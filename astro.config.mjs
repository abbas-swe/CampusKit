import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// GitHub Pages configuration for repository: https://github.com/abbas-swe/CampusKit
const site = process.env.ASTRO_SITE || process.env.SITE || 'https://abbas-swe.github.io';
const base = process.env.ASTRO_BASE || process.env.BASE_PATH || '/CampusKit';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
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
