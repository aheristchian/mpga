import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';

export function useWakeLock() {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const isActive = ref(false);
  const isAutoEnabled = ref(true);
  let wakeLockSentinel = null;

  const requestWakeLock = async () => {
    if (!isSupported || !isAutoEnabled.value) return false;
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      isActive.value = true;
      return true;
    }

    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      isActive.value = true;

      wakeLockSentinel.addEventListener('release', () => {
        isActive.value = false;
        wakeLockSentinel = null;
      });

      return true;
    } catch (err) {
      console.warn('[MPGA WakeLock] Failed to acquire screen wake lock:', err);
      isActive.value = false;
      wakeLockSentinel = null;
      return false;
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      try {
        await wakeLockSentinel.release();
      } catch (err) {
        console.warn('[MPGA WakeLock] Failed to release screen wake lock:', err);
      }
    }
    wakeLockSentinel = null;
    isActive.value = false;
  };

  const toggleWakeLock = async () => {
    isAutoEnabled.value = !isAutoEnabled.value;
    if (isAutoEnabled.value) {
      await requestWakeLock();
    } else {
      await releaseWakeLock();
    }
    return isActive.value;
  };

  const handleVisibilityChange = async () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isAutoEnabled.value) {
      await requestWakeLock();
    }
  };

  if (getCurrentInstance()) {
    onMounted(() => {
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange);
      }
    });

    onUnmounted(() => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      releaseWakeLock();
    });
  }

  return {
    isSupported,
    isActive,
    isAutoEnabled,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
  };
}
