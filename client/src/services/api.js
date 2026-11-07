import axios from 'axios';

// Bulletproof API Base URL Sanitizer
// Handles typos like "https://https//", "https//", missing "https://", or trailing slashes
const getBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw) return '/api';

  let url = raw.trim();
  if (url.startsWith('/')) return url.replace(/\/+$/, '');

  // Strip duplicate or broken protocols (e.g., "https://https//", "https//")
  url = url.replace(/^(https?:?\/*)+/i, '');
  url = 'https://' + url;

  // Ensure /api suffix is present
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = url.replace(/\/+$/, '') + '/api';
  }

  return url.replace(/\/+$/, '');
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000, // 15s timeout prevents infinite spinners
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

