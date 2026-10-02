import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    // GitHub Pages project URL:
    // https://tpj-root.github.io/Price_Prediction_Arcade/
    //
    // Without this, Vite generates:
    // /assets/index-xxxxx.js
    //
    // With this, Vite generates:
    // /Price_Prediction_Arcade/assets/index-xxxxx.js
    base: '/Price_Prediction_Arcade/',

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});