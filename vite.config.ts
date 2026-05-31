import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/ray-birthday-calendar/' : '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // UI 库
          'vendor-ui': ['framer-motion', 'lucide-react'],
          // Firebase
          'vendor-firebase': ['firebase/app', 'firebase/firestore'],
        },
      },
    },
  },
});
