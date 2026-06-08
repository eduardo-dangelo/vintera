export function sortByRecent<T>(items: T[], getDate: (item: T) => Date | string): T[] {
  return [...items].sort(
    (a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime(),
  );
}

export function takeRecent<T>(items: T[], limit = 5): T[] {
  return items.slice(0, limit);
}
