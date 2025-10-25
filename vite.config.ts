import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Required for Docker: Enable polling for file changes
    // Without this, hot reload won't work in Docker containers
    watch: {
      usePolling: true,
    },
    // Host configuration for Docker
    // Bind to 0.0.0.0 to allow access from outside the container
    host: '0.0.0.0',
    port: 5173,
    // Enable CORS for development
    cors: true,
    // Strict port - fail if port is already in use
    strictPort: true,
  },
  // Enable optimized dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
