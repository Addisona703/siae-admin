import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 7090,
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${fileURLToPath(new URL('./src/styles/variables.less', import.meta.url))}";`,
        },
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal code splitting
        manualChunks: (id) => {
          // Split each theme into its own chunk
          if (id.includes('/themes/brand/')) {
            return 'theme-brand'
          }
          if (id.includes('/themes/modern/')) {
            return 'theme-modern'
          }
          if (id.includes('/themes/matrix/')) {
            return 'theme-matrix'
          }
          if (id.includes('/themes/split/')) {
            return 'theme-split'
          }

          // Split vendor libraries
          if (id.includes('node_modules')) {
            // Split large libraries into separate chunks
            if (id.includes('tdesign-vue-next')) {
              return 'vendor-tdesign'
            }
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vendor-vue'
            }
            if (id.includes('@vue')) {
              return 'vendor-vue-ecosystem'
            }
            // Other node_modules go into vendor chunk
            return 'vendor'
          }
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name
          // Theme chunks get special naming
          if (name.startsWith('theme-')) {
            return 'assets/themes/[name]-[hash].js'
          }
          return 'assets/js/[name]-[hash].js'
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || ''
          // Theme styles get special directory
          if (name.includes('themes/')) {
            return 'assets/themes/[name]-[hash][extname]'
          }
          // Other assets
          if (name.endsWith('.css')) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize source maps for production
    sourcemap: false,
    // Minify options
    minify: 'esbuild', // Use esbuild for faster builds
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'pinia', 'vue-router'],
    exclude: ['@vueuse/core'], // Exclude if causing issues
    force: true, // Force re-optimization
  },
  // Ensure proper module resolution
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
})
