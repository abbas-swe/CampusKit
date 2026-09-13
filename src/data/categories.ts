import type { CategoryMetadata } from '../types/tools';

export const CATEGORIES: CategoryMetadata[] = [
  {
    id: 'academic',
    name: 'Academic Calculators',
    tagline: 'GPA, grades, targets, and degree progress',
    description: 'Precision calculation tools calibrated for US, Canadian, UK, and international university grading systems.',
    badge: 'Core Academic',
    colorClass: 'border-blue-200 bg-blue-50/50 text-blue-800',
  },
  {
    id: 'productivity',
    name: 'Study Productivity',
    tagline: 'Time blocking, exam prep, and focus timers',
    description: 'Practical time management and countdown tools engineered to keep students organized through midterms and finals.',
    badge: 'Daily Utility',
    colorClass: 'border-indigo-200 bg-indigo-50/50 text-indigo-800',
  },
  {
    id: 'ai',
    name: 'AI Academic Tools',
    tagline: 'Smart synthesis and citation assistance',
    description: 'Discreet, privacy-focused artificial intelligence helpers for academic writing, reference formatting, and study synthesis.',
    badge: 'Preview',
    colorClass: 'border-purple-200 bg-purple-50/50 text-purple-800',
  },
];
