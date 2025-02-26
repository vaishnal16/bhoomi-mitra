import { useState, useEffect } from 'react';
import { BsTruck, BsCalendar, BsGeo, BsBarChart, BsCheckCircle, BsFilter, BsSearch } from 'react-icons/bs';
import io from 'socket.io-client';
import '../../BiomassCollection.css';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api/biomass';
const ITEMS_PER_PAGE = 15;
const GEMINI_API_ENDPOINT = 'http://localhost:5000/api/gemini'; // Endpoint for Gemini API

function BiomassCollection() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [optimizationMetrics, setOptimizationMetrics] = useState({
    routeEfficiency: 0,
    fuelSaved: '0L',
    carbonReduction: '0 tons',
    collectionRate: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    species: '',
    location: '',
    wood: '',
    bark: 'High',
    date: new Date().toISOString().split('T')[0],
    status: 'Available'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    quality: '',
    energyRange: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Available filter options (will be populated from data)
  const [filterOptions, setFilterOptions] = useState({
    types: [],
    locations: [],
    qualities: ['High', 'Medium', 'Low'],
    energyRanges: ['0-5 MWh', '5-10 MWh', '10-15 MWh', '15+ MWh'],
    statuses: ['Available', 'In Progress', 'Collected', 'Processing']
  });

  // Gemini prediction state
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // Function to fetch predictions from Gemini API
  const fetchGeminiPredictions = async (filterParams) => {
    setIsGeminiLoading(true);
    try {
      // Prepare data for Gemini
      const biomassData = filteredCollections.map(item => ({
        species: item.type,
        dbh: Math.round(parseFloat(item.wood) * 2), // Simulate diameter breast height based on wood mass
        wood: parseFloat(item.wood),
        bark: item.quality === 'High' ? parseFloat(item.wood) * 0.2 : 
              item.quality === 'Medium' ? parseFloat(item.wood) * 0.15 : 
              parseFloat(item.wood) * 0.1,
        root: parseFloat(item.wood) * 0.3,
        rootsk: parseFloat(item.wood) * 0.1,
        branch: parseFloat(item.wood) * 0.25
      }));

      // Construct request for Gemini
      const requestData = {
        biomassData: biomassData,
        filters: filterParams
      };

      const response = await fetch(GEMINI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const predictions = await response.json();

      // Format the predictions for our UI
      const formattedMetrics = {
        routeEfficiency: Math.round(predictions.routeEfficiency * 100),
        fuelSaved: `${Math.round(predictions.fuelSaved * 100)}L`,
        carbonReduction: `${Math.round(predictions.carbonReduction * 100)} tons`,
        collectionRate: `${Math.round(predictions.collectionRate * 100)}%`
      };

      setOptimizationMetrics(formattedMetrics);
    } catch (err) {
      console.error("Error fetching Gemini predictions:", err);
      // If Gemini prediction fails, generate random values for demo purposes
      generateFallbackMetrics();
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Fallback function to generate random metrics for demo purposes
  const generateFallbackMetrics = () => {
    // Adjust values based on current filters
    let efficiencyBase = 65; // Base efficiency percentage
    let fuelBase = 75; // Base fuel saved in liters
    let carbonBase = 45; // Base carbon reduction in tons
    let collectionBase = 70; // Base collection rate percentage
    
    // Apply modifiers based on filters
    if (filters.type) efficiencyBase += 10;
    if (filters.location) fuelBase += 15;
    if (filters.quality === 'High') {
      efficiencyBase += 15;
      carbonBase += 20;
    } else if (filters.quality === 'Medium') {
      efficiencyBase += 8;
      carbonBase += 10;
    }
    
    if (filters.energyRange) {
      const range = filters.energyRange.split('-');
      if (range[0] === '10' || range[0] === '15+') {
        carbonBase += 25;
        collectionBase += 15;
      }
    }
    
    // Add some randomness
    const randomFactor = () => Math.floor(Math.random() * 10) - 5;
    
    setOptimizationMetrics({
      routeEfficiency: Math.min(100, Math.max(0, efficiencyBase + randomFactor())),
      fuelSaved: `${Math.max(0, fuelBase + randomFactor())}L`,
      carbonReduction: `${Math.max(0, carbonBase + randomFactor())} tons`,
      collectionRate: `${Math.min(100, Math.max(0, collectionBase + randomFactor()))}%`
    });
  };

  const fetchBiomassData = async () => {
    try {
      // Simple fetch without authentication
      const response = await fetch(`${API_URL}/external`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw Backend Response:", data);

      if (!Array.isArray(data)) {
        console.error("Error: Data is not an array", data);
        setError("Invalid data format received from server");
        return;
      }

      // Transform data to match our display format
      const transformedData = data.map((entry, index) => ({
        id: entry.id || index + 1,
        type: entry.species || "Unknown",
        location: entry.location || "N/A",
        quantity: entry.wood ? `${entry.wood} tons` : "N/A",
        wood: entry.wood || 0, // Keep the raw number for filtering
        date: entry.date || new Date().toISOString().split("T")[0],
        quality: entry.bark || "High",
        energyPotential: entry.wood 
          ? `${(parseFloat(entry.wood) * 1.5).toFixed(1)} MWh` 
          : "N/A",
        energyValue: entry.wood ? parseFloat(entry.wood) * 1.5 : 0, // Raw value for filtering
        status: entry.status || "Available"
      }));

      console.log("Transformed Data:", transformedData);
      setCollections(transformedData);
      setFilteredCollections(transformedData);

      // Extract unique values for filter options
      const types = [...new Set(transformedData.map(item => item.type))];
      const locations = [...new Set(transformedData.map(item => item.location))];
      const statuses = [...new Set(transformedData.map(item => item.status))];
      
      setFilterOptions(prev => ({
        ...prev,
        types,
        locations,
        statuses: statuses.length > 0 ? statuses : prev.statuses
      }));

      setLoading(false);
      
      // Initial metrics prediction
      fetchGeminiPredictions(filters);
    } catch (err) {
      setError("Failed to fetch biomass data");
      console.error("Error fetching biomass data:", err);
      setLoading(false);
      generateFallbackMetrics();
    }
  };

  const createCollection = async (collectionData) => {
    try {
      const response = await fetch(`${API_URL}/external`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`Server responded with ${response.status}: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error;
    }
  };

  // Initialize Socket.IO connection and fetch data
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('metrics_update', (data) => {
      setOptimizationMetrics(data);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    fetchBiomassData();

    return () => socket.close();
  }, []);

  // Apply filters and pagination whenever filtered data or page changes
  useEffect(() => {
    applyFilters();
  }, [collections, filters, searchQuery]);

  // Update pagination whenever filtered data changes
  useEffect(() => {
    const total = Math.ceil(filteredCollections.length / ITEMS_PER_PAGE);
    setTotalPages(total || 1);
    
    // Reset to page 1 if current page is now out of bounds
    if (currentPage > total) {
      setCurrentPage(1);
    }
    
    // Calculate paginated data
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedData(filteredCollections.slice(startIndex, endIndex));
    
    // Update optimization metrics based on filtered collections
    fetchGeminiPredictions(filters);
  }, [filteredCollections]);

  // Apply all filters and search to the data
  const applyFilters = () => {
    let filtered = [...collections];

    // Apply text search across multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.type.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }

    // Apply dropdown filters
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }

    if (filters.quality) {
      filtered = filtered.filter(item => item.quality === filters.quality);
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Apply energy range filter
    if (filters.energyRange) {
      const [min, max] = filters.energyRange.split('-').map(val => {
        // Handle the "15+" case
        if (val.includes('+')) {
          return parseFloat(val);
        }
        return parseFloat(val);
      });

      filtered = filtered.filter(item => {
        if (max) {
          return item.energyValue >= min && item.energyValue < max;
        } else {
          // For the "15+" case
          return item.energyValue >= min;
        }
      });
    }

    setFilteredCollections(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: '',
      location: '',
      quality: '',
      energyRange: '',
      status: ''
    });
    setSearchQuery('');
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Calculate energy potential based on wood quantity
  const calculateEnergyPotential = (woodQuantity) => {
    if (!woodQuantity || isNaN(parseFloat(woodQuantity))) return '';
    return (parseFloat(woodQuantity) * 1.5).toFixed(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Automatically calculate energy potential when wood quantity changes
    if (name === 'wood') {
      const energyPotential = calculateEnergyPotential(value);
      setNewCollection({
        ...newCollection,
        [name]: value,
        energyPotential
      });
    } else {
      setNewCollection({
        ...newCollection,
        [name]: value
      });
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare the data for the backend
      const collectionData = {
        species: newCollection.species,
        location: newCollection.location,
        wood: parseFloat(newCollection.wood),
        bark: newCollection.bark,
        date: newCollection.date,
        status: 'Available'
      };
      
      try {
        // Try to create through API first
        await createCollection(collectionData);
        console.log("Collection created successfully via API");
      } catch (apiError) {
        console.warn("API creation failed, adding collection locally", apiError);
        
        // If API fails, add the item locally to the collections array
        const newItem = {
          id: collections.length + 1,
          type: collectionData.species,
          location: collectionData.location,
          quantity: `${collectionData.wood} tons`,
          wood: collectionData.wood,
          date: collectionData.date,
          quality: collectionData.bark,
          energyPotential: `${calculateEnergyPotential(collectionData.wood)} MWh`,
          energyValue: parseFloat(collectionData.wood) * 1.5,
          status: collectionData.status
        };
        
        // Update the collections state directly
        setCollections(prevCollections => [...prevCollections, newItem]);
      }
      
      // Reset form regardless of API success
      setShowModal(false);
      setNewCollection({
        species: '',
        location: '',
        wood: '',
        bark: 'High',
        date: new Date().toISOString().split('T')[0],
        status: 'Available'
      });
      
      // Refetch to include the new collection, or reload page 1
      setCurrentPage(1);
      
      // Update metrics after adding a new collection
      fetchGeminiPredictions(filters);
      
    } catch (err) {
      setError('Failed to create collection');
      console.error("Error in handleCreateCollection:", err);
      alert(`Failed to create collection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div className="biomass-container">
      <div className="header">
        <h2 className="title">AI-Optimized Biomass Collection</h2>
        <button className="schedule-button" onClick={() => setShowModal(true)}>
          Schedule Collection
        </button>
      </div>

      {/* Optimization Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <BsTruck className="icon green" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Route Efficiency</p>
            <p className="metric-value green">
              {isGeminiLoading ? 
                <span className="loading-pulse">{optimizationMetrics.routeEfficiency}%</span> : 
                `${optimizationMetrics.routeEfficiency}%`
              }
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BsBarChart className="icon blue" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Fuel Saved</p>
            <p className="metric-value blue">
              {isGeminiLoading ? 
                <span className="loading-pulse">{optimizationMetrics.fuelSaved}</span> : 
                optimizationMetrics.fuelSaved
              }
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BsCheckCircle className="icon purple" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Carbon Reduction</p>
            <p className="metric-value purple">
              {isGeminiLoading ? 
                <span className="loading-pulse">{optimizationMetrics.carbonReduction}</span> : 
                optimizationMetrics.carbonReduction
              }
            </p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BsGeo className="icon yellow" />
          </div>
          <div className="metric-content">
            <p className="metric-label">Collection Rate</p>
            <p className="metric-value yellow">
              {isGeminiLoading ? 
                <span className="loading-pulse">{optimizationMetrics.collectionRate}</span> : 
                optimizationMetrics.collectionRate
              }
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="search-filter-container">
        <div className="search-box">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by type, location, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <button 
            className="filter-toggle-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <BsFilter className="filter-icon" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {filteredCollections.length !== collections.length && (
            <button 
              className="reset-filters-button"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
      
      {/* Expanded Filter Section */}
      {showFilters && (
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="type-filter">Biomass Type</label>
              <select
                id="type-filter"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Types</option>
                {filterOptions.types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="location-filter">Location</label>
              <select
                id="location-filter"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="quality-filter">Quality</label>
              <select
                id="quality-filter"
                name="quality"
                value={filters.quality}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Qualities</option>
                {filterOptions.qualities.map(quality => (
                  <option key={quality} value={quality}>{quality}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="energy-filter">Energy Potential</label>
              <select
                id="energy-filter"
                name="energyRange"
                value={filters.energyRange}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Ranges</option>
                <option value="0-5">0-5 MWh</option>
                <option value="5-10">5-10 MWh</option>
                <option value="10-15">10-15 MWh</option>
                <option value="15+">15+ MWh</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="status-filter">Status</label>
              <select
                id="status-filter"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Collection Schedule Table with Pagination */}
      <div className="table-container">
        <h3 className="table-title">
          Collection Schedule 
          <span className="results-counter">
            Showing {paginatedData.length} of {filteredCollections.length} results
          </span>
        </h3>
        <div className="table-wrapper">
          <table className="collection-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Quality</th>
                <th>Energy Potential</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((collection) => (
                  <tr key={collection.id}>
                    <td>{collection.type}</td>
                    <td>{collection.location}</td>
                    <td>{collection.quantity}</td>
                    <td>{new Date(collection.date).toLocaleDateString()}</td>
                    <td>{collection.quality}</td>
                    <td>{collection.energyPotential}</td>
                    <td>
                      <span className={`status-badge ${collection.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {collection.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No collections found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button 
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button 
              className="pagination-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button 
              className="pagination-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button 
              className="pagination-button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        )}
      </div>

      {/* Add Collection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Schedule New Collection</h3>
            <form onSubmit={handleCreateCollection} className="space-y-3">
              {/* Biomass Type Dropdown */}
              <select
                name="species"
                value={newCollection.species}
                onChange={handleInputChange}
                required
                className="w-full border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Biomass Type</option>
                <option value="Crop Residue">Crop Residue</option>
                <option value="Wood Waste">Wood Waste</option>
                <option value="Agricultural Waste">Agricultural Waste</option>
                <option value="Forest Residue">Forest Residue</option>
                <option value="Sawdust">Sawdust</option>
                <option value="Pine">Pine</option>
                <option value="Oak">Oak</option>
                <option value="Maple">Maple</option>
              </select>

              {/* Location Input */}
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={newCollection.location}
                onChange={handleInputChange}
                required
                className="w-full border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Quantity Input */}
              <input
                type="number"
                name="wood"
                placeholder="Quantity (in tons)"
                value={newCollection.wood}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                className="w-full border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Date Picker */}
              <input
                type="date"
                name="date"
                value={newCollection.date}
                onChange={handleInputChange}
                required
                className="w-full border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Energy Level Selection */}
              <select
                name="bark"
                value={newCollection.bark}
                onChange={handleInputChange}
                required
                className="w-full border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Energy Potential (Read-Only) */}
              <input
                type="text"
                placeholder="Energy Potential (MWh)"
                value={`${calculateEnergyPotential(newCollection.wood)} MWh`}
                readOnly
                disabled
                className="w-full border-gray-300 rounded-md p-2 bg-gray-100 cursor-not-allowed"
              />

              {/* Buttons */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BiomassCollection;