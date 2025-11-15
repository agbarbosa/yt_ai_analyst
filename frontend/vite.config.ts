import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable SPA routing - all routes will serve index.html
    // This allows React Router to handle client-side routing
    historyApiFallback: true,
  },
})
