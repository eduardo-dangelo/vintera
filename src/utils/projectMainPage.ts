import type { JSONContent } from '@tiptap/core';
import type { ProjectMainSection } from '@/utils/projectMainSections';
import { normalizeExternalLinkUrl } from '@/utils/externalLinkEmbed';
import { richTextToPlainText, sanitizeRichTextHtml } from '@/utils/sanitizeRichTextHtml';

/** Legacy aggregate blocks. Converted to recent lists on read. */
export const PROJECT_ALBUMS_NODE = 'projectAlbums';
export const PROJECT_SONGS_NODE = 'projectSongs';
export const PROJECT_SONG_NODE = 'projectSong';
export const PROJECT_ALBUM_NODE = 'projectAlbum';
export const PROJECT_SONG_LIST_NODE = 'projectSongList';
export const PROJECT_ALBUM_LIST_NODE = 'projectAlbumList';
export const PROJECT_EMBED_NODE = 'projectEmbed';

export type PageBlockView = 'row' | 'card';
export type PageListMode = 'recent' | 'custom';

const ALLOWED_NODES = new Set([
  'doc',
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
  'text',
  PROJECT_SONG_NODE,
  PROJECT_ALBUM_NODE,
  PROJECT_SONG_LIST_NODE,
  PROJECT_ALBUM_LIST_NODE,
  PROJECT_EMBED_NODE,
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function emptyMainPage(): JSONContent {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

export function recentMusicList(type: typeof PROJECT_SONG_LIST_NODE | typeof PROJECT_ALBUM_LIST_NODE): JSONContent {
  return {
    type,
    attrs: { mode: 'recent', title: '', itemIds: [], view: 'row' },
  };
}

export function defaultMainPage(_albumCount: number, songCount: number): JSONContent {
  const content: JSONContent[] = [];
  if (songCount > 0) {
    content.push(recentMusicList(PROJECT_SONG_LIST_NODE));
  }
  if (content.length === 0) {
    return emptyMainPage();
  }
  return { type: 'doc', content };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'');
}

function parseInline(source: string, marks: JSONContent['marks'] = []): JSONContent[] {
  const out: JSONContent[] = [];
  let text = '';
  let index = 0;

  const flush = () => {
    const decoded = decodeEntities(text);
    text = '';
    if (!decoded) {
      return;
    }
    const node: JSONContent = { type: 'text', text: decoded };
    if (marks && marks.length > 0) {
      node.marks = marks;
    }
    out.push(node);
  };

  while (index < source.length) {
    if (source[index] !== '<') {
      text += source[index];
      index += 1;
      continue;
    }
    const close = source.indexOf('>', index);
    if (close === -1) {
      text += source.slice(index);
      break;
    }
    const rawTag = source.slice(index + 1, close).trim();
    flush();
    if (/^br\s*\/?$/i.test(rawTag)) {
      out.push({ type: 'hardBreak' });
      index = close + 1;
      continue;
    }
    const open = /^(strong|em|[abi])(\s[\s\S]*)?$/i.exec(rawTag);
    if (!open) {
      index = close + 1;
      continue;
    }
    const name = open[1]!.toLowerCase();
    const endTag = `</${name}>`;
    const end = source.toLowerCase().indexOf(endTag, close + 1);
    if (end === -1) {
      index = close + 1;
      continue;
    }
    let nextMarks = marks ? [...marks] : [];
    if (name === 'strong' || name === 'b') {
      nextMarks = [...nextMarks, { type: 'bold' }];
    } else if (name === 'em' || name === 'i') {
      nextMarks = [...nextMarks, { type: 'italic' }];
    } else if (name === 'a') {
      const href = /href\s*=\s*"([^"]*)"/i.exec(open[2] ?? '')?.[1]
        ?? /href\s*=\s*'([^']*)'/i.exec(open[2] ?? '')?.[1];
      if (href) {
        nextMarks = [...nextMarks, { type: 'link', attrs: { href } }];
      }
    }
    out.push(...parseInline(source.slice(close + 1, end), nextMarks));
    index = end + endTag.length;
  }
  flush();
  return out;
}

