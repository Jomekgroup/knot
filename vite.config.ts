import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 1. Fixes the 404 error by using relative paths
    base: './', 
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    
    // 2. Ensures environment variables are available
    define: {
      'process.env': env,
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    }
  };
});