'use client';

import type { HeroBackgroundPreset, ResolvedHeroBackground } from '@/components/MusicProjects/heroBackgroundPresets';
import type { HeroBackgroundOverrides } from '@/utils/musicProjectMetadata';
import { Palette as PaletteIcon, Upload as UploadIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Popover,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { HeroBackgroundCustomPanel } from '@/components/MusicProjects/HeroBackgroundCustomPanel';
import {
  getPresetPreviewSx,
  HERO_PRESET_SECTIONS,
  HERO_SOLID_COLOR_ROWS,
  HERO_SOLID_PRESET_HEXES,
  isHeroBackgroundSelection,
} from '@/components/MusicProjects/heroBackgroundPresets';
import { HeroPresetTilePicker } from '@/components/MusicProjects/HeroPatternShapePicker';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import { getHexLuminance, readableTextOnLuminance } from '@/utils/heroChromeTextColor';
import { hasPatternOverlay } from '@/utils/musicProjectMetadata';
import { primaryGradientBorderSx } from '@/utils/primaryGradientStyles';

const DEFAULT_CUSTOM_SOLID = '#8b5cf6';
const SWATCH_SIZE = 28;
const SWATCH_COLUMNS = 6;

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

function getCustomSwatchIconColor(hex: string | null, selected: boolean): string {
  if (!selected || !hex) {
    return 'grey.600';
  }
  return readableTextOnLuminance(getHexLuminance(hex));
}

const sectionTitleSx = {
  display: 'block',
  mb: 1,
  fontSize: '0.75rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
} as const;

type ProjectHeroBackgroundPickerProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  resolved: ResolvedHeroBackground;
  onSelectPreset: (preset: HeroBackgroundPreset) => void;
  onSelectCustomSolid: (hex: string) => void;
  onApplyCustom: (overrides: Partial<HeroBackgroundOverrides>) => void;
  onPreviewCustom: (overrides: Partial<HeroBackgroundOverrides>) => void;
  onUploadClick: () => void;
  uploading: boolean;
  textColor: string;
  onTextColorChange: (hex: string) => void;
};

type TabKey = 'presets' | 'custom' | 'upload';

