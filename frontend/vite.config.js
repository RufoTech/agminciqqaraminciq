import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/commerce': {
        target: 'https://agminciqqaraminciq-production.up.railway.app/', // Backend serverinizin URL-si
        changeOrigin: true,
      },
      alias: {
        '@': '/src', // Əgər alias istifadə edirsinizsə
      },
    }
  }
})
