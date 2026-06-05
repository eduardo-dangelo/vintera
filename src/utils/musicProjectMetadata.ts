import {
  hasPatternOverlay,
  MAX_PATTERN_SIZE,
  migrateLegacyPatternOverrides,
  MIN_PATTERN_SIZE,
} from '@/components/MusicProjects/heroPatternShapes';
import { DEFAULT_TITLE_FONT_FAMILY } from '@/components/MusicProjects/projectTitleFonts';

export type HeroBackgroundKind = 'solid' | 'pattern' | 'gradient' | 'composed' | 'image';

export const MAX_GRADIENT_STOPS = 4;
export const MIN_GRADIENT_STOPS = 1;
export const DEFAULT_BUILDER_GRADIENT_STOPS = ['#8b5cf6', '#3b82f6'];
export const DEFAULT_BUILDER_GRADIENT_ANGLE = 135;
export const DEFAULT_BUILDER_GRADIENT_SHARPNESS = 0;
export const DEFAULT_BUILDER_SOLID = '#8b5cf6';

export type HeroBackgroundOverrides = {
  backgroundColor?: string;
  accentColor?: string;
  patternAccentColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientStops?: string[];
  gradientAngle?: number;
  /** 0 = soft blend, 100 = hard bands between stops */
  gradientSharpness?: number;
  /** @deprecated Legacy shape id; use patternShapeId */
  patternPresetId?: string | null;
  patternShapeId?: string | null;
  patternSize?: number;
  patternOpacity?: number;
};

export type MusicProjectMetadata = {
  heroBackgroundKind?: HeroBackgroundKind;
  /** Last-applied preset id (reference for selection UI) */
  heroBackgroundPreset?: string;
  /** @deprecated Legacy solid hex; normalized to gradientStops */
  heroBackgroundColor?: string;
  heroBackgroundOverrides?: HeroBackgroundOverrides;
  heroChromeTextColor?: string;
  heroImageUrl?: string;
  titleFontFamily?: string;
};

const HERO_BACKGROUND_KINDS: HeroBackgroundKind[] = [
  'solid',
  'pattern',
  'gradient',
  'composed',
  'image',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHeroBackgroundKind(value: unknown): value is HeroBackgroundKind {
  return typeof value === 'string' && HERO_BACKGROUND_KINDS.includes(value as HeroBackgroundKind);
}

function parseGradientStops(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) {
    return undefined;
  }
  const stops = raw.filter((s): s is string => typeof s === 'string' && s.startsWith('#'));
  return stops.length > 0 ? stops.slice(0, MAX_GRADIENT_STOPS) : undefined;
}

function parseHeroBackgroundOverrides(raw: unknown): HeroBackgroundOverrides | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  const overrides: HeroBackgroundOverrides = {};
  if (typeof raw.backgroundColor === 'string' && raw.backgroundColor.length > 0) {
    overrides.backgroundColor = raw.backgroundColor;
  }
  if (typeof raw.accentColor === 'string' && raw.accentColor.length > 0) {
    overrides.accentColor = raw.accentColor;
  }
  if (typeof raw.patternAccentColor === 'string' && raw.patternAccentColor.length > 0) {
    overrides.patternAccentColor = raw.patternAccentColor;
  }
  if (typeof raw.gradientStart === 'string' && raw.gradientStart.length > 0) {
    overrides.gradientStart = raw.gradientStart;
  }
  if (typeof raw.gradientEnd === 'string' && raw.gradientEnd.length > 0) {
    overrides.gradientEnd = raw.gradientEnd;
  }
  const stops = parseGradientStops(raw.gradientStops);
  if (stops) {
    overrides.gradientStops = stops;
  }
  if (typeof raw.gradientAngle === 'number' && !Number.isNaN(raw.gradientAngle)) {
    overrides.gradientAngle = raw.gradientAngle;
  }
  if (typeof raw.gradientSharpness === 'number' && !Number.isNaN(raw.gradientSharpness)) {
    overrides.gradientSharpness = Math.min(100, Math.max(0, Math.round(raw.gradientSharpness)));
  }
  if (raw.patternPresetId === null) {
    overrides.patternPresetId = null;
  } else if (typeof raw.patternPresetId === 'string' && raw.patternPresetId.length > 0) {
    overrides.patternPresetId = raw.patternPresetId;
  }
  if (raw.patternShapeId === null) {
    overrides.patternShapeId = null;
  } else if (typeof raw.patternShapeId === 'string' && raw.patternShapeId.length > 0) {
    overrides.patternShapeId = raw.patternShapeId;
  }
  if (typeof raw.patternSize === 'number' && !Number.isNaN(raw.patternSize)) {
    overrides.patternSize = Math.min(MAX_PATTERN_SIZE, Math.max(MIN_PATTERN_SIZE, raw.patternSize));
  }
  if (typeof raw.patternOpacity === 'number' && !Number.isNaN(raw.patternOpacity)) {
    overrides.patternOpacity = Math.min(1, Math.max(0.1, raw.patternOpacity));
  }
  return Object.keys(overrides).length > 0 ? overrides : undefined;
}

