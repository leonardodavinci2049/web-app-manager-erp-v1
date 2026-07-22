export function buildCategoryQuery(
  updates: Record<string, string | undefined>,
  search: string,
): string {
  const params = new URLSearchParams(search);
  for (const [key, value] of Object.entries(updates)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return params.toString();
}
