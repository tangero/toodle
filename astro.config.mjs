// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  integrations: [react()],
  site: 'https://skola.aivefirmach.cz',
  // Kontrolu Origin dělá src/middleware.ts – potřebuje výjimky (one-click odhlášení, webhook, crony).
  security: { checkOrigin: false },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@lib': '/src/lib',
        '@components': '/src/components',
        '@layouts': '/src/layouts',
      },
    },
  },
});