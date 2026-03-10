// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // PITFALL #8 FIX: Single canonical domain — NO www
  site: 'https://yapayzekapratik.com',

  // PITFALL #4 FIX: Trailing slash consistency — Astro generates /page/index.html
  trailingSlash: 'always',

  // PITFALL #2 FIX: Static output — full HTML per page, no SPA shell
  output: 'static',

  // Performance: Prefetch links on hover for instant navigation
  prefetch: true,

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    // PITFALL #9 FIX: Generates /sitemap-index.xml (NOT /sitemap.xml)
    sitemap(),
    // React islands for interactive-only components
    react(),
  ],
});