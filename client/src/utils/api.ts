// API URL helper that ensures the correct backend URL is always used
export const getApiUrl = () => {
  // HARDCODED PRODUCTION URL - ABSOLUTELY NO CONDITIONAL LOGIC
  // This ensures we always use the production URL no matter what
  const apiUrl = 'https://unibeez.onrender.com';
  console.log('🌐 getApiUrl: Using production URL:', apiUrl);
  return apiUrl;
};

// Helper function for API fetching with correct URL
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  // Add cache-busting parameter to prevent browser caching
  const cacheBuster = `_cb=${Date.now()}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  const cacheBustedEndpoint = `${endpoint}${separator}${cacheBuster}`;
  
  // HARDCODED API URL for all requests
  const url = `https://unibeez.onrender.com${cacheBustedEndpoint.startsWith('/') ? '' : '/'}${cacheBustedEndpoint}`;
  console.log('📡 Fetching from:', url, 'with options:', JSON.stringify(options));
  
  // Ensure credentials are included by default
  const fetchOptions = {
    ...options,
    credentials: 'include' as RequestCredentials,
    headers: {
      ...options.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  };
  
  try {
    console.log('🚀 Starting fetch request to:', url);
    const response = await fetch(url, fetchOptions);
    console.log(`✅ Fetch completed: Status ${response.status} ${response.statusText}`);
    return response;
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    // Log additional diagnostic information
    console.error('Failed request details:', {
      url,
      options: fetchOptions,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

export default {
  getApiUrl,
  fetchApi
}; 