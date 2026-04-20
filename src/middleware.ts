import { defineMiddleware } from 'astro:middleware';

/**
 * Trailing-slash normalisation for SSR blog routes.
 *
 * WHY THIS EXISTS:
 * Netlify's `_redirects` rule `/blog → /blog/ 301!` also matches `/blog/`
 * because Netlify strips trailing slashes before comparing rules, creating
 * an infinite redirect loop. The `url-normalize` edge function from the
 * Netlify adapter also does not redirect SSR routes that lack a trailing slash.
 *
 * HOW IT WORKS:
 * With `edgeMiddleware: true` in astro.config.mjs, this middleware runs as a
 * Netlify Edge Function (before `url-normalize`). It catches /blog and /blog/:slug
 * requests without trailing slashes and issues a 301 redirect to add the slash.
 *
 * SCOPE:
 * Only /blog paths are affected. Static pre-rendered pages are handled by
 * Netlify's pretty_urls. All other paths pass through unchanged.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  // Only act on /blog paths without trailing slash (and no file extension)
  if (pathname.startsWith('/blog') && !pathname.endsWith('/') && !pathname.includes('.')) {
    return context.redirect(pathname + '/', 301);
  }

  return next();
});
