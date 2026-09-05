import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // Your designated frontend port
    strictPort: true // Force exit if 5173 is occupied
  }
});