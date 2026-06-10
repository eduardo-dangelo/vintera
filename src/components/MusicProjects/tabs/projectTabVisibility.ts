export type ProjectTabName = 'overview' | 'songs' | 'albums';

export const TAB_THRESHOLD = 6;
export const OVERVIEW_PREVIEW_LIMIT = 5;

export function hasAlbumsTab(albumCount: number): boolean {
  return albumCount > TAB_THRESHOLD;
}

export function hasSongsTab(songCount: number): boolean {
  return songCount > TAB_THRESHOLD;
}

export function hasTabBar(albumCount: number, songCount: number): boolean {
  return hasAlbumsTab(albumCount) || hasSongsTab(songCount);
}

export function getVisibleTabs(albumCount: number, songCount: number): ProjectTabName[] {
  if (!hasTabBar(albumCount, songCount)) {
    return [];
  }

  const tabs: ProjectTabName[] = ['overview'];
  if (hasSongsTab(songCount)) {
    tabs.push('songs');
  }
  if (hasAlbumsTab(albumCount)) {
    tabs.push('albums');
  }
  return tabs;
}
