import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@/": fileURLToPath(new URL('./src', import.meta.url)),
      "@/assets": fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
  plugins: [react(), svgr()],
})
