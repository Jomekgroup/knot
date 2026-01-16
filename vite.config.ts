import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Use the '@' alias we created to avoid relative path confusion
import { SendIcon } from '@/components/icons/SendIcon';

export default defineConfig(({ mode }) => {
  // 1. Load environment variables from the system (Vercel)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 2. Fixes the 404 error: Use empty string to ensure relative paths on Vercel
    base: '', 
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    
    plugins: [react()],
    
    // 3. CRITICAL: Explicitly hard-code the Supabase variables into the build.
    // This solves the 406 error by ensuring the Supabase client isn't "undefined".
    define: {
      'process.env': env,
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Helps debug if things go wrong
      sourcemap: true 
    }
  };
});