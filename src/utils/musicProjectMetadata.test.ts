import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import {
  applyHeroPresetRecipe,
  buildComposedHeroBackgroundSx,
  buildGradientBackground,
  buildMultiStopGradient,
  getPresetDefaultsById,
  resolveHeroBackground,
} from '@/components/MusicProjects/heroBackgroundPresets';
import {
  buildHeroBackgroundMetadataPatch,
  DEFAULT_BUILDER_GRADIENT_STOPS,
  mergeHeroBackgroundOverrides,
  mergeMusicProjectMetadata,
  normalizeHeroMetadata,
  parseMusicProjectMetadata,
  resolveGradientStops,
} from '@/utils/musicProjectMetadata';

const theme = createTheme({ palette: { mode: 'light' } });

describe('parseMusicProjectMetadata', () => {
  it('parses hero background fields and overrides', () => {
    const parsed = parseMusicProjectMetadata({
      heroBackgroundKind: 'gradient',
      heroBackgroundPreset: 'gradient-brand',
      heroBackgroundOverrides: {
        gradientStart: '#ff0000',
        gradientEnd: '#0000ff',
        gradientAngle: 90,
      },
    });

    expect(parsed.heroBackgroundKind).toBe('composed');
    expect(parsed.heroBackgroundOverrides?.gradientStops).toEqual(['#ff0000', '#0000ff']);
    expect(parsed.heroBackgroundOverrides?.gradientAngle).toBe(90);
  });

  it('normalizes legacy solid to composed with one stop', () => {
    const parsed = parseMusicProjectMetadata({
      heroBackgroundKind: 'solid',
      heroBackgroundColor: '#ff00ff',
    });

    expect(parsed.heroBackgroundKind).toBe('composed');
    expect(parsed.heroBackgroundOverrides?.gradientStops).toEqual(['#ff00ff']);
  });
});

describe('buildHeroBackgroundMetadataPatch', () => {
  it('omits image url when switching to composed color', () => {
    const patch = buildHeroBackgroundMetadataPatch('solid', { color: '#8b5cf6' });
    const merged = mergeMusicProjectMetadata(
      { heroImageUrl: 'https://example.com/old.png' },
      patch,
    );

    expect(merged.heroImageUrl).toBeUndefined();
    expect(merged.heroBackgroundKind).toBe('composed');
  });

  it('accepts heroChromeTextColor in patch', () => {
    const patch = buildHeroBackgroundMetadataPatch('solid', {
      color: '#8b5cf6',
      heroChromeTextColor: '#ffffff',
    });

    expect(patch.heroChromeTextColor).toBe('#ffffff');
    expect(patch.heroBackgroundKind).toBe('composed');
  });
});

describe('mergeHeroBackgroundOverrides', () => {
  it('preserves kind and preset when tweaking', () => {
    const merged = mergeHeroBackgroundOverrides(
      {
        heroBackgroundKind: 'composed',
        heroBackgroundPreset: 'pattern-grid',
        heroBackgroundOverrides: {
          gradientStops: ['#252526'],
          patternPresetId: 'pattern-grid',
        },
      },
      { patternAccentColor: '#8b5cf6' },
    );

    expect(merged.heroBackgroundKind).toBe('composed');
    expect(merged.heroBackgroundPreset).toBe('pattern-grid');
    expect(merged.heroBackgroundOverrides?.patternAccentColor).toBe('#8b5cf6');
  });
});

describe('applyHeroPresetRecipe', () => {
  it('keeps pattern overlay when applying a gradient preset', () => {
    const base = parseMusicProjectMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        gradientStops: ['#111111'],
        patternPresetId: 'pattern-grid',
        patternAccentColor: '#ffffff',
      },
    });
    const preset = getPresetDefaultsById('gradient-ocean');

    expect(preset).toBeDefined();

    const merged = applyHeroPresetRecipe(base, {
      id: 'gradient-ocean',
      labelKey: 'hero_bg_gradient_ocean',
      kind: 'gradient',
      background: '',
      gradientStart: '#0ea5e9',
      gradientEnd: '#6366f1',
    });

    expect(merged.heroBackgroundOverrides?.patternPresetId).toBe('pattern-grid');
    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual(['#0ea5e9', '#6366f1']);
  });

  it('keeps gradient stops when applying a pattern preset', () => {
    const base = parseMusicProjectMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        gradientStops: ['#8b5cf6', '#3b82f6'],
        gradientAngle: 90,
      },
    });
    const merged = applyHeroPresetRecipe(base, {
      id: 'pattern-dots-dark',
      labelKey: 'hero_bg_pattern_dots',
      kind: 'pattern',
      background: '#1e1e22',
      backgroundColor: '#1e1e22',
      defaultAccentColor: '#ffffff',
    });

    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual(['#8b5cf6', '#3b82f6']);
    expect(merged.heroBackgroundOverrides?.patternPresetId).toBe('pattern-dots-dark');
    expect(merged.heroBackgroundOverrides?.backgroundColor).toBeUndefined();
  });

  it('uses default builder gradient when applying pattern on empty project', () => {
    const merged = applyHeroPresetRecipe({}, {
      id: 'pattern-dots-dark',
      labelKey: 'hero_bg_pattern_dots',
      kind: 'pattern',
      background: '#1e1e22',
      backgroundColor: '#1e1e22',
      defaultAccentColor: '#ffffff',
    });

    expect(merged.heroBackgroundOverrides?.patternPresetId).toBe('pattern-dots-dark');
    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual([
      ...DEFAULT_BUILDER_GRADIENT_STOPS,
    ]);
    expect(merged.heroBackgroundOverrides?.backgroundColor).toBeUndefined();
  });

  it('pattern preset defaults omit background fill', () => {
    const defaults = getPresetDefaultsById('pattern-dots-dark');

    expect(defaults?.patternPresetId).toBe('pattern-dots-dark');
    expect(defaults?.backgroundColor).toBeUndefined();
    expect(defaults?.gradientStops).toBeUndefined();
  });
});

