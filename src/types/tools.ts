export type ToolCategory = 'academic' | 'productivity' | 'ai';

export type ToolStatus = 'active' | 'beta' | 'coming-soon';

export interface ToolMetadata {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  badge?: string;
  features: string[];
  estimatedTime?: string;
  targetAudience?: string;
  relatedToolSlugs: string[];
  iconName: 'calculator' | 'chart' | 'graduation-cap' | 'target' | 'clock' | 'calendar' | 'percent' | 'book-open' | 'sparkles' | 'award';
}

export interface CategoryMetadata {
  id: ToolCategory;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  colorClass: string;
}
