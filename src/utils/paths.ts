/**
 * Resolves an internal path ensuring it respects Astro's base URL (e.g. /CampusKit/)
 * and trailing slash convention for static hosting like GitHub Pages.
 */
export function resolvePath(path: string = ''): string {
  if (!path) return import.meta.env.BASE_URL || '/';

  // External, protocol-relative, or mailto/tel URLs
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:')
  ) {
    return path;
  }

  // Anchor links on the homepage (e.g. "/#tools" or "#tools")
  if (path.startsWith('#') || path.startsWith('/#')) {
    const anchor = path.replace(/^\//, '');
    const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
    return base ? `${base}/${anchor}` : `/${anchor}`;
  }

  // Assets (like /favicon.svg, /og-image.png, /site.webmanifest) should not have trailing slashes
  const isStaticAsset = /\.(svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|xml|txt|css|js)$/i.test(path);

  // Separate hash and query if present
  const [urlWithoutHash, hash] = path.split('#');
  const [cleanUrl, query] = urlWithoutHash.split('?');

  const rawBase = (import.meta.env.BASE_URL || '/').replace(/\/+$/, ''); // e.g. "/CampusKit" or ""
  let route = cleanUrl.replace(/^\/+/, '').replace(/\/+$/, ''); // e.g. "about"

  // Prevent duplicating base if already prefixed
  const baseName = rawBase.replace(/^\/+/, ''); // "CampusKit"
  if (baseName && route.startsWith(baseName)) {
    route = route.slice(baseName.length).replace(/^\/+/, '');
  }

  let finalUrl = '';
  if (!route) {
    finalUrl = rawBase ? `${rawBase}/` : '/';
  } else if (isStaticAsset) {
    finalUrl = rawBase ? `${rawBase}/${route}` : `/${route}`;
  } else {
    finalUrl = rawBase ? `${rawBase}/${route}/` : `/${route}/`;
  }

  if (query) finalUrl += `?${query}`;
  if (hash) finalUrl += `#${hash}`;

  return finalUrl;
}
