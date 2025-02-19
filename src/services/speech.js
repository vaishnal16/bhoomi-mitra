export const speechToText = (language) => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported in this browser'));
        return;
      }
  
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
  
      let finalTranscript = '';
      let silenceTimer;
      const SILENCE_DURATION = 1500; // 1.5 seconds of silence to detect end of speech
  
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        finalTranscript = transcript;
        
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          recognition.stop();
          resolve(finalTranscript);
        }, SILENCE_DURATION);
      };
  
      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
  
      recognition.onend = () => {
        if (finalTranscript) {
          resolve(finalTranscript);
        } else {
          reject(new Error('No speech detected'));
        }
      };
  
      recognition.start();
    });
  };
  
  export const textToSpeech = async (text, language) => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
  
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const languageVoice = voices.find(voice => voice.lang.startsWith(language.split('-')[0]));
        if (languageVoice) {
          utterance.voice = languageVoice;
        }
  
        utterance.onend = () => {
          resolve();
        };
  
        utterance.onerror = (event) => {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };
  
        window.speechSynthesis.speak(utterance);
      } else {
        reject(new Error('Speech synthesis not supported in this browser'));
      }
    });
  };