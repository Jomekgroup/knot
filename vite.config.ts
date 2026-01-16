import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Load environment variables from the system (Vercel)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 2. Updated to '/' for better Vercel routing stability.
    // This ensures assets like index.css are always found at the root.
    base: '/', 
    
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    
    plugins: [react()],
    
    // 3. CRITICAL: Hard-coding variables into the build process.
    // This ensures Supabase and Gemini work the instant the app loads.
    define: {
      'process.env': JSON.stringify(env),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_PAYSTACK_PUBLIC_KEY': JSON.stringify(env.VITE_PAYSTACK_PUBLIC_KEY),
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },
    
    resolve: {
      alias: {
        // This allows you to use 'import { SendIcon } from "@/components/icons/SendIcon"'
        // consistently throughout the project.
        '@': path.resolve(__dirname, './src'),
      }
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      // Prevents the build from failing if there are tiny CSS warnings
      cssCodeSplit: true,
    }
  };
});