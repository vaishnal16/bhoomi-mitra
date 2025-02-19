import React, { useState, useCallback, useEffect } from 'react';
import { MdOutlineRecordVoiceOver } from "react-icons/md";
import VoiceRecorder from '../components/VoiceRecorder';
import ChatMessage from '../components/ChatMessage';
import LanguageSelector from '../components/LanguageSelector';
import { initializeGemini, generateResponse } from '../services/gemini';
import { speechToText, textToSpeech } from '../services/speech';
import { getLanguageCode } from '../utils/languageMapping';

const GEMINI_API_KEY = 'AIzaSyDSynDh4asJf6mcqtiEy2A5SG4UdX8wEIE';

function Voicechatbot() {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({
    code: 'en',
    name: 'English',
    localName: 'English',
  });

  useEffect(() => {
    initializeGemini(GEMINI_API_KEY);
  }, []);

  const handleRecordingComplete = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const userMessage = {
        content: '🎤 Recording...',
        type: 'user',
      };
      setMessages((prev) => [...prev, userMessage]);

      const languageCode = getLanguageCode(selectedLanguage.code);
      const transcribedText = await speechToText(languageCode);
      
      setMessages((prev) => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 
            ? { ...msg, content: transcribedText }
            : msg
        )
      );

      const response = await generateResponse(transcribedText, selectedLanguage.code);

      const assistantMessage = {
        content: response,
        type: 'assistant',
      };
      setMessages((prev) => [...prev, assistantMessage]);

      textToSpeech(response, languageCode).catch(error => {
        console.error('Text-to-speech error:', error);
      });

    } catch (error) {
      console.error('Error processing voice message:', error);
      
      const errorMessages = {
        en: 'Sorry, there was an error processing your message. Please try again.',
        hi: 'क्षमा करें, आपका संदेश प्रोसेस करने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
        mr: 'क्षमस्व, तुमचा संदेश प्रक्रिया करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
        pa: 'ਮੁਆਫ਼ ਕਰਨਾ, ਤੁਹਾਡਾ ਸੁਨੇਹਾ ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਗਲਤੀ ਹੋਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
        bn: 'দুঃখিত, আপনার বার্তা প্রক্রিয়া করতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        te: 'క్షమించండి, మీ సందేశాన్ని ప్రాసెస్ చేయడంలో లోపం జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
        kn: 'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುವಲ್ಲಿ ದೋಷ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      };
      
      const errorMessage = {
        content: errorMessages[selectedLanguage.code] || errorMessages.en,
        type: 'assistant',
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedLanguage]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MdOutlineRecordVoiceOver className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Kisan Saathi / किसान साथी</h1>
          </div>
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4">
        <div className="bg-gray-50 rounded-lg shadow-lg min-h-[70vh] p-4 mb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
              <MdOutlineRecordVoiceOver className="w-16 h-16 mb-4 text-green-500" />
              <p className="text-xl mb-2">Welcome! / आपका स्वागत है!</p>
              <p className="text-sm text-center">
                Press the mic button below to ask your question
                <br />
                अपना सवाल पूछने के लिए नीचे माइक बटन दबाएं
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isProcessing}
          />
        </div>
      </main>
    </div>
  );
}

export default Voicechatbot;