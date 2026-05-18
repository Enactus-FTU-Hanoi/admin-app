import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // KHÔNG dùng terser — cần cài thêm package, gây lỗi CI
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Hash trong tên file là BẮT BUỘC — không có hash → GitHub Pages cache sai → MIME error
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
})