function parseList(kind: 'bulletList' | 'orderedList', inner: string): JSONContent | null {
  const items: JSONContent[] = [];
  const re = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  for (const match of inner.matchAll(re)) {
    const inline = parseInline(match[1] ?? '');
    items.push({
      type: 'listItem',
      content: [{
        type: 'paragraph',
        ...(inline.length > 0 ? { content: inline } : {}),
      }],
    });
  }
  if (items.length === 0) {
    return null;
  }
  return { type: kind, content: items };
}

export function htmlToMainPageBlocks(html: string): JSONContent[] {
  const sanitized = sanitizeRichTextHtml(html).trim();
  if (!sanitized) {
    return [];
  }
  if (!sanitized.includes('<')) {
    return [{ type: 'paragraph', content: [{ type: 'text', text: sanitized }] }];
  }

  const blocks: JSONContent[] = [];
  const re = /<(p|h1|h2|h3|ul|ol)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  for (const match of sanitized.matchAll(re)) {
    const tag = match[1]!.toLowerCase();
    const inner = match[3] ?? '';
    if (tag === 'ul' || tag === 'ol') {
      const list = parseList(tag === 'ul' ? 'bulletList' : 'orderedList', inner);
      if (list) {
        blocks.push(list);
      }
      continue;
    }
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
      const level = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3;
      const content = parseInline(inner);
      blocks.push({
        type: 'heading',
        attrs: { level },
        ...(content.length > 0 ? { content } : {}),
      });
      continue;
    }
    const content = parseInline(inner);
    if (content.length > 0) {
      blocks.push({ type: 'paragraph', content });
    }
  }

  if (blocks.length === 0) {
    const plain = richTextToPlainText(sanitized);
    if (plain) {
      blocks.push({ type: 'paragraph', content: [{ type: 'text', text: plain }] });
    }
  }
  return blocks;
}

function embedBlock(url: string, title?: string): JSONContent | null {
  const normalized = normalizeExternalLinkUrl(url);
  if (!normalized) {
    return null;
  }
  return {
    type: PROJECT_EMBED_NODE,
    attrs: {
      url: normalized,
      title: title?.trim() || null,
    },
  };
}

export function mainSectionsToPage(sections: ProjectMainSection[]): JSONContent {
  const content: JSONContent[] = [];
  for (const section of sections) {
    if (section.kind === 'albums' || section.kind === 'songs') {
      content.push(recentMusicList(PROJECT_SONG_LIST_NODE));
    } else if (section.kind === 'video' || section.kind === 'link') {
      const block = embedBlock(section.url, section.title);
      if (block) {
        content.push(block);
      }
    } else if (section.kind === 'text') {
      if (section.title?.trim()) {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: section.title.trim() }],
        });
      }
      content.push(...htmlToMainPageBlocks(section.body));
    }
  }
  const normalized = normalizeMainPage({ type: 'doc', content });
  return normalized ?? emptyMainPage();
}

