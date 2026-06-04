import type { Theme } from '@mui/material/styles';
import type { ResolvedHeroBackground } from '@/components/MusicProjects/heroBackgroundPresets';
import { resolveGradientStops } from '@/utils/musicProjectMetadata';

const LIGHT_TEXT = '#ffffff';
const DARK_TEXT = '#1a1a1a';
const LIGHT_THEME_CHROME = '#1a1a1a';
const DARK_THEME_CHROME = '#f4f4f5';
const LUMINANCE_THRESHOLD = 0.55;

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
    return theme.palette.mode === 'light' ? LIGHT_THEME_CHROME : DARK_THEME_CHROME;
  }

  if (resolved.kind === 'composed') {
    const stops = resolveGradientStops(resolved.builderOverrides);
    const avg = stops.reduce((sum, hex) => sum + getHexLuminance(hex), 0) / stops.length;
    return readableTextOnLuminance(avg);
  }

  return LIGHT_TEXT;
}
