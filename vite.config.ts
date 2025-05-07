import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy for Google Drive images to bypass CORS
      '/api/image-proxy': {
        target: 'https://lh3.googleusercontent.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/image-proxy/, ''),
      },
      // Proxy for direct Google Drive API requests
      '/api/drive-proxy': {
        target: 'https://www.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/drive-proxy/, ''),
      }
    }
  },
  preview: {
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});