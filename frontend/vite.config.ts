import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Note: Vite's dev server automatically handles SPA routing
  // It serves index.html for routes that don't match static files
})
