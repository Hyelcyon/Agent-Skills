import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string): string | undefined {
          const normalizedId = id.replaceAll('\\', '/');
          if (normalizedId.includes('/node_modules/')) {
            if (/\/node_modules\/(?:react|react-dom|scheduler)\//.test(normalizedId)) {
              return 'vendor-react';
            }
            if (normalizedId.includes('/node_modules/@tanstack/react-query/')) {
              return 'vendor-query';
            }
            return 'vendor';
          }
          return undefined;
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  },
  envPrefix: ['VITE_']
});
