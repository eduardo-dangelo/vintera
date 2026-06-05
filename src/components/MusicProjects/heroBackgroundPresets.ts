import type { SxProps, Theme } from '@mui/material/styles';
import type { ColorPickerPreset } from '@/components/common/EventColorPickerPopover';
import type {
  HeroBackgroundKind,
  HeroBackgroundOverrides,
  MusicProjectMetadata,
} from '@/utils/musicProjectMetadata';
import {
  buildPatternBackgroundImage,
  getComposedBackgroundSize,
  getPatternBackgroundPosition,
  getPatternBackgroundRepeat,
  resolvePatternOpacity,
  resolvePatternShapeId,
  resolvePatternSize,
} from '@/components/MusicProjects/heroPatternShapes';
import { getHeroBackgroundSx } from '@/components/MusicProjects/musicListPageHeaderStyles';
import { PRIMARY_GRADIENT } from '@/components/MusicProjects/musicListToolbarStyles';
import {
  DEFAULT_BUILDER_GRADIENT_ANGLE,
  DEFAULT_BUILDER_GRADIENT_SHARPNESS,
  DEFAULT_BUILDER_SOLID,
  getPatternAccentColor,
  hasPatternOverlay,
  normalizeHeroMetadata,
  parseMusicProjectMetadata,
  resolveGradientSharpness,
  resolveGradientStops,
} from '@/utils/musicProjectMetadata';

export type HeroBackgroundPreset = {
  id: string;
  labelKey: string;
  kind: 'solid' | 'pattern' | 'gradient';
  background: string;
  backgroundColor?: string;
  backgroundImage?: string;
  gradientStart?: string;
  gradientEnd?: string;
  /** Pattern recipe fields */
  gradientStops?: string[];
  patternShapeId?: string;
  patternAccentColor?: string;
  defaultAccentColor?: string;
  patternSize?: number;
  patternOpacity?: number;
};

export const HERO_SOLID_PRESETS: HeroBackgroundPreset[] = [
  { id: 'solid-slate-900', labelKey: 'hero_bg_solid_slate', kind: 'solid', background: '#0f172a', backgroundColor: '#0f172a' },
  { id: 'solid-slate-700', labelKey: 'hero_bg_solid_charcoal', kind: 'solid', background: '#334155', backgroundColor: '#334155' },
  { id: 'solid-zinc-100', labelKey: 'hero_bg_solid_mist', kind: 'solid', background: '#f4f4f5', backgroundColor: '#f4f4f5' },
  { id: 'solid-stone-200', labelKey: 'hero_bg_solid_stone', kind: 'solid', background: '#e7e5e4', backgroundColor: '#e7e5e4' },
  { id: 'solid-violet', labelKey: 'hero_bg_solid_violet', kind: 'solid', background: '#8b5cf6', backgroundColor: '#8b5cf6' },
  { id: 'solid-blue', labelKey: 'hero_bg_solid_blue', kind: 'solid', background: '#3b82f6', backgroundColor: '#3b82f6' },
  { id: 'solid-emerald', labelKey: 'hero_bg_solid_emerald', kind: 'solid', background: '#10b981', backgroundColor: '#10b981' },
  { id: 'solid-rose', labelKey: 'hero_bg_solid_rose', kind: 'solid', background: '#f43f5e', backgroundColor: '#f43f5e' },
  { id: 'solid-amber', labelKey: 'hero_bg_solid_amber', kind: 'solid', background: '#f59e0b', backgroundColor: '#f59e0b' },
  { id: 'solid-indigo', labelKey: 'hero_bg_solid_indigo', kind: 'solid', background: '#6366f1', backgroundColor: '#6366f1' },
  { id: 'solid-cyan', labelKey: 'hero_bg_solid_cyan', kind: 'solid', background: '#06b6d4', backgroundColor: '#06b6d4' },
  { id: 'solid-fuchsia', labelKey: 'hero_bg_solid_fuchsia', kind: 'solid', background: '#d946ef', backgroundColor: '#d946ef' },
  { id: 'solid-navy', labelKey: 'hero_bg_solid_navy', kind: 'solid', background: '#1e3a5f', backgroundColor: '#1e3a5f' },
  { id: 'solid-teal', labelKey: 'hero_bg_solid_teal', kind: 'solid', background: '#0f766e', backgroundColor: '#0f766e' },
  { id: 'solid-lime', labelKey: 'hero_bg_solid_lime', kind: 'solid', background: '#84cc16', backgroundColor: '#84cc16' },
  { id: 'solid-crimson', labelKey: 'hero_bg_solid_crimson', kind: 'solid', background: '#be123c', backgroundColor: '#be123c' },
  { id: 'solid-peach', labelKey: 'hero_bg_solid_peach', kind: 'solid', background: '#fdba74', backgroundColor: '#fdba74' },
  { id: 'solid-gray', labelKey: 'hero_bg_solid_gray', kind: 'solid', background: '#9ca3af', backgroundColor: '#9ca3af' },
];

