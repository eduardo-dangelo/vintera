'use client';

import { Box, IconButton, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import {
  APP_ICON_IDS,
  APP_ICONS,
  appIconLabel,
  DEFAULT_APP_ICON_ID,
  isAppIconId,
} from '@/components/common/appIcons';
import { Popover } from '@/components/common/Popover';
import { glassPaperSx } from '@/utils/glassPaperStyles';

type IconPickerPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  value: string | null | undefined;
  onChange: (iconId: string) => void;
};

export function IconPickerPopover({
  open,
  anchorEl,
  onClose,
  value,
  onChange,
}: IconPickerPopoverProps) {
  const t = useTranslations('Common');
  const [query, setQuery] = useState('');
  const selected = value && isAppIconId(value) ? value : DEFAULT_APP_ICON_ID;

  const icons = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return APP_ICON_IDS;
    }
    return APP_ICON_IDS.filter(id => appIconLabel(id).includes(needle) || id.toLowerCase().includes(needle));
  }, [query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={close}
      minWidth={248}
      maxWidth={280}
      showArrow={false}
      paperSx={glassPaperSx}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <Box sx={{ p: 1.25, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          value={query}
          placeholder={t('icon_picker_search')}
          onChange={event => setQuery(event.target.value)}
        />
        {icons.length === 0
          ? (
              <Typography variant="body2" color="text.secondary" sx={{ px: 0.5, py: 1 }}>
                {t('icon_picker_empty')}
              </Typography>
            )
          : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 32px)',
                  gap: 0.5,
                  maxHeight: 220,
                  overflow: 'auto',
                }}
              >
                {icons.map((id) => {
                  const Icon = APP_ICONS[id];
                  const label = appIconLabel(id);
                  return (
                    <IconButton
                      key={id}
                      size="small"
                      aria-label={label}
                      color={id === selected ? 'primary' : 'default'}
                      onClick={() => {
                        onChange(id);
                        close();
                      }}
                      sx={{ width: 32, height: 32 }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </IconButton>
                  );
                })}
              </Box>
            )}
      </Box>
    </Popover>
  );
}
