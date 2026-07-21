import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: 'all', // Autorise tous les tunnels comme localtunnel
    watch: {
      ignored: [
        '**/.vs/**',
        '**/.git/**',
        '**/node_modules/**'
      ]
    }
  }
});