export const HERO_SOLID_PRESET_HEXES = new Set(
  HERO_SOLID_PRESETS.map(p => p.backgroundColor ?? p.background),
);

export const HERO_PATTERN_PRESETS: HeroBackgroundPreset[] = [
  {
    id: 'pattern-recipe-vinyl-night',
    labelKey: 'hero_bg_pattern_recipe_vinyl_night',
    kind: 'pattern',
    background: '#0d0d0f',
    backgroundColor: '#0d0d0f',
    gradientStops: ['#0d0d0f'],
    patternShapeId: 'vinyl',
    patternAccentColor: '#b87333',
    defaultAccentColor: '#b87333',
    patternSize: 20,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-studio-eq',
    labelKey: 'hero_bg_pattern_recipe_studio_eq',
    kind: 'pattern',
    background: '#1a1028',
    backgroundColor: '#1a1028',
    gradientStops: ['#1a1028'],
    patternShapeId: 'eq-bars',
    patternAccentColor: '#22d3ee',
    defaultAccentColor: '#22d3ee',
    patternSize: 20,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-parchment-staff',
    labelKey: 'hero_bg_pattern_recipe_parchment_staff',
    kind: 'pattern',
    background: '#f5f0e6',
    backgroundColor: '#f5f0e6',
    gradientStops: ['#f5f0e6'],
    patternShapeId: 'staff',
    patternAccentColor: '#5c4a3d',
    defaultAccentColor: '#5c4a3d',
    patternSize: 32,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-midnight-waves',
    labelKey: 'hero_bg_pattern_recipe_midnight_waves',
    kind: 'pattern',
    background: '#0f172a',
    backgroundColor: '#0f172a',
    gradientStops: ['#0f172a'],
    patternShapeId: 'waves',
    patternAccentColor: '#a78bfa',
    defaultAccentColor: '#a78bfa',
    patternSize: 24,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-stage-checker',
    labelKey: 'hero_bg_pattern_recipe_stage_checker',
    kind: 'pattern',
    background: '#1c0a14',
    backgroundColor: '#1c0a14',
    gradientStops: ['#1c0a14'],
    patternShapeId: 'checkerboard',
    patternAccentColor: '#f43f5e',
    defaultAccentColor: '#f43f5e',
    patternSize: 20,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-amp-rings',
    labelKey: 'hero_bg_pattern_recipe_amp_rings',
    kind: 'pattern',
    background: '#1e1b4b',
    backgroundColor: '#1e1b4b',
    gradientStops: ['#1e1b4b'],
    patternShapeId: 'rings',
    patternAccentColor: '#c4b5fd',
    defaultAccentColor: '#c4b5fd',
    patternSize: 28,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-amp-zigzag',
    labelKey: 'hero_bg_pattern_recipe_amp_zigzag',
    kind: 'pattern',
    background: '#292524',
    backgroundColor: '#292524',
    gradientStops: ['#292524'],
    patternShapeId: 'zigzag',
    patternAccentColor: '#fbbf24',
    defaultAccentColor: '#fbbf24',
    patternSize: 20,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-fx-speckle',
    labelKey: 'hero_bg_pattern_recipe_fx_speckle',
    kind: 'pattern',
    background: '#09090b',
    backgroundColor: '#09090b',
    gradientStops: ['#09090b'],
    patternShapeId: 'speckle',
    patternAccentColor: '#38bdf8',
    defaultAccentColor: '#38bdf8',
    patternSize: 24,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-velvet-diagonal',
    labelKey: 'hero_bg_pattern_recipe_velvet_diagonal',
    kind: 'pattern',
    background: '#3b0a1e',
    backgroundColor: '#3b0a1e',
    gradientStops: ['#3b0a1e'],
    patternShapeId: 'diagonal',
    patternAccentColor: '#fda4af',
    defaultAccentColor: '#fda4af',
    patternSize: 24,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-mixer-grid',
    labelKey: 'hero_bg_pattern_recipe_mixer_grid',
    kind: 'pattern',
    background: '#1c1917',
    backgroundColor: '#1c1917',
    gradientStops: ['#1c1917'],
    patternShapeId: 'grid',
    patternAccentColor: '#fafaf9',
    defaultAccentColor: '#fafaf9',
    patternSize: 24,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-synth-triangles',
    labelKey: 'hero_bg_pattern_recipe_synth_triangles',
    kind: 'pattern',
    background: '#2e1065',
    backgroundColor: '#2e1065',
    gradientStops: ['#2e1065'],
    patternShapeId: 'triangles',
    patternAccentColor: '#f472b6',
    defaultAccentColor: '#f472b6',
    patternSize: 24,
    patternOpacity: 1,
  },
  {
    id: 'pattern-recipe-spotlight-diamonds',
    labelKey: 'hero_bg_pattern_recipe_spotlight_diamonds',
    kind: 'pattern',
    background: '#0a0a0a',
    backgroundColor: '#0a0a0a',
    gradientStops: ['#0a0a0a'],
    patternShapeId: 'diamonds',
    patternAccentColor: '#fcd34d',
    defaultAccentColor: '#fcd34d',
    patternSize: 24,
    patternOpacity: 1,
  },
];

