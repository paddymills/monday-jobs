import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
    define: {
      APP_VERSION: JSON.stringify(process.env.npm_package_version)
    }
  }
)
