import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Importation indispensable pour Tailwind v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Activation obligatoire du compilateur de styles
  ],
  server: {
    host: true,
    port: 3000,
    allowedHosts: 'all',
    watch: {
      ignored: [
        '**/.vs/**',
        '**/.git/**',
        '**/node_modules/**'
      ]
    }
  }
});
