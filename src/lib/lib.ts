// lib/lib.ts

/**
 * Generate a clean slug from a name.
 * - Lowercases
 * - Replaces spaces with hyphens
 * - Removes non-alphanumeric (except hyphen)
 * - Trims hyphens from start/end
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ""); // trim hyphens from start and end
} 

/**
 * Ensure slug is unique within a list of existing slugs.
 * If baseSlug exists, appends "-1", "-2", etc.
 */
export function generateUniqueSlug(name: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
