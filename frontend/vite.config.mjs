import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
<<<<<<< HEAD
    },
    allowedHosts: ['localhost', '----.ngrok-free.dev']
=======
    }
>>>>>>> e8e9bc35347c166c03829b7a59dca062879bb374
  }
});