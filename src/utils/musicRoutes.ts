export function getSongDetailHref(
  locale: string,
  songId: number,
  projectId?: number,
): string {
  if (projectId != null) {
    return `/${locale}/projects/${projectId}/songs/${songId}`;
  }
  return `/${locale}/songs/${songId}`;
}