function parsePositiveId(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function parseItemIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids: number[] = [];
  for (const item of value) {
    const id = parsePositiveId(item);
    if (id != null && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

function parseBlockView(value: unknown): PageBlockView {
  return value === 'card' ? 'card' : 'row';
}

function parseListMode(value: unknown): PageListMode {
  return value === 'custom' ? 'custom' : 'recent';
}

function musicListNode(type: string, attrs: Record<string, unknown>): JSONContent {
  const title = typeof attrs.title === 'string' ? attrs.title.trim() : '';
  return {
    type,
    attrs: {
      mode: parseListMode(attrs.mode),
      title,
      itemIds: parseItemIds(attrs.itemIds),
      view: parseBlockView(attrs.view),
    },
  };
}

function normalizeNode(raw: unknown): JSONContent | null {
  if (!isRecord(raw) || typeof raw.type !== 'string' || raw.type === 'doc') {
    return null;
  }
  if (raw.type === PROJECT_SONGS_NODE) {
    return recentMusicList(PROJECT_SONG_LIST_NODE);
  }
  if (raw.type === PROJECT_ALBUMS_NODE) {
    return recentMusicList(PROJECT_ALBUM_LIST_NODE);
  }
  if (!ALLOWED_NODES.has(raw.type)) {
    return null;
  }
  if (raw.type === 'text') {
    return typeof raw.text === 'string' && raw.text.length > 0
      ? { type: 'text', text: raw.text, ...(Array.isArray(raw.marks) ? { marks: raw.marks as JSONContent['marks'] } : {}) }
      : null;
  }
  if (raw.type === PROJECT_ALBUM_NODE) {
    return null;
  }
  if (raw.type === PROJECT_SONG_NODE) {
    const attrs = isRecord(raw.attrs) ? raw.attrs : {};
    const id = parsePositiveId(attrs.id);
    if (id == null) {
      return null;
    }
    return { type: raw.type, attrs: { id, view: parseBlockView(attrs.view) } };
  }
  if (raw.type === PROJECT_SONG_LIST_NODE || raw.type === PROJECT_ALBUM_LIST_NODE) {
    return musicListNode(raw.type, isRecord(raw.attrs) ? raw.attrs : {});
  }
  if (raw.type === PROJECT_EMBED_NODE) {
    const attrs = isRecord(raw.attrs) ? raw.attrs : {};
    const url = typeof attrs.url === 'string' ? normalizeExternalLinkUrl(attrs.url) : null;
    if (!url) {
      return null;
    }
    const title = typeof attrs.title === 'string' && attrs.title.trim() ? attrs.title.trim() : null;
    return { type: PROJECT_EMBED_NODE, attrs: { url, title } };
  }
  if (raw.type === 'horizontalRule' || raw.type === 'hardBreak') {
    return { type: raw.type };
  }

  const content = Array.isArray(raw.content)
    ? raw.content.map(normalizeNode).filter((node): node is JSONContent => node != null)
    : [];
  const node: JSONContent = { type: raw.type };
  if (raw.type === 'heading') {
    const attrs = isRecord(raw.attrs) ? raw.attrs : {};
    const level = attrs.level === 1 || attrs.level === 2 || attrs.level === 3 ? attrs.level : 2;
    node.attrs = { level };
  }
  if (raw.type === 'taskList') {
    const attrs = isRecord(raw.attrs) ? raw.attrs : {};
    if (attrs.hideCompleted === true) {
      node.attrs = { hideCompleted: true };
    }
  }
  if (raw.type === 'taskItem') {
    const attrs = isRecord(raw.attrs) ? raw.attrs : {};
    node.attrs = { checked: attrs.checked === true };
  }
  if (content.length > 0) {
    node.content = content;
  }
  return node;
}

export function normalizeMainPage(raw: unknown): JSONContent | null {
  if (!isRecord(raw) || raw.type !== 'doc' || !Array.isArray(raw.content)) {
    return null;
  }
  const content: JSONContent[] = [];
  for (const item of raw.content) {
    const node = normalizeNode(item);
    if (!node) {
      continue;
    }
    content.push(node);
  }
  const collections = collapseCollectionNodes(content);
  if (collections.length === 0) {
    return emptyMainPage();
  }
  return { type: 'doc', content: collections };
}

function isRecentCollectionNode(node: JSONContent): boolean {
  return node.type === PROJECT_SONG_LIST_NODE && node.attrs?.mode === 'recent';
}

/** Drop album blocks. A recent album list becomes one recent collection when the page has none. */
function collapseCollectionNodes(content: JSONContent[]): JSONContent[] {
  let hasRecent = content.some(isRecentCollectionNode);
  const next: JSONContent[] = [];
  for (const node of content) {
    if (node.type === PROJECT_ALBUM_NODE) {
      continue;
    }
    if (node.type === PROJECT_ALBUM_LIST_NODE) {
      if (node.attrs?.mode === 'recent' && !hasRecent) {
        next.push(recentMusicList(PROJECT_SONG_LIST_NODE));
        hasRecent = true;
      }
      continue;
    }
    if (isRecentCollectionNode(node)) {
      if (hasRecent && next.some(isRecentCollectionNode)) {
        continue;
      }
      hasRecent = true;
    }
    next.push(node);
  }
  return next;
}

export type PageCollection = {
  mode: PageListMode;
  title: string;
  itemIds: number[];
  view: PageBlockView;
};

export function pageCollections(doc: JSONContent | null | undefined): PageCollection[] {
  const collections: PageCollection[] = [];
  for (const node of doc?.content ?? []) {
    if (node.type !== PROJECT_SONG_LIST_NODE) {
      continue;
    }
    const attrs = isRecord(node.attrs) ? node.attrs : {};
    collections.push({
      mode: attrs.mode === 'custom' ? 'custom' : 'recent',
      title: typeof attrs.title === 'string' ? attrs.title : '',
      itemIds: parseItemIds(attrs.itemIds),
      view: parseBlockView(attrs.view),
    });
  }
  return collections;
}

export function pageHasRecentCollection(doc: JSONContent | null | undefined): boolean {
  return pageCollections(doc).some(collection => collection.mode === 'recent');
}

export function gatherCollections(pages: Array<JSONContent | null | undefined>): PageCollection[] {
  let recent: PageCollection | null = null;
  const custom: PageCollection[] = [];
  for (const page of pages) {
    for (const collection of pageCollections(page)) {
      if (collection.mode === 'recent') {
        if (!recent) {
          recent = collection;
        }
      } else {
        custom.push(collection);
      }
    }
  }
  return recent ? [recent, ...custom] : custom;
}

export function projectHasCollection(pages: Array<JSONContent | null | undefined>): boolean {
  return gatherCollections(pages).length > 0;
}

export function appendAlbumCollections(
  page: JSONContent,
  albums: Array<{ id: number; name: string }>,
  songs: Array<{ id: number; albumId: number | null }>,
): JSONContent {
  if (albums.length === 0) {
    return page;
  }
  const content = [...(page.content ?? [])];
  for (const album of albums) {
    content.push({
      type: PROJECT_SONG_LIST_NODE,
      attrs: {
        mode: 'custom',
        title: album.name,
        itemIds: songs.filter(song => song.albumId === album.id).map(song => song.id),
        view: 'row',
      },
    });
  }
  return { type: 'doc', content };
}

export function parseMainPage(raw: unknown): JSONContent | null {
  return normalizeMainPage(raw);
}

export function resolveMainPage(
  mainPage: JSONContent | null | undefined,
  mainSections: ProjectMainSection[] | null | undefined,
  albumCount: number,
  songCount: number,
): JSONContent {
  return mainPage
    ?? (mainSections ? mainSectionsToPage(mainSections) : defaultMainPage(albumCount, songCount));
}

function walkContent(node: JSONContent, visit: (node: JSONContent) => boolean): boolean {
  if (visit(node)) {
    return true;
  }
  return (node.content ?? []).some(child => walkContent(child, visit));
}

export function mainPageHasEditableContent(doc: JSONContent): boolean {
  return walkContent(doc, (node) => {
    if (node.type === PROJECT_EMBED_NODE) {
      return true;
    }
    if (node.type === 'text') {
      return Boolean(node.text?.trim());
    }
    return false;
  });
}

export function mainPageHasNode(doc: JSONContent, type: string): boolean {
  return walkContent(doc, node => node.type === type);
}

export function pastedSingleUrl(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed || /\s/.test(trimmed)) {
    return null;
  }
  const looksLikeUrl = /^https?:\/\//i.test(trimmed)
    || /^[\w.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(trimmed);
  if (!looksLikeUrl) {
    return null;
  }
  return normalizeExternalLinkUrl(trimmed);
}
