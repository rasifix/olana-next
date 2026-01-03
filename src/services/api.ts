import axios from 'axios';

const api = axios.create({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.zimaa.ch/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication, logging, etc.
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
