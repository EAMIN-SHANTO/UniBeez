// API URL helper that ensures the correct backend URL is always used
export const getApiUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // IMPORTANT: Always use the production URL in deployed environments
    // Use simple hostname check for development/production
    const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
                         
    if (isLocalhost) {
      console.log('Development environment detected, using local API');
      return 'http://localhost:3000';
    } else {
      console.log('Production environment detected, using Render API');
      // Directly use the Render URL to bypass any env variable loading issues
      return 'https://unibeez.onrender.com';
    }
  }
  
  // Default to production URL if not in browser
  return 'https://unibeez.onrender.com';
};

// Log the API URL for debugging
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