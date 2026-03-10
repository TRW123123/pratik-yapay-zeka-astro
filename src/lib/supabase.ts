/**
 * Supabase client — server-side only.
 * Used by SSR blog pages to fetch from blog_posts table.
 * No localStorage, no persistSession (Astro SSR has no browser APIs).
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    author_bio: string | null;
    category: string;
    tags: string[] | null;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    read_time: number | null;
    language: string;
    status: string | null;
    published_at: string | null;
    created_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
    og_image_url: string | null;
}
