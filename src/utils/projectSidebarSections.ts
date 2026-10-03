import type { ExternalLink } from '@/utils/externalLinkEmbed';
import {
  detectExternalLinkKind,
  getYouTubeEmbedUrl,
  isSafeHttpUrl,
  normalizeExternalLinkUrl,
  parseExternalLinks,
} from '@/utils/externalLinkEmbed';
import { normalizeRichTextForSave } from '@/utils/sanitizeRichTextHtml';

export type SidebarSectionKind = 'members' | 'calendar' | 'video' | 'link' | 'text';

export type MembersSidebarSection = {
  id: string;
  kind: 'members';
};

export type CalendarSidebarSection = {
  id: string;
  kind: 'calendar';
};

export type VideoSidebarSection = {
  id: string;
  kind: 'video';
  url: string;
  title?: string;
};

export type LinkSidebarSection = {
  id: string;
  kind: 'link';
  url: string;
  title?: string;
};

export type TextSidebarSection = {
  id: string;
  kind: 'text';
  title?: string;
  body: string;
};

export type ProjectSidebarSection =
  | MembersSidebarSection
  | CalendarSidebarSection
  | VideoSidebarSection
  | LinkSidebarSection
  | TextSidebarSection;

export const SIDEBAR_SECTION_KINDS: SidebarSectionKind[] = [
  'members',
  'calendar',
  'video',
  'link',
  'text',
];

export const UNIQUE_SIDEBAR_SECTION_KINDS: SidebarSectionKind[] = ['members', 'calendar'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSidebarSectionKind(value: unknown): value is SidebarSectionKind {
  return typeof value === 'string' && SIDEBAR_SECTION_KINDS.includes(value as SidebarSectionKind);
}

function newSectionId(): string {
  return crypto.randomUUID();
}

export function createMembersSection(id?: string): MembersSidebarSection {
  return { id: id ?? newSectionId(), kind: 'members' };
}

export function createCalendarSection(id?: string): CalendarSidebarSection {
  return { id: id ?? newSectionId(), kind: 'calendar' };
}

export function createVideoSection(url: string, title?: string, id?: string): VideoSidebarSection | null {
  const normalized = normalizeExternalLinkUrl(url);
  if (!normalized || !getYouTubeEmbedUrl(normalized)) {
    return null;
  }
  return {
    id: id ?? newSectionId(),
    kind: 'video',
    url: normalized,
    title: title?.trim() || undefined,
  };
}

export function createLinkSection(url: string, title?: string, id?: string): LinkSidebarSection | null {
  const normalized = normalizeExternalLinkUrl(url);
  if (!normalized || !isSafeHttpUrl(normalized)) {
    return null;
  }
  return {
    id: id ?? newSectionId(),
    kind: 'link',
    url: normalized,
    title: title?.trim() || undefined,
  };
}

export function createTextSection(body: string, title?: string, id?: string): TextSidebarSection {
  return {
    id: id ?? newSectionId(),
    kind: 'text',
    title: title?.trim() || undefined,
    body: normalizeRichTextForSave(body),
  };
}

export function hasUniqueSection(sections: ProjectSidebarSection[], kind: SidebarSectionKind): boolean {
  return sections.some(section => section.kind === kind);
}

export function canAddSidebarSectionKind(
  sections: ProjectSidebarSection[],
  kind: SidebarSectionKind,
): boolean {
  if (UNIQUE_SIDEBAR_SECTION_KINDS.includes(kind)) {
    return !hasUniqueSection(sections, kind);
  }
  return true;
}

function parseSidebarSection(raw: unknown): ProjectSidebarSection | null {
  if (!isRecord(raw) || !isSidebarSectionKind(raw.kind)) {
    return null;
  }

  const id = typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : newSectionId();

  if (raw.kind === 'members') {
    return { id, kind: 'members' };
  }
  if (raw.kind === 'calendar') {
    return { id, kind: 'calendar' };
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

/** Validate and dedupe unique kinds (keep first). */
export function normalizeSidebarSections(sections: ProjectSidebarSection[]): ProjectSidebarSection[] {
  const seenUnique = new Set<SidebarSectionKind>();
  const next: ProjectSidebarSection[] = [];

  for (const section of sections) {
    if (UNIQUE_SIDEBAR_SECTION_KINDS.includes(section.kind)) {
      if (seenUnique.has(section.kind)) {
        continue;
      }
      seenUnique.add(section.kind);
    }
    next.push(section);
  }

  return next;
}

export function parseSidebarSections(raw: unknown): ProjectSidebarSection[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const sections: ProjectSidebarSection[] = [];
  for (const item of raw) {
    const parsed = parseSidebarSection(item);
    if (parsed) {
      sections.push(parsed);
    }
  }
  return normalizeSidebarSections(sections);
}

function externalLinkToSection(link: ExternalLink): ProjectSidebarSection | null {
  if (link.kind === 'youtube' || getYouTubeEmbedUrl(link.url)) {
    return createVideoSection(link.url, link.title, link.id);
  }
  return createLinkSection(link.url, link.title, link.id);
}

/** Default sections when metadata has no sidebarSections yet. */
export function migrateLegacySidebarSections(externalLinksRaw: unknown): ProjectSidebarSection[] {
  const links = parseExternalLinks(externalLinksRaw);
  const fromLinks = links
    .map(externalLinkToSection)
    .filter((section): section is ProjectSidebarSection => section != null);

  return normalizeSidebarSections([
    createMembersSection('sidebar-members'),
    createCalendarSection('sidebar-calendar'),
    ...fromLinks,
  ]);
}

export function resolveSidebarSections(
  sidebarSectionsRaw: unknown,
  externalLinksRaw: unknown,
): ProjectSidebarSection[] {
  const parsed = parseSidebarSections(sidebarSectionsRaw);
  if (parsed != null) {
    return parsed;
  }
  return migrateLegacySidebarSections(externalLinksRaw);
}

export function sectionToExternalLinkKind(section: VideoSidebarSection | LinkSidebarSection): ExternalLink['kind'] {
  if (section.kind === 'video') {
    return 'youtube';
  }
  return detectExternalLinkKind(section.url);
}

export function toExternalLinkFromSection(
  section: VideoSidebarSection | LinkSidebarSection,
): ExternalLink {
  return {
    id: section.id,
    url: section.url,
    title: section.title,
    kind: sectionToExternalLinkKind(section),
  };
}
