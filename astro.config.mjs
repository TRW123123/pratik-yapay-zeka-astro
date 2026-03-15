// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  // PITFALL #8 FIX: Single canonical domain — NO www
  site: 'https://yapayzekapratik.com',

  // PITFALL #4 FIX: Trailing slash consistency — Astro generates /page/index.html
  // PINECONE HARD RULE: Zwingend 'always' belassen, Netlify Pretty URLs übernehmen den Rest in Prod!
  trailingSlash: 'always',

  // ASTRO v6: 'static' is the default. Pages with `export const prerender = false`
  // are server-rendered. Netlify adapter handles SSR for those pages.
  output: 'static',

  // Netlify adapter for SSR pages (blog listing + blog detail)
  adapter: netlify(),

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