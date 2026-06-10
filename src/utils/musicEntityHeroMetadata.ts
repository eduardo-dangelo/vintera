import type { MusicProjectMetadata } from '@/utils/musicProjectMetadata';
import {
  mergeMusicProjectMetadata,
  parseMusicProjectMetadata,
  resolveProjectTitleFontFamily,
} from '@/utils/musicProjectMetadata';

export type EntityHeroMetadata = Pick<
  MusicProjectMetadata,
  | 'heroBackgroundKind'
  | 'heroBackgroundPreset'
  | 'heroBackgroundColor'
  | 'heroBackgroundOverrides'
  | 'heroChromeTextColor'
  | 'heroImageUrl'
>;

export type SongEntityMetadata = EntityHeroMetadata & {
  coverImageUrl?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasEntityHeroOverrides(metadata: EntityHeroMetadata): boolean {
  return Boolean(
    metadata.heroBackgroundKind
    || metadata.heroBackgroundPreset
    || metadata.heroBackgroundColor
    || metadata.heroBackgroundOverrides
    || metadata.heroImageUrl
    || metadata.heroChromeTextColor,
  );
}

export function parseEntityHeroMetadata(raw: unknown): EntityHeroMetadata {
  if (!isRecord(raw)) {
    return {};
  }

  const parsed = parseMusicProjectMetadata(raw);
  return {
    heroBackgroundKind: parsed.heroBackgroundKind,
    heroBackgroundPreset: parsed.heroBackgroundPreset,
    heroBackgroundColor: parsed.heroBackgroundColor,
    heroBackgroundOverrides: parsed.heroBackgroundOverrides,
    heroChromeTextColor: parsed.heroChromeTextColor,
    heroImageUrl: parsed.heroImageUrl,
  };
}

export function parseSongEntityMetadata(raw: unknown): SongEntityMetadata {
  const hero = parseEntityHeroMetadata(raw);
  if (!isRecord(raw)) {
    return hero;
  }

  const coverImageUrl = typeof raw.coverImageUrl === 'string' && raw.coverImageUrl.length > 0
    ? raw.coverImageUrl
    : undefined;

  return {
    ...hero,
    ...(coverImageUrl ? { coverImageUrl } : {}),
  };
}

export function mergeEntityHeroMetadata(
  projectMetadata: unknown,
  entityMetadata: unknown,
): MusicProjectMetadata {
  const entity = parseEntityHeroMetadata(entityMetadata);
  if (!hasEntityHeroOverrides(entity)) {
    return parseMusicProjectMetadata(projectMetadata);
  }
  return mergeMusicProjectMetadata(projectMetadata, entity);
}

export function resolveSongCoverImageUrl(options: {
  songMetadata: unknown;
  albumCoverImageUrl?: string | null;
  projectCoverImageUrl?: string | null;
}): string | null {
  const songMeta = parseSongEntityMetadata(options.songMetadata);
  return songMeta.coverImageUrl
    ?? options.albumCoverImageUrl
    ?? options.projectCoverImageUrl
    ?? null;
}

export function resolveAlbumCoverImageUrl(options: {
  albumCoverImageUrl?: string | null;
  projectCoverImageUrl?: string | null;
}): string | null {
  return options.albumCoverImageUrl ?? options.projectCoverImageUrl ?? null;
}

export function resolveInheritedTitleFontFamily(projectMetadata: unknown): string {
  return resolveProjectTitleFontFamily(projectMetadata);
}

export function mergeSongEntityMetadata(
  existing: unknown,
  patch: Partial<SongEntityMetadata>,
): SongEntityMetadata {
  const current = parseSongEntityMetadata(existing);
  return {
    ...current,
    ...patch,
    heroBackgroundOverrides: patch.heroBackgroundOverrides
      ? { ...current.heroBackgroundOverrides, ...patch.heroBackgroundOverrides }
      : current.heroBackgroundOverrides,
  };
}

export function mergeAlbumEntityMetadata(
  existing: unknown,
  patch: Partial<EntityHeroMetadata>,
): EntityHeroMetadata {
  const current = parseEntityHeroMetadata(existing);
  return {
    ...current,
    ...patch,
    heroBackgroundOverrides: patch.heroBackgroundOverrides
      ? { ...current.heroBackgroundOverrides, ...patch.heroBackgroundOverrides }
      : current.heroBackgroundOverrides,
  };
}

export { hasEntityHeroOverrides };
