export function filterByProjectIds<T>(
  items: T[],
  projectIds: number[],
  getProjectId: (item: T) => number,
): T[] {
  if (projectIds.length === 0) {
    return items;
  }
  const idSet = new Set(projectIds);
  return items.filter(item => idSet.has(getProjectId(item)));
}

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
