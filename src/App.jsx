import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import DiseaseDetection from "./pages/DiseaseDetection";
import MarketAnalytics from "./pages/MarketAnalytics";
import WeatherInsights from "./pages/WeatherInsights";
import SubsidyChecker from "./pages/SubsidyChecker";
import AISupport from "./pages/AISupport";
import Landing from "./pages/Landing";
import CropCalendar from "./pages/CropCalendar"; 

function App() {
  return (
    <Router>
      <Sidebar />
      <div className="md:ml-64 flex flex-col h-screen bg-gray-100">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/market-analytics" element={<MarketAnalytics />} />
            <Route path="/weather-insights" element={<WeatherInsights />} />
            <Route path="/subsidy-checker" element={<SubsidyChecker />} />
            <Route path="/crop-calendar" element={<CropCalendar />} />
            <Route path="/ai-support" element={<AISupport />} />
            <Route path="/landing" element={<Landing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
