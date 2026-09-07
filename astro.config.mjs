// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://webmark-up.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: undefined,
      filter: (page) => !page.includes('/privacy-policy/'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
