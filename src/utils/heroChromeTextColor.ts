import type { Theme } from '@mui/material/styles';
import type { ResolvedHeroBackground } from '@/components/MusicProjects/heroBackgroundPresets';
import { resolveGradientStops } from '@/utils/musicProjectMetadata';

const LIGHT_TEXT = '#ffffff';
const DARK_TEXT = '#1a1a1a';
const LUMINANCE_THRESHOLD = 0.55;

/** Chrome text on the light sticky bar (after scrolling past the hero). */
export const LIGHT_STICKY_BAR_CHROME = '#1a1a1a';

/** Chrome text on the dark sticky bar (after scrolling past the hero). */
export const DARK_STICKY_BAR_CHROME = '#f4f4f5';

export function getHexLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return 0;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function readableTextOnLuminance(luminance: number): string {
  return luminance > LUMINANCE_THRESHOLD ? DARK_TEXT : LIGHT_TEXT;
}

/** Pick contrast against the darkest gradient stop so chrome stays readable on every band. */
export function resolveComposedChromeLuminance(stops: string[]): number {
  if (stops.length === 0) {
    return 0;
  }
  return Math.min(...stops.map(hex => getHexLuminance(hex)));
}

/** Chrome text for stats/actions on the sticky bar when it is no longer over the hero. */
export function resolveStickyBarChromeTextColor(theme: Theme): string {
  return theme.palette.mode === 'light' ? LIGHT_STICKY_BAR_CHROME : DARK_STICKY_BAR_CHROME;
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

/** Count chip + label styles for hero header stat badges. */
export function getHeroStatBadgeSx(
  textColor: string,
  compact: boolean,
): { chip: Record<string, unknown>; label: { color: string } } {
  const isLightText = getHexLuminance(textColor) <= LUMINANCE_THRESHOLD;
  return {
    chip: {
      color: textColor,
      bgcolor: isLightText ? 'rgba(255, 255, 255, 0.22)' : hexToRgba(textColor, 0.12),
      border: '1px solid',
      borderColor: isLightText ? 'rgba(255, 255, 255, 0.35)' : hexToRgba(textColor, 0.25),
      fontSize: compact ? '0.65rem' : '0.7rem',
      fontWeight: 600,
      lineHeight: 1,
    },
    label: { color: textColor },
  };
}

export function resolveHeroChromeTextColor(
  resolved: ResolvedHeroBackground,
  theme: Theme,
): string {
  if (resolved.kind === 'image') {
    return LIGHT_TEXT;
  }

  if (resolved.kind === 'theme_default') {
    return resolveStickyBarChromeTextColor(theme);
  }

  if (resolved.kind === 'composed') {
    const stops = resolveGradientStops(resolved.builderOverrides);
    return readableTextOnLuminance(resolveComposedChromeLuminance(stops));
  }

  return LIGHT_TEXT;
}
