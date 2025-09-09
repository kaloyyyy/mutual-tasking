export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^\w-]/g, ""); // remove special characters
}

export function generateUniqueSlug(name: string, existingSlugs: string[]) {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}
