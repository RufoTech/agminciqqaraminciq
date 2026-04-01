import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/commerce': {
        target: 'http://localhost:3010/', // Backend serverinizin URL-si
        changeOrigin: true,
      },
      alias: {
        '@': '/src', // Əgər alias istifadə edirsinizsə
      },
    }
  }
})
