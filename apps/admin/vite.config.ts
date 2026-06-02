import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 独立后台前端（ADR-0010）。dev 把 /api 代理到本机 services/api(3000)；生产由部署层指向后端。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
