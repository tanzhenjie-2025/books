import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'; // 确保引入 path 模块

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 配置路径别名，让 @ 指向 src 目录
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // 代理配置：将 /api 开头的请求转发到后端 8080 端口
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 后端 context-path 已经是 /api，不需要 rewrite
      }
    }
  }
});