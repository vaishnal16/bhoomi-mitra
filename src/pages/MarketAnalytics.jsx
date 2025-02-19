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
import { fetchAgricultureNews } from '../services/googleNews';
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

function MarketAnalytics() {
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [timeRange, setTimeRange] = useState('1M');
  const [region, setRegion] = useState('national');
  const [newsUpdates, setNewsUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_KEY = import.meta.env.VITE_GOOGLE_NEWS_API_KEY;
  const CX_ID = import.meta.env.VITE_GOOGLE_CX_ID;
  const query = "agriculture farming crops India";

  
  const [marketData, setMarketData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Actual Price',
        data: [2100, 2300, 2200, 2400, 2600, 2800, 2900, 3100, 3300, 3200, 3400, 3600],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Predicted Price',
        data: [2100, 2300, 2200, 2400, 2600, 2800, 2900, 3100, 3300, 3500, 3700, 3900],
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false
      }
    ]
  });

  const [marketInsights] = useState({
    priceVolatility: 'Medium',
    confidenceScore: 85,
    marketSentiment: 'Bullish',
    tradingVolume: '12,500 tons',
    priceChange: '+5.2%',
    predictedTrend: 'Upward',
    recommendations: [
      'Consider forward contracts for price security',
      'Monitor international market movements',
      'Stock inventory for potential price rise'
    ]
  });

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



  const [priceAlerts] = useState([
    {
      crop: 'Rice',
      type: 'Price Surge',
      message: 'Price expected to rise by 8% in next 2 weeks',
      confidence: 85,
      timestamp: '2024-03-15T10:30:00Z'
    },
    {
      crop: 'Wheat',
      type: 'Market Opportunity',
      message: 'Optimal selling window approaching',
      confidence: 92,
      timestamp: '2024-03-14T15:45:00Z'
    }
  ]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Price Trends & Predictions`,
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
                  {alert.message} ({alert.confidence}% confidence)
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
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                  {marketInsights.priceVolatility}
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
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  {marketInsights.marketSentiment}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trading Volume</span>
                <span className="text-sm font-medium text-gray-900">
                  {marketInsights.tradingVolume}
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