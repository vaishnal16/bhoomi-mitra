import React, { useState, useEffect } from 'react';
// Import JSON data (Ensure cropData.json is in src/assets/)
import cropJsonData from '../assets/cropData.json';

function CropCalendar() {
  const [regionFilter, setRegionFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cropData, setCropData] = useState([]); // Rename imported JSON variable

  const itemsPerPage = 8;

  // Load crop data
  useEffect(() => {
    setCropData(cropJsonData.crops); // Use the imported JSON data
  }, []);

  // Filter crops based on selected filters
  const filteredCrops = cropData.filter(crop => {
    const regionMatch = regionFilter === 'all' || crop.region === regionFilter;
    const cropMatch = cropFilter === 'all' || crop.crop === cropFilter;
    return regionMatch && cropMatch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCrops.length / itemsPerPage);
  const paginatedCrops = filteredCrops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get unique regions for filter
  const uniqueRegions = [...new Set(cropData.map(crop => crop.region))].sort();

  // Handle details button click
  const handleDetailsClick = (crop) => {
    setSelectedCrop(crop);
    setShowModal(true);
  };

  // Handle region filter change
  const handleRegionFilterChange = (e) => {
    setRegionFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle crop filter change
  const handleCropFilterChange = (e) => {
    setCropFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl w-full mx-auto font-sans bg-slate-50 min-h-screen rounded-lg p-6 shadow-lg">

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 py-6 px-6 shadow-md rounded-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-white m-0">Agricultural Planting & Harvest Calendar</h1>
              <p className="text-green-100 mt-1">Strategic timing for optimal crop yields by region</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Planning Guide</h2>
          <p className="text-gray-600 mb-4">
            Use our comprehensive crop calendar to strategically plan your agricultural activities. 
            Optimal timing is critical for maximizing yields and minimizing pest and disease issues.
          </p>
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <p className="text-sm text-green-700">
              <strong>Pro Tip:</strong> Consider your local microclimate conditions when planning. Always 
              consult with your local agricultural extension for region-specific recommendations.
            </p>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Options</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                id="region-filter"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                value={regionFilter}
                onChange={handleRegionFilterChange}
              >
                <option value="all">All Regions</option>
                {uniqueRegions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="crop-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type
              </label>
              <select
                id="crop-filter"
                className="w-full p-3 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                value={cropFilter}
                onChange={handleCropFilterChange}
              >
                <option value="all">All Crops</option>
                {[...new Set(cropData.map(crop => crop.crop))].sort().map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Currently displaying:</span> {filteredCrops.length} crops
              {regionFilter !== 'all' && ` in ${regionFilter}`}
              {cropFilter !== 'all' && ` filtered for ${cropFilter}`}
            </p>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Crop Calendar</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CROP
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    REGION
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SOWING PERIOD
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HARVEST PERIOD
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DETAILS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCrops.length > 0 ? (
                  paginatedCrops.map((crop) => (
                    <tr key={crop.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {crop.crop}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {crop.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {crop.sowingPeriod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {crop.harvestPeriod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleDetailsClick(crop)}
                          className="bg-green-600 text-white py-1.5 px-3 rounded-md text-sm mr-2 hover:bg-green-700 transition shadow-sm"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No crops found matching your criteria. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Enhanced Pagination */}
          {filteredCrops.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCrops.length)} of {filteredCrops.length} results
                </div>
                
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`h-9 px-3 flex items-center justify-center rounded border ${
                      currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-gray-500 mx-1">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`h-9 w-9 flex items-center justify-center rounded ${
                            currentPage === page 
                              ? 'bg-green-600 text-white border-green-600' 
                              : 'text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`h-9 px-3 flex items-center justify-center rounded border ${
                      currentPage === totalPages || totalPages === 0 
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && selectedCrop && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="relative p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-green-800">{selectedCrop.crop} - Growing Guide</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Crop Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Region</p>
                    <p className="font-medium text-gray-900">{selectedCrop.region}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Sowing Period</p>
                    <p className="font-medium text-gray-900">{selectedCrop.sowingPeriod}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-500 mb-1">Harvest Period</p>
                    <p className="font-medium text-gray-900">{selectedCrop.harvestPeriod}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Growing Details</h3>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                  <p className="text-gray-700">{selectedCrop.details}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Key Considerations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Monitor soil moisture regularly, especially during critical growth stages
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Implement integrated pest management strategies to minimize chemical use
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Adjust planting dates based on local weather forecasts and soil conditions
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CropCalendar;