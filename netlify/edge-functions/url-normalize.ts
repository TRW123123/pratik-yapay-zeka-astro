import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
    const url = new URL(request.url);
    let { pathname } = url;

    // 1. NEVER touch the root path
    if (pathname === "/" || pathname === "") {
        return context.next();
    }

    // 2. NEVER touch static assets
    const staticExtensions = /\.(css|js|mjs|json|png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2|ttf|eot|mp4|webm|pdf|xml|txt|map)$/i;
    if (staticExtensions.test(pathname)) {
        return context.next();
    }

    // 3. NEVER touch Netlify internals or Astro build files
    if (
        pathname.startsWith("/.netlify/") ||
        pathname.startsWith("/_astro/") ||
        pathname.startsWith("/_image")
    ) {
        return context.next();
    }

    // 4. NEVER touch crawler files
    if (
        pathname === "/robots.txt" ||
        pathname.startsWith("/sitemap") ||
        pathname === "/site.webmanifest" ||
        pathname === "/favicon.ico"
    ) {
        return context.next();
    }

    // 5. Build the normalized pathname
    let normalized = pathname;

    // Strip .html extension
    if (normalized.endsWith(".html")) {
        normalized = normalized.slice(0, -5);
    }

    // Enforce lowercase
    normalized = normalized.toLowerCase();

    // Enforce trailing slash
    if (!normalized.endsWith("/")) {
        normalized += "/";
    }

    // 6. Redirect only if something actually changed (prevents loops!)
    if (normalized !== pathname) {
        url.pathname = normalized;
        return new Response(null, {
            status: 301,
            headers: { Location: url.toString() },
        });
    }

    // 7. Pass through if already normalized
    return context.next();
};
