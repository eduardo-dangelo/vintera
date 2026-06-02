'use client';

import { VolumeOff } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Slider,
  SvgIcon,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import { PRIMARY_GRADIENT_END, PRIMARY_GRADIENT_START } from '@/components/MusicProjects/musicListToolbarStyles';

const POPOVER_MIN_WIDTH = 180;

const muteButtonSx = (muted: boolean) => ({
  'borderRadius': '6px',
  'color': muted ? 'text.primary' : 'text.secondary',
  'bgcolor': muted ? 'action.selected' : 'transparent',
  'transition': 'all 0.2s ease',
  '&:hover': {
    bgcolor: muted ? 'action.selected' : 'action.hover',
  },
});

const sliderSx = (primaryGradient: string) => ({
  'flex': 1,
  'mx': 0.5,
  'py': 0.5,
  'color': 'primary.main',
  '& .MuiSlider-rail': {
    height: 6,
    borderRadius: 3,
    opacity: 1,
    bgcolor: 'action.hover',
  },
  '& .MuiSlider-track': {
    height: 6,
    borderRadius: 3,
    border: 'none',
    background: primaryGradient,
  },
  '& .MuiSlider-thumb': {
    width: 14,
    height: 14,
    background: primaryGradient,
    border: 'none',
  },
  '&.Mui-disabled': {
    'color': 'action.disabled',
    '& .MuiSlider-rail': {
      bgcolor: 'grey.200',
    },
    '& .MuiSlider-track': {
      background: 'grey.300',
      bgcolor: 'grey.300',
    },
    '& .MuiSlider-thumb': {
      background: 'grey.300',
      bgcolor: 'grey.300',
    },
  },
});

function GradientVolumeOffIcon({ fontSize = 16 }: { fontSize?: number }) {
  const gradientId = useId().replace(/:/g, '');
  const fill = `url(#${gradientId})`;

  return (
    <SvgIcon sx={{ fontSize, fill: `${fill} !important` }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={PRIMARY_GRADIENT_START} />
          <stop offset="100%" stopColor={PRIMARY_GRADIENT_END} />
        </linearGradient>
      </defs>
      <path
        d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71M4.27 3 3 4.27l4.74 4.74H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73zM12 4 9.91 6.09 12 8.18z"
        fill={fill}
      />
    </SvgIcon>
  );
}

type HoverSoundVolumePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  volume: number;
  muted: boolean;
  isLoading: boolean;
  onVolumeChange: (volume: number, options?: { debounce?: boolean; preview?: boolean }) => void;
  onMuteToggle: () => Promise<void>;
};

export function HoverSoundVolumePopover({
  open,
  anchorEl,
  onClose,
  volume,
  muted,
  isLoading,
  onVolumeChange,
  onMuteToggle,
}: HoverSoundVolumePopoverProps) {
  const t = useTranslations('Settings');
  const theme = useTheme();
  const [localVolume, setLocalVolume] = useState(volume);
  const [isUpdatingMute, setIsUpdatingMute] = useState(false);
  const primaryGradient = (theme.palette as typeof theme.palette & { gradients: { primary: string } })
    .gradients
    .primary;

  useEffect(() => {
    setLocalVolume(volume);
  }, [volume]);

  const handleMuteClick = async () => {
    setIsUpdatingMute(true);
    try {
      await onMuteToggle();
    } finally {
      setIsUpdatingMute(false);
    }
  };

  const muteLabel = muted ? t('hover_sound_unmute') : t('hover_sound_mute');

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_MIN_WIDTH}
      maxWidth={POPOVER_MIN_WIDTH}
      showArrow={false}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          p: 1,
          minHeight: 28,
        }}
        onClick={e => e.stopPropagation()}
      >
        <Tooltip title={muteLabel}>
          <IconButton
            size="small"
            onClick={handleMuteClick}
            disabled={isLoading || isUpdatingMute}
            aria-label={muteLabel}
            aria-pressed={muted}
            sx={{
              ...muteButtonSx(muted),
              'p': 0.5,
              '& .MuiSvgIcon-root': { fontSize: 16 },
            }}
          >
            {muted ? <GradientVolumeOffIcon /> : <VolumeOff />}
          </IconButton>
        </Tooltip>
        <Slider
          size="small"
          value={localVolume}
          min={0}
          max={100}
          disabled={isLoading || muted}
          aria-label={t('hover_sound_volume_label')}
          sx={sliderSx(primaryGradient)}
          onChange={(_, value) => {
            const nextVolume = value as number;
            setLocalVolume(nextVolume);
            onVolumeChange(nextVolume, { debounce: true, preview: true });
          }}
          onChangeCommitted={(_, value) => {
            onVolumeChange(value as number, { debounce: false, preview: true });
          }}
        />
      </Box>
    </Popover>
  );
}
