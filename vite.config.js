import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', ext: '.gz' }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Public marketing site, ported from School-erp-main. Kept behind its own
      // alias so its `@site/...` imports can't collide with the ERP app's own
      // src/components, src/pages and src/utils directories.
      "@site": path.resolve(__dirname, "./src/landing"),
    }
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'ui': ['lucide-react', 'recharts'],
        },
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
