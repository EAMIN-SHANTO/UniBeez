// This is a hardcoded configuration file that is not affected by .env or any environment variables
// It ensures that API URLs are always correct, regardless of environment

// API URL Configuration
export const PRODUCTION_API_URL = 'https://unibeez.onrender.com';
export const DEVELOPMENT_API_URL = 'http://localhost:3000';

// Always use the production URL in any environment - NO CONDITIONALS
export const API_URL = PRODUCTION_API_URL;

// Cache busting
export const addCacheBuster = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_cb=${Date.now()}`;
};

// Debug helper to track where config values are being accessed
export const getApiUrl = (source: string = 'unknown'): string => {
  console.log(`📌 API URL requested from [${source}]: ${API_URL}`);
  return API_URL;
};

// Log config info at load time
console.log('🔧 Config loaded - PRODUCTION mode active');
console.log('🔧 API URL hardcoded to:', API_URL);
console.log('🔧 Current hostname:', window.location.hostname);
console.log('🔧 Current pathname:', window.location.pathname);

// Make all exports available as default export for convenience
export default {
  API_URL,
  PRODUCTION_API_URL,
  DEVELOPMENT_API_URL,
  addCacheBuster,
  getApiUrl
};
