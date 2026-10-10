export type ProjectTabName = 'overview' | 'songs' | 'albums';

export const OVERVIEW_PREVIEW_LIMIT = 5;

const PINNED_TABS = new Set<string>(['overview', 'songs', 'albums']);

export function isPinnedProjectTab(id: string): id is ProjectTabName {
  return PINNED_TABS.has(id);
}

export function hasAlbumsTab(hasCollections: boolean): boolean {
  return hasCollections;
}

export function hasSongsTab(songCount: number): boolean {
  return songCount > 0;
}

/** Overview, then Songs if any, then Collections if any, then custom tab ids. */
export function getVisibleTabIds(
  hasCollections: boolean,
  songCount: number,
  customTabIds: readonly string[] = [],
): string[] {
  const tabs: string[] = ['overview'];
  if (hasSongsTab(songCount)) {
    tabs.push('songs');
  }
  if (hasAlbumsTab(hasCollections)) {
    tabs.push('albums');
  }
  for (const id of customTabIds) {
    if (!isPinnedProjectTab(id)) {
      tabs.push(id);
    }
  }
  return tabs;
}
