import { z } from 'zod';

/**
 * Zod Schema for pSEO Data Validation
 * Enforces the B2B pSEO Master Ruleset 2026 data integrity requirements.
 * Every feature MUST have a colon-separated title:description format.
 */

const FeatureStringSchema = z.string().refine(
  (val) => val.includes(':'),
  { message: 'Feature must contain a colon for title:description split. Generic "Otonom Çözüm X" fallback is prohibited.' }
);

const FAQSchema = z.object({
  question: z.string().min(10, 'FAQ question must be at least 10 characters'),
  answer: z.string().min(30, 'FAQ answer must be at least 30 characters for meaningful content'),
});

export const PseoEntrySchema = z.object({
  id: z.string().min(1),
  branche: z.string().min(2),
  slug_branche: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  slug_problem: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  seo_title: z.string().max(70, 'SEO title must be ≤70 chars for SERP display').min(30),
  seo_description: z.string().max(160, 'Meta description must be ≤160 chars').min(50),
  keywords: z.array(z.string()).min(3, 'At least 3 keywords required'),
  schmerzpunkte: z.array(z.string().min(20)).min(2, 'At least 2 pain points required'),
  hard_metrics: z.object({
    lead_cost: z.string().min(10),
    time_saved: z.string().min(10),
    conversion_rate: z.string().min(10),
  }),
  loesung_titel: z.string().min(10),
  loesung_features: z.array(FeatureStringSchema).min(2, 'At least 2 features required'),
  faqs: z.array(FAQSchema).min(2, 'At least 2 FAQs required for FAQPage schema'),
});

export const PseoDataSchema = z.array(PseoEntrySchema).min(1, 'At least 1 pSEO entry required');

export type PseoEntry = z.infer<typeof PseoEntrySchema>;
export type PseoData = z.infer<typeof PseoDataSchema>;
