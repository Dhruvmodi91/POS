import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  // Add TypeScript support
  esbuild: {
    loader: 'tsx',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});