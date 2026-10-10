import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    // Flujos completos (varias pantallas y peticiones al mock) superan los 5 s por defecto.
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      // El backend simulado y la página de demo no son código de producción.
      exclude: ['src/services/api/mocks/**', 'src/app/dev/**', 'src/test/**', '**/*.test.{js,jsx}'],
      reporter: ['text-summary', 'html'],
    },
    env: {
      VITE_USE_MOCKS: 'true',
      VITE_API_URL: '/api/v1',
    },
  },
})
