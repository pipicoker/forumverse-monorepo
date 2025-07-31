// src/lib/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL}/api`, 
  timeout: 10000, // 10 second timeout
  headers: {
    'Accept-Encoding': 'gzip, deflate, br'
  }
});

// Automatically attach token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling and caching
instance.interceptors.response.use(
  (response) => {
    // Add timestamp for cache invalidation
    response.data._timestamp = Date.now();
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    return Promise.reject(error);
  }
);
export default instance;
