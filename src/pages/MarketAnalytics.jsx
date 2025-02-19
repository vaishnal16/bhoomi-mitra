import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { BsArrowUp, BsArrowDown, BsNewspaper, BsBell, BsGraphUp, BsCashStack, BsGlobe } from 'react-icons/bs';
import ErrorBoundary from "../components/ErrorBoundary";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Realistic crop price data (₹/quintal)
const cropData = {
  rice: {
    actualPrices: [2150, 2280, 2340, 2410, 2560, 2720, 2850, 2920, 3050, 3180, 3250, 3410],
    predictedPrices: [2150, 2290, 2350, 2430, 2590, 2750, 2880, 2960, 3090, 3230, 3320, 3490],
    volatility: 'Low',
    confidenceScore: 88,
    marketSentiment: 'Bullish',
    tradingVolume: '18,750 tons',
    priceChange: '+6.1%',
    predictedTrend: 'Upward',
    recommendations: [
      'Hold inventory for better prices in post-harvest season',
      'Consider quality improvement for premium pricing',
      'Monitor international export policy changes'
    ],
    priceAlerts: [
      {
        type: 'Price Surge',
        message: 'Price expected to rise by 8% in next 3 weeks',
        confidence: 85,
        timestamp: '2024-03-15T10:30:00Z'
      },
      {
        type: 'Export Demand',
        message: 'Rising export demand from Middle East',
        confidence: 78,
        timestamp: '2024-03-10T09:15:00Z'
      }
    ]
  },
  wheat: {
    actualPrices: [2320, 2290, 2350, 2420, 2510, 2650, 2780, 2910, 3050, 3190, 3340, 3510],
    predictedPrices: [2320, 2300, 2380, 2450, 2540, 2690, 2820, 2960, 3100, 3250, 3410, 3590],
    volatility: 'Medium',
    confidenceScore: 82,
    marketSentiment: 'Neutral',
    tradingVolume: '22,340 tons',
    priceChange: '+3.8%',
    predictedTrend: 'Stable with upward bias',
    recommendations: [
      'Ideal time for forward contracts',
      'Watch global wheat production forecasts',
      'Consider storage for 3-4 months for better returns'
    ],
    priceAlerts: [
      {
        type: 'Market Opportunity',
        message: 'Optimal selling window approaching',
        confidence: 92,
        timestamp: '2024-03-14T15:45:00Z'
      },
      {
        type: 'Quality Premium',
        message: 'Premium of 8-10% for protein content >11.5%',
        confidence: 87,
        timestamp: '2024-03-08T12:30:00Z'
      }
    ]
  },
  corn: {
    actualPrices: [1850, 1890, 1920, 1970, 2050, 2110, 2180, 2240, 2290, 2320, 2360, 2410],
    predictedPrices: [1850, 1900, 1930, 1990, 2070, 2130, 2210, 2270, 2320, 2360, 2410, 2470],
    volatility: 'Medium-High',
    confidenceScore: 76,
    marketSentiment: 'Cautiously Bullish',
    tradingVolume: '15,820 tons',
    priceChange: '+4.2%',
    predictedTrend: 'Gradual increase',
    recommendations: [
      'Consider staggered selling approach',
      'Watch ethanol demand trends carefully',
      'Monitor feed industry demand fluctuations'
    ],
    priceAlerts: [
      {
        type: 'Feed Demand',
        message: 'Increased demand from poultry sector',
        confidence: 81,
        timestamp: '2024-03-12T14:20:00Z'
      },
      {
        type: 'Weather Alert',
        message: 'Drought conditions may affect new crop prices',
        confidence: 75,
        timestamp: '2024-03-09T08:45:00Z'
      }
    ]
  },
  soybeans: {
    actualPrices: [3650, 3720, 3680, 3750, 3820, 3920, 4050, 4180, 4220, 4190, 4260, 4350],
    predictedPrices: [3650, 3730, 3700, 3780, 3860, 3970, 4100, 4230, 4270, 4250, 4330, 4430],
    volatility: 'High',
    confidenceScore: 74,
    marketSentiment: 'Volatile',
    tradingVolume: '9,240 tons',
    priceChange: '+7.9%',
    predictedTrend: 'Volatile with upward bias',
    recommendations: [
      'Consider hedging strategies for price protection',
      'Monitor international oilseed markets closely',
      'Watch crush margins and oil demand trends'
    ],
    priceAlerts: [
      {
        type: 'Oil Demand',
        message: 'Edible oil prices trending upward',
        confidence: 82,
        timestamp: '2024-03-16T11:10:00Z'
      },
      {
        type: 'Export Potential',
        message: 'Potential for increased exports to China',
        confidence: 68,
        timestamp: '2024-03-07T16:30:00Z'
      }
    ]
  }
};

// Adjust data based on timeRange
const getTimeRangeData = (cropName, timeRange) => {
  const data = cropData[cropName];
  
  switch(timeRange) {
    case '1W':
      // Last week's daily data (7 days)
      const lastWeekActual = data.actualPrices.slice(-1)[0];
      const lastWeekPredicted = data.predictedPrices.slice(-1)[0];
      const dailyVariation = [-0.5, 0.3, -0.2, 0.4, 0.6, -0.3, 0.2]; // % daily changes
      
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Actual Price',
            data: dailyVariation.map((var_pct, i) => Math.round(lastWeekActual * (1 + dailyVariation[i]/100))),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Predicted Price',
            data: dailyVariation.map((var_pct, i) => Math.round(lastWeekPredicted * (1 + (dailyVariation[i] + 0.1)/100))),
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      };
    case '1M':
      // Last month's weekly data (4 weeks)
      const monthActual = data.actualPrices.slice(-3);
      const monthPredicted = data.predictedPrices.slice(-3);
      
      return {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Actual Price',
            data: [
              monthActual[0] - Math.round(Math.random() * 50),
              monthActual[0],
              monthActual[1],
              monthActual[2]
            ],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Predicted Price',
            data: [
              monthPredicted[0] - Math.round(Math.random() * 40),
              monthPredicted[0],
              monthPredicted[1],
              monthPredicted[2] + Math.round(Math.random() * 30)
            ],
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      };
    case '3M':
      // Last quarter (3 months)
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Actual Price',
            data: data.actualPrices.slice(6),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Predicted Price',
            data: data.predictedPrices.slice(6),
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      };
    case '1Y':
    default:
      // Full year
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Actual Price',
            data: data.actualPrices,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            fill: false
          },
          {
            label: 'Predicted Price',
            data: data.predictedPrices,
            borderColor: 'rgb(255, 99, 132)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      };
  }
};

