export function useHaptics() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrateLight = () => {
    if (isSupported) {
      try {
        navigator.vibrate(30);
      } catch {
        /* ignore vibration failure */
      }
    }
  };

  const vibrateSuccess = () => {
    if (isSupported) {
      try {
        navigator.vibrate(60);
      } catch {
        /* ignore vibration failure */
      }
    }
  };

  const vibrateWarning = () => {
    if (isSupported) {
      try {
        navigator.vibrate([80, 50, 80]);
      } catch {
        /* ignore vibration failure */
      }
    }
  };

  const vibrateNightCall = () => {
    if (isSupported) {
      try {
        navigator.vibrate([100, 80, 100]);
      } catch {
        /* ignore vibration failure */
      }
    }
  };

  return {
    isSupported,
    vibrateLight,
    vibrateSuccess,
    vibrateWarning,
    vibrateNightCall,
  };
}