describe('buildMultiStopGradient', () => {
  it('builds evenly spaced multi-stop gradient', () => {
    expect(buildMultiStopGradient(['#ff0000', '#00ff00', '#0000ff'], 90)).toBe(
      'linear-gradient(90deg, #ff0000 0%, #00ff00 50%, #0000ff 100%)',
    );
  });

  it('matches two-stop helper', () => {
    expect(buildGradientBackground('#ff0000', '#00ff00', 90)).toBe(
      buildMultiStopGradient(['#ff0000', '#00ff00'], 90),
    );
  });
});

describe('buildComposedHeroBackgroundSx', () => {
  it('stacks pattern image over gradient in one backgroundImage', () => {
    const sx = buildComposedHeroBackgroundSx({
      gradientStops: ['#8b5cf6', '#3b82f6'],
      gradientAngle: 135,
      patternPresetId: 'pattern-grid',
      patternAccentColor: '#ffffff',
    }) as { background?: string; backgroundImage?: string };

    expect(sx.background).toBeUndefined();
    expect(sx.backgroundImage).toMatch(/^linear-gradient.*, linear-gradient\(135deg, #8b5cf6/);
    expect(sx.backgroundImage).toContain('#3b82f6');
  });
});

describe('resolveHeroBackground', () => {
  it('uses theme default when no customization', () => {
    const resolved = resolveHeroBackground({}, theme);

    expect(resolved.kind).toBe('theme_default');
    expect(resolved.overlayKind).toBe('theme');
  });

  it('treats legacy heroImageUrl as image', () => {
    const resolved = resolveHeroBackground(
      { heroImageUrl: 'https://example.com/hero.png' },
      theme,
    );

    expect(resolved.kind).toBe('image');
    expect(resolved.imageUrl).toBe('https://example.com/hero.png');
  });

  it('applies gradient overrides to CSS', () => {
    const metadata = normalizeHeroMetadata(
      mergeMusicProjectMetadata(
        {},
        {
          heroBackgroundKind: 'composed',
          heroBackgroundOverrides: {
            gradientStops: ['#ff0000', '#00ff00'],
            gradientAngle: 90,
          },
        },
      ),
    );
    const resolved = resolveHeroBackground(metadata, theme);

    expect(resolved.kind).toBe('composed');

    const bgImage = (resolved.backgroundSx as { backgroundImage?: string }).backgroundImage;

    expect(bgImage).toBe(buildMultiStopGradient(['#ff0000', '#00ff00'], 90));
  });

  it('prefers heroBackgroundColor for legacy solid', () => {
    const metadata = parseMusicProjectMetadata({
      heroBackgroundKind: 'solid',
      heroBackgroundPreset: 'solid-blue',
      heroBackgroundColor: '#ff00ff',
    });
    const resolved = resolveHeroBackground(metadata, theme);

    expect(resolved.solidHex).toBe('#ff00ff');
  });
});

describe('resolveGradientStops', () => {
  it('migrates legacy start/end fields', () => {
    expect(resolveGradientStops({ gradientStart: '#a', gradientEnd: '#b' })).toEqual(['#a', '#b']);
  });

  it('ignores orphan backgroundColor when pattern overlay is active', () => {
    expect(resolveGradientStops({
      backgroundColor: '#1e1e22',
      patternPresetId: 'pattern-grid',
    })).toEqual([...DEFAULT_BUILDER_GRADIENT_STOPS]);
  });
});

describe('normalizeHeroMetadata legacy pattern', () => {
  it('migrates pattern-only legacy to default gradient base', () => {
    const normalized = normalizeHeroMetadata({
      heroBackgroundKind: 'pattern',
      heroBackgroundPreset: 'pattern-dots-dark',
      heroBackgroundOverrides: {
        backgroundColor: '#1e1e22',
        accentColor: '#ffffff',
      },
    });

    expect(normalized.heroBackgroundKind).toBe('composed');
    expect(normalized.heroBackgroundOverrides?.gradientStops).toEqual([
      ...DEFAULT_BUILDER_GRADIENT_STOPS,
    ]);
    expect(normalized.heroBackgroundOverrides?.backgroundColor).toBeUndefined();
  });
});
