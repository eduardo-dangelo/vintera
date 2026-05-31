export function filterBySearchQuery<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }
  return items.filter(item => getSearchableText(item).toLowerCase().includes(normalized));
}