export const HERO_GRADIENT_PRESETS: HeroBackgroundPreset[] = [
  { id: 'gradient-brand', labelKey: 'hero_bg_gradient_brand', kind: 'gradient', background: PRIMARY_GRADIENT, gradientStart: '#8b5cf6', gradientEnd: '#3b82f6' },
  { id: 'gradient-synthwave', labelKey: 'hero_bg_gradient_synthwave', kind: 'gradient', background: 'linear-gradient(135deg, #2d1b4e 0%, #ff2a6d 100%)', gradientStart: '#2d1b4e', gradientEnd: '#ff2a6d' },
  { id: 'gradient-jazz-club', labelKey: 'hero_bg_gradient_jazz_club', kind: 'gradient', background: 'linear-gradient(135deg, #1a0f0a 0%, #7f1d1d 100%)', gradientStart: '#1a0f0a', gradientEnd: '#7f1d1d' },
  { id: 'gradient-studio-lamp', labelKey: 'hero_bg_gradient_studio_lamp', kind: 'gradient', background: 'linear-gradient(135deg, #1c1917 0%, #d97706 100%)', gradientStart: '#1c1917', gradientEnd: '#d97706' },
  { id: 'gradient-electric', labelKey: 'hero_bg_gradient_electric', kind: 'gradient', background: 'linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)', gradientStart: '#06b6d4', gradientEnd: '#7c3aed' },
  { id: 'gradient-concert', labelKey: 'hero_bg_gradient_concert', kind: 'gradient', background: 'linear-gradient(135deg, #1e1b4b 0%, #ea580c 100%)', gradientStart: '#1e1b4b', gradientEnd: '#ea580c' },
  { id: 'gradient-lofi', labelKey: 'hero_bg_gradient_lofi', kind: 'gradient', background: 'linear-gradient(135deg, #e8d5c4 0%, #c4a4a4 100%)', gradientStart: '#e8d5c4', gradientEnd: '#c4a4a4' },
  { id: 'gradient-vinyl', labelKey: 'hero_bg_gradient_vinyl', kind: 'gradient', background: 'linear-gradient(135deg, #121218 0%, #3d3d50 100%)', gradientStart: '#121218', gradientEnd: '#3d3d50' },
  { id: 'gradient-midnight', labelKey: 'hero_bg_gradient_midnight', kind: 'gradient', background: 'linear-gradient(135deg, #0f0a1a 0%, #5b21b6 100%)', gradientStart: '#0f0a1a', gradientEnd: '#5b21b6' },
  {
    id: 'gradient-gold-record',
    labelKey: 'hero_bg_gradient_gold_record',
    kind: 'gradient',
    background: 'linear-gradient(135deg, #292524 0%, #fbbf24 50%, #92400e 100%)',
    gradientStart: '#292524',
    gradientEnd: '#92400e',
    gradientStops: ['#292524', '#fbbf24', '#92400e'],
  },
];

