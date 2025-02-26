const express = require('express');
const router = express.Router();
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
// Initialize the Gemini API
const apiKey = process.env.GEMINI_BIOMASS_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
// Configuration for Gemini API
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};
// Helper function to convert biomass data to CSV-like format for Gemini
function formatBiomassData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return "";
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  let csvData = headers.join(",") + "\n";
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      // Handle cases where values might contain commas or need quotes
      const value = item[header] === null || item[header] === undefined ? "" : String(item[header]);
      return value.includes(",") ? `"${value}"` : value;
    }).join(",");
    csvData += row + "\n";
  });
  
  return csvData;
}

// Safe JSON parsing with error handling
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return null;
  }
}

// Route to analyze biomass data
router.post('/analyze', async (req, res) => {
  try {
    const { biomassData } = req.body;
    
    if (!biomassData || !Array.isArray(biomassData) || biomassData.length === 0) {
      return res.status(400).json({ error: "Invalid or empty biomass data" });
    }
    
    // Format data for Gemini
    const formattedData = formatBiomassData(biomassData);
    
    // Create prompt for Gemini API
    const prompt = `
    I'm providing biomass collection data in CSV format:
    
    ${formattedData}
    
    Please analyze this data and provide insights in the following JSON structure:
    {
      "summary": "A brief summary of the biomass data",
      "topBiomassSources": [
        { "source": "Source name", "amount": "Amount", "percentage": "Percentage of total" }
      ],
      "trends": "Any notable trends in the data",
      "recommendations": "Recommendations for improving biomass collection",
      "potentialIssues": "Any potential issues or anomalies in the data"
    }
    
    Only return valid JSON without any additional text, explanations, or markdown.
    `;
    
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    // Call Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonResponse = safeJsonParse(text);
    
    if (!jsonResponse) {
      return res.status(500).json({ error: "Invalid response from AI model" });
    }
    
    return res.json(jsonResponse);
  } catch (error) {
    console.error("Error in /analyze endpoint:", error);
    return res.status(500).json({ 
      error: "Error processing biomass data",
      details: error.message 
    });
  }
});

// Route to get optimization suggestions
router.post('/optimize', async (req, res) => {
  try {
    const { biomassData, currentProcess } = req.body;
    
    if (!biomassData || !Array.isArray(biomassData) || biomassData.length === 0) {
      return res.status(400).json({ error: "Invalid or empty biomass data" });
    }
    
    if (!currentProcess || typeof currentProcess !== 'string') {
      return res.status(400).json({ error: "Current process description is required" });
    }
    
    // Format data for Gemini
    const formattedData = formatBiomassData(biomassData);
    
    // Create prompt for optimization
    const prompt = `
    I'm providing biomass collection data in CSV format:
    
    ${formattedData}
    
    Our current process is: ${currentProcess}
    
    Please analyze this data and provide optimization suggestions in the following JSON structure:
    {
      "processImprovements": [
        {
          "area": "Area of improvement",
          "suggestion": "Detailed suggestion",
          "potentialImpact": "Estimated impact (high/medium/low)",
          "implementationDifficulty": "Difficulty to implement (high/medium/low)"
        }
      ],
      "resourceAllocation": "Suggestions for better resource allocation",
      "collectionStrategy": "Improved collection strategy",
      "sustainability": "Sustainability improvements"
    }
    
    Only return valid JSON without any additional text, explanations, or markdown.
    `;
    
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    // Call Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonResponse = safeJsonParse(text);
    
    if (!jsonResponse) {
      return res.status(500).json({ error: "Invalid response from AI model" });
    }
    
    return res.json(jsonResponse);
  } catch (error) {
    console.error("Error in /optimize endpoint:", error);
    return res.status(500).json({ 
      error: "Error generating optimization suggestions",
      details: error.message 
    });
  }
});

// Route to generate a report
router.post('/report', async (req, res) => {
  try {
    const { biomassData, reportType, timeframe } = req.body;
    
    if (!biomassData || !Array.isArray(biomassData) || biomassData.length === 0) {
      return res.status(400).json({ error: "Invalid or empty biomass data" });
    }
    
    if (!reportType || typeof reportType !== 'string') {
      return res.status(400).json({ error: "Report type is required" });
    }
    
    // Format data for Gemini
    const formattedData = formatBiomassData(biomassData);
    
    // Create prompt based on report type
    let reportPrompt = `
    I'm providing biomass collection data in CSV format:
    
    ${formattedData}
    
    Please generate a ${reportType} report`;
    
    if (timeframe) {
      reportPrompt += ` for the ${timeframe} timeframe`;
    }
    
    reportPrompt += ` in the following JSON structure:
    {
      "title": "Report title",
      "summary": "Executive summary of findings",
      "keyMetrics": [
        { "name": "Metric name", "value": "Value", "trend": "Trend compared to previous period" }
      ],
      "detailedAnalysis": "Detailed analysis of the biomass data",
      "conclusions": "Conclusions from the analysis",
      "nextSteps": "Recommended next steps"
    }
    
    Only return valid JSON without any additional text, explanations, or markdown.
    `;
    
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    // Call Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: reportPrompt }] }],
      generationConfig,
      safetySettings,
    });
    
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const jsonResponse = safeJsonParse(text);
    
    if (!jsonResponse) {
      return res.status(500).json({ error: "Invalid response from AI model" });
    }
    
    return res.json(jsonResponse);
  } catch (error) {
    console.error("Error in /report endpoint:", error);
    return res.status(500).json({ 
      error: "Error generating report",
      details: error.message 
    });
  }
});

module.exports = router;