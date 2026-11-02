export function slugify(text) {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Returns a slug not used by any other document, adding a short suffix on collision
export async function uniqueSlug(Model, title, excludeId) {
  const base = slugify(title).slice(0, 80) || 'post';
  let slug = base;
  const taken = (s) => Model.exists(excludeId ? { slug: s, _id: { $ne: excludeId } } : { slug: s });
  while (await taken(slug)) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return slug;
}
