import type { SxProps, Theme } from '@mui/material/styles';
import type {
  HeroBackgroundKind,
  HeroBackgroundOverrides,
  MusicProjectMetadata,
} from '@/utils/musicProjectMetadata';
import { getHeroBackgroundSx } from '@/components/MusicProjects/musicListPageHeaderStyles';
import { PRIMARY_GRADIENT } from '@/components/MusicProjects/musicListToolbarStyles';
import {
  DEFAULT_BUILDER_GRADIENT_ANGLE,
  DEFAULT_BUILDER_GRADIENT_STOPS,
  DEFAULT_BUILDER_SOLID,
  getPatternAccentColor,
  normalizeHeroMetadata,
  parseMusicProjectMetadata,
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
  defaultAccentColor?: string;
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
    id: 'pattern-dots-dark',
    labelKey: 'hero_bg_pattern_dots',
    kind: 'pattern',
    background: '#1e1e22',
    backgroundColor: '#1e1e22',
    defaultAccentColor: '#ffffff',
  },
  {
    id: 'pattern-dots-light',
    labelKey: 'hero_bg_pattern_dots_light',
    kind: 'pattern',
    background: '#f0f4f8',
    backgroundColor: '#f0f4f8',
    defaultAccentColor: '#0f172a',
  },
  {
    id: 'pattern-grid',
    labelKey: 'hero_bg_pattern_grid',
    kind: 'pattern',
    background: '#252526',
    backgroundColor: '#252526',
    defaultAccentColor: '#ffffff',
  },
  {
    id: 'pattern-diagonal',
    labelKey: 'hero_bg_pattern_diagonal',
    kind: 'pattern',
    background: '#2a2a30',
    backgroundColor: '#2a2a30',
    defaultAccentColor: '#ffffff',
  },
  {
    id: 'pattern-waves',
    labelKey: 'hero_bg_pattern_waves',
    kind: 'pattern',
    background: '#1e293b',
    backgroundColor: '#1e293b',
    defaultAccentColor: '#8b5cf6',
  },
  {
    id: 'pattern-cross',
    labelKey: 'hero_bg_pattern_cross',
    kind: 'pattern',
    background: '#e8ecf1',
    backgroundColor: '#e8ecf1',
    defaultAccentColor: '#0f172a',
  },
  {
    id: 'pattern-noise',
    labelKey: 'hero_bg_pattern_noise',
    kind: 'pattern',
    background: '#18181b',
    backgroundColor: '#18181b',
    defaultAccentColor: '#60a5fa',
  },
  {
    id: 'pattern-brand',
    labelKey: 'hero_bg_pattern_brand',
    kind: 'pattern',
    background: '#120e1c',
    backgroundColor: '#120e1c',
    defaultAccentColor: '#8b5cf6',
  },
];

