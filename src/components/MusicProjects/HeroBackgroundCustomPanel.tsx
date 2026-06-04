'use client';

import type { DragEndEvent, Modifier } from '@dnd-kit/core';
import type { ResolvedHeroBackground } from '@/components/MusicProjects/heroBackgroundPresets';
import type { ColorStopItem } from '@/hooks/useStableColorStopItems';
import type { HeroBackgroundOverrides } from '@/utils/musicProjectMetadata';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Slider,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { EventColorPickerPopover } from '@/components/common/EventColorPickerPopover';
import {
  getHeroSolidColorPickerRows,
  HERO_SOLID_COLOR_PICKER_COLUMNS,
} from '@/components/MusicProjects/heroBackgroundPresets';
import { HeroPatternShapePicker } from '@/components/MusicProjects/HeroPatternShapePicker';
import {
  findHeroPatternShape,
  HERO_PATTERN_SHAPES,
  PATTERN_NONE_ID,
  resolvePatternShapeId,
} from '@/components/MusicProjects/heroPatternShapes';
import { useStableColorStopItems } from '@/hooks/useStableColorStopItems';
import { randomHexColor } from '@/utils/hexColorInput';
import {
  DEFAULT_BUILDER_GRADIENT_ANGLE,
  getBuilderDefaultOverrides,
  getPatternAccentColor,
  MAX_GRADIENT_STOPS,
  MIN_GRADIENT_STOPS,
  resolveGradientStops,
} from '@/utils/musicProjectMetadata';

const SWATCH_SIZE = 36;
/** Space for the delete button that sits at top:-6 / right:-6 of the swatch. */
const SWATCH_DELETE_INSET = 6;
const SWATCH_SLOT_SIZE = SWATCH_SIZE + SWATCH_DELETE_INSET;

const sectionTitleSx = {
  display: 'block',
  mb: 1,
  fontSize: '0.75rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
} as const;

const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

function isLightSwatchHex(hex: string): boolean {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return false;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.72;
}

function getSwatchBorderSx(hex: string) {
  return isLightSwatchHex(hex)
    ? { boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.18)' }
    : { boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.12)' };
}

const colorStopSlotSx = {
  width: SWATCH_SLOT_SIZE,
  height: SWATCH_SLOT_SIZE,
  flexShrink: 0,
  position: 'relative',
} as const;

type HeroBackgroundCustomPanelProps = {
  resolved: ResolvedHeroBackground;
  onPreviewCustom: (overrides: Partial<HeroBackgroundOverrides>) => void;
  onApplyCustom: (overrides: Partial<HeroBackgroundOverrides>) => void;
};

