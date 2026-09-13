import type { BreadcrumbItem, FAQItem } from '../types/seo';

export const SITE_URL = 'https://campuskit.io';
export const SITE_NAME = 'CampusKit';
export const SITE_TAGLINE = 'Tools for university life.';
export const DEFAULT_DESCRIPTION =
  'Fast, free, accessible academic calculators and productivity tools for university students. Calculate GPA, target grades, attendance, and exam countdowns with zero sign-up.';

export function formatPageTitle(title?: string): string {
  if (!title || title === SITE_NAME) {
    return `${SITE_NAME} | ${SITE_TAGLINE}`;
  }
  return `${title} | ${SITE_NAME}`;
}

export function formatCanonicalUrl(pathname: string): string {
  const cleanPath = pathname.replace(/\/+$/, '') || '';
  return `${SITE_URL}${cleanPath}`;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item.startsWith('http') ? item.item : `${SITE_URL}${item.item}`,
    })),
  };
}

export function generateSoftwareApplicationSchema(tool: {
  name: string;
  description: string;
  url: string;
  category?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.description,
    url: tool.url.startsWith('http') ? tool.url : `${SITE_URL}${tool.url}`,
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