export function getPatternAccentColor(overrides: HeroBackgroundOverrides): string {
  return overrides.patternAccentColor ?? overrides.accentColor ?? '#ffffff';
}

export { hasPatternOverlay } from '@/components/MusicProjects/heroPatternShapes';

/** Resolve gradient stops from overrides (legacy fields included). */
export function resolveGradientStops(overrides: HeroBackgroundOverrides): string[] {
  if (overrides.gradientStops && overrides.gradientStops.length > 0) {
    return overrides.gradientStops.slice(0, MAX_GRADIENT_STOPS);
  }
  const legacy: string[] = [];
  if (overrides.gradientStart) {
    legacy.push(overrides.gradientStart);
  }
  if (overrides.gradientEnd) {
    legacy.push(overrides.gradientEnd);
  }
  if (legacy.length > 0) {
    return legacy;
  }
  if (overrides.backgroundColor && !hasPatternOverlay(overrides)) {
    return [overrides.backgroundColor];
  }
  return [...DEFAULT_BUILDER_GRADIENT_STOPS];
}

export function normalizeHeroMetadata(metadata: MusicProjectMetadata): MusicProjectMetadata {
  if (metadata.heroBackgroundKind === 'image') {
    return metadata;
  }

  const kind = metadata.heroBackgroundKind;
  const overrides = { ...metadata.heroBackgroundOverrides };

  if (kind === 'composed' || !kind) {
    if (!kind) {
      return metadata;
    }
    const migrated = migrateLegacyPatternOverrides(overrides);
    const normalizedOverrides: HeroBackgroundOverrides = {
      ...migrated,
      gradientStops: resolveGradientStops(migrated),
      gradientAngle: migrated.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
    };
    if (migrated.patternPresetId !== undefined) {
      normalizedOverrides.patternPresetId = migrated.patternPresetId;
    }
    if (migrated.patternShapeId !== undefined) {
      normalizedOverrides.patternShapeId = migrated.patternShapeId;
    }
    if (hasPatternOverlay(normalizedOverrides)) {
      delete normalizedOverrides.backgroundColor;
    }
    return {
      ...metadata,
      heroBackgroundOverrides: normalizedOverrides,
    };
  }

  if (kind === 'solid') {
    const hex = metadata.heroBackgroundColor
      ?? overrides.backgroundColor
      ?? DEFAULT_BUILDER_SOLID;
    return {
      ...metadata,
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        ...overrides,
        gradientStops: [hex],
        backgroundColor: hex,
        gradientAngle: overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
        patternPresetId: overrides.patternPresetId,
      },
    };
  }

  if (kind === 'gradient') {
    const stops = resolveGradientStops(overrides);
    return {
      ...metadata,
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        ...overrides,
        gradientStops: stops,
        gradientAngle: overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
        patternPresetId: overrides.patternPresetId,
      },
    };
  }

  if (kind === 'pattern') {
    const migrated = migrateLegacyPatternOverrides({
      ...overrides,
      patternPresetId: metadata.heroBackgroundPreset ?? overrides.patternPresetId ?? null,
    });
    const hasCustomBase = migrated.gradientStops?.length
      || migrated.gradientStart
      || migrated.gradientEnd;
    const stops = hasCustomBase
      ? resolveGradientStops(migrated)
      : (migrated.gradientStops ?? [...DEFAULT_BUILDER_GRADIENT_STOPS]);
    const nextOverrides: HeroBackgroundOverrides = {
      ...migrated,
      gradientStops: stops,
      gradientAngle: migrated.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
      patternAccentColor: getPatternAccentColor(migrated),
    };
    delete nextOverrides.backgroundColor;

    return {
      ...metadata,
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: nextOverrides,
    };
  }

  return metadata;
}

