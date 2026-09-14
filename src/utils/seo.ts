import type { BreadcrumbItem, FAQItem } from '../types/seo';

export const SITE_URL = 'https://abbas-swe.github.io';
export const BASE_PATH = '/CampusKit';
export const SITE_NAME = 'CampusKit';
export const SITE_TAGLINE = 'Tools for university life.';
export const DEFAULT_DESCRIPTION =
  'Fast, free, accessible academic calculators and productivity tools for university students. Calculate GPA, target grades, attendance, and exam countdowns with zero sign-up.';

export function formatPageTitle(title?: string): string {
  if (!title || title.trim() === SITE_NAME) {
    return `${SITE_NAME} | ${SITE_TAGLINE}`;
  }
  const trimmed = title.trim();
  // Check if brand is already present in title
  if (
    trimmed.includes(SITE_NAME) ||
    trimmed.endsWith(`| ${SITE_NAME}`) ||
    trimmed.endsWith(`– ${SITE_NAME}`) ||
    trimmed.endsWith(`- ${SITE_NAME}`)
  ) {
    return trimmed;
  }
  return `${trimmed} | ${SITE_NAME}`;
}

export function formatCanonicalUrl(pathname: string): string {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }

  let clean = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
  const baseName = BASE_PATH.replace(/^\/+/, '');

  if (clean.startsWith(baseName)) {
    clean = clean.slice(baseName.length).replace(/^\/+/, '');
  }

  if (!clean) {
    return `${SITE_URL}${BASE_PATH}/`;
  }

  return `${SITE_URL}${BASE_PATH}/${clean}/`;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      let itemUrl = item.item;
      if (!itemUrl.startsWith('http')) {
        let clean = itemUrl.replace(/^\/+/, '').replace(/\/+$/, '');
        const baseName = BASE_PATH.replace(/^\/+/, '');
        if (clean.startsWith(baseName)) {
          clean = clean.slice(baseName.length).replace(/^\/+/, '');
        }
        itemUrl = clean ? `${SITE_URL}${BASE_PATH}/${clean}/` : `${SITE_URL}${BASE_PATH}/`;
      }
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: itemUrl,
      };
    }),
  };
}

export function generateSoftwareApplicationSchema(tool: {
  name: string;
  description: string;
  url: string;
  category?: string;
}): Record<string, unknown> {
  let toolUrl = tool.url;
  if (!toolUrl.startsWith('http')) {
    let clean = toolUrl.replace(/^\/+/, '').replace(/\/+$/, '');
    const baseName = BASE_PATH.replace(/^\/+/, '');
    if (clean.startsWith(baseName)) {
      clean = clean.slice(baseName.length).replace(/^\/+/, '');
    }
    toolUrl = clean ? `${SITE_URL}${BASE_PATH}/${clean}/` : `${SITE_URL}${BASE_PATH}/`;
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: toolUrl,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
  };
}

export function generateFAQSchema(faqs: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