export function ProjectHeroBackgroundPicker({
  anchorEl,
  open,
  onClose,
  resolved,
  onSelectPreset,
  onSelectCustomSolid,
  onApplyCustom,
  onPreviewCustom,
  onUploadClick,
  uploading,
  textColor,
  onTextColorChange,
}: ProjectHeroBackgroundPickerProps) {
  const t = useTranslations('MusicProjects');
  const [tab, setTab] = useState<TabKey>('presets');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const customSolidHex = resolved.kind === 'composed' ? resolved.solidHex : null;
  const isCustomSolidSelected = Boolean(
    resolved.kind === 'composed'
    && customSolidHex
    && !hasPatternOverlay(resolved.builderOverrides)
    && (!resolved.presetId || !HERO_SOLID_PRESET_HEXES.has(customSolidHex)),
  );

  const handleTabChange = (_: React.SyntheticEvent, value: TabKey) => {
    setTab(value);
  };

  const renderSolidSwatch = (preset: HeroBackgroundPreset) => {
    const hex = preset.backgroundColor ?? preset.background;
    const selected = isHeroBackgroundSelection(resolved, 'solid', preset.id);
    return (
      <Box
        key={preset.id}
        component="button"
        type="button"
        onClick={() => onSelectPreset(preset)}
        aria-label={t(preset.labelKey as Parameters<typeof t>[0])}
        sx={theme => ({
          width: SWATCH_SIZE,
          height: SWATCH_SIZE,
          borderRadius: 1,
          bgcolor: hex,
          cursor: 'pointer',
          p: 0,
          ...(selected
            ? primaryGradientBorderSx(theme, 2, hex)
            : { border: '2px solid transparent' }),
          ...getSwatchBorderSx(hex),
        })}
      />
    );
  };

  const customSolidSwatch = (
    <Box
      component="button"
      type="button"
      onClick={() => colorInputRef.current?.click()}
      aria-label={t('hero_bg_custom_color')}
      sx={theme => ({
        width: SWATCH_SIZE,
        height: SWATCH_SIZE,
        borderRadius: 1,
        bgcolor: isCustomSolidSelected && customSolidHex ? customSolidHex : 'grey.300',
        cursor: 'pointer',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
        ...(isCustomSolidSelected
          ? primaryGradientBorderSx(
              theme,
              2,
              customSolidHex ?? 'grey.300',
            )
          : { border: '2px solid transparent' }),
        ...(isCustomSolidSelected && customSolidHex ? getSwatchBorderSx(customSolidHex) : {}),
      })}
    >
      <PaletteIcon
        sx={{
          fontSize: 16,
          color: getCustomSwatchIconColor(
            isCustomSolidSelected ? (customSolidHex ?? null) : null,
            isCustomSolidSelected,
          ),
        }}
      />
    </Box>
  );

  const renderPresetSection = (section: typeof HERO_PRESET_SECTIONS[number]) => (
    <Box key={section.key}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={sectionTitleSx}
      >
        {t(section.labelKey as Parameters<typeof t>[0])}
      </Typography>
      {section.key === 'colors'
        ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {HERO_SOLID_COLOR_ROWS.map((row, rowIndex) => (
                <Box
                  key={row[0]?.id ?? rowIndex}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${SWATCH_COLUMNS}, ${SWATCH_SIZE}px)`,
                    gap: 1,
                  }}
                >
                  {row.map(renderSolidSwatch)}
                  {rowIndex === HERO_SOLID_COLOR_ROWS.length - 1 && customSolidSwatch}
                </Box>
              ))}
            </Box>
          )
        : (
            <HeroPresetTilePicker
              presets={section.presets.map(preset => ({
                id: preset.id,
                labelKey: preset.labelKey,
                previewSx: getPresetPreviewSx(preset),
              }))}
              selectedId={section.presets.find(p => isHeroBackgroundSelection(resolved, p.kind, p.id))?.id}
              onSelect={(id) => {
                const preset = section.presets.find(p => p.id === id);
                if (preset) {
                  onSelectPreset(preset);
                }
              }}
            />
          )}
    </Box>
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: theme => ({
            ...glassPaperSx(theme),
            width: { xs: 300, sm: 340 },
            maxWidth: '95vw',
          }),
        },
      }}
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          'minHeight': 40,
          'borderBottom': 1,
          'borderColor': 'divider',
          '& .MuiTab-root': {
            minHeight: 40,
            py: 0.75,
            fontSize: '0.75rem',
            textTransform: 'none',
          },
        }}
      >
        <Tab value="presets" label={t('hero_bg_tab_presets')} />
        <Tab value="custom" label={t('hero_bg_tab_custom')} />
        <Tab value="upload" label={t('hero_bg_tab_upload')} />
      </Tabs>

      <Box sx={{ p: 2, position: 'relative' }}>
        {tab === 'presets' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              maxHeight: 520,
              overflowY: 'auto',
            }}
          >
            {HERO_PRESET_SECTIONS.map(renderPresetSection)}
          </Box>
        )}

        {tab === 'custom' && (
          <HeroBackgroundCustomPanel
            resolved={resolved}
            onPreviewCustom={onPreviewCustom}
            onApplyCustom={onApplyCustom}
            textColor={textColor}
            onTextColorChange={onTextColorChange}
          />
        )}

        {tab === 'upload' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={onUploadClick}
              disabled={uploading}
              fullWidth
            >
              {uploading ? t('saving') : t('hero_bg_upload_button')}
            </Button>
            <Typography variant="caption" color="text.secondary" component="p">
              {t('hero_bg_upload_hint')}
            </Typography>
            {resolved.kind === 'image' && resolved.imageUrl && (
              <Typography variant="caption" color="text.secondary">
                {t('hero_bg_upload_current')}
              </Typography>
            )}
          </Box>
        )}

        <input
          ref={colorInputRef}
          type="color"
          value={customSolidHex ?? DEFAULT_CUSTOM_SOLID}
          onChange={(e) => {
            onSelectCustomSolid(e.target.value);
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
