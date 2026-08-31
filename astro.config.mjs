// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Configuração do site da Juliana Constantino — Deputada Federal Missão 1424
// Jundiaí-SP 2026
// Stack: Astro 5 (gerador estático) + Decap CMS opcional / Cloudflare R2 (imagens)
// Hospedagem alvo: Vercel / Cloudflare Pages / Localweb

export default defineConfig({
  site: 'https://www.julianaconstantino.com.br',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
