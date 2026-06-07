export type ExternalLinkKind = 'youtube' | 'spotify' | 'website';

export type ExternalLink = {
  id: string;
  url: string;
  title?: string;
  kind: ExternalLinkKind;
};

const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'];

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return !BLOCKED_PROTOCOLS.some(blocked => url.toLowerCase().startsWith(blocked));
  } catch {
    return false;
  }
}

function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1).split('/')[0];
    return id || null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (url.pathname === '/watch') {
      return url.searchParams.get('v');
    }
    const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
    if (shortsMatch) {
      return shortsMatch[1] ?? null;
    }
    const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);
    if (embedMatch) {
      return embedMatch[1] ?? null;
    }
  }

  return null;
}

function extractSpotifyEmbedPath(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '');
  if (host !== 'open.spotify.com') {
    return null;
  }

  const match = url.pathname.match(/^\/(playlist|album|track|show|episode)\/([^/?#]+)/);
  if (!match) {
    return null;
  }

  return `${match[1]}/${match[2]}`;
}

export function detectExternalLinkKind(url: string): ExternalLinkKind {
  if (!isSafeHttpUrl(url)) {
    return 'website';
  }

  try {
    const parsed = new URL(url);
    if (extractYouTubeId(parsed)) {
      return 'youtube';
    }
    if (extractSpotifyEmbedPath(parsed)) {
      return 'spotify';
    }
  } catch {
    // fall through
  }

  return 'website';
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!isSafeHttpUrl(url)) {
    return null;
  }
  try {
    const parsed = new URL(url);
    const id = extractYouTubeId(parsed);
    if (!id) {
      return null;
    }
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}

export function getSpotifyEmbedUrl(url: string): string | null {
  if (!isSafeHttpUrl(url)) {
    return null;
  }
  try {
    const parsed = new URL(url);
    const path = extractSpotifyEmbedPath(parsed);
    if (!path) {
      return null;
    }
    return `https://open.spotify.com/embed/${path}`;
  } catch {
    return null;
  }
}

export function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function normalizeExternalLinkUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!isSafeHttpUrl(withProtocol)) {
    return null;
  }

  return withProtocol;
}

export function buildExternalLink(url: string, title?: string, id?: string): ExternalLink | null {
  const normalized = normalizeExternalLinkUrl(url);
  if (!normalized) {
    return null;
  }

  return {
    id: id ?? crypto.randomUUID(),
    url: normalized,
    title: title?.trim() || undefined,
    kind: detectExternalLinkKind(normalized),
  };
}

export function parseExternalLinks(raw: unknown): ExternalLink[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const links: ExternalLink[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const url = typeof record.url === 'string' ? record.url : '';
    const normalized = normalizeExternalLinkUrl(url);
    if (!normalized) {
      continue;
    }
    const id = typeof record.id === 'string' && record.id.length > 0
      ? record.id
      : crypto.randomUUID();
    const title = typeof record.title === 'string' && record.title.length > 0
      ? record.title
      : undefined;
    const kind = detectExternalLinkKind(normalized);

    links.push({ id, url: normalized, title, kind });
  }

  return links;
}
