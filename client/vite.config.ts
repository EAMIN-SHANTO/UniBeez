import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Log the environment mode
  console.log('Vite build mode:', mode);
  console.log('Environment variables:', process.env.VITE_API_URL);
  
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
      // Make sure environment variables are correctly replaced at build time
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    }
  };
}); 