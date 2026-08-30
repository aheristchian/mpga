import { ref, computed } from 'vue';

const checkSupported = (): boolean => {
  const globalObj = typeof window !== 'undefined' ? window : (globalThis as any);
  return typeof globalObj !== 'undefined' && !!globalObj.speechSynthesis;
};

const isEnabled = ref<boolean>(false);
const isSpeaking = ref<boolean>(false);
const volume = ref<number>(1.0);
const rate = ref<number>(1.0);
const availableVoices = ref<SpeechSynthesisVoice[]>([]);

// Load saved preference
if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('mpga_ttsEnabled');
  if (saved !== null) {
    isEnabled.value = saved === 'true';
  }
}

const loadVoices = () => {
  const globalObj = typeof window !== 'undefined' ? window : (globalThis as any);
  if (!checkSupported()) return;
  availableVoices.value = globalObj.speechSynthesis.getVoices() || [];
};

if (typeof window !== 'undefined' && checkSupported()) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Native Text-to-Speech Voice Narration Composable using Web Speech API.
 */
export function useVoiceNarration() {
  const isSupported = computed(() => checkSupported());

  const toggleEnabled = () => {
    isEnabled.value = !isEnabled.value;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_ttsEnabled', isEnabled.value.toString());
    }
    if (!isEnabled.value && checkSupported()) {
      stop();
    }
  };

  const setEnabled = (val: boolean) => {
    isEnabled.value = Boolean(val);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mpga_ttsEnabled', isEnabled.value.toString());
    }
    if (!isEnabled.value && checkSupported()) {
      stop();
    }
  };

  const stop = () => {
    if (!checkSupported()) return;
    const globalObj = typeof window !== 'undefined' ? window : (globalThis as any);
    try {
      globalObj.speechSynthesis.cancel();
      isSpeaking.value = false;
    } catch {
      // Ignore synthesis cancel errors
    }
  };

  const speak = (text: string, lang: string = 'en-US') => {
    if (!checkSupported() || !isEnabled.value || !text) return;
    const globalObj = typeof window !== 'undefined' ? window : (globalThis as any);

    try {
      globalObj.speechSynthesis.cancel(); // Cancel previous queued speech for responsiveness

      const UtteranceClass = globalObj.SpeechSynthesisUtterance || SpeechSynthesisUtterance;
      const utterance = new UtteranceClass(text);
      utterance.lang = lang;
      utterance.volume = volume.value;
      utterance.rate = rate.value;

      // Select matching voice if available
      if (availableVoices.value.length > 0) {
        const langPrefix = lang.split('-')[0].toLowerCase();
        const matchingVoice = availableVoices.value.find((v: SpeechSynthesisVoice) =>
          v.lang.toLowerCase().startsWith(langPrefix)
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        isSpeaking.value = true;
      };
      utterance.onend = () => {
        isSpeaking.value = false;
      };
      utterance.onerror = () => {
        isSpeaking.value = false;
      };

      globalObj.speechSynthesis.speak(utterance);
    } catch {
      isSpeaking.value = false;
    }
  };

  return {
    isSupported,
    isEnabled,
    isSpeaking,
    volume,
    rate,
    availableVoices,
    toggleEnabled,
    setEnabled,
    speak,
    stop,
  };
}
