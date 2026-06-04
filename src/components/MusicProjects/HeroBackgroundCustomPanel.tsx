'use client';

import type { ResolvedHeroBackground } from '@/components/MusicProjects/heroBackgroundPresets';
import type { HeroBackgroundOverrides } from '@/utils/musicProjectMetadata';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Switch,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';
import {
  HERO_PATTERN_PRESETS,

} from '@/components/MusicProjects/heroBackgroundPresets';
import {
  DEFAULT_BUILDER_GRADIENT_ANGLE,
  getBuilderDefaultOverrides,
  getPatternAccentColor,
  MAX_GRADIENT_STOPS,
  MIN_GRADIENT_STOPS,
  resolveGradientStops,
} from '@/utils/musicProjectMetadata';

const sectionTitleSx = {
  display: 'block',
  mb: 1,
  fontSize: '0.75rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
} as const;

type HeroBackgroundCustomPanelProps = {
  resolved: ResolvedHeroBackground;
  onApplyCustom: (overrides: Partial<HeroBackgroundOverrides>) => void;
};

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        component="button"
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={label}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: value,
          border: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          cursor: 'pointer',
          p: 0,
        }}
      />
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
        {label}
      </Typography>
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden
      />
    </Box>
  );
}

export function HeroBackgroundCustomPanel({
  resolved,
  onApplyCustom,
}: HeroBackgroundCustomPanelProps) {
  const t = useTranslations('MusicProjects');

  const overrides = useMemo(() => {
    if (resolved.kind === 'theme_default') {
      return getBuilderDefaultOverrides();
    }
    if (resolved.kind === 'composed') {
      return resolved.builderOverrides;
    }
    return getBuilderDefaultOverrides();
  }, [resolved]);

  if (resolved.kind === 'image') {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('hero_bg_custom_image_only')}
      </Typography>
    );
  }

  const stops = resolveGradientStops(overrides);
  const angle = overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE;
  const patternEnabled = Boolean(
    overrides.patternPresetId && overrides.patternPresetId.length > 0,
  );
  const patternPresetId = overrides.patternPresetId
    ?? HERO_PATTERN_PRESETS[0]?.id
    ?? '';
  const accentColor = getPatternAccentColor(overrides);

  const applyStops = (nextStops: string[]) => {
    onApplyCustom({
      gradientStops: nextStops,
      gradientAngle: angle,
      ...(nextStops.length === 1
        ? { backgroundColor: nextStops[0] }
        : {}),
    });
  };

  const applyPattern = (patch: Partial<HeroBackgroundOverrides>) => {
    onApplyCustom(patch);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography component="span" sx={sectionTitleSx}>
          {t('hero_bg_builder_section_base')}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          {stops.length === 1 ? t('hero_bg_builder_solid_hint') : t('hero_bg_builder_gradient_hint')}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {stops.map((hex, index) => (
            <Box key={`stop-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ColorField
                  label={t('hero_bg_builder_color_stop', { index: index + 1 })}
                  value={hex}
                  onChange={(value) => {
                    const next = [...stops];
                    next[index] = value;
                    applyStops(next);
                  }}
                />
              </Box>
              <IconButton
                size="small"
                aria-label={t('hero_bg_builder_remove_stop')}
                disabled={stops.length <= MIN_GRADIENT_STOPS}
                onClick={() => {
                  if (stops.length <= MIN_GRADIENT_STOPS) {
                    return;
                  }
                  applyStops(stops.filter((_, i) => i !== index));
                }}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <IconButton
            size="small"
            aria-label={t('hero_bg_builder_add_stop')}
            disabled={stops.length >= MAX_GRADIENT_STOPS}
            onClick={() => {
              if (stops.length >= MAX_GRADIENT_STOPS) {
                return;
              }
              const last = stops[stops.length - 1] ?? '#8b5cf6';
              applyStops([...stops, last]);
            }}
            sx={{ alignSelf: 'flex-start' }}
          >
            <AddIcon fontSize="small" />
            <Typography variant="caption" component="span" sx={{ ml: 0.5 }}>
              {t('hero_bg_builder_add_stop')}
            </Typography>
          </IconButton>
        </Box>
        {stops.length >= 2 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              {t('hero_bg_custom_gradient_angle')}
              {' '}
              (
              {angle}
              °)
            </Typography>
            <Slider
              value={angle}
              min={0}
              max={360}
              step={15}
              onChange={(_, value) => {
                onApplyCustom({ gradientAngle: value as number, gradientStops: stops });
              }}
              size="small"
            />
          </Box>
        )}
      </Box>

      <Box>
        <Typography component="span" sx={sectionTitleSx}>
          {t('hero_bg_builder_section_pattern')}
        </Typography>
        <FormControlLabel
          sx={{ mt: 0.5, mb: 1, display: 'flex' }}
          control={(
            <Switch
              size="small"
              checked={patternEnabled}
              onChange={(_, checked) => {
                applyPattern({
                  patternPresetId: checked
                    ? (overrides.patternPresetId ?? HERO_PATTERN_PRESETS[0]?.id ?? 'pattern-dots-dark')
                    : null,
                });
              }}
            />
          )}
          label={t('hero_bg_builder_pattern_enable')}
        />
        {patternEnabled && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('hero_bg_builder_pattern_accent_hint')}
            </Typography>
            <FormControl size="small" fullWidth>
              <InputLabel id="hero-pattern-style-label">{t('hero_bg_custom_pattern_style')}</InputLabel>
              <Select
                labelId="hero-pattern-style-label"
                label={t('hero_bg_custom_pattern_style')}
                value={patternPresetId}
                onChange={(e) => {
                  applyPattern({ patternPresetId: e.target.value });
                }}
              >
                {HERO_PATTERN_PRESETS.map(preset => (
                  <MenuItem key={preset.id} value={preset.id}>
                    {t(preset.labelKey as Parameters<typeof t>[0])}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <ColorField
              label={t('hero_bg_custom_accent_color')}
              value={accentColor}
              onChange={hex => applyPattern({
                patternAccentColor: hex,
                accentColor: hex,
              })}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
