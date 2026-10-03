export type ShareKind = 'project' | 'song' | 'album';

export function isShareKind(value: string): value is ShareKind {
  return value === 'project' || value === 'song' || value === 'album';
}

export function parseShareKind(value: string): ShareKind | null {
  return isShareKind(value) ? value : null;
}

export function getShareItemHref(locale: string, kind: ShareKind, id: number): string {
  switch (kind) {
    case 'project':
      return `/${locale}/projects/${id}`;
    case 'song':
      return `/${locale}/songs/${id}`;
    case 'album':
      return `/${locale}/albums/${id}`;
  }
}

export function getSharePageHref(locale: string, kind: ShareKind, id: number): string {
  return `/${locale}/share/${kind}/${id}`;
}

export function getEmbedPageHref(locale: string, kind: ShareKind, id: number): string {
  return `/${locale}/embed/${kind}/${id}`;
}

export function buildEmbedSnippet(origin: string, locale: string, kind: ShareKind, id: number): string {
  const src = `${origin}${getEmbedPageHref(locale, kind, id)}`;
  return `<iframe src="${src}" width="320" height="140" frameborder="0" allow="web-share" title="Vintera"></iframe>`;
}
