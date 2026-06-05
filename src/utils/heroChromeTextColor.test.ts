import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import {
  applyHeroPresetRecipe,
  findHeroBackgroundPreset,
  resolveHeroBackground,
} from '@/components/MusicProjects/heroBackgroundPresets';
import {
  getHeroStatBadgeSx,
  getHexLuminance,
  readableTextOnLuminance,
  resolveComposedChromeLuminance,
  resolveHeroChromeTextColor,
} from '@/utils/heroChromeTextColor';
import { parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';

const lightTheme = createTheme({ palette: { mode: 'light' } });
const darkTheme = createTheme({ palette: { mode: 'dark' } });

describe('resolveHeroChromeTextColor', () => {
  it('returns white text on dark solid background', () => {
    const preset = findHeroBackgroundPreset('solid-slate-900');

    expect(preset).toBeDefined();

    const metadata = applyHeroPresetRecipe({}, preset!);
    const resolved = resolveHeroBackground(metadata, darkTheme);

    expect(resolveHeroChromeTextColor(resolved, darkTheme)).toBe('#ffffff');
  });

  it('returns dark text on light solid background', () => {
    const preset = findHeroBackgroundPreset('solid-zinc-100');

    expect(preset).toBeDefined();

    const metadata = applyHeroPresetRecipe({}, preset!);
    const resolved = resolveHeroBackground(metadata, lightTheme);

    expect(resolveHeroChromeTextColor(resolved, lightTheme)).toBe('#1a1a1a');
  });

  it('returns white text for hero images', () => {
    const resolved = resolveHeroBackground(
      { heroBackgroundKind: 'image', heroImageUrl: 'https://example.com/x.png' },
      lightTheme,
    );

    expect(resolveHeroChromeTextColor(resolved, lightTheme)).toBe('#ffffff');
  });

  it('returns light text when any composed gradient stop is dark', () => {
    const resolved = resolveHeroBackground(
      {
        heroBackgroundKind: 'composed',
        heroBackgroundOverrides: {
          gradientStops: ['#fb923c', '#bef264', '#1e3a5f'],
        },
      },
      lightTheme,
    );

    expect(resolveHeroChromeTextColor(resolved, lightTheme)).toBe('#ffffff');
  });
});

describe('resolveComposedChromeLuminance', () => {
  it('uses the darkest stop, not the average', () => {
    const stops = ['#fb923c', '#bef264', '#1e3a5f'];
    const min = resolveComposedChromeLuminance(stops);
    const avg = stops.reduce((sum, hex) => sum + getHexLuminance(hex), 0) / stops.length;

    expect(min).toBeLessThan(avg);
    expect(readableTextOnLuminance(min)).toBe('#ffffff');
    expect(readableTextOnLuminance(avg)).toBe('#1a1a1a');
  });
});

describe('readableTextOnLuminance', () => {
  it('picks dark text on high luminance', () => {
    expect(readableTextOnLuminance(0.9)).toBe('#1a1a1a');
    expect(readableTextOnLuminance(0.2)).toBe('#ffffff');
  });
});

describe('parseMusicProjectMetadata heroChromeTextColor', () => {
  it('parses heroChromeTextColor', () => {
    const parsed = parseMusicProjectMetadata({ heroChromeTextColor: '#f4f4f5' });

    expect(parsed.heroChromeTextColor).toBe('#f4f4f5');
  });
});

describe('getHeroStatBadgeSx', () => {
  it('uses light chip styling for dark text on light backgrounds', () => {
    const { chip } = getHeroStatBadgeSx('#1a1a1a', true);

    expect(chip.color).toBe('#1a1a1a');
    expect(chip.bgcolor).toContain('rgba');
  });
});

describe('getHexLuminance', () => {
  it('returns higher luminance for white than black', () => {
    expect(getHexLuminance('#ffffff')).toBeGreaterThan(getHexLuminance('#000000'));
  });
});
