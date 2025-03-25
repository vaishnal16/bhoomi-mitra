export const getLanguageCode = (code) => {
  const languageMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'mr': 'mr-IN',
    'pa': 'pa-IN',
    'bn': 'bn-IN',
    'te': 'te-IN',
    'kn': 'kn-IN',
  };
  
  return languageMap[code] || code;
};

// Get voice names for different languages
export const getVoiceNames = () => {
  const voices = window.speechSynthesis.getVoices();
  
  const languageCodes = ['en', 'hi', 'mr', 'pa', 'bn', 'te', 'kn'];
  const voiceMap = {};
  
  languageCodes.forEach(code => {
    const fullCode = getLanguageCode(code);
    const matchingVoices = voices.filter(voice => 
      voice.lang.startsWith(fullCode) || 
      voice.lang.startsWith(code)
    );
    
    voiceMap[code] = matchingVoices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default
    }));
  });
  
  return voiceMap;
};