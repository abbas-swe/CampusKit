export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  twitterHandle?: string;
}
