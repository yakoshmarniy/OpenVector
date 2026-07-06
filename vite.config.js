import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Honour an externally assigned port (e.g. the preview harness sets PORT);
  // falls back to Vite's default when unset or overridden by --port.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : {},
});