export const HERO_GRADIENT_PRESETS: HeroBackgroundPreset[] = [
  { id: 'gradient-brand', labelKey: 'hero_bg_gradient_brand', kind: 'gradient', background: PRIMARY_GRADIENT, gradientStart: '#8b5cf6', gradientEnd: '#3b82f6' },
  { id: 'gradient-sunset', labelKey: 'hero_bg_gradient_sunset', kind: 'gradient', background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)', gradientStart: '#f97316', gradientEnd: '#ec4899' },
  { id: 'gradient-ocean', labelKey: 'hero_bg_gradient_ocean', kind: 'gradient', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', gradientStart: '#0ea5e9', gradientEnd: '#6366f1' },
  { id: 'gradient-forest', labelKey: 'hero_bg_gradient_forest', kind: 'gradient', background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)', gradientStart: '#059669', gradientEnd: '#0d9488' },
  { id: 'gradient-midnight', labelKey: 'hero_bg_gradient_midnight', kind: 'gradient', background: 'linear-gradient(135deg, #1e1e22 0%, #4c1d95 100%)', gradientStart: '#1e1e22', gradientEnd: '#4c1d95' },
  { id: 'gradient-dawn', labelKey: 'hero_bg_gradient_dawn', kind: 'gradient', background: 'linear-gradient(135deg, #fce7f3 0%, #e0e7ff 100%)', gradientStart: '#fce7f3', gradientEnd: '#e0e7ff' },
  { id: 'gradient-slate', labelKey: 'hero_bg_gradient_slate', kind: 'gradient', background: 'linear-gradient(135deg, #e8ecf1 0%, #f0f4f8 100%)', gradientStart: '#e8ecf1', gradientEnd: '#f0f4f8' },
  { id: 'gradient-charcoal', labelKey: 'hero_bg_gradient_charcoal', kind: 'gradient', background: 'linear-gradient(135deg, #1e1e22 0%, #2a2a30 100%)', gradientStart: '#1e1e22', gradientEnd: '#2a2a30' },
  { id: 'gradient-aurora', labelKey: 'hero_bg_gradient_aurora', kind: 'gradient', background: 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 50%, #f472b6 100%)', gradientStart: '#22d3ee', gradientEnd: '#f472b6' },
  { id: 'gradient-gold', labelKey: 'hero_bg_gradient_gold', kind: 'gradient', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #b45309 100%)', gradientStart: '#fbbf24', gradientEnd: '#b45309' },
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

const ALL_PRESETS = [...HERO_SOLID_PRESETS, ...HERO_PATTERN_PRESETS, ...HERO_GRADIENT_PRESETS];

const DEFAULT_GRADIENT_ANGLE = 135;

export function findHeroBackgroundPreset(id: string): HeroBackgroundPreset | undefined {
  return ALL_PRESETS.find(p => p.id === id);
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

export function buildPatternBackgroundImage(presetId: string, _baseColor: string, accentColor: string): string {
  const accentSoft = hexToRgba(accentColor, 0.35);
  const accentMid = hexToRgba(accentColor, 0.2);
  const accentLine = hexToRgba(accentColor, 0.06);
  const accentLine45 = hexToRgba(accentColor, 0.04);

  switch (presetId) {
    case 'pattern-dots-dark':
    case 'pattern-dots-light':
      return `radial-gradient(${hexToRgba(accentColor, presetId === 'pattern-dots-dark' ? 0.14 : 0.12)} 1px, transparent 1px)`;
    case 'pattern-grid':
      return `linear-gradient(${accentLine} 1px, transparent 1px), linear-gradient(90deg, ${accentLine} 1px, transparent 1px)`;
    case 'pattern-diagonal':
      return `repeating-linear-gradient(45deg, ${accentLine45} 0, ${accentLine45} 1px, transparent 0, transparent 50%)`;
    case 'pattern-waves':
      return `radial-gradient(ellipse at 20% 80%, ${accentSoft} 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${hexToRgba(accentColor, 0.3)} 0%, transparent 50%)`;
    case 'pattern-cross':
      return `linear-gradient(${hexToRgba(accentColor, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${hexToRgba(accentColor, 0.05)} 1px, transparent 1px)`;
    case 'pattern-noise':
      return `radial-gradient(circle at 25% 25%, ${hexToRgba(accentColor, 0.08)} 0%, transparent 40%), radial-gradient(circle at 75% 75%, ${hexToRgba(accentColor, 0.12)} 0%, transparent 45%)`;
    case 'pattern-brand':
      return `radial-gradient(${hexToRgba(accentColor, 0.25)} 1px, transparent 1px), radial-gradient(${hexToRgba(accentColor, 0.2)} 1px, transparent 1px)`;
    default:
      return `radial-gradient(${accentMid} 1px, transparent 1px)`;
  }
}

export function getPatternBackgroundSize(presetId: string): string {
  if (presetId.includes('dots') || presetId === 'pattern-brand') {
    return '16px 16px';
  }
  return '24px 24px';
}

export function getPresetDefaults(preset: HeroBackgroundPreset): HeroBackgroundOverrides {
  if (preset.kind === 'solid') {
    const color = preset.backgroundColor ?? preset.background;
    return { backgroundColor: color, gradientStops: [color] };
  }
  if (preset.kind === 'pattern') {
    const accent = preset.defaultAccentColor ?? '#ffffff';
    return {
      accentColor: accent,
      patternAccentColor: accent,
      patternPresetId: preset.id,
    };
  }
  const start = preset.gradientStart ?? '#8b5cf6';
  const end = preset.gradientEnd ?? '#3b82f6';
  return {
    gradientStart: start,
    gradientEnd: end,
    gradientStops: [start, end],
    gradientAngle: DEFAULT_GRADIENT_ANGLE,
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
): string {
  return buildMultiStopGradient([start, end], angle);
}

export function buildMultiStopGradient(
  stops: string[],
  angle: number = DEFAULT_GRADIENT_ANGLE,
): string {
  if (stops.length === 0) {
    return DEFAULT_BUILDER_SOLID;
  }
  if (stops.length === 1) {
    return stops[0]!;
  }
  const positions = stops.map((_, i) => {
    const pct = stops.length === 1 ? 0 : Math.round((i / (stops.length - 1)) * 100);
    return `${stops[i]} ${pct}%`;
  });
  return `linear-gradient(${angle}deg, ${positions.join(', ')})`;
}

const HERO_LAYER_BASE_SX = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  overflow: 'hidden',
} as const;

function buildBaseBackgroundLayer(stops: string[], angle: number): string {
  if (stops.length === 1) {
    const hex = stops[0]!;
    return `linear-gradient(${hex}, ${hex})`;
  }
  return buildMultiStopGradient(stops, angle);
}

export function buildComposedHeroBackgroundSx(
  overrides: HeroBackgroundOverrides,
): SxProps<Theme> {
  const stops = resolveGradientStops(overrides);
  const angle = overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE;
  const patternId = overrides.patternPresetId;
  const hasPattern = typeof patternId === 'string' && patternId.length > 0;

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
      backgroundImage: buildMultiStopGradient(stops, angle),
    };
  }

  const accent = getPatternAccentColor(overrides);
  const patternImage = buildPatternBackgroundImage(patternId, stops[0] ?? DEFAULT_BUILDER_SOLID, accent);
  const patternSize = getPatternBackgroundSize(patternId);
  const baseLayer = buildBaseBackgroundLayer(stops, angle);

  // Pattern first in the list = painted on top; base layer last = shows through transparent pattern areas.
  // Do not mix `background` shorthand with `backgroundImage` — the shorthand resets other layers.
  return {
    ...HERO_LAYER_BASE_SX,
    backgroundImage: `${patternImage}, ${baseLayer}`,
    backgroundSize: `${patternSize}, auto`,
    backgroundRepeat: 'repeat, no-repeat',
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
        gradientStops: stops,
        gradientStart: defaults.gradientStart,
        gradientEnd: defaults.gradientEnd,
        gradientAngle: defaults.gradientAngle ?? prev.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE,
      },
    });
  }

  const accent = defaults.patternAccentColor ?? getPatternAccentColor(prev);
  const existingStops = prev.gradientStops?.length
    ? prev.gradientStops
    : (prev.gradientStart || prev.gradientEnd
        ? resolveGradientStops(prev)
        : undefined);

  return normalizeHeroMetadata({
    ...current,
    heroBackgroundKind: 'composed',
    heroBackgroundPreset: preset.id,
    heroBackgroundOverrides: {
      ...prev,
      patternPresetId: preset.id,
      patternAccentColor: accent,
      accentColor: accent,
      gradientStops: existingStops ?? [...DEFAULT_BUILDER_GRADIENT_STOPS],
    },
  });
}

