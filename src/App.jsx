import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DiseaseDetection from "./pages/DiseaseDetection.jsx";
import MarketAnalytics from "./pages/MarketAnalytics.jsx";
import WeatherInsights from "./pages/WeatherInsights.jsx";
import SubsidyChecker from "./pages/SubsidyChecker.jsx";
import CropCalendar from "./pages/CropCalendar.jsx";
import AISupport from "./pages/AISupport.jsx";
import Landing from "./pages/Landing.jsx";
import AuthPages from "./pages/AuthPages.jsx";
import Voicechatbot from "./pages/Voicechatbot.jsx";
import BiomassCollection from "./pages/BiomassCollection";
import SupplyChain from "./pages/SupplyChainForm.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages (No Sidebar & Navbar) */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPages />} />

        {/* Protected Routes (With Sidebar & Navbar) */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <ProtectedLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

/* Protected Layout - Includes Sidebar & Navbar */
function ProtectedLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="md:ml-64 flex flex-col h-screen w-full bg-gray-100">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/market-analytics" element={<MarketAnalytics />} />
            <Route path="/weather-insights" element={<WeatherInsights />} />
            <Route path="/subsidy-checker" element={<SubsidyChecker />} />
            <Route path="/crop-calendar" element={<CropCalendar />} />
            <Route path="/supply-chain" element={<SupplyChain />} />
            <Route path="/ai-support" element={<AISupport />} />
            <Route path="/voice-support" element={<Voicechatbot/>} />
            <Route path="/biomass-collection" element={<BiomassCollection />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