export function parseMusicProjectMetadata(raw: unknown): MusicProjectMetadata {
  if (!isRecord(raw)) {
    return {};
  }

  const metadata: MusicProjectMetadata = {};

  if (isHeroBackgroundKind(raw.heroBackgroundKind)) {
    metadata.heroBackgroundKind = raw.heroBackgroundKind;
  }

  if (typeof raw.heroBackgroundPreset === 'string' && raw.heroBackgroundPreset.length > 0) {
    metadata.heroBackgroundPreset = raw.heroBackgroundPreset;
  }

  if (typeof raw.heroBackgroundColor === 'string' && raw.heroBackgroundColor.length > 0) {
    metadata.heroBackgroundColor = raw.heroBackgroundColor;
  }

  const overrides = parseHeroBackgroundOverrides(raw.heroBackgroundOverrides);
  if (overrides) {
    metadata.heroBackgroundOverrides = overrides;
  }

  if (typeof raw.heroChromeTextColor === 'string' && raw.heroChromeTextColor.length > 0) {
    metadata.heroChromeTextColor = raw.heroChromeTextColor;
  }

  if (typeof raw.heroImageUrl === 'string' && raw.heroImageUrl.length > 0) {
    metadata.heroImageUrl = raw.heroImageUrl;
  }

  if (typeof raw.titleFontFamily === 'string' && raw.titleFontFamily.length > 0) {
    metadata.titleFontFamily = raw.titleFontFamily;
  }

  return normalizeHeroMetadata(metadata);
}

export function resolveProjectTitleFontFamily(metadata: unknown): string {
  return parseMusicProjectMetadata(metadata).titleFontFamily ?? DEFAULT_TITLE_FONT_FAMILY;
}

const HERO_METADATA_KEYS = [
  'heroBackgroundKind',
  'heroBackgroundPreset',
  'heroBackgroundColor',
  'heroBackgroundOverrides',
  'heroChromeTextColor',
  'heroImageUrl',
] as const;

