import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/proxy/grok': {
        target: 'https://api.x.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/grok/, ''),
      },
      '/api/proxy/openai': {
        target: 'https://api.openai.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/openai/, ''),
      },
      '/api/proxy/anthropic': {
        target: 'https://api.anthropic.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/anthropic/, ''),
      },
    },
  },
});
