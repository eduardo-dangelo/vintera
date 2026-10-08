import type {
  LinkSidebarSection,
  TextSidebarSection,
  VideoSidebarSection,
} from '@/utils/projectSidebarSections';
import {
  createLinkSection,
  createTextSection,
  createVideoSection,
} from '@/utils/projectSidebarSections';

export type MainSectionKind = 'albums' | 'songs' | 'video' | 'link' | 'text';

export type AlbumsMainSection = {
  id: string;
  kind: 'albums';
};

export type SongsMainSection = {
  id: string;
  kind: 'songs';
};

export type ProjectMainSection =
  | AlbumsMainSection
  | SongsMainSection
  | VideoSidebarSection
  | LinkSidebarSection
  | TextSidebarSection;

export const MAIN_SECTION_KINDS: MainSectionKind[] = [
  'albums',
  'songs',
  'video',
  'link',
  'text',
];

export const UNIQUE_MAIN_SECTION_KINDS: MainSectionKind[] = ['albums', 'songs'];

export const MAIN_CONTENT_SECTION_KINDS: Array<Extract<MainSectionKind, 'video' | 'link' | 'text'>> = [
  'video',
  'link',
  'text',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMainSectionKind(value: unknown): value is MainSectionKind {
  return typeof value === 'string' && MAIN_SECTION_KINDS.includes(value as MainSectionKind);
}

function newSectionId(): string {
  return crypto.randomUUID();
}

export function createAlbumsSection(id?: string): AlbumsMainSection {
  return { id: id ?? newSectionId(), kind: 'albums' };
}

export function createSongsSection(id?: string): SongsMainSection {
  return { id: id ?? newSectionId(), kind: 'songs' };
}

export function hasUniqueMainSection(
  sections: ProjectMainSection[],
  kind: MainSectionKind,
): boolean {
  return sections.some(section => section.kind === kind);
}

export type MainSectionAddCounts = {
  albumCount: number;
  songCount: number;
};

/** Albums/songs only when that content exists and the section is not already in the list. */
export function canAddMainSectionKind(
  sections: ProjectMainSection[],
  kind: MainSectionKind,
  counts: MainSectionAddCounts,
): boolean {
  if (kind === 'albums') {
    return counts.albumCount > 0 && !hasUniqueMainSection(sections, 'albums');
  }
  if (kind === 'songs') {
    return counts.songCount > 0 && !hasUniqueMainSection(sections, 'songs');
  }
  return true;
}

function parseMainSection(raw: unknown): ProjectMainSection | null {
  if (!isRecord(raw) || !isMainSectionKind(raw.kind)) {
    return null;
  }

  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : newSectionId();

  if (raw.kind === 'albums') {
    return { id, kind: 'albums' };
  }
  if (raw.kind === 'songs') {
    return { id, kind: 'songs' };
  }
  if (raw.kind === 'video') {
    const url = typeof raw.url === 'string' ? raw.url : '';
    const title = typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : undefined;
    return createVideoSection(url, title, id);
  }
  if (raw.kind === 'link') {
    const url = typeof raw.url === 'string' ? raw.url : '';
    const title = typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : undefined;
    return createLinkSection(url, title, id);
  }
  if (raw.kind === 'text') {
    const body = typeof raw.body === 'string' ? raw.body : '';
    const title = typeof raw.title === 'string' && raw.title.length > 0 ? raw.title : undefined;
    return createTextSection(body, title, id);
  }
  return null;
}

export function normalizeMainSections(sections: ProjectMainSection[]): ProjectMainSection[] {
  const seenUnique = new Set<MainSectionKind>();
  const next: ProjectMainSection[] = [];

  for (const section of sections) {
    if (UNIQUE_MAIN_SECTION_KINDS.includes(section.kind)) {
      if (seenUnique.has(section.kind)) {
        continue;
      }
      seenUnique.add(section.kind);
    }
    next.push(section);
  }

  return next;
}

export function parseMainSections(raw: unknown): ProjectMainSection[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const sections: ProjectMainSection[] = [];
  for (const item of raw) {
    const parsed = parseMainSection(item);
    if (parsed) {
      sections.push(parsed);
    }
  }
  return normalizeMainSections(sections);
}

/** Default sections when metadata has no mainSections yet. */
export function defaultMainSections(): ProjectMainSection[] {
  return normalizeMainSections([
    createAlbumsSection('main-albums'),
    createSongsSection('main-songs'),
  ]);
}

export function resolveMainSections(mainSectionsRaw: unknown): ProjectMainSection[] {
  const parsed = parseMainSections(mainSectionsRaw);
  if (parsed != null) {
    return parsed;
  }
  return defaultMainSections();
}

export function isMainContentSection(
  section: ProjectMainSection,
): section is VideoSidebarSection | LinkSidebarSection | TextSidebarSection {
  return section.kind === 'video' || section.kind === 'link' || section.kind === 'text';
}

export function isMainHideOnlySection(section: ProjectMainSection): boolean {
  return section.kind === 'albums' || section.kind === 'songs';
}