export function mergeMusicProjectMetadata(
  existing: unknown,
  patch: Partial<MusicProjectMetadata>,
): MusicProjectMetadata {
  const current = parseMusicProjectMetadata(existing);

  if (patch.heroBackgroundKind === 'image') {
    const rest = { ...current };
    for (const key of HERO_METADATA_KEYS) {
      delete rest[key];
    }
    const next: MusicProjectMetadata = { ...rest, heroBackgroundKind: 'image' };
    if (patch.heroImageUrl) {
      next.heroImageUrl = patch.heroImageUrl;
    }
    if (patch.heroChromeTextColor) {
      next.heroChromeTextColor = patch.heroChromeTextColor;
    }
    return next;
  }

  if (patch.heroBackgroundKind !== undefined && patch.heroBackgroundKind !== 'composed') {
    const rest = { ...current };
    for (const key of HERO_METADATA_KEYS) {
      delete rest[key];
    }
    const next: MusicProjectMetadata = { ...rest, heroBackgroundKind: patch.heroBackgroundKind };
    if (patch.heroBackgroundPreset) {
      next.heroBackgroundPreset = patch.heroBackgroundPreset;
    }
    if (patch.heroBackgroundColor) {
      next.heroBackgroundColor = patch.heroBackgroundColor;
    }
    if (patch.heroBackgroundOverrides) {
      next.heroBackgroundOverrides = patch.heroBackgroundOverrides;
    }
    if (patch.heroChromeTextColor) {
      next.heroChromeTextColor = patch.heroChromeTextColor;
    }
    if (patch.heroImageUrl) {
      next.heroImageUrl = patch.heroImageUrl;
    }
    return normalizeHeroMetadata(next);
  }

  const merged = { ...current, ...patch };
  if (patch.heroBackgroundOverrides) {
    merged.heroBackgroundOverrides = {
      ...current.heroBackgroundOverrides,
      ...patch.heroBackgroundOverrides,
    };
  }
  if (
    patch.heroBackgroundKind === 'composed'
    || (patch.heroBackgroundOverrides && current.heroBackgroundKind !== 'image')
  ) {
    delete merged.heroImageUrl;
  }
  return normalizeHeroMetadata(merged);
}

/** Updates tweak overrides without resetting kind / preset. */
export function mergeHeroBackgroundOverrides(
  existing: unknown,
  overrides: Partial<HeroBackgroundOverrides>,
): MusicProjectMetadata {
  const current = parseMusicProjectMetadata(existing);
  const nextOverrides = {
    ...current.heroBackgroundOverrides,
    ...overrides,
  };
  return normalizeHeroMetadata({
    ...current,
    heroBackgroundKind: current.heroBackgroundKind === 'image' ? 'image' : 'composed',
    heroBackgroundOverrides: nextOverrides,
  });
}

/** Patch for switching hero background; use with mergeMusicProjectMetadata. */
export function buildHeroBackgroundMetadataPatch(
  kind: HeroBackgroundKind,
  options: {
    presetId?: string;
    color?: string;
    imageUrl?: string;
    overrides?: HeroBackgroundOverrides;
    heroChromeTextColor?: string;
  } = {},
): MusicProjectMetadata {
  if (kind === 'image' && options.imageUrl) {
    const patch: MusicProjectMetadata = { heroBackgroundKind: kind, heroImageUrl: options.imageUrl };
    if (options.heroChromeTextColor) {
      patch.heroChromeTextColor = options.heroChromeTextColor;
    }
    return patch;
  }

  if (kind === 'solid' && options.color) {
    return normalizeHeroMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundColor: options.color,
      heroBackgroundOverrides: {
        ...options.overrides,
        gradientStops: [options.color],
        backgroundColor: options.color,
      },
      ...(options.heroChromeTextColor ? { heroChromeTextColor: options.heroChromeTextColor } : {}),
    });
  }

  const patch: MusicProjectMetadata = { heroBackgroundKind: kind === 'composed' ? 'composed' : kind };
  if (options.overrides) {
    patch.heroBackgroundOverrides = options.overrides;
  }
  if (options.heroChromeTextColor) {
    patch.heroChromeTextColor = options.heroChromeTextColor;
  }
  return normalizeHeroMetadata(patch);
}

export function resolveGradientSharpness(overrides: HeroBackgroundOverrides): number {
  if (typeof overrides.gradientSharpness === 'number' && !Number.isNaN(overrides.gradientSharpness)) {
    return Math.min(100, Math.max(0, Math.round(overrides.gradientSharpness)));
  }
  return DEFAULT_BUILDER_GRADIENT_SHARPNESS;
}

export function getBuilderDefaultOverrides(): HeroBackgroundOverrides {
  return {
    gradientStops: [...DEFAULT_BUILDER_GRADIENT_STOPS],
    gradientAngle: DEFAULT_BUILDER_GRADIENT_ANGLE,
    gradientSharpness: DEFAULT_BUILDER_GRADIENT_SHARPNESS,
    patternPresetId: null,
    patternShapeId: null,
  };
}
