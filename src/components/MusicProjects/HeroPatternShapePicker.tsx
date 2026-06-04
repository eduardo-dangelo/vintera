'use client';

import type { SxProps, Theme } from '@mui/material/styles';
import type { HeroPatternShape } from '@/components/MusicProjects/heroPatternShapes';
import type { HeroBackgroundOverrides } from '@/utils/musicProjectMetadata';
import { BlockOutlined as BlockOutlinedIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  buildComposedHeroBackgroundSx,
  buildShapePreviewOverrides,
} from '@/components/MusicProjects/heroBackgroundPresets';
import { getPatternBackgroundSize, PATTERN_NONE_ID } from '@/components/MusicProjects/heroPatternShapes';

type HeroPatternShapePickerProps = {
  shapes: HeroPatternShape[];
  selectedId: string;
  onSelect: (shapeId: string) => void;
  previewOverrides: HeroBackgroundOverrides;
  columns?: number;
  includeNoneOption?: boolean;
};

const tileSx = (selected: boolean) => ({
  width: '100%',
  aspectRatio: '16 / 10',
  borderRadius: 1,
  border: '2px solid',
  borderColor: selected ? 'primary.main' : 'divider',
  cursor: 'pointer',
  p: 0,
  overflow: 'hidden',
  position: 'relative' as const,
});

function getShapePreviewSx(
  shapeId: string,
  previewOverrides: HeroBackgroundOverrides,
): SxProps<Theme> {
  const overrides = buildShapePreviewOverrides(shapeId, previewOverrides);
  const full = buildComposedHeroBackgroundSx(overrides);
  const previewScale = 0.5;
  const scaledSize = overrides.patternSize
    ? Math.round(overrides.patternSize * previewScale)
    : undefined;
  const size = scaledSize
    ? getPatternBackgroundSize(shapeId, scaledSize)
    : undefined;

  return {
    background: (full as { background?: string }).background,
    backgroundColor: (full as { backgroundColor?: string }).backgroundColor,
    backgroundImage: (full as { backgroundImage?: string }).backgroundImage,
    backgroundSize: (full as { backgroundSize?: string }).backgroundSize ?? size,
    backgroundRepeat: (full as { backgroundRepeat?: string }).backgroundRepeat,
  };
}

function getNonePreviewSx(previewOverrides: HeroBackgroundOverrides): SxProps<Theme> {
  const full = buildComposedHeroBackgroundSx({
    gradientStops: previewOverrides.gradientStops,
    gradientAngle: previewOverrides.gradientAngle,
  });

  return {
    background: (full as { background?: string }).background,
    backgroundColor: (full as { backgroundColor?: string }).backgroundColor,
    backgroundImage: (full as { backgroundImage?: string }).backgroundImage,
    backgroundSize: (full as { backgroundSize?: string }).backgroundSize,
    backgroundRepeat: (full as { backgroundRepeat?: string }).backgroundRepeat,
  };
}

export function HeroPatternShapePicker({
  shapes,
  selectedId,
  onSelect,
  previewOverrides,
  columns = 2,
  includeNoneOption = false,
}: HeroPatternShapePickerProps) {
  const t = useTranslations('MusicProjects');
  const noneLabel = t('hero_bg_shape_none');

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 1,
      }}
    >
      {shapes.map((shape) => {
        const selected = selectedId === shape.id;
        return (
          <Box
            key={shape.id}
            component="button"
            type="button"
            onClick={() => onSelect(shape.id)}
            aria-label={t(shape.labelKey as Parameters<typeof t>[0])}
            title={t(shape.labelKey as Parameters<typeof t>[0])}
            sx={{
              ...tileSx(selected),
              ...(getShapePreviewSx(shape.id, previewOverrides) as Record<string, unknown>),
            }}
          />
        );
      })}
      {includeNoneOption && (
        <Box
          component="button"
          type="button"
          onClick={() => onSelect(PATTERN_NONE_ID)}
          aria-label={noneLabel}
          title={noneLabel}
          sx={{
            ...tileSx(selectedId === PATTERN_NONE_ID),
            ...(getNonePreviewSx(previewOverrides) as Record<string, unknown>),
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0, 0, 0, 0.12)',
              pointerEvents: 'none',
            },
          }}
        >
          <BlockOutlinedIcon
            sx={{
              fontSize: 20,
              color: 'text.secondary',
              opacity: 0.85,
              zIndex: 1,
            }}
            aria-hidden
          />
        </Box>
      )}
    </Box>
  );
}

type HeroPresetTilePickerProps = {
  presets: Array<{
    id: string;
    labelKey: string;
    previewSx: SxProps<Theme>;
  }>;
  selectedId?: string;
  onSelect: (id: string) => void;
  columns?: number;
};

export function HeroPresetTilePicker({
  presets,
  selectedId,
  onSelect,
  columns = 2,
}: HeroPresetTilePickerProps) {
  const t = useTranslations('MusicProjects');

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 1,
      }}
    >
      {presets.map((preset) => {
        const selected = selectedId === preset.id;
        return (
          <Box
            key={preset.id}
            component="button"
            type="button"
            onClick={() => onSelect(preset.id)}
            aria-label={t(preset.labelKey as Parameters<typeof t>[0])}
            title={t(preset.labelKey as Parameters<typeof t>[0])}
            sx={{
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: 1,
              border: '2px solid',
              borderColor: selected ? 'primary.main' : 'divider',
              cursor: 'pointer',
              p: 0,
              overflow: 'hidden',
              ...(preset.previewSx as Record<string, unknown>),
            }}
          />
        );
      })}
    </Box>
  );
}
