// vite.config.ts
import { defineConfig } from 'vite';
//import angular from 'vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    port: 4200,
    open: true
  }
});
