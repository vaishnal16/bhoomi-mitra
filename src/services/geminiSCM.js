import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_SCM_API_KEY);

export const generateSupplyChainPlan = async (
  options,
  produceType,
  location
) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Act as an agricultural supply chain advisor. Create a comprehensive supply chain plan for a farmer with the following details:
Product: ${produceType}
Location: ${location}
Selected Options: ${options.join(', ')}
Please provide detailed recommendations for:
${options.includes('transport') ? '- Transportation options with costs and transit times' : ''}
${options.includes('storage') ? '- Storage and warehousing facilities with capacity and costs' : ''}
${options.includes('market') ? '- Market demand analysis and optimal selling strategy' : ''}
${options.includes('cost') ? '- Cost optimization recommendations' : ''}
Format the response in a clear, structured way with specific actionable steps.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating supply chain plan:', error);
    
    // More specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error('Invalid API configuration or model not available. Please check your API key and try again.');
      } else if (error.message.includes('401')) {
        throw new Error('Invalid API key. Please check your credentials.');
      }
    }
    
    throw new Error('Failed to generate supply chain plan. Please try again.');
  }
};