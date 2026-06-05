import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import {
  applyHeroPresetRecipe,
  buildComposedHeroBackgroundSx,
  buildGradientBackground,
  buildMultiStopGradient,
  findHeroBackgroundPreset,
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
        heroBackgroundPreset: 'pattern-recipe-mixer-grid',
        heroBackgroundOverrides: {
          gradientStops: ['#252526'],
          patternShapeId: 'grid',
        },
      },
      { patternAccentColor: '#8b5cf6' },
    );

    expect(merged.heroBackgroundKind).toBe('composed');
    expect(merged.heroBackgroundPreset).toBe('pattern-recipe-mixer-grid');
    expect(merged.heroBackgroundOverrides?.patternAccentColor).toBe('#8b5cf6');
  });
});

describe('applyHeroPresetRecipe', () => {
  it('clears pattern overlay when applying a gradient preset', () => {
    const base = parseMusicProjectMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        gradientStops: ['#111111'],
        patternShapeId: 'grid',
        patternAccentColor: '#ffffff',
      },
    });

    expect(getPresetDefaultsById('gradient-studio-lamp')).toBeDefined();

    const merged = applyHeroPresetRecipe(base, {
      id: 'gradient-studio-lamp',
      labelKey: 'hero_bg_gradient_studio_lamp',
      kind: 'gradient',
      background: '',
      gradientStart: '#1c1917',
      gradientEnd: '#d97706',
    });

    expect(merged.heroBackgroundOverrides?.patternShapeId).toBeNull();
    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual(['#1c1917', '#d97706']);
  });

  it('clears gradient stops when applying a pattern preset', () => {
    const base = parseMusicProjectMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        gradientStops: ['#8b5cf6', '#3b82f6'],
        gradientAngle: 90,
      },
    });
    const merged = applyHeroPresetRecipe(base, {
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
    });

    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual(['#1c1917']);
    expect(merged.heroBackgroundOverrides?.patternShapeId).toBe('grid');
    expect(merged.heroBackgroundOverrides?.backgroundColor).toBeUndefined();
    expect(merged.heroBackgroundPreset).toBe('pattern-recipe-mixer-grid');
  });

  it('applies solid base from pattern recipe on empty project', () => {
    const merged = applyHeroPresetRecipe({}, {
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
    });

    expect(merged.heroBackgroundOverrides?.patternShapeId).toBe('grid');
    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual(['#1c1917']);
    expect(merged.heroBackgroundOverrides?.backgroundColor).toBeUndefined();
  });

  it('clears pattern when applying a solid preset', () => {
    const base = parseMusicProjectMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        gradientStops: ['#1e1e22'],
        patternShapeId: 'dots',
        patternAccentColor: '#ffffff',
      },
    });
    const preset = findHeroBackgroundPreset('solid-blue');

    expect(preset).toBeDefined();

    const merged = applyHeroPresetRecipe(base, preset!);

    expect(merged.heroBackgroundOverrides?.patternShapeId).toBeNull();
    expect(merged.heroBackgroundOverrides?.gradientStops).toEqual(['#3b82f6']);
  });

  it('pattern preset defaults include full recipe', () => {
    const defaults = getPresetDefaultsById('pattern-recipe-mixer-grid');

    expect(defaults?.patternShapeId).toBe('grid');
    expect(defaults?.gradientStops).toEqual(['#1c1917']);
    expect(defaults?.patternPresetId).toBeNull();
    expect(defaults?.backgroundColor).toBeUndefined();
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

  it('builds hard-edged gradient at full sharpness', () => {
    expect(buildMultiStopGradient(['#ff0000', '#00ff00'], 90, 100)).toBe(
      'linear-gradient(90deg, #ff0000 0%, #ff0000 50%, #00ff00 50%, #00ff00 100%)',
    );
  });
});