export const HERO_PRESET_SECTIONS = [
  { key: 'colors' as const, labelKey: 'hero_bg_section_colors', presets: HERO_SOLID_PRESETS },
  { key: 'gradients' as const, labelKey: 'hero_bg_section_gradients', presets: HERO_GRADIENT_PRESETS },
  { key: 'patterns' as const, labelKey: 'hero_bg_section_patterns', presets: HERO_PATTERN_PRESETS },
];

export const HERO_SOLID_COLOR_ROWS: HeroBackgroundPreset[][] = [
  HERO_SOLID_PRESETS.slice(0, 6),
  HERO_SOLID_PRESETS.slice(6, 12),
  HERO_SOLID_PRESETS.slice(12, 18),
];

export const HERO_SOLID_COLOR_PICKER_COLUMNS = 6;

export function getHeroSolidColorPickerRows(
  translateLabel: (labelKey: string) => string,
): ColorPickerPreset[][] {
  return HERO_SOLID_COLOR_ROWS.map(row =>
    row.map(preset => ({
      value: preset.id,
      label: translateLabel(preset.labelKey),
      hex: preset.backgroundColor ?? preset.background,
    })),
  );
}

const ALL_PRESETS = [...HERO_SOLID_PRESETS, ...HERO_PATTERN_PRESETS, ...HERO_GRADIENT_PRESETS];

const DEFAULT_GRADIENT_ANGLE = 135;

const CLEAR_PATTERN_FIELDS = {
  patternPresetId: null,
  patternShapeId: null,
  patternAccentColor: undefined,
  accentColor: undefined,
  patternSize: undefined,
  patternOpacity: undefined,
} as const;

export function findHeroBackgroundPreset(id: string): HeroBackgroundPreset | undefined {
  return ALL_PRESETS.find(p => p.id === id);
}

export function getPresetDefaults(preset: HeroBackgroundPreset): HeroBackgroundOverrides {
  if (preset.kind === 'solid') {
    const color = preset.backgroundColor ?? preset.background;
    return { backgroundColor: color, gradientStops: [color] };
  }
  if (preset.kind === 'pattern') {
    const accent = preset.patternAccentColor ?? preset.defaultAccentColor ?? '#ffffff';
    const base = preset.gradientStops?.[0] ?? preset.backgroundColor ?? preset.background;
    return {
      gradientStops: [base],
      patternShapeId: preset.patternShapeId ?? 'dots',
      patternAccentColor: accent,
      accentColor: accent,
      patternSize: preset.patternSize,
      patternOpacity: preset.patternOpacity ?? 1,
      patternPresetId: null,
    };
  }
  const start = preset.gradientStart ?? '#8b5cf6';
  const end = preset.gradientEnd ?? '#3b82f6';
  const stops = preset.gradientStops ?? [start, end];
  return {
    gradientStart: start,
    gradientEnd: end,
    gradientStops: stops,
    gradientAngle: DEFAULT_GRADIENT_ANGLE,
    gradientSharpness: DEFAULT_BUILDER_GRADIENT_SHARPNESS,
  };
}

export function getPresetDefaultsById(presetId: string): HeroBackgroundOverrides | undefined {
  const preset = findHeroBackgroundPreset(presetId);
  return preset ? getPresetDefaults(preset) : undefined;
}

function mergeOverrides(
  defaults: HeroBackgroundOverrides,
  overrides?: HeroBackgroundOverrides,
): HeroBackgroundOverrides {
  return { ...defaults, ...overrides };
}

