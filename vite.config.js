import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@animations': fileURLToPath(new URL('./src/animations', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
