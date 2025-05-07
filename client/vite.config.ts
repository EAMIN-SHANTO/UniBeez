import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Hardcoded API URLs
const PRODUCTION_API_URL = 'https://unibeez.onrender.com';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Log configuration information
  console.log('🏗️ Vite build mode:', mode);
  console.log('🏗️ Using HARDCODED API URL:', PRODUCTION_API_URL);
  console.log('🏗️ Original env vars (ignored):', {
    VITE_API_URL: process.env.VITE_API_URL || '(not set)',
    VITE_API_URL_DEV: process.env.VITE_API_URL_DEV || '(not set)',
    NODE_ENV: process.env.NODE_ENV || '(not set)'
  });
  
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    define: {
      // Override environment variables with hardcoded values
      'process.env.VITE_API_URL': JSON.stringify(PRODUCTION_API_URL),
      'process.env.VITE_API_URL_DEV': JSON.stringify(PRODUCTION_API_URL),
      // Set __PRODUCTION__ flag to true to ensure production mode
      '__PRODUCTION__': 'true'
    }
  };
}); 