export function buildHeroBackgroundSxFromPreset(
  preset: HeroBackgroundPreset,
  overrides?: HeroBackgroundOverrides,
): SxProps<Theme> {
  const base: SxProps<Theme> = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    overflow: 'hidden',
  };

  if (preset.kind === 'solid') {
    const hex = overrides?.backgroundColor
      ?? preset.backgroundColor
      ?? preset.background;
    return { ...base, backgroundColor: hex };
  }

  if (preset.kind === 'gradient') {
    const defaults = getPresetDefaults(preset);
    const merged = mergeOverrides(defaults, overrides);
    const start = merged.gradientStart ?? '#8b5cf6';
    const end = merged.gradientEnd ?? '#3b82f6';
    const angle = merged.gradientAngle ?? DEFAULT_GRADIENT_ANGLE;
    return {
      ...base,
      background: buildGradientBackground(start, end, angle),
    };
  }

  const defaults = getPresetDefaults(preset);
  const merged = mergeOverrides(defaults, overrides);
  const baseColor = merged.backgroundColor ?? preset.backgroundColor ?? preset.background;
  const accentColor = merged.accentColor ?? preset.defaultAccentColor ?? '#ffffff';
  const backgroundImage = buildPatternBackgroundImage(preset.id, baseColor, accentColor);

  return {
    ...base,
    backgroundColor: baseColor,
    backgroundImage,
    backgroundSize: getPatternBackgroundSize(preset.id),
  };
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
  if (preset.kind === 'pattern') {
    const accent = preset.defaultAccentColor ?? '#ffffff';
    const full = buildComposedHeroBackgroundSx({
      gradientStops: [...DEFAULT_BUILDER_GRADIENT_STOPS],
      gradientAngle: DEFAULT_GRADIENT_ANGLE,
      patternPresetId: preset.id,
      patternAccentColor: accent,
      ...overrides,
    });
    const size = preset.id.includes('dots') || preset.id === 'pattern-brand'
      ? '8px 8px'
      : '12px 12px';
    return {
      background: (full as { background?: string }).background,
      backgroundColor: (full as { backgroundColor?: string }).backgroundColor,
      backgroundImage: (full as { backgroundImage?: string }).backgroundImage,
      backgroundSize: (full as { backgroundSize?: string }).backgroundSize ?? size,
    };
  }

  const full = buildHeroBackgroundSxFromPreset(preset, overrides);
  return {
    background: (full as { background?: string }).background,
    backgroundColor: (full as { backgroundColor?: string }).backgroundColor,
    backgroundImage: (full as { backgroundImage?: string }).backgroundImage,
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
      patternPresetId: overrides.patternPresetId,
    };
    const isSolidOnly = stops.length === 1 && !builderOverrides.patternPresetId;

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

  const overrides = resolved.builderOverrides;
  const stops = resolveGradientStops(overrides);

  if (preset.kind === 'solid') {
    const hex = preset.backgroundColor ?? preset.background;
    return stops.length === 1 && stops[0]?.toLowerCase() === hex.toLowerCase();
  }

  if (preset.kind === 'gradient') {
    return stopsMatchPreset(stops, preset);
  }

  return overrides.patternPresetId === preset.id;
}
