import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      features: {
        propsDestructure: true
      }
    })
  ],
  server: {
    port: 3000,
    strictPort: true
  }
});
