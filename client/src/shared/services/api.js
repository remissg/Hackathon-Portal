import axios from 'axios';

// Bulletproof API Base URL Sanitizer
// Handles typos like "https://https//", "https//", preserves http:// for localhost
const getBaseUrl = () => {
  let raw = import.meta.env.VITE_API_BASE_URL;

  // If missing or still pointing to deprecated Render backend, redirect directly to active Railway backend
  if (!raw || raw.includes('onrender.com')) {
    raw = 'https://hackathon-portal-production-9f3f.up.railway.app/api';
  }

  let url = raw.trim();
  if (url.startsWith('/')) return url.replace(/\/+$/, '');

  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  // Strip duplicate or broken protocols (e.g., "https://https//", "http//")
  url = url.replace(/^(https?:?\/*)+/i, '');

  if (isLocalhost) {
    url = 'http://' + url;
  } else {
    url = 'https://' + url;
  }

  // Ensure /api suffix is present
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = url.replace(/\/+$/, '') + '/api';
  }

  return url.replace(/\/+$/, '');
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 45000, // 45s timeout ensures cloud cold starts and SMTP operations complete reliably
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
    if (
      error.response &&
      error.response.status === 403 &&
      error.response.data?.message?.toLowerCase().includes('deactivated')
    ) {
      if (localStorage.getItem('token') && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?deactivated=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