export function buildGradientBackground(
  start: string,
  end: string,
  angle: number = DEFAULT_GRADIENT_ANGLE,
  sharpness: number = 0,
): string {
  return buildMultiStopGradient([start, end], angle, sharpness);
}

function formatGradientStop(color: string, position: number): string {
  const rounded = Math.round(position * 10) / 10;
  return `${color} ${rounded}%`;
}

export function buildMultiStopGradient(
  stops: string[],
  angle: number = DEFAULT_GRADIENT_ANGLE,
  sharpness: number = 0,
): string {
  if (stops.length === 0) {
    return DEFAULT_BUILDER_SOLID;
  }
  if (stops.length === 1) {
    return stops[0]!;
  }

  const normalizedSharpness = Math.min(100, Math.max(0, Math.round(sharpness))) / 100;
  if (normalizedSharpness === 0) {
    const positions = stops.map((color, i) => {
      const pct = Math.round((i / (stops.length - 1)) * 100);
      return formatGradientStop(color, pct);
    });
    return `linear-gradient(${angle}deg, ${positions.join(', ')})`;
  }

  const anchors = stops.map((_, i) => (i / (stops.length - 1)) * 100);
  const entries: string[] = [];

  for (let i = 0; i < stops.length; i++) {
    const left = i === 0 ? 0 : (anchors[i - 1]! + anchors[i]!) / 2;
    const right = i === stops.length - 1 ? 100 : (anchors[i]! + anchors[i + 1]!) / 2;
    const blend = ((right - left) / 2) * (1 - normalizedSharpness);
    entries.push(formatGradientStop(stops[i]!, left + blend));
    entries.push(formatGradientStop(stops[i]!, right - blend));
  }

  return `linear-gradient(${angle}deg, ${entries.join(', ')})`;
}

const HERO_LAYER_BASE_SX = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  overflow: 'hidden',
} as const;

function buildBaseBackgroundLayer(stops: string[], angle: number, sharpness: number): string {
  if (stops.length === 1) {
    const hex = stops[0]!;
    return `linear-gradient(${hex}, ${hex})`;
  }
  return buildMultiStopGradient(stops, angle, sharpness);
}

export function buildComposedHeroBackgroundSx(
  overrides: HeroBackgroundOverrides,
): SxProps<Theme> {
  const stops = resolveGradientStops(overrides);
  const angle = overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE;
  const sharpness = resolveGradientSharpness(overrides);
  const shapeId = resolvePatternShapeId(overrides);
  const hasPattern = shapeId !== null;

  if (stops.length === 1 && !hasPattern) {
    return {
      ...HERO_LAYER_BASE_SX,
      backgroundColor: stops[0],
    };
  }

  if (!hasPattern) {
    if (stops.length === 1) {
      return { ...HERO_LAYER_BASE_SX, backgroundColor: stops[0] };
    }
    return {
      ...HERO_LAYER_BASE_SX,
      backgroundImage: buildMultiStopGradient(stops, angle, sharpness),
    };
  }

  const accent = getPatternAccentColor(overrides);
  const opacity = resolvePatternOpacity(overrides);
  const resolvedPatternSize = resolvePatternSize(overrides);
  const patternImage = buildPatternBackgroundImage(shapeId, accent, opacity);
  const patternPosition = getPatternBackgroundPosition(shapeId, resolvedPatternSize);
  const baseLayer = buildBaseBackgroundLayer(stops, angle, sharpness);

  const patternRepeat = getPatternBackgroundRepeat(shapeId);

  return {
    ...HERO_LAYER_BASE_SX,
    backgroundImage: `${patternImage}, ${baseLayer}`,
    backgroundSize: getComposedBackgroundSize(shapeId, resolvedPatternSize),
    backgroundRepeat: `${patternRepeat}, no-repeat`,
    ...(patternPosition ? { backgroundPosition: `${patternPosition}, 0 0` } : {}),
  };
}

