import { defineMiddleware } from 'astro:middleware';

/**
 * Trailing-slash normalisation for SSR routes.
 *
 * Netlify's _redirects rule `/blog → /blog/ 301!` also matches `/blog/`
 * (Netlify strips trailing slashes before rule comparison), creating a redirect
 * loop. Instead, we handle the redirect inside the Astro SSR function.
 *
 * This middleware only runs for routes handled by the SSR function (i.e.
 * prerender:false pages like /blog/ and /blog/[slug]/). Static pre-rendered
 * pages are served directly by Netlify and never reach this code.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = new URL(context.request.url);

  // If path doesn't end with / and has no file extension → add slash + redirect
  if (!pathname.endsWith('/') && !pathname.includes('.')) {
    return context.redirect(pathname + '/', 301);
  }

  return next();
});
