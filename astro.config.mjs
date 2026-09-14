import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Determine deployment site and base path:
// Default: 'https://campuskit.io' (Custom Domain / root)
// Automatically overridden by GitHub Actions if deployed to https://<owner>.github.io/<repo>
const site = process.env.ASTRO_SITE || process.env.SITE || 'https://campuskit.io';
const rawBase = process.env.ASTRO_BASE || process.env.BASE_PATH || '';
const base = rawBase && rawBase !== '/' ? rawBase : undefined;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'never',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => {
        const excluded = [
          '/admin/',
          '/404',
          '/tools/attendance-calculator',
          '/tools/final-grade-calculator',
          '/tools/grade-calculator',
          '/tools/percentage-calculator',
          '/tools/pomodoro-timer',
        ];
        return !excluded.some((pattern) => page.includes(pattern));
      },
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  compressHTML: true,
  build: {
    format: 'directory',
  },
});