/** Merge a preset recipe into existing metadata without clearing unrelated layers. */
export function applyHeroPresetRecipe(
  existing: unknown,
  preset: HeroBackgroundPreset,
): MusicProjectMetadata {
  const current = parseMusicProjectMetadata(existing);
  const defaults = getPresetDefaults(preset);
  const prev = current.heroBackgroundOverrides ?? {};

  if (preset.kind === 'solid') {
    const hex = preset.backgroundColor ?? preset.background;
    return normalizeHeroMetadata({
      ...current,
      heroBackgroundKind: 'composed',
      heroBackgroundPreset: preset.id,
      heroBackgroundColor: hex,
      heroBackgroundOverrides: {
        ...prev,
        ...CLEAR_PATTERN_FIELDS,
        gradientStops: [hex],
        backgroundColor: hex,
      },
    });
  }

  if (preset.kind === 'gradient') {
    const stops = defaults.gradientStops ?? [
      defaults.gradientStart ?? '#8b5cf6',
      defaults.gradientEnd ?? '#3b82f6',
    ];
    return normalizeHeroMetadata({
      ...current,
      heroBackgroundKind: 'composed',
      heroBackgroundPreset: preset.id,
      heroBackgroundOverrides: {
        ...prev,
        ...CLEAR_PATTERN_FIELDS,
        gradientStops: stops,
        gradientStart: defaults.gradientStart,
        gradientEnd: defaults.gradientEnd,
        gradientAngle: defaults.gradientAngle ?? prev.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
        // Preset selection should not carry over prior custom sharpness.
        gradientSharpness: defaults.gradientSharpness ?? DEFAULT_BUILDER_GRADIENT_SHARPNESS,
      },
    });
  }

  return normalizeHeroMetadata({
    ...current,
    heroBackgroundKind: 'composed',
    heroBackgroundPreset: preset.id,
    heroBackgroundOverrides: {
      ...defaults,
      gradientSharpness: prev.gradientSharpness ?? defaults.gradientSharpness ?? DEFAULT_BUILDER_GRADIENT_SHARPNESS,
      gradientAngle: prev.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
      patternPresetId: null,
    },
  });
}

export function buildHeroBackgroundSxFromPreset(
  preset: HeroBackgroundPreset,
  overrides?: HeroBackgroundOverrides,
): SxProps<Theme> {
  const defaults = getPresetDefaults(preset);
  return buildComposedHeroBackgroundSx(mergeOverrides(defaults, overrides));
}

export type ResolvedHeroBackgroundKind = HeroBackgroundKind | 'theme_default';

export type ResolvedHeroBackground = {
  kind: ResolvedHeroBackgroundKind;
  imageUrl?: string;
  presetId?: string;
  solidHex?: string;
  overrides?: HeroBackgroundOverrides;
  /** Normalized overrides for builder UI */
  builderOverrides: HeroBackgroundOverrides;
  backgroundSx: SxProps<Theme>;
  hasHeroBackdrop: boolean;
  overlayKind: 'image' | 'rich' | 'solid' | 'theme';
};

export function getPresetPreviewSx(
  preset: HeroBackgroundPreset,
  overrides?: HeroBackgroundOverrides,
): SxProps<Theme> {
  const defaults = getPresetDefaults(preset);
  const full = buildComposedHeroBackgroundSx(mergeOverrides(defaults, overrides));
  const shapeId = preset.kind === 'pattern' ? preset.patternShapeId : null;
  const previewScale = 0.5;
  const size = shapeId
    ? getComposedBackgroundSize(
        shapeId,
        Math.round((preset.patternSize ?? resolvePatternSize(defaults)) * previewScale),
      )
    : undefined;

  return {
    background: (full as { background?: string }).background,
    backgroundColor: (full as { backgroundColor?: string }).backgroundColor,
    backgroundImage: (full as { backgroundImage?: string }).backgroundImage,
    backgroundSize: (full as { backgroundSize?: string }).backgroundSize ?? size,
    backgroundPosition: (full as { backgroundPosition?: string }).backgroundPosition,
    backgroundRepeat: (full as { backgroundRepeat?: string }).backgroundRepeat,
  };
}

export function getEffectiveOverrides(
  metadata: MusicProjectMetadata,
  preset?: HeroBackgroundPreset,
): HeroBackgroundOverrides | undefined {
  const stored = metadata.heroBackgroundOverrides;
  if (preset) {
    return mergeOverrides(getPresetDefaults(preset), stored);
  }
  return stored;
}

