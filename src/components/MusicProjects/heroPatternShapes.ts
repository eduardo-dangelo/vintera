import type { HeroBackgroundOverrides } from '@/utils/musicProjectMetadata';

export type HeroPatternShapeId
  = | 'dots'
    | 'grid'
    | 'diagonal'
    | 'waves'
    | 'speckle'
    | 'offset-dots'
    | 'checkerboard'
    | 'rings'
    | 'zigzag'
    | 'plus'
    | 'eq-bars'
    | 'staff'
    | 'vinyl'
    | 'triangles'
    | 'diamonds';

export const MIN_PATTERN_SIZE = 8;
export const MAX_PATTERN_SIZE = 96;

export type HeroPatternShape = {
  id: HeroPatternShapeId;
  labelKey: string;
  defaultSize: number;
  minSize: number;
  maxSize: number;
};

export const HERO_PATTERN_SHAPES: HeroPatternShape[] = [
  { id: 'dots', labelKey: 'hero_bg_shape_dots', defaultSize: 16, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'grid', labelKey: 'hero_bg_shape_grid', defaultSize: 24, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'diagonal', labelKey: 'hero_bg_shape_diagonal', defaultSize: 24, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'waves', labelKey: 'hero_bg_shape_waves', defaultSize: 24, minSize: 12, maxSize: MAX_PATTERN_SIZE },
  { id: 'speckle', labelKey: 'hero_bg_shape_speckle', defaultSize: 24, minSize: 12, maxSize: MAX_PATTERN_SIZE },
  { id: 'offset-dots', labelKey: 'hero_bg_shape_offset_dots', defaultSize: 16, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'checkerboard', labelKey: 'hero_bg_shape_checkerboard', defaultSize: 20, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'rings', labelKey: 'hero_bg_shape_rings', defaultSize: 28, minSize: 12, maxSize: MAX_PATTERN_SIZE },
  { id: 'zigzag', labelKey: 'hero_bg_shape_zigzag', defaultSize: 20, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'plus', labelKey: 'hero_bg_shape_plus', defaultSize: 24, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'eq-bars', labelKey: 'hero_bg_shape_eq_bars', defaultSize: 20, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'staff', labelKey: 'hero_bg_shape_staff', defaultSize: 32, minSize: 12, maxSize: MAX_PATTERN_SIZE },
  { id: 'vinyl', labelKey: 'hero_bg_shape_vinyl', defaultSize: 20, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'triangles', labelKey: 'hero_bg_shape_triangles', defaultSize: 24, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
  { id: 'diamonds', labelKey: 'hero_bg_shape_diamonds', defaultSize: 24, minSize: MIN_PATTERN_SIZE, maxSize: MAX_PATTERN_SIZE },
];

export const DEFAULT_PATTERN_SHAPE_ID: HeroPatternShapeId = 'dots';

/** Sentinel id for the "no pattern" tile in the custom builder. */
export const PATTERN_NONE_ID = 'none';

export type LegacyPatternMigration = {
  patternShapeId: HeroPatternShapeId;
  gradientStops: string[];
  patternAccentColor: string;
  patternSize?: number;
  patternOpacity?: number;
};

/** Maps legacy patternPresetId values to shape + default recipe fields. */
export const LEGACY_PATTERN_PRESET_MIGRATION: Record<string, LegacyPatternMigration> = {
  'pattern-dots-dark': {
    patternShapeId: 'dots',
    gradientStops: ['#1e1e22'],
    patternAccentColor: '#ffffff',
    patternSize: 16,
  },
  'pattern-dots-light': {
    patternShapeId: 'dots',
    gradientStops: ['#f0f4f8'],
    patternAccentColor: '#0f172a',
    patternSize: 16,
  },
  'pattern-grid': {
    patternShapeId: 'grid',
    gradientStops: ['#252526'],
    patternAccentColor: '#ffffff',
    patternSize: 24,
  },
  'pattern-diagonal': {
    patternShapeId: 'diagonal',
    gradientStops: ['#2a2a30'],
    patternAccentColor: '#ffffff',
    patternSize: 24,
  },
  'pattern-waves': {
    patternShapeId: 'waves',
    gradientStops: ['#1e293b'],
    patternAccentColor: '#8b5cf6',
    patternSize: 24,
  },
  'pattern-cross': {
    patternShapeId: 'grid',
    gradientStops: ['#e8ecf1'],
    patternAccentColor: '#0f172a',
    patternSize: 24,
  },
  'pattern-noise': {
    patternShapeId: 'speckle',
    gradientStops: ['#18181b'],
    patternAccentColor: '#60a5fa',
    patternSize: 24,
  },
  'pattern-brand': {
    patternShapeId: 'offset-dots',
    gradientStops: ['#120e1c'],
    patternAccentColor: '#8b5cf6',
    patternSize: 16,
  },
};

export function findHeroPatternShape(id: string): HeroPatternShape | undefined {
  return HERO_PATTERN_SHAPES.find(shape => shape.id === id);
}

export function getDefaultPatternSize(shapeId: string): number {
  return findHeroPatternShape(shapeId)?.defaultSize ?? 24;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function scaledAlpha(baseAlpha: number, opacity: number): number {
  return Math.min(1, Math.max(0, baseAlpha * opacity));
}

export function buildPatternBackgroundImage(
  shapeId: string,
  accentColor: string,
  opacity: number = 1,
): string {
  const a = (base: number) => hexToRgba(accentColor, scaledAlpha(base, opacity));
  const accentSoft = a(0.35);
  const accentMid = a(0.2);
  const accentLine = a(0.06);
  const accentLine45 = a(0.04);

  switch (shapeId) {
    case 'dots':
      return `radial-gradient(${a(0.14)} 1px, transparent 1px)`;
    case 'grid':
      return `linear-gradient(${accentLine} 1px, transparent 1px), linear-gradient(90deg, ${accentLine} 1px, transparent 1px)`;
    case 'diagonal':
      return `repeating-linear-gradient(45deg, ${accentLine45} 0, ${accentLine45} 1px, transparent 0, transparent 50%)`;
    case 'waves':
      return `radial-gradient(ellipse at 20% 80%, ${accentSoft} 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${a(0.3)} 0%, transparent 50%)`;
    case 'speckle':
      return `radial-gradient(circle at 25% 25%, ${a(0.08)} 0%, transparent 40%), radial-gradient(circle at 75% 75%, ${a(0.12)} 0%, transparent 45%)`;
    case 'offset-dots':
      return `radial-gradient(${a(0.25)} 1px, transparent 1px), radial-gradient(${a(0.2)} 1px, transparent 1px)`;
    case 'checkerboard':
      return `linear-gradient(45deg, ${a(0.08)} 25%, transparent 25%, transparent 75%, ${a(0.08)} 75%), linear-gradient(45deg, ${a(0.08)} 25%, transparent 25%, transparent 75%, ${a(0.08)} 75%)`;
    case 'rings':
      return `radial-gradient(circle, transparent 55%, ${a(0.12)} 56%, ${a(0.12)} 60%, transparent 61%)`;
    case 'zigzag': {
      const chevron = a(0.2);
      return [
        `linear-gradient(135deg, ${chevron} 25%, transparent 25%)`,
        `linear-gradient(225deg, ${chevron} 25%, transparent 25%)`,
        `linear-gradient(315deg, ${chevron} 25%, transparent 25%)`,
        `linear-gradient(45deg, ${chevron} 25%, transparent 25%)`,
      ].join(', ');
    }
    case 'plus':
      return `linear-gradient(${a(0.1)} 2px, transparent 2px), linear-gradient(90deg, ${a(0.1)} 2px, transparent 2px)`;
    case 'eq-bars':
      return `linear-gradient(90deg, ${a(0.28)} 0%, ${a(0.28)} 12%, transparent 12%, transparent 22%, ${a(0.14)} 22%, ${a(0.14)} 28%, transparent 28%, transparent 40%, ${a(0.22)} 40%, ${a(0.22)} 52%, transparent 52%, transparent 64%, ${a(0.1)} 64%, ${a(0.1)} 68%, transparent 68%, transparent 80%, ${a(0.18)} 80%, ${a(0.18)} 90%, transparent 90%)`;
    case 'staff':
      return `repeating-linear-gradient(0deg, transparent 0, transparent calc(20% - 1px), ${a(0.12)} calc(20% - 1px), ${a(0.12)} 20%)`;
    case 'vinyl':
      return `radial-gradient(circle, transparent 28%, ${a(0.1)} 29%, ${a(0.1)} 30%, transparent 31%, transparent 38%, ${a(0.1)} 39%, ${a(0.1)} 40%, transparent 41%, transparent 48%, ${a(0.08)} 49%, ${a(0.08)} 50%, transparent 51%, transparent 58%, ${a(0.08)} 59%, ${a(0.08)} 60%, transparent 61%, transparent 68%, ${a(0.06)} 69%, ${a(0.06)} 70%, transparent 71%)`;
    case 'triangles':
      return `repeating-linear-gradient(60deg, ${a(0.1)} 0, ${a(0.1)} 1px, transparent 1px, transparent 50%), repeating-linear-gradient(120deg, ${a(0.1)} 0, ${a(0.1)} 1px, transparent 1px, transparent 50%)`;
    case 'diamonds':
      return `repeating-linear-gradient(45deg, ${a(0.1)} 0, ${a(0.1)} 1px, transparent 1px, transparent 50%), repeating-linear-gradient(-45deg, ${a(0.1)} 0, ${a(0.1)} 1px, transparent 1px, transparent 50%)`;
    default:
      return `radial-gradient(${accentMid} 1px, transparent 1px)`;
  }
}

function getPatternTileSize(shapeId: string, size: number): string {
  if (shapeId === 'zigzag') {
    const half = Math.round(size / 2);
    return `${size}px ${half}px`;
  }
  return `${size}px ${size}px`;
}

/** One background-size entry per pattern layer (not including the base gradient). */
export function getPatternBackgroundSize(shapeId: string, sizeOverride?: number): string {
  const size = sizeOverride ?? getDefaultPatternSize(shapeId);
  const layerCount = getPatternLayerCount(shapeId);
  const tile = getPatternTileSize(shapeId, size);
  return Array.from({ length: layerCount }, () => tile).join(', ');
}

/** Pattern tile sizes plus a full-bleed size for the base gradient layer. */
export function getComposedBackgroundSize(shapeId: string, sizeOverride?: number): string {
  return `${getPatternBackgroundSize(shapeId, sizeOverride)}, 100% 100%`;
}

export function getPatternLayerCount(shapeId: string): number {
  switch (shapeId) {
    case 'zigzag':
      return 4;
    case 'grid':
    case 'plus':
    case 'checkerboard':
    case 'offset-dots':
    case 'waves':
    case 'speckle':
    case 'triangles':
    case 'diamonds':
      return 2;
    default:
      return 1;
  }
}

export function getPatternBackgroundRepeat(shapeId: string): string {
  return Array.from({ length: getPatternLayerCount(shapeId) }, () => 'repeat').join(', ');
}

/** Some multi-layer patterns need explicit tile offsets to avoid a solid fill. */
export function getPatternBackgroundPosition(shapeId: string, sizeOverride?: number): string | undefined {
  const size = sizeOverride ?? getDefaultPatternSize(shapeId);
  if (shapeId === 'zigzag') {
    const half = Math.round(size / 2);
    return `-${half}px 0, -${half}px 0, 0 0, 0 0`;
  }
  if (shapeId === 'checkerboard') {
    const half = Math.round(size / 2);
    return `0 0, ${half}px ${half}px`;
  }
  if (shapeId === 'offset-dots') {
    const half = Math.round(size / 2);
    return `0 0, ${half}px ${half}px`;
  }
  return undefined;
}

export function resolvePatternShapeId(overrides: HeroBackgroundOverrides): string | null {
  if (typeof overrides.patternShapeId === 'string' && overrides.patternShapeId.length > 0) {
    return overrides.patternShapeId;
  }
  const legacyId = overrides.patternPresetId;
  if (typeof legacyId === 'string' && legacyId.length > 0) {
    const migration = LEGACY_PATTERN_PRESET_MIGRATION[legacyId];
    if (migration) {
      return migration.patternShapeId;
    }
    if (findHeroPatternShape(legacyId)) {
      return legacyId;
    }
  }
  return null;
}

export function hasPatternOverlay(overrides: HeroBackgroundOverrides): boolean {
  return resolvePatternShapeId(overrides) !== null;
}

export function migrateLegacyPatternOverrides(
  overrides: HeroBackgroundOverrides,
): HeroBackgroundOverrides {
  const legacyId = overrides.patternPresetId;
  if (
    typeof legacyId !== 'string'
    || legacyId.length === 0
    || overrides.patternShapeId
  ) {
    return overrides;
  }

  const migration = LEGACY_PATTERN_PRESET_MIGRATION[legacyId];
  if (!migration) {
    if (findHeroPatternShape(legacyId)) {
      return {
        ...overrides,
        patternShapeId: legacyId as HeroPatternShapeId,
        patternPresetId: null,
      };
    }
    return overrides;
  }

  return {
    ...overrides,
    patternShapeId: migration.patternShapeId,
    patternPresetId: null,
    gradientStops: overrides.gradientStops ?? migration.gradientStops,
    patternAccentColor: overrides.patternAccentColor ?? migration.patternAccentColor,
    accentColor: overrides.accentColor ?? migration.patternAccentColor,
    patternSize: overrides.patternSize ?? migration.patternSize,
    patternOpacity: overrides.patternOpacity ?? migration.patternOpacity ?? 1,
  };
}

export function resolvePatternSize(overrides: HeroBackgroundOverrides): number {
  if (typeof overrides.patternSize === 'number' && !Number.isNaN(overrides.patternSize)) {
    return overrides.patternSize;
  }
  const shapeId = resolvePatternShapeId(overrides);
  return shapeId ? getDefaultPatternSize(shapeId) : 24;
}

export function resolvePatternOpacity(overrides: HeroBackgroundOverrides): number {
  if (typeof overrides.patternOpacity === 'number' && !Number.isNaN(overrides.patternOpacity)) {
    return overrides.patternOpacity;
  }
  return 1;
}
