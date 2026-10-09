export type ProjectTabName = 'overview' | 'songs' | 'albums';

export const OVERVIEW_PREVIEW_LIMIT = 5;

const PINNED_TABS = new Set<string>(['overview', 'songs', 'albums']);

export function isPinnedProjectTab(id: string): id is ProjectTabName {
  return PINNED_TABS.has(id);
}

export function hasAlbumsTab(albumCount: number): boolean {
  return albumCount > 0;
}

export function hasSongsTab(songCount: number): boolean {
  return songCount > 0;
}

export function hasTabBar(
  albumCount: number,
  songCount: number,
  customTabCount = 0,
): boolean {
  return albumCount > 0 || songCount > 0 || customTabCount > 0;
}

/** Overview, then Songs if any, then Albums if any, then custom tab ids. */
export function getVisibleTabIds(
  albumCount: number,
  songCount: number,
  customTabIds: readonly string[] = [],
): string[] {
  if (!hasTabBar(albumCount, songCount, customTabIds.length)) {
    return [];
  }

  const tabs: string[] = ['overview'];
  if (hasSongsTab(songCount)) {
    tabs.push('songs');
  }
  if (hasAlbumsTab(albumCount)) {
    tabs.push('albums');
  }
  for (const id of customTabIds) {
    if (!isPinnedProjectTab(id)) {
      tabs.push(id);
    }
  }
  return tabs;
}
