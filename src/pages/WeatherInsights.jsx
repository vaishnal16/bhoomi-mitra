import { useState, useEffect } from 'react';
import { BsCloud, BsDroplet, BsWind, BsThermometer, BsSun, BsCloudRain, BsCloudSun, BsCalendar, BsExclamationTriangle, BsCloudSnow, BsCloudFog } from 'react-icons/bs';

function WeatherInsights() {
  const [weatherData, setWeatherData] = useState({
    temperature: null,
    humidity: null,
    windSpeed: null,
    uvIndex: 6,
    soilMoisture: 45,
    precipitation: null,
    alerts: []
  });

  const [forecast, setForecast] = useState([]);
  const [farmingCalendar, setFarmingCalendar] = useState([]);
  const [cropRecommendations, setCropRecommendations] = useState([]);

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get appropriate weather icon based on condition
  const getWeatherIcon = (condition) => {
    condition = condition ? condition.toLowerCase() : '';
    if (condition.includes('rain')) return BsCloudRain;
    if (condition.includes('snow')) return BsCloudSnow;
    if (condition.includes('fog') || condition.includes('mist')) return BsCloudFog;
    if (condition.includes('cloud') && condition.includes('sun')) return BsCloudSun;
    if (condition.includes('cloud')) return BsCloud;
    return BsSun; // Default to sunny
  };

  // Function to generate farming calendar based on weather
  const generateFarmingCalendar = (weatherData) => {
    const today = new Date();
    const calendar = [];
    
    // Generate dates for the next 5 days
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate activities based on weather conditions
      const activities = [];
      
      // If temperature is high, suggest early morning activities
      if (weatherData.temperature > 25) {
        activities.push({ 
          type: 'Irrigation', 
          time: 'Early Morning', 
          priority: 'High' 
        });
      }
      
      // If precipitation is low, suggest watering
      if (weatherData.precipitation < 30) {
        activities.push({ 
          type: 'Watering', 
          time: 'Evening', 
          priority: weatherData.precipitation < 10 ? 'High' : 'Medium' 
        });
      }
      
      // If soil moisture is low, suggest irrigation
      if (weatherData.soilMoisture < 40) {
        if (!activities.some(a => a.type === 'Irrigation')) {
          activities.push({ 
            type: 'Irrigation', 
            time: 'Morning', 
            priority: 'High' 
          });
        }
      }
      
      // If humidity is high, suggest pest control
      if (weatherData.humidity > 70) {
        activities.push({ 
          type: 'Pest Control', 
          time: 'Morning', 
          priority: 'High' 
        });
      }
      
      // If it's the first day (today), add harvesting if conditions are good
      if (i === 0 && weatherData.precipitation < 20 && weatherData.windSpeed < 15) {
        activities.push({ 
          type: 'Harvesting', 
          time: 'Late Afternoon', 
          priority: 'Medium' 
        });
      }
      
      // If it's the second day, add fertilization if no heavy rain
      if (i === 1 && weatherData.precipitation < 40) {
        activities.push({ 
          type: 'Fertilization', 
          time: 'Afternoon', 
          priority: 'Medium' 
        });
      }
      
      // Ensure we have at least one activity per day
      if (activities.length === 0) {
        activities.push({ 
          type: 'Field Monitoring', 
          time: 'Morning', 
          priority: 'Medium' 
        });
      }
      
      calendar.push({
        date: dateString,
        activities: activities
      });
    }
    
    return calendar;
  };

  // Function to generate crop recommendations based on weather
  const generateCropRecommendations = (weatherData) => {
    const recommendations = [];
    
    // Irrigation recommendations
    const irrigationRecs = [];
    if (weatherData.temperature > 25) {
      irrigationRecs.push('Consider early morning irrigation to minimize water loss');
    }
    if (weatherData.soilMoisture < 50) {
      irrigationRecs.push('Increase irrigation frequency to maintain optimal soil moisture');
    } else if (weatherData.soilMoisture > 70) {
      irrigationRecs.push('Reduce irrigation to prevent waterlogging');
    }
    irrigationRecs.push('Adjust irrigation based on current soil moisture readings of ' + weatherData.soilMoisture + '%');
    
    recommendations.push({
      category: 'Irrigation',
      recommendations: irrigationRecs
    });
    
    // Crop Protection recommendations
    // const protectionRecs = [];
    // if (weatherData.precipitation > 40) {
    //   protectionRecs.push('Apply preventive fungicide before forecasted rain');
    //   protectionRecs.push('Ensure proper drainage to prevent waterlogging');
    // }
    // if (weatherData.temperature > 30) {
    //   protectionRecs.push('Install temporary shade structures for sensitive crops');
    // }
    // if (weatherData.windSpeed > 15) {
    //   protectionRecs.push('Consider wind breaks for vulnerable crops');
    // }
    
    // recommendations.push({
    //   category: 'Crop Protection',
    //   recommendations: protectionRecs
    // });
    
    // Resource Management recommendations
    const resourceRecs = [];
    resourceRecs.push('Optimize water usage during peak temperature hours');
    resourceRecs.push('Plan harvesting activities around weather conditions');
    if (weatherData.precipitation > 50 || weatherData.windSpeed > 20) {
      resourceRecs.push('Prepare contingency measures for extreme weather');
    }
    
    recommendations.push({
      category: 'Resource Management',
      recommendations: resourceRecs
    });
    
    return recommendations;
  };

  // Function to generate 5-day forecast based on current weather
  const generateForecast = (currentWeather) => {
    const forecastData = [];
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Use current data as base and create variations for next 5 days
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = daysOfWeek[date.getDay()];
      
      // Create some reasonable variations from current weather
      const tempVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2 degrees
      const humidityVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5 percent
      const windVariation = Math.floor(Math.random() * 6) - 3; // -3 to +3 km/h
      const precipVariation = Math.floor(Math.random() * 20) - 5; // -5 to +15 percent
      
      let condition = 'Sunny';
      const precipForecast = Math.max(0, Math.min(100, currentWeather.precipitation + precipVariation));
      if (precipForecast > 50) condition = 'Rain';
      else if (precipForecast > 20) condition = 'Cloudy';
      else if (precipForecast > 10) condition = 'Partly Cloudy';
      else condition = 'Sunny';
      
      forecastData.push({
        date: dayName,
        temperature: Math.max(0, Math.min(50, currentWeather.temperature + tempVariation)),
        condition: condition,
        humidity: Math.max(0, Math.min(100, currentWeather.humidity + humidityVariation)),
        windSpeed: Math.max(0, currentWeather.windSpeed + windVariation),
        precipitation: precipForecast,
        icon: getWeatherIcon(condition)
      });
    }
    
    return forecastData;
  };

  // Function to parse weather data from Gemini API response
  const parseGeminiResponse = (response) => {
    try {
      console.log('Raw response:', response);
        
      // Parse the JSON string to object if it's a string
      const parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;
        
      // Extract forecast data from the parsed response
      const forecast = parsedResponse.forecast || {};

      // Extract relevant weather details from response
      const {
          temperature,
          humidity,
          windSpeed,
          uvIndex,
          soilMoisture,
          precipitation
      } = forecast;

      // Convert extracted values to appropriate types
      const avgTemp = temperature ? parseInt(temperature.replace('°C', '')) : null;
      const avgHumidity = humidity ? parseInt(humidity.replace('%', '')) : null;
      const avgWind = windSpeed ? parseInt(windSpeed.replace(' km/h', '')) : null;
      const avgPrecipitation = precipitation ? parseInt(precipitation.replace('%', '')) : null;
      const avgUVIndex = uvIndex ? parseInt(uvIndex) : 6; // Default UV index
      const avgSoilMoisture = soilMoisture ? parseInt(soilMoisture.replace('%', '')) : 45; // Default soil moisture

      // Alerts based on extracted data
      const alerts = [];
      if (avgTemp !== null && avgTemp > 30) {
          alerts.push({
              type: 'High Temperature',
              message: 'Protect your crops from heat stress.',
              severity: 'warning'
          });
      }
      if (avgPrecipitation !== null && avgPrecipitation > 10) {
          alerts.push({
              type: 'Heavy Rainfall',
              message: 'Heavy rainfall expected, ensure proper drainage.',
              severity: 'alert'
          });
      }

      const parsedWeatherData = {
          temperature: avgTemp,
          humidity: avgHumidity,
          windSpeed: avgWind,
          precipitation: avgPrecipitation,
          uvIndex: avgUVIndex,
          soilMoisture: avgSoilMoisture,
          alerts
      };

      console.log('Parsed values:', parsedWeatherData);
      return parsedWeatherData;
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
          temperature: null,
          humidity: null,
          windSpeed: null,
          precipitation: null,
          uvIndex: 6,
          soilMoisture: 45,
          alerts: []
      };
    }
  };

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setLocation(data.city || data.locality || 'Unknown Location');
            setError(null);
          } catch (err) {
            setError('Error getting location details');
            setLocation(null);
          }
        },
        (err) => {
          setError('Please enable location access to get weather insights');
          setLocation(null);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  // Fetch weather data from your backend
  const fetchWeatherData = async (location) => {
    try {
      setLoading(true);
      console.log('Fetching weather data for:', location);
  
      const response = await fetch('http://localhost:5000/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          date: new Date().toISOString().split('T')[0]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
  
      const parsedWeatherData = parseGeminiResponse(data);
      console.log('Parsed weather data:', parsedWeatherData);
      
      if (parsedWeatherData) {
        setWeatherData(parsedWeatherData);
        
        // Generate dynamic data based on current weather
        const dynamicForecast = generateForecast(parsedWeatherData);
        setForecast(dynamicForecast);
        
        const dynamicCalendar = generateFarmingCalendar(parsedWeatherData);
        setFarmingCalendar(dynamicCalendar);
        
        const dynamicRecommendations = generateCropRecommendations(parsedWeatherData);
        setCropRecommendations(dynamicRecommendations);
        
        setError(null);
      } else {
        setError('Error parsing weather data');
      }
    } catch (err) {
      console.error('Weather data fetch error:', err);
      setError(`Error fetching weather data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData(location);
    }
  }, [location]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex">
          <BsExclamationTriangle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Weather Insights for {location}
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts && weatherData.alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weatherData.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'warning'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex">
                <BsExclamationTriangle className={`h-5 w-5 ${
                  alert.severity === 'warning' ? 'text-yellow-400' : 'text-red-500'
                }`} />
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    alert.severity === 'warning' ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {alert.type}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    alert.severity === 'warning' ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <div className="p-3 bg-blue-100 rounded-full">
              <BsThermometer className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Temperature</p>
              <p className="text-xl font-bold text-blue-600">{weatherData.temperature !== null ? `${weatherData.temperature}°C` : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-full">
              <BsDroplet className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Humidity</p>
              <p className="text-xl font-bold text-green-600">{weatherData.humidity !== null ? `${weatherData.humidity}%` : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <div className="p-3 bg-purple-100 rounded-full">
              <BsWind className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wind Speed</p>
              <p className="text-xl font-bold text-purple-600">{weatherData.windSpeed !== null ? `${weatherData.windSpeed} km/h` : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BsSun className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">UV Index</p>
              <p className="text-xl font-bold text-yellow-600">{weatherData.uvIndex !== null ? weatherData.uvIndex : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-teal-50 rounded-lg">
            <div className="p-3 bg-teal-100 rounded-full">
              <BsDroplet className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Soil Moisture</p>
              <p className="text-xl font-bold text-teal-600">{weatherData.soilMoisture !== null ? `${weatherData.soilMoisture}%` : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
            <div className="p-3 bg-indigo-100 rounded-full">
              <BsCloudRain className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Precipitation</p>
              <p className="text-xl font-bold text-indigo-600">{weatherData.precipitation !== null ? `${weatherData.precipitation}%` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Forecast & Farming Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">5-Day Forecast</h3>
            <div className="grid grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="text-sm font-semibold text-gray-700">{day.date}</p>
                  <day.icon className="h-8 w-8 mx-auto my-3 text-blue-600" />
                  <p className="text-lg font-bold text-gray-900">{day.temperature}°C</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p>Humidity: {day.humidity}%</p>
                    <p>Wind: {day.windSpeed} km/h</p>
                    <p>Rain: {day.precipitation}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Farming Calendar */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Farming Calendar</h3>
          <div className="space-y-4">
            {farmingCalendar.slice(0, 2).map((day, dayIndex) => (
              <div key={dayIndex} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-center mb-2">
                  <BsCalendar className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{day.date}</span>
                </div>
                <div className="space-y-2">
                  {day.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                        <p className="text-xs text-gray-600">{activity.time}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        activity.priority === 'High' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crop Recommendations */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weather-Based Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cropRecommendations.map((category, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">{category.category}</h4>
              <ul className="space-y-2">
                {category.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <BsCloud className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeatherInsights;