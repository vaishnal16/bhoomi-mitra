import axios from 'axios';

const API_URL = 'http://localhost:5000/api/biomass';

// Get auth token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const biomassService = {
  getCollections: async () => {
    const response = await axiosInstance.get('/');
    return response.data;
  },

  createCollection: async (collectionData) => {
    const response = await axiosInstance.post('/', collectionData);
    return response.data;
  },

  updateCollection: async (id, collectionData) => {
    const response = await axiosInstance.put(`/${id}`, collectionData);
    return response.data;
  },

  deleteCollection: async (id) => {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  },

  getOptimizationMetrics: async () => {
    const response = await axiosInstance.get('/metrics');
    return response.data;
  }
};
