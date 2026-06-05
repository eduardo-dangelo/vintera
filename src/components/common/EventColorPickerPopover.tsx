'use client';

import { Box, Popover } from '@mui/material';
import { useTranslations } from 'next-intl';
import { EVENT_COLORS } from '@/components/Calendar/constants';
import { ColorPickerSwatchPanel } from '@/components/common/ColorPickerSwatchPanel';

export type ColorPickerPreset = {
  value: string;
  label: string;
  hex: string;
};

export type EventColorPickerValueMode = 'token' | 'hex';

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

  const handleChange = (color: string) => {
    onChange(color);
    onClose();
  };

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
      <Box sx={{ p: 2 }}>
        <ColorPickerSwatchPanel
          value={value}
          onChange={handleChange}
          valueMode={valueMode}
          colors={colors}
          colorRows={colorRows}
          columns={columns}
          defaultCustomHex={defaultCustomHex}
          swatchVariant={swatchVariant}
          swatchSize={swatchSize}
          customColorAriaLabel={customColorAriaLabel ?? t('event_color_custom')}
        />
      </Box>
    </Popover>
  );
}
