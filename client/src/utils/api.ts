// API URL helper that ensures the correct backend URL is always used
export const getApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Use environment variables for API URLs
    return window.location.hostname === 'localhost' 
      ? import.meta.env.VITE_API_URL_DEV || 'http://localhost:3000'
      : import.meta.env.VITE_API_URL || 'https://unibeez.onrender.com';
  }
  // Default to production URL if not in browser (unlikely scenario)
  return import.meta.env.VITE_API_URL || 'https://unibeez.onrender.com';
};

// Log the API URL once for debugging
console.log('API URL set to:', getApiUrl());

// Helper function for API fetching with correct URL
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  console.log('Fetching from:', url);
  
  // Ensure credentials are included by default
  const fetchOptions = {
    ...options,
    credentials: 'include' as RequestCredentials
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

export default {
  getApiUrl,
  fetchApi
}; 