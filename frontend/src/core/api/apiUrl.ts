/**
 * API URL Helper
 * Ensures the API base URL is always properly formatted with '/api' suffix,
 * even if configured as 'https://dilmet.onrender.com' or 'https://dilmet.onrender.com/' in Vercel.
 */

export const getApiUrl = (): string => {
  let url = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? 'https://api.dilmate.in/api' : 'http://localhost:5001/api')
  ).trim();

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // If running on a LAN IP on mobile/dev (e.g. 192.168.x.x), replace localhost/127.0.0.1 with current hostname
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    (url.includes('localhost') || url.includes('127.0.0.1'))
  ) {
    url = url.replace(/localhost|127\.0\.0\.1/g, window.location.hostname);
  }

  // Never let a deployed HTTPS page send credentials or session tokens over HTTP.
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    url.startsWith('http://') &&
    !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(url)
  ) {
    url = url.replace(/^http:\/\//i, 'https://');
  }

  // If missing '/api' at the end, append it
  if (!url.endsWith('/api')) {
    url += '/api';
  }

  return url;
};

export const API_URL = getApiUrl();
export default API_URL;
