import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import axios from 'axios';
import { API_URL } from './config';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Add axios interceptor to ensure all requests go to the production backend
axios.interceptors.request.use(config => {
  // Force all axios requests to use the production API URL
  if (config.url && config.url.includes('localhost:3000')) {
    console.warn('⚠️ Intercepted localhost API call in axios:', config.url);
    config.url = config.url.replace('http://localhost:3000', API_URL);
    console.log('🔄 Redirected to:', config.url);
  }
  
  // If the URL doesn't include http and doesn't already include the API_URL,
  // it's likely a relative URL, so prefix it with the API_URL
  if (config.url && !config.url.includes('http') && !config.url.includes(API_URL)) {
    config.url = `${API_URL}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    console.log('🔄 Prefixed relative URL with API_URL:', config.url);
  }
  
  return config;
});

console.log('📱 App starting - API URL configured to:', API_URL);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 