function ColorSwatch({
  value,
  ariaLabel,
  onPreviewChange,
  onPersistChange,
  showDelete,
  onDelete,
  deleteLabel,
}: {
  value: string;
  ariaLabel: string;
  onPreviewChange: (hex: string) => void;
  onPersistChange: (hex: string) => void;
  showDelete?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  const t = useTranslations('MusicProjects');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const colorRows = useMemo(
    () => getHeroSolidColorPickerRows(key => t(key as Parameters<typeof t>[0])),
    [t],
  );

  const handleColorChange = (hex: string) => {
    onPreviewChange(hex);
    onPersistChange(hex);
  };

  return (
    <>
      <Box
        sx={{
          'position': 'relative',
          'width': SWATCH_SIZE,
          'height': SWATCH_SIZE,
          'flexShrink': 0,
          '&:hover .color-stop-delete': {
            opacity: 1,
          },
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={e => setAnchorEl(e.currentTarget)}
          aria-label={ariaLabel}
          sx={{
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
            borderRadius: 1,
            bgcolor: value,
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            p: 0,
            ...getSwatchBorderSx(value),
          }}
        />
        {showDelete && onDelete && (
          <IconButton
            className="color-stop-delete"
            size="small"
            aria-label={deleteLabel ?? t('hero_bg_builder_remove_stop')}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            sx={{
              'position': 'absolute',
              'top': -6,
              'right': -6,
              'width': 18,
              'height': 18,
              'p': 0,
              'opacity': 0,
              'bgcolor': 'background.paper',
              'border': '1px solid',
              'borderColor': 'divider',
              'boxShadow': 1,
              'transition': 'opacity 0.15s ease',
              '&:hover': {
                bgcolor: 'background.paper',
              },
              '& .MuiSvgIcon-root': {
                fontSize: 12,
              },
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
      </Box>
      <EventColorPickerPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        value={value}
        onChange={handleColorChange}
        valueMode="hex"
        colorRows={colorRows}
        columns={HERO_SOLID_COLOR_PICKER_COLUMNS}
        defaultCustomHex={value}
        swatchVariant="square"
        customColorAriaLabel={t('hero_bg_custom_color')}
        nested
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />
    </>
  );
}

function SortableColorSwatch({
  id,
  value,
  ariaLabel,
  reorderLabel,
  onColorChange,
  showDelete,
  onDelete,
  deleteLabel,
}: {
  id: string;
  value: string;
  ariaLabel: string;
  reorderLabel: string;
  onColorChange: (hex: string) => void;
  showDelete?: boolean;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  const t = useTranslations('MusicProjects');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const colorRows = useMemo(
    () => getHeroSolidColorPickerRows(key => t(key as Parameters<typeof t>[0])),
    [t],
  );
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <Box
        ref={setNodeRef}
        style={style}
        aria-label={`${ariaLabel}. ${reorderLabel}`}
        {...attributes}
        {...listeners}
        sx={{
          ...colorStopSlotSx,
          'touchAction': 'none',
          'zIndex': isDragging ? 10 : undefined,
          '&:hover .color-stop-delete': {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={e => setAnchorEl(e.currentTarget)}
            aria-label={ariaLabel}
            sx={{
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              borderRadius: 1,
              bgcolor: value,
              border: '1px solid',
              borderColor: 'divider',
              cursor: isDragging ? 'grabbing' : 'pointer',
              p: 0,
              ...getSwatchBorderSx(value),
            }}
          />
          {showDelete && onDelete && (
            <IconButton
              className="color-stop-delete"
              size="small"
              aria-label={deleteLabel ?? t('hero_bg_builder_remove_stop')}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{
                'position': 'absolute',
                'top': -6,
                'right': -6,
                'width': 18,
                'height': 18,
                'p': 0,
                'opacity': 0,
                'bgcolor': 'background.paper',
                'border': '1px solid',
                'borderColor': 'divider',
                'boxShadow': 1,
                'transition': 'opacity 0.15s ease',
                '&:hover': {
                  bgcolor: 'background.paper',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 12,
                },
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          )}
        </Box>
      </Box>
      <EventColorPickerPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        value={value}
        onChange={onColorChange}
        valueMode="hex"
        colorRows={colorRows}
        columns={HERO_SOLID_COLOR_PICKER_COLUMNS}
        defaultCustomHex={value}
        swatchVariant="square"
        customColorAriaLabel={t('hero_bg_custom_color')}
        nested
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />
    </>
  );
}

type GradientColorStopsRowProps = {
  items: ColorStopItem[];
  replaceItems: (nextItems: ColorStopItem[], emittedStops: string[]) => void;
  onPreviewStops: (nextStops: string[]) => void;
  onPersistStops: (nextStops: string[]) => void;
  onApplyStops: (nextStops: string[]) => void;
};

function GradientColorStopsRow({
  items,
  replaceItems,
  onPreviewStops,
  onPersistStops,
  onApplyStops,
}: GradientColorStopsRowProps) {
  const t = useTranslations('MusicProjects');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const nextItems = arrayMove(items, oldIndex, newIndex);
    const nextStops = nextItems.map(item => item.hex);
    replaceItems(nextItems, nextStops);
    onApplyStops(nextStops);
  };

  const handleDelete = (itemId: string) => {
    const nextItems = items.filter(item => item.id !== itemId);
    const nextStops = nextItems.map(item => item.hex);
    replaceItems(nextItems, nextStops);
    onApplyStops(nextStops);
  };

  const handleAdd = () => {
    if (items.length >= MAX_GRADIENT_STOPS) {
      return;
    }
    const newHex = randomHexColor();
    const nextItems = [...items, { id: crypto.randomUUID(), hex: newHex }];
    const nextStops = nextItems.map(item => item.hex);
    replaceItems(nextItems, nextStops);
    onApplyStops(nextStops);
  };

  const handleColorChange = (itemId: string, hex: string) => {
    const nextItems = items.map(item =>
      item.id === itemId ? { ...item, hex } : item,
    );
    const nextStops = nextItems.map(item => item.hex);
    replaceItems(nextItems, nextStops);
    onPreviewStops(nextStops);
    onPersistStops(nextStops);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        flexWrap: 'wrap',
        mt: 1.5,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flexWrap: 'wrap', overflow: 'visible' }}>
            {items.map((item, index) => (
              <SortableColorSwatch
                key={item.id}
                id={item.id}
                value={item.hex}
                ariaLabel={t('hero_bg_builder_color_stop', { index: index + 1 })}
                reorderLabel={t('hero_bg_builder_reorder_stop')}
                showDelete={items.length > MIN_GRADIENT_STOPS}
                deleteLabel={t('hero_bg_builder_remove_stop')}
                onDelete={() => handleDelete(item.id)}
                onColorChange={hex => handleColorChange(item.id, hex)}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>
      <IconButton
        size="small"
        aria-label={t('hero_bg_builder_add_stop')}
        disabled={items.length >= MAX_GRADIENT_STOPS}
        onClick={handleAdd}
        sx={{
          width: SWATCH_SIZE,
          height: SWATCH_SIZE,
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

export function HeroBackgroundCustomPanel({
  resolved,
  onPreviewCustom,
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

  const stops = useMemo(() => resolveGradientStops(overrides), [overrides]);
  const { items, replaceItems } = useStableColorStopItems(stops);

  if (resolved.kind === 'image') {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('hero_bg_custom_image_only')}
      </Typography>
    );
  }

  const angle = overrides.gradientAngle ?? DEFAULT_BUILDER_GRADIENT_ANGLE;
  const activeShapeId = resolvePatternShapeId(overrides);
  const patternEnabled = activeShapeId !== null;
  const selectedPatternId = activeShapeId ?? PATTERN_NONE_ID;
  const accentColor = getPatternAccentColor(overrides);
  const patternSize = overrides.patternSize
    ?? (activeShapeId ? findHeroPatternShape(activeShapeId)?.defaultSize : undefined)
    ?? 24;
  const patternOpacity = overrides.patternOpacity ?? 1;
  const sizeBounds = activeShapeId
    ? (findHeroPatternShape(activeShapeId) ?? HERO_PATTERN_SHAPES[0]!)
    : HERO_PATTERN_SHAPES[0]!;

  const patternPreviewOverrides: HeroBackgroundOverrides = {
    gradientStops: stops,
    gradientAngle: angle,
    patternAccentColor: accentColor,
    patternSize,
    patternOpacity,
  };

  const previewStops = (nextStops: string[]) => {
    onPreviewCustom({
      gradientStops: nextStops,
      gradientAngle: angle,
      ...(nextStops.length === 1
        ? { backgroundColor: nextStops[0] }
        : {}),
    });
  };

  const persistStops = (nextStops: string[]) => {
    onApplyCustom({
      gradientStops: nextStops,
      gradientAngle: angle,
      ...(nextStops.length === 1
        ? { backgroundColor: nextStops[0] }
        : {}),
    });
  };

  const applyStops = (nextStops: string[]) => {
    previewStops(nextStops);
    persistStops(nextStops);
  };

  const previewPattern = (patch: Partial<HeroBackgroundOverrides>) => {
    onPreviewCustom({
      ...patch,
      patternPresetId: null,
    });
  };

  const persistPattern = (patch: Partial<HeroBackgroundOverrides>) => {
    onApplyCustom({
      ...patch,
      patternPresetId: null,
    });
  };

  const applyPattern = (patch: Partial<HeroBackgroundOverrides>) => {
    previewPattern(patch);
    persistPattern(patch);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography component="span" sx={sectionTitleSx}>
          {t('hero_bg_builder_section_base')}
        </Typography>
        <GradientColorStopsRow
          items={items}
          replaceItems={replaceItems}
          onPreviewStops={previewStops}
          onPersistStops={persistStops}
          onApplyStops={applyStops}
        />
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5 }}>
          <HeroPatternShapePicker
            shapes={HERO_PATTERN_SHAPES}
            selectedId={selectedPatternId}
            previewOverrides={patternPreviewOverrides}
            includeNoneOption
            onSelect={(shapeId) => {
              if (shapeId === PATTERN_NONE_ID) {
                applyPattern({ patternShapeId: null });
                return;
              }
              applyPattern({
                patternShapeId: shapeId,
                patternSize: findHeroPatternShape(shapeId)?.defaultSize,
              });
            }}
          />
          {patternEnabled && (
            <>
              <ColorSwatch
                ariaLabel={t('hero_bg_custom_accent_color')}
                value={accentColor}
                onPreviewChange={hex => previewPattern({
                  patternAccentColor: hex,
                  accentColor: hex,
                })}
                onPersistChange={hex => persistPattern({
                  patternAccentColor: hex,
                  accentColor: hex,
                })}
              />
              <Box>
                <Typography variant="body2" gutterBottom>
                  {t('hero_bg_custom_pattern_size')}
                  {' '}
                  (
                  {patternSize}
                  px)
                </Typography>
                <Slider
                  value={patternSize}
                  min={sizeBounds.minSize}
                  max={sizeBounds.maxSize}
                  step={2}
                  onChange={(_, value) => {
                    applyPattern({ patternSize: value as number });
                  }}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  {t('hero_bg_custom_pattern_opacity')}
                  {' '}
                  (
                  {Math.round(patternOpacity * 100)}
                  %)
                </Typography>
                <Slider
                  value={patternOpacity}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onChange={(_, value) => {
                    applyPattern({ patternOpacity: value as number });
                  }}
                  size="small"
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
