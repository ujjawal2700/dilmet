/**
 * API URL Helper
 * Ensures the API base URL is always properly formatted with '/api' suffix,
 * even if configured as 'https://dilmet.onrender.com' or 'https://dilmet.onrender.com/' in Vercel.
 */

export const getApiUrl = (): string => {
  let url = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:5000/api'
  ).trim();

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // If missing '/api' at the end, append it
  if (!url.endsWith('/api')) {
    url += '/api';
  }

  return url;
};

export const API_URL = getApiUrl();
export default API_URL;

