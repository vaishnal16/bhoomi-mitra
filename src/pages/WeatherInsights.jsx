import { useState, useEffect } from 'react';
import { BsCloud, BsDroplet, BsWind, BsThermometer, BsSun, BsCloudRain, BsCloudSun, BsCalendar, BsExclamationTriangle } from 'react-icons/bs';

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

  // Add back the forecast state
  const [forecast] = useState([
    { date: 'Mon', temperature: 28, condition: 'Sunny', humidity: 65, windSpeed: 12, precipitation: 0, icon: BsCloudSun },
    { date: 'Tue', temperature: 27, condition: 'Cloudy', humidity: 70, windSpeed: 10, precipitation: 20, icon: BsCloud },
    { date: 'Wed', temperature: 25, condition: 'Rain', humidity: 80, windSpeed: 15, precipitation: 60, icon: BsCloudRain },
    { date: 'Thu', temperature: 26, condition: 'Cloudy', humidity: 75, windSpeed: 11, precipitation: 30, icon: BsCloud },
    { date: 'Fri', temperature: 29, condition: 'Sunny', humidity: 60, windSpeed: 8, precipitation: 0, icon: BsCloudSun }
  ]);

  // Add back the farming calendar state
  const [farmingCalendar] = useState([
    {
      date: '2024-03-15',
      activities: [
        { type: 'Irrigation', time: 'Early Morning', priority: 'High' },
        { type: 'Fertilization', time: 'Afternoon', priority: 'Medium' }
      ]
    },
    {
      date: '2024-03-16',
      activities: [
        { type: 'Pest Control', time: 'Morning', priority: 'High' },
        { type: 'Harvesting', time: 'Late Afternoon', priority: 'Medium' }
      ]
    }
  ]);

  // Add back the crop recommendations state
  const [cropRecommendations] = useState([
    {
      category: 'Irrigation',
      recommendations: [
        'Consider early morning irrigation to minimize water loss',
        'Adjust irrigation schedule based on soil moisture levels',
        'Monitor water requirements for different growth stages'
      ]
    },
    {
      category: 'Crop Protection',
      recommendations: [
        'Apply preventive fungicide before forecasted rain',
        'Install temporary shade structures for sensitive crops',
        'Ensure proper drainage to prevent waterlogging'
      ]
    },
    {
      category: 'Resource Management',
      recommendations: [
        'Optimize water usage during peak temperature hours',
        'Plan harvesting activities around weather conditions',
        'Prepare contingency measures for extreme weather'
      ]
    }
  ]);

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse weather data from Gemini response
  const parseGeminiResponse = (response) => {
    try {
        // Debugging the raw response
        console.log('Raw response:', response);

        // Extract temperature (handles single value and range)
        const tempMatch = response.match(/Temperature:.*?(\d+)(?:-(\d+))?°C/);
        const avgTemp = tempMatch ? Math.round(tempMatch[2] ? (parseInt(tempMatch[1]) + parseInt(tempMatch[2])) / 2 : parseInt(tempMatch[1])) : null;

        // Extract humidity (handles single value and range)
        const humidityMatch = response.match(/Humidity:.*?(\d+)(?:-(\d+))?%/);
        const avgHumidity = humidityMatch ? Math.round(humidityMatch[2] ? (parseInt(humidityMatch[1]) + parseInt(humidityMatch[2])) / 2 : parseInt(humidityMatch[1])) : null;

        // Extract wind speed (handles single value and range)
        const windMatch = response.match(/Wind:.*?(\d+)(?:-(\d+))?\s*km\/h/);
        const avgWind = windMatch ? Math.round(windMatch[2] ? (parseInt(windMatch[1]) + parseInt(windMatch[2])) / 2 : parseInt(windMatch[1])) : null;

        // Extract rainfall (handles single value and range)
        const rainMatch = response.match(/Rainfall:.*?(\d+)(?:-(\d+))?\s*mm/);
        const avgRainfall = rainMatch ? Math.round(rainMatch[2] ? (parseInt(rainMatch[1]) + parseInt(rainMatch[2])) / 2 : parseInt(rainMatch[1])) : null;

        // Extract UV Index (if present)
        const uvMatch = response.match(/UV Index:.*?(\d+)/);
        const uvIndex = uvMatch ? parseInt(uvMatch[1]) : 6; // Default value

        // Extract Soil Moisture (if present)
        const soilMatch = response.match(/Soil Moisture:.*?(\d+)%/);
        const soilMoisture = soilMatch ? parseInt(soilMatch[1]) : 45; // Default value

        // Alerts based on extracted data
        const alerts = [];
        if (avgTemp !== null && avgTemp > 30) {
            alerts.push({
                type: 'High Temperature',
                message: 'Protect your crops from heat stress',
                severity: 'warning'
            });
        }
        if (avgRainfall !== null && avgRainfall > 10) {
            alerts.push({
                type: 'Heavy Rainfall',
                message: 'Heavy rainfall expected, ensure proper drainage',
                severity: 'alert'
            });
        }

        // Log parsed values for debugging
        console.log('Parsed values:', {
            temperature: avgTemp,
            humidity: avgHumidity,
            windSpeed: avgWind,
            precipitation: avgRainfall,
            uvIndex,
            soilMoisture
        });

        return {
            temperature: avgTemp,
            humidity: avgHumidity,
            windSpeed: avgWind,
            precipitation: avgRainfall,
            uvIndex,
            soilMoisture,
            alerts
        };
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
      
      const data = await response.text();
      console.log('Raw API response:', data);
  
      const parsedWeatherData = parseGeminiResponse(data);
      console.log('Parsed weather data:', parsedWeatherData);
      
      if (parsedWeatherData) {
        setWeatherData(parsedWeatherData);
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
              <p className="text-xl font-bold text-blue-600">{weatherData.temperature}°C</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="p-3 bg-green-100 rounded-full">
              <BsDroplet className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Humidity</p>
              <p className="text-xl font-bold text-green-600">{weatherData.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-purple-50 rounded-lg">
            <div className="p-3 bg-purple-100 rounded-full">
              <BsWind className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wind Speed</p>
              <p className="text-xl font-bold text-purple-600">{weatherData.windSpeed} km/h</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BsSun className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">UV Index</p>
              <p className="text-xl font-bold text-yellow-600">{weatherData.uvIndex}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-teal-50 rounded-lg">
            <div className="p-3 bg-teal-100 rounded-full">
              <BsDroplet className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Soil Moisture</p>
              <p className="text-xl font-bold text-teal-600">{weatherData.soilMoisture}%</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
            <div className="p-3 bg-indigo-100 rounded-full">
              <BsCloudRain className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Precipitation</p>
              <p className="text-xl font-bold text-indigo-600">{weatherData.precipitation}%</p>
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
            {farmingCalendar.map((day, dayIndex) => (
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