describe('buildComposedHeroBackgroundSx', () => {
  it('stacks pattern image over gradient in one backgroundImage', () => {
    const sx = buildComposedHeroBackgroundSx({
      gradientStops: ['#8b5cf6', '#3b82f6'],
      gradientAngle: 135,
      patternShapeId: 'grid',
      patternAccentColor: '#ffffff',
    }) as { background?: string; backgroundImage?: string };

    expect(sx.background).toBeUndefined();
    expect(sx.backgroundImage).toMatch(/^linear-gradient.*, linear-gradient\(135deg, #8b5cf6/);
    expect(sx.backgroundImage).toContain('#3b82f6');
  });

  it('respects patternSize and patternOpacity', () => {
    const sx = buildComposedHeroBackgroundSx({
      gradientStops: ['#1e1e22'],
      patternShapeId: 'dots',
      patternAccentColor: '#ffffff',
      patternSize: 32,
      patternOpacity: 0.5,
    }) as { backgroundSize?: string; backgroundImage?: string };

    expect(sx.backgroundSize).toBe('32px 32px, 100% 100%');
    expect(sx.backgroundImage).toContain('rgba(255, 255, 255');
  });

  it('gives each pattern layer its own tile size and full-bleeds the base gradient', () => {
    const sx = buildComposedHeroBackgroundSx({
      gradientStops: ['#8b5cf6', '#3b82f6'],
      patternShapeId: 'checkerboard',
      patternAccentColor: '#ffffff',
      patternSize: 24,
    }) as { backgroundSize?: string };

    expect(sx.backgroundSize).toBe('24px 24px, 24px 24px, 100% 100%');
  });

  it('offsets zigzag layers so the chevron pattern stays visible', () => {
    const sx = buildComposedHeroBackgroundSx({
      gradientStops: ['#292524'],
      patternShapeId: 'zigzag',
      patternAccentColor: '#fbbf24',
      patternSize: 20,
    }) as { backgroundPosition?: string; backgroundRepeat?: string; backgroundSize?: string; backgroundImage?: string };

    expect(sx.backgroundSize).toBe('20px 10px, 20px 10px, 20px 10px, 20px 10px, 100% 100%');
    expect(sx.backgroundPosition).toBe('-10px 0, -10px 0, 0 0, 0 0, 0 0');
    expect(sx.backgroundRepeat).toBe('repeat, repeat, repeat, repeat, no-repeat');
    expect(sx.backgroundImage).not.toContain(') 0 0');
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
      patternShapeId: 'grid',
    })).toEqual([...DEFAULT_BUILDER_GRADIENT_STOPS]);
  });

  it('migrates legacy patternPresetId to patternShapeId', () => {
    const parsed = parseMusicProjectMetadata({
      heroBackgroundKind: 'composed',
      heroBackgroundOverrides: {
        patternPresetId: 'pattern-grid',
        patternAccentColor: '#ffffff',
      },
    });

    expect(parsed.heroBackgroundOverrides?.patternShapeId).toBe('grid');
    expect(parsed.heroBackgroundOverrides?.patternPresetId).toBeNull();
    expect(parsed.heroBackgroundOverrides?.gradientStops).toEqual(['#252526']);
  });
});

describe('normalizeHeroMetadata legacy pattern', () => {
  it('migrates pattern-only legacy to recipe base color', () => {
    const normalized = normalizeHeroMetadata({
      heroBackgroundKind: 'pattern',
      heroBackgroundPreset: 'pattern-dots-dark',
      heroBackgroundOverrides: {
        backgroundColor: '#1e1e22',
        accentColor: '#ffffff',
      },
    });

    expect(normalized.heroBackgroundKind).toBe('composed');
    expect(normalized.heroBackgroundOverrides?.gradientStops).toEqual(['#1e1e22']);
    expect(normalized.heroBackgroundOverrides?.patternShapeId).toBe('dots');
    expect(normalized.heroBackgroundOverrides?.backgroundColor).toBeUndefined();
  });
});
