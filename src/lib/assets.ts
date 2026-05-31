/**
 * Resolve an asset path relative to the Vite base URL.
 * Works correctly for both local dev (/) and GitHub Pages (/ray-birthday-calendar/).
 */
export const asset = (path: string) => {
  const base = import.meta.env.BASE_URL; // e.g. "/" or "/ray-birthday-calendar/"
  // Avoid double slash: base ends with /, path starts with /
  if (base.endsWith('/') && path.startsWith('/')) {
    return `${base}${path.slice(1)}`;
  }
  return `${base}${path}`;
};
