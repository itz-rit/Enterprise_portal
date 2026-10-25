const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const hostname = typeof window === 'undefined' ? '' : window.location.hostname;
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

export const API_BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : isLocalHost
    ? 'http://localhost:5000'
    : 'http://demo.local'; // fallback for demo mode — interceptor handles all requests

export const getApiUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
