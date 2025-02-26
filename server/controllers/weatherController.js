const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fetchWeatherFromAI = async (req, res) => {
    try {
        const { location, date } = req.body;
        console.log("Request received:", { location, date });

        if (!location || !date) {
            console.warn("Missing location or date in request");
            return res.status(400).json({ error: "Location and date are required" });
        }

        console.log("Initializing Gemini AI model...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a weather forecast for ${location} on ${date} based on historical weather patterns and general climate trends.
        You do NOT need real-time data. Simply estimate based on average climate conditions for that time of year.

        Format your response as JSON using the following structure:
        {
          "temperature": "value in °C",
          "humidity": "value in %",
          "windSpeed": "value in km/h",
          "uvIndex": "value",
          "soilMoisture": "value in %",
          "precipitation": "value in %"
        }`;

        console.log("Sending prompt to Gemini AI...");
        const result = await model.generateContent(prompt);

        if (!result || !result.response) {
            throw new Error("Invalid or empty response from AI");
        }

        let response = result.response.text();
        console.log("Raw AI Response:", response);

        // 🛠 **Fix: Clean and extract only the JSON**
        response = response.replace(/```json|```/g, "").trim();
        response = response.replace(/\n/g, ""); 
        response = response.replace(/\s\s+/g, " ");

        // 🛠 **Fix: Try parsing the cleaned JSON response**
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(response);
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", parseError);
            return res.status(500).json({ error: "Invalid AI response format", details: response });
        }

        console.log("Sending parsed response:", parsedResponse);
        res.json({
            location,
            date,
            forecast: parsedResponse,
        });

    } catch (error) {
        console.error("Error in fetchWeatherFromAI:", error);
        res.status(500).json({ error: "AI weather generation failed", details: error.message });
    }
};

module.exports = { fetchWeatherFromAI };
