import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5199,
    strictPort: true,
  },
  // Relative asset URLs, so the same build serves from a domain root, from a
  // GitHub Pages project subpath (/ghostlight/) or from a plain folder with no
  // rewrite rules. There is no client-side router, so there is nothing to break.
  base: './',
  build: {
    target: 'es2022',
  },
});