// Adjust data based on region
const adjustPricesByRegion = (marketData, region) => {
  if (region === 'national') return marketData;
  
  const regionAdjustments = {
    north: { factor: 1.05, offset: 20 },  // 5% higher on average
    south: { factor: 0.97, offset: -15 },  // 3% lower on average
    east: { factor: 0.93, offset: -25 },   // 7% lower on average
    west: { factor: 1.08, offset: 35 }     // 8% higher on average
  };
  
  const adjustment = regionAdjustments[region];
  
  const adjustedData = {...marketData};
  adjustedData.datasets = marketData.datasets.map(dataset => {
    return {
      ...dataset,
      data: dataset.data.map(price => Math.round(price * adjustment.factor + adjustment.offset))
    };
  });
  
  return adjustedData;
};

function MarketAnalytics() {
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [timeRange, setTimeRange] = useState('1M');
  const [region, setRegion] = useState('national');
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(getTimeRangeData('rice', '1M'));
  const [marketInsights, setMarketInsights] = useState(cropData.rice);
  const [priceAlerts, setPriceAlerts] = useState(cropData.rice.priceAlerts);
  const API_KEY = import.meta.env.VITE_GOOGLE_NEWS_API_KEY;
  const CX_ID = import.meta.env.VITE_GOOGLE_CX_ID;
  const query = "agriculture farming crops India";

  // Update data when crop, timeRange or region changes
  useEffect(() => {
    const baseData = getTimeRangeData(selectedCrop, timeRange);
    const regionAdjustedData = adjustPricesByRegion(baseData, region);
    setMarketData(regionAdjustedData);
    setMarketInsights(cropData[selectedCrop]);
    setPriceAlerts(cropData[selectedCrop].priceAlerts);
  }, [selectedCrop, timeRange, region]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX_ID}&key=${API_KEY}&sort=date&num=10`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();

        if (data.items) {
          const formattedNews = data.items.map((item) => ({
            title: item.title,
            description: item.snippet,
            source: item.displayLink,
            link: item.link,
            publishedAt: new Date().toLocaleDateString(), // Google API doesn't provide a date, using current date as a placeholder
          }));

          setNewsUpdates(formattedNews);
        } else {
          setNewsUpdates([]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Price Trends & Predictions - ${region.charAt(0).toUpperCase() + region.slice(1)} Market`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price (₹/quintal)'
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Market Analytics</h2>
        <div className="flex space-x-4">
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="rice">Rice</option>
            <option value="wheat">Wheat</option>
            <option value="corn">Corn</option>
            <option value="soybeans">Soybeans</option>
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="national">National</option>
            <option value="north">North Region</option>
            <option value="south">South Region</option>
            <option value="east">East Region</option>
            <option value="west">West Region</option>
          </select>
          <div className="flex rounded-md shadow-sm">
            {['1W', '1M', '3M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 first:rounded-l-md last:rounded-r-md -ml-px first:ml-0`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Alerts */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <BsBell className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Price Alerts</h3>
            <div className="mt-2 space-y-2">
              {priceAlerts.map((alert, index) => (
                <p key={index} className="text-sm text-yellow-700">
                  <span className="font-medium">{alert.type}:</span> {alert.message} ({alert.confidence}% confidence)
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Market Insights Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Market Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price Volatility</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  marketInsights.volatility === 'Low' ? 'bg-green-100 text-green-800' :
                  marketInsights.volatility === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {marketInsights.volatility}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confidence Score</span>
                <span className="text-sm font-medium text-gray-900">
                  {marketInsights.confidenceScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Market Sentiment</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  marketInsights.marketSentiment.includes('Bull') ? 'bg-green-100 text-green-800' :
                  marketInsights.marketSentiment.includes('Bear') ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {marketInsights.marketSentiment}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trading Volume</span>
                <span className="text-sm font-medium text-gray-900">
                  {marketInsights.tradingVolume}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price Change (YTD)</span>
                <span className={`text-sm font-medium ${
                  marketInsights.priceChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {marketInsights.priceChange}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Predicted Trend</span>
                <span className="text-sm font-medium text-gray-900">
                  {marketInsights.predictedTrend}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
            <ul className="space-y-3">
              {marketInsights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <BsGraphUp className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Price Trends Chart */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Line options={options} data={marketData} />
          </div>
        </div>
      </div>

      {/* Market News */}
      <ErrorBoundary>
      <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Market News & Analysis
      </h3>

      {loading ? (
        <p className="text-gray-600">Loading news...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsUpdates.length > 0 ? (
            newsUpdates.map((news, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <BsNewspaper className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      <a href={news.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {news.title}
                      </a>
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">{news.description}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>{news.source}</span>
                      <span className="mx-1">•</span>
                      <span>{news.publishedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No news available at the moment.</p>
          )}
        </div>
      )}
    </div>
      </ErrorBoundary>
    </div>
  );
}

export default MarketAnalytics;