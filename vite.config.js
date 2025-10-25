import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // Required for Docker: Enable polling for file changes
    // Without this, hot reload won't work in Docker containers
    watch: {
      usePolling: true,
    },
    // Host configuration (already handled by Dockerfile CMD, but explicit here)
    host: '0.0.0.0',
    port: 5173,
    // Enable CORS for development
    cors: true,
  },
})
