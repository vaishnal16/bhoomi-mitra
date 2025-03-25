import { GoogleGenerativeAI } from '@google/generative-ai';
const API_KEY = import.meta.env.VITE_GEMINI_ADVISER_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

export async function generateResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}