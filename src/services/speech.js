// services/speech.js

// Speech to text function
export const speechToText = async (languageCode) => {
  return new Promise((resolve, reject) => {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject('Speech recognition not supported in this browser');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = languageCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        reject(`Speech recognition error: ${event.error}`);
      };

      recognition.start();
    } catch (error) {
      reject(`Failed to initialize speech recognition: ${error.message}`);
    }
  });
};

// Text to speech function with fallback
export const textToSpeech = async (text, languageCode) => {
  return new Promise((resolve, reject) => {
    try {
      if (!('speechSynthesis' in window)) {
        reject('Speech synthesis not supported in this browser');
        return;
      }

      // Make sure we have the right BCP-47 format
      const languageTag = formatLanguageCode(languageCode);
      
      // Log which language we're trying to speak
      console.log(`Attempting TTS for language: ${languageTag} with text: ${text.substring(0, 50)}...`);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageTag;
      
      // Get all voices
      const voices = window.speechSynthesis.getVoices();
      console.log(`Available voices: ${voices.length}`);
      
      // Try to find a matching voice
      let selectedVoice = null;
      
      // First try: exact match
      selectedVoice = voices.find(voice => voice.lang === languageTag);
      
      // Second try: language code match (e.g., 'hi' part of 'hi-IN')
      if (!selectedVoice) {
        const langCode = languageTag.split('-')[0];
        selectedVoice = voices.find(voice => voice.lang.startsWith(langCode));
      }
      
      // Third try: Use Google voices if available as they often have better language support
      if (!selectedVoice) {
        const langCode = languageTag.split('-')[0];
        selectedVoice = voices.find(voice => 
          voice.name.includes('Google') && voice.lang.startsWith(langCode)
        );
      }
      
      // Log the selected voice
      if (selectedVoice) {
        console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
        utterance.voice = selectedVoice;
      } else {
        console.log(`No matching voice found for ${languageTag}, using default`);
      }

      // Add event listeners
      utterance.onend = () => {
        console.log('Speech finished successfully');
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error(`Speech synthesis error: ${event.error}`);
        reject(event.error);
      };
      
      // Speak
      window.speechSynthesis.speak(utterance);
      
      // Safety timeout (in case onend doesn't fire)
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          console.log('Speech is still going, resolving anyway');
          resolve();
        }
      }, 10000); // 10 second timeout
      
    } catch (error) {
      console.error(`TTS error: ${error.message}`);
      reject(error);
    }
  });
};

// Format language code to BCP-47 format
function formatLanguageCode(code) {
  const languageMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'pa': 'pa-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'kn': 'kn-IN'
  };
  
  return languageMap[code] || code;
}