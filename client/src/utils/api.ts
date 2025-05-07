// API URL helper that ensures the correct backend URL is always used
export const getApiUrl = () => {
  // HARDCODED PRODUCTION URL - This is the most reliable approach
  const PRODUCTION_API_URL = 'https://unibeez.onrender.com';
  const DEVELOPMENT_API_URL = 'http://localhost:3000';
  
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Get the current hostname
    const hostname = window.location.hostname;
    console.log('🔍 Current hostname detected:', hostname);
    
    // IMPORTANT: Only use localhost URL for actual localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🔧 Using DEVELOPMENT API:', DEVELOPMENT_API_URL);
      return DEVELOPMENT_API_URL;
    } else {
      // For ANY other hostname (including vercel.app domains), use production URL
      console.log('🚀 Using PRODUCTION API:', PRODUCTION_API_URL);
      console.log('🌐 Request will go to:', `${PRODUCTION_API_URL}/api/events-21301429`);
      return PRODUCTION_API_URL;
    }
  }
  
  // Default to production URL if not in browser
  console.log('⚠️ Not in browser environment, defaulting to PRODUCTION API');
  return PRODUCTION_API_URL;
};

// Log the API URL for debugging
const apiUrl = getApiUrl();
console.log('✅ Final API URL decision:', apiUrl);

// Helper function for API fetching with correct URL
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Add cache-busting parameter to prevent browser caching
  const cacheBuster = `_cb=${Date.now()}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  const cacheBustedEndpoint = `${endpoint}${separator}${cacheBuster}`;
  
  const url = `${getApiUrl()}${cacheBustedEndpoint}`;
  console.log('📡 Fetching from:', url);
  
  // Ensure credentials are included by default
  const fetchOptions = {
    ...options,
    credentials: 'include' as RequestCredentials
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    throw error;
  }
};

export default {
  getApiUrl,
  fetchApi
}; 