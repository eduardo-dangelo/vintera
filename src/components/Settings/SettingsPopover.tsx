'use client';

import {
  Box,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Popover } from '@/components/common/Popover';
import { useThemeMode } from '@/components/ThemeProvider';
import { useHoverSound } from '@/hooks/useHoverSound';

const POPOVER_WIDTH = 280;

type SettingsPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

export function SettingsPopover({ open, anchorEl, onClose }: SettingsPopoverProps) {
  const t = useTranslations('Settings');
  const { mode, setTheme } = useThemeMode();
  const { hoverSoundEnabled, updatePreference, isLoading } = useHoverSound();
  const [isUpdatingSound, setIsUpdatingSound] = useState(false);

  const handleHoverSoundToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUpdatingSound(true);
    try {
      await updatePreference(event.target.checked);
    } finally {
      setIsUpdatingSound(false);
    }
  };

  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    void setTheme(event.target.checked ? 'dark' : 'light');
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          {t('sound_settings_title')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {t('hover_sound_description')}
        </Typography>
        <FormControlLabel
          control={(
            <Switch
              size="small"
              checked={hoverSoundEnabled}
              onChange={handleHoverSoundToggle}
              disabled={isLoading || isUpdatingSound}
            />
          )}
          label={t('hover_sound_label')}
          sx={{ mb: 2, ml: 0 }}
        />

        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          {t('theme_settings_title')}
        </Typography>
        <FormControlLabel
          control={(
            <Switch
              size="small"
              checked={mode === 'dark'}
              onChange={handleThemeToggle}
            />
          )}
          label={mode === 'dark' ? t('theme_dark') : t('theme_light')}
          sx={{ ml: 0 }}
        />
      </Box>
    </Popover>
  );
}
