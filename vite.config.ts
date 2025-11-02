import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Optimize dependency pre-bundling
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  // Build optimizations for production
  build: {
    // Generate sourcemaps for error tracking in production
    sourcemap: true,

    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },

    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,

    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },

  // Server configuration
  server: {
    port: 5173,
    host: true, // Listen on all addresses
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
});
