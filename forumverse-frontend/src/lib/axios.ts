// src/lib/axios.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001'}/api`, 
});

// Automatically attach token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug: log token details for notification requests
      if (config.url?.includes('/notifications')) {
        console.log('[Axios] Token Info:', {
          url: config.url,
          tokenLength: token.length,
          tokenStart: token.substring(0, 20) + '...',
          hasAuthHeader: !!config.headers.Authorization,
        });
      }
    } else {
      // Debug: log when token is missing for authenticated endpoints
      const url = config.url || '';
      if (url.includes('/notifications') || url.includes('/posts') || url.includes('/comments')) {
        console.warn(`[Axios] No token found in localStorage for request to: ${url}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
