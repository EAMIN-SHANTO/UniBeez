// API URL helper that ensures the correct backend URL is always used
export const getApiUrl = () => {
  // HARDCODED PRODUCTION URL - ABSOLUTELY NO CONDITIONAL LOGIC
  // This ensures we always use the production URL no matter what
  return 'https://unibeez.onrender.com';
};

// Log the fixed API URL for debugging
console.log('📌 FIXED PRODUCTION API URL USED:', getApiUrl());

// Helper function for API fetching with correct URL
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Add cache-busting parameter to prevent browser caching
  const cacheBuster = `_cb=${Date.now()}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  const cacheBustedEndpoint = `${endpoint}${separator}${cacheBuster}`;
  
  // HARDCODED API URL for all requests
  const url = `https://unibeez.onrender.com${cacheBustedEndpoint}`;
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