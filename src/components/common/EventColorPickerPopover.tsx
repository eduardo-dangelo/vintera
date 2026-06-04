'use client';

import { Palette as PaletteIcon } from '@mui/icons-material';
import { Box, Popover } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useRef } from 'react';
import { EVENT_COLORS } from '@/components/Calendar/constants';
import { primaryGradientBorderSx } from '@/utils/primaryGradientStyles';

export type ColorPickerPreset = {
  value: string;
  label: string;
  hex: string;
};

export type EventColorPickerValueMode = 'token' | 'hex';

function isCustomHexColor(color: string): boolean {
  return color.startsWith('#');
}

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

type SwatchVariant = 'circle' | 'square';

type EventColorPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: string;
  onChange: (color: string) => void;
  valueMode?: EventColorPickerValueMode;
  colors?: readonly ColorPickerPreset[];
  /** When set, renders each group as its own row (max 2 rows for header text picker). */
  colorRows?: readonly (readonly ColorPickerPreset[])[];
  columns?: number;
  defaultCustomHex?: string;
  /** Square swatches match hero background preset picker. */
  swatchVariant?: SwatchVariant;
  swatchSize?: number;
  customColorAriaLabel?: string;
  /** Raise z-index and relax focus for use inside another popover. */
  nested?: boolean;
  anchorOrigin?: { vertical: 'top' | 'bottom' | 'center'; horizontal: 'left' | 'right' | 'center' };
  transformOrigin?: { vertical: 'top' | 'bottom' | 'center'; horizontal: 'left' | 'right' | 'center' };
};

export function EventColorPickerPopover({
  open,
  anchorEl,
  onClose,
  value,
  onChange,
  valueMode = 'token',
  colors = EVENT_COLORS,
  colorRows,
  columns = 5,
  defaultCustomHex,
  swatchVariant = 'circle',
  swatchSize,
  customColorAriaLabel,
  nested = false,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
}: EventColorPickerPopoverProps) {
  const t = useTranslations('Calendar');
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isSquare = swatchVariant === 'square';
  const size = swatchSize ?? (isSquare ? 28 : 24);
  const swatchRadius = isSquare ? 1 : '50%';

  const isHexMode = valueMode === 'hex';
  const flatColors = useMemo(
    () => (colorRows ? colorRows.flat() : [...colors]),
    [colorRows, colors],
  );
  const presetHexes = useMemo(() => new Set(flatColors.map(c => c.hex)), [flatColors]);

  const isCustomSelected = isHexMode
    ? isCustomHexColor(value) && !presetHexes.has(value)
    : isCustomHexColor(value);

  const isPresetSelected = (hex: string, token: string) => {
    if (isHexMode) {
      return value === hex;
    }
    return value === token;
  };

  const handlePresetClick = (hex: string, token: string) => {
    onChange(isHexMode ? hex : token);
    onClose();
  };

  const fallbackCustomHex
    = defaultCustomHex
      ?? flatColors[0]?.hex
      ?? EVENT_COLORS.find(c => c.value === 'blue')?.hex
      ?? '#3b82f6';

  const showCustomColor = isCustomSelected || (isHexMode && isCustomHexColor(value));

  const renderSwatch = (c: ColorPickerPreset) => (
    <Box
      key={c.value}
      component="button"
      type="button"
      onClick={() => handlePresetClick(c.hex, c.value)}
      aria-label={c.label}
      sx={theme => ({
        width: size,
        height: size,
        borderRadius: swatchRadius,
        bgcolor: c.hex,
        cursor: 'pointer',
        p: 0,
        ...(isPresetSelected(c.hex, c.value)
          ? primaryGradientBorderSx(theme, 2, c.hex)
          : { border: '2px solid transparent' }),
        ...getSwatchBorderSx(c.hex),
      })}
    />
  );

  const customSwatch = (
    <Box
      component="button"
      type="button"
      onClick={() => colorInputRef.current?.click()}
      aria-label={customColorAriaLabel ?? t('event_color_custom')}
      sx={theme => ({
        width: size,
        height: size,
        borderRadius: swatchRadius,
        bgcolor: showCustomColor && isHexMode ? value : 'grey.300',
        cursor: 'pointer',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
        ...(showCustomColor
          ? primaryGradientBorderSx(
              theme,
              2,
              isHexMode ? value : 'grey.300',
            )
          : { border: '2px solid transparent' }),
        ...(showCustomColor && isHexMode ? getSwatchBorderSx(value) : {}),
      })}
    >
      {!showCustomColor && (
        <PaletteIcon sx={{ fontSize: isSquare ? 16 : 14, color: 'grey.600' }} />
      )}
    </Box>
  );

  const rowGridSx = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, ${size}px)`,
    gap: 1,
  } as const;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableEnforceFocus={nested}
      anchorOrigin={anchorOrigin}
      transformOrigin={transformOrigin}
      slotProps={{
        paper: nested
          ? { sx: theme => ({ zIndex: theme.zIndex.modal + 2 }) }
          : undefined,
      }}
    >
      <Box sx={{ position: 'relative', p: 2 }}>
        {colorRows
          ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {colorRows.map((row, rowIndex) => (
                  <Box key={row[0]?.value ?? rowIndex} sx={rowGridSx}>
                    {row.map(renderSwatch)}
                    {rowIndex === colorRows.length - 1 && customSwatch}
                  </Box>
                ))}
              </Box>
            )
          : (
              <Box sx={rowGridSx}>
                {colors.map(renderSwatch)}
                {customSwatch}
              </Box>
            )}
        <input
          ref={colorInputRef}
          type="color"
          value={isHexMode && isCustomHexColor(value) ? value : fallbackCustomHex}
          onChange={(e) => {
            onChange(e.target.value);
            onClose();
          }}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
          aria-hidden
        />
      </Box>
    </Popover>
  );
}
