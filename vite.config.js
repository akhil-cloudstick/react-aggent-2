import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// 💡 IMPORTANT: Add the React plugin
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  // 💡 CRITICAL: Set base to './' for Electron's file:// protocol
  base: './', 
  plugins: [
    react(), // 💡 The plugin for processing React/JSX files
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 💡 Optional but recommended: Explicitly ensure output is in the root 'dist'
  build: {
    outDir: 'dist', 
  }
});