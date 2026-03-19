import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'https://founded-alberta-deadline-prerequisite.trycloudflare.com',
        changeOrigin: true,
      },
    },
  },
});