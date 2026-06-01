'use client';

import { VolumeOff } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Slider,
  Tooltip,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Popover } from '@/components/common/Popover';

const POPOVER_MIN_WIDTH = 180;

const muteButtonSx = (muted: boolean) => ({
  'borderRadius': '6px',
  'color': muted ? 'primary.main' : 'text.secondary',
  'bgcolor': muted ? 'action.selected' : 'transparent',
  'transition': 'all 0.2s ease',
  '&:hover': {
    bgcolor: muted ? 'action.selected' : 'action.hover',
  },
});

const sliderSx = {
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
    bgcolor: 'primary.main',
  },
  '& .MuiSlider-thumb': {
    width: 14,
    height: 14,
  },
  '&.Mui-disabled': {
    'color': 'action.disabled',
    '& .MuiSlider-rail': {
      bgcolor: 'action.disabledBackground',
    },
    '& .MuiSlider-track': {
      bgcolor: 'action.disabled',
    },
  },
};

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
  const [localVolume, setLocalVolume] = useState(volume);
  const [isUpdatingMute, setIsUpdatingMute] = useState(false);

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
            <VolumeOff />
          </IconButton>
        </Tooltip>
        <Slider
          size="small"
          value={localVolume}
          min={0}
          max={100}
          disabled={isLoading || muted}
          aria-label={t('hover_sound_volume_label')}
          sx={sliderSx}
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
