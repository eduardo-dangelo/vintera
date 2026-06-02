'use client';

import {
  DarkMode,
  LightMode,
  Settings as SettingsIcon,
  VolumeOff,
  VolumeUp,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import { useThemeMode } from '@/components/ThemeProvider';
import { useHoverSound } from '@/hooks/useHoverSound';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import { HoverSoundVolumePopover } from './HoverSoundVolumePopover';

const POPOVER_WIDTH = 240;

/** Match sidebar list / section typography in Sidebar.tsx */
const sidebarItemTextSx = {
  fontSize: '0.75rem',
  fontWeight: 400,
} as const;

const sidebarTitleTextSx = {
  fontSize: '0.6875rem',
  fontWeight: 500,
} as const;

const settingsIconButtonSx = {
  'p': 0.5,
  '& .MuiSvgIcon-root': {
    fontSize: 16,
  },
};

const toggleIconButtonSx = (active: boolean) => ({
  'borderRadius': '6px',
  'color': 'text.primary',
  'bgcolor': active ? 'action.selected' : 'transparent',
  'transition': 'all 0.2s ease',
  '&:hover': {
    color: 'text.primary',
    bgcolor: active ? 'action.selected' : 'action.hover',
  },
  '&.Mui-disabled': {
    color: 'text.primary',
  },
});

type SettingsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function SettingsPopover({ open, anchorEl, onClose }: SettingsPopoverProps) {
  const t = useTranslations('Settings');
  const { mode, setTheme } = useThemeMode();
  const {
    hoverSoundVolume,
    hoverSoundMuted,
    isAudible,
    isLoading,
    playHoverSound,
    updateMute,
    updateVolume,
  } = useHoverSound();
  const [volumeAnchorEl, setVolumeAnchorEl] = useState<HTMLElement | null>(null);
  const soundButtonRef = useRef<HTMLButtonElement>(null);

  const volumeOpen = Boolean(volumeAnchorEl);
  const isDarkMode = mode === 'dark';
  const themeLabel = isDarkMode ? t('theme_dark') : t('theme_light');
  const showVolumeOffIcon = hoverSoundMuted || hoverSoundVolume === 0;

  const handlePopoverClose = () => {
    if (volumeOpen) {
      setVolumeAnchorEl(null);
      return;
    }
    onClose();
  };

  const handleVolumePopoverClose = () => {
    setVolumeAnchorEl(null);
  };

  const toggleVolumePopover = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setVolumeAnchorEl(prev => (prev ? null : soundButtonRef.current));
  };

  const clickableLabelSx = {
    'cursor': 'pointer',
    'userSelect': 'none',
    '&:hover': {
      color: 'text.primary',
    },
  } as const;

  const handleMuteToggle = async () => {
    const nextMuted = !hoverSoundMuted;
    await updateMute(nextMuted);
    if (!nextMuted && hoverSoundVolume > 0) {
      playHoverSound();
    }
  };

  const handleThemeToggle = () => {
    void setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        minWidth={POPOVER_WIDTH}
        maxWidth={POPOVER_WIDTH}
        showArrow={false}
        paperSx={glassPaperSx}
      >
        <Box sx={{ p: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 1,
            }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} color="action" />
            <Typography component="span" sx={sidebarTitleTextSx}>
              {t('page_title')}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 0.5,
              minHeight: 28,
            }}
          >
            <Tooltip title={t('hover_sound_label')}>
              <IconButton
                ref={soundButtonRef}
                size="small"
                onMouseEnter={playHoverSound}
                onClick={toggleVolumePopover}
                disabled={isLoading}
                aria-label={t('hover_sound_label')}
                aria-expanded={volumeOpen}
                aria-pressed={isAudible}
                sx={{ ...settingsIconButtonSx, ...toggleIconButtonSx(isAudible) }}
              >
                {showVolumeOffIcon ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Tooltip>
            <Typography
              component="span"
              onClick={toggleVolumePopover}
              sx={{ ...sidebarItemTextSx, ...clickableLabelSx }}
            >
              {t('hover_sound_label')}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              minHeight: 28,
            }}
          >
            <Tooltip title={themeLabel}>
              <IconButton
                size="small"
                onMouseEnter={playHoverSound}
                onClick={handleThemeToggle}
                aria-label={themeLabel}
                aria-pressed={isDarkMode}
                sx={{ ...settingsIconButtonSx, ...toggleIconButtonSx(isDarkMode) }}
              >
                {isDarkMode ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>
            <Typography
              component="span"
              onClick={handleThemeToggle}
              sx={{ ...sidebarItemTextSx, ...clickableLabelSx }}
            >
              {themeLabel}
            </Typography>
          </Box>
        </Box>
      </Popover>

      <HoverSoundVolumePopover
        open={volumeOpen}
        anchorEl={volumeAnchorEl}
        onClose={handleVolumePopoverClose}
        volume={hoverSoundVolume}
        muted={hoverSoundMuted}
        isLoading={isLoading}
        onVolumeChange={updateVolume}
        onMuteToggle={handleMuteToggle}
      />
    </>
  );
}
