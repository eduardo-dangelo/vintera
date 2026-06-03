import { PRIMARY_GRADIENT_END, PRIMARY_GRADIENT_START } from '@/components/MusicProjects/musicListToolbarStyles';

export type HeaderTextColorPreset = {
  value: string;
  label: string;
  hex: string;
};

/** Header title color when the project has no saved color (light, readable on hero). */
export const DEFAULT_HEADER_TEXT_COLOR = '#f4f4f5';

export function resolveProjectHeaderTextColor(color: string | null | undefined): string {
  if (color && color.startsWith('#')) {
    return color;
  }
  return DEFAULT_HEADER_TEXT_COLOR;
}

/** Six per row — light swatches for dark hero overlays (top row). */
export const HEADER_TEXT_LIGHT_COLORS: HeaderTextColorPreset[] = [
  { value: 'text-white', label: 'White', hex: '#ffffff' },
  { value: 'text-snow', label: 'Snow', hex: '#f4f4f5' },
  { value: 'text-frost', label: 'Frost', hex: '#f3f4f6' },
  { value: 'text-mist', label: 'Mist', hex: '#e5e7eb' },
  { value: 'text-lavender', label: 'Lavender', hex: '#ddd6fe' },
  { value: 'text-sky', label: 'Sky', hex: '#bfdbfe' },
];

/** Five presets + custom swatch on bottom row — dark and theme accents. */
export const HEADER_TEXT_DARK_COLORS: HeaderTextColorPreset[] = [
  { value: 'text-ink', label: 'Ink', hex: '#1a1a1a' },
  { value: 'text-charcoal', label: 'Charcoal', hex: '#374151' },
  { value: 'text-slate', label: 'Slate', hex: '#6b7280' },
  { value: 'text-violet', label: 'Violet', hex: PRIMARY_GRADIENT_START },
  { value: 'text-blue', label: 'Blue', hex: PRIMARY_GRADIENT_END },
];

export const HEADER_TEXT_COLOR_ROWS = [
  HEADER_TEXT_LIGHT_COLORS,
  HEADER_TEXT_DARK_COLORS,
] as const;

export const HEADER_TEXT_COLOR_COLUMNS = 6;