export function resolveHeroBackground(
  metadata: MusicProjectMetadata,
  theme: Theme,
): ResolvedHeroBackground {
  const normalized = normalizeHeroMetadata(parseMusicProjectMetadata(metadata));
  const kind = normalized.heroBackgroundKind;
  const legacyImageOnly = !kind && normalized.heroImageUrl;

  if (legacyImageOnly || kind === 'image') {
    const imageUrl = normalized.heroImageUrl;
    if (imageUrl) {
      return {
        kind: 'image',
        imageUrl,
        builderOverrides: {},
        backgroundSx: {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        },
        hasHeroBackdrop: true,
        overlayKind: 'image',
      };
    }
  }

  if (
    kind === 'composed'
    || kind === 'solid'
    || kind === 'pattern'
    || kind === 'gradient'
  ) {
    const overrides = normalized.heroBackgroundOverrides ?? {};
    const stops = resolveGradientStops(overrides);
    const builderOverrides: HeroBackgroundOverrides = {
      ...overrides,
      gradientStops: stops,
      gradientAngle: overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
      gradientSharpness: resolveGradientSharpness(overrides),
      patternShapeId: overrides.patternShapeId ?? resolvePatternShapeId(overrides),
      patternPresetId: overrides.patternPresetId,
    };
    const isSolidOnly = stops.length === 1 && !hasPatternOverlay(builderOverrides);

    return {
      kind: 'composed',
      presetId: normalized.heroBackgroundPreset,
      solidHex: stops.length === 1 ? stops[0] : undefined,
      overrides: builderOverrides,
      builderOverrides,
      backgroundSx: buildComposedHeroBackgroundSx(builderOverrides),
      hasHeroBackdrop: true,
      overlayKind: isSolidOnly ? 'solid' : 'rich',
    };
  }

  return {
    kind: 'theme_default',
    builderOverrides: {},
    backgroundSx: getHeroBackgroundSx(theme),
    hasHeroBackdrop: true,
    overlayKind: 'theme',
  };
}

function stopsMatchPreset(stops: string[], preset: HeroBackgroundPreset): boolean {
  const defaults = getPresetDefaults(preset);
  const expected = defaults.gradientStops ?? resolveGradientStops(defaults);
  if (expected.length !== stops.length) {
    return false;
  }
  return expected.every((hex, i) => hex.toLowerCase() === stops[i]?.toLowerCase());
}

export function isHeroBackgroundSelection(
  resolved: ResolvedHeroBackground,
  kind: HeroBackgroundKind,
  presetId?: string,
): boolean {
  if (kind === 'image') {
    return resolved.kind === 'image';
  }

  if (resolved.kind !== 'composed' && resolved.kind !== kind) {
    return false;
  }

  if (!presetId) {
    return false;
  }

  const preset = findHeroBackgroundPreset(presetId);
  if (!preset) {
    return resolved.presetId === presetId;
  }

  if (preset.kind === 'pattern') {
    return resolved.presetId === preset.id;
  }

  const overrides = resolved.builderOverrides;
  const stops = resolveGradientStops(overrides);

  if (preset.kind === 'solid') {
    const hex = preset.backgroundColor ?? preset.background;
    return stops.length === 1
      && stops[0]?.toLowerCase() === hex.toLowerCase()
      && !hasPatternOverlay(overrides);
  }

  if (preset.kind === 'gradient') {
    return stopsMatchPreset(stops, preset) && !hasPatternOverlay(overrides);
  }

  return false;
}

export function buildShapePreviewOverrides(
  shapeId: string,
  baseOverrides: HeroBackgroundOverrides,
): HeroBackgroundOverrides {
  return {
    ...baseOverrides,
    patternShapeId: shapeId,
    patternPresetId: null,
    patternAccentColor: getPatternAccentColor(baseOverrides),
    patternOpacity: resolvePatternOpacity(baseOverrides),
    patternSize: baseOverrides.patternSize ?? resolvePatternSize({
      ...baseOverrides,
      patternShapeId: shapeId,
    }),
  };
}
