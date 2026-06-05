'use client';

import type { ColorPickerPreset, EventColorPickerValueMode } from '@/components/common/EventColorPickerPopover';
import { Palette as PaletteIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useMemo, useRef } from 'react';
import { EVENT_COLORS } from '@/components/Calendar/constants';
import { getHexLuminance, readableTextOnLuminance } from '@/utils/heroChromeTextColor';
import { primaryGradientBorderSx } from '@/utils/primaryGradientStyles';

function getCustomSwatchIconColor(hex: string | null, selected: boolean): string {
  if (!selected || !hex) {
    return 'grey.600';
  }
  return readableTextOnLuminance(getHexLuminance(hex));
}

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

export type ColorPickerSwatchPanelProps = {
  value: string;
  onChange: (color: string) => void;
  valueMode?: EventColorPickerValueMode;
  colors?: readonly ColorPickerPreset[];
  colorRows?: readonly (readonly ColorPickerPreset[])[];
  columns?: number;
  defaultCustomHex?: string;
  swatchVariant?: SwatchVariant;
  swatchSize?: number;
  customColorAriaLabel?: string;
};

export function ColorPickerSwatchPanel({
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
}: ColorPickerSwatchPanelProps) {
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
  };

  const fallbackCustomHex
    = defaultCustomHex
      ?? flatColors[0]?.hex
      ?? EVENT_COLORS.find(c => c.value === 'blue')?.hex
      ?? '#3b82f6';

  const showCustomColor = isCustomSelected;

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
      aria-label={customColorAriaLabel}
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
      <PaletteIcon
        sx={{
          fontSize: isSquare ? 16 : 14,
          color: getCustomSwatchIconColor(
            showCustomColor && isHexMode ? value : null,
            showCustomColor,
          ),
        }}
      />
    </Box>
  );

  const rowGridSx = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, ${size}px)`,
    gap: 1,
  } as const;

  return (
    <Box sx={{ position: 'relative' }}>
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
        onChange={e => onChange(e.target.value)}
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
  );
}
