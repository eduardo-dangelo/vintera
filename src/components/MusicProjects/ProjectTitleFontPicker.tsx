'use client';

import {
  Box,
  List,
  ListItemButton,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  preloadTitleFontOptions,
  TITLE_FONT_OPTIONS,
} from '@/components/MusicProjects/projectTitleFonts';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import { sanitizeDisplayText } from '@/utils/sanitizeDisplayText';

type ProjectTitleFontPickerProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  /** Project name rendered in each font as the preview label */
  previewLabel: string;
  selectedFontFamily: string;
  onSelect: (fontFamily: string) => void;
};

export function ProjectTitleFontPicker({
  anchorEl,
  open,
  onClose,
  previewLabel,
  selectedFontFamily,
  onSelect,
}: ProjectTitleFontPickerProps) {
  const t = useTranslations('MusicProjects');
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const displayLabel = sanitizeDisplayText(previewLabel) || t('project_name');

  useEffect(() => {
    if (!open) {
      return;
    }
    preloadTitleFontOptions();
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return TITLE_FONT_OPTIONS;
    }
    return TITLE_FONT_OPTIONS.filter((option) => {
      const terms = option.searchTerms ?? [];
      return option.id.includes(q) || terms.some(term => term.includes(q));
    });
  }, [search]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const handleSelect = (fontFamily: string) => {
    onSelect(fontFamily);
    handleClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: theme => ({
            ...glassPaperSx(theme),
            width: { xs: 280, sm: 360 },
            maxWidth: '95vw',
            maxHeight: 'min(520px, 70vh)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }),
        },
      }}
    >
      <Box sx={{ p: 1.5, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={t('font_search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          inputRef={searchInputRef}
        />
      </Box>
      <List dense disablePadding sx={{ overflowY: 'auto', flex: 1, px: 0.5, pb: 1 }}>
        {filteredOptions.map(option => (
          <ListItemButton
            key={option.id}
            selected={selectedFontFamily === option.fontFamily}
            onClick={() => handleSelect(option.fontFamily)}
            aria-label={option.ariaLabel}
            sx={{ py: 1, px: 1.5 }}
          >
            <Typography
              noWrap
              title={displayLabel}
              sx={{
                fontFamily: option.fontFamily,
                fontSize: '1.125rem',
                fontWeight: 700,
                lineHeight: 1.2,
                width: '100%',
                fontVariantLigatures: 'none',
                fontFeatureSettings: '"liga" 0, "calt" 0',
                fontSynthesis: 'none',
              }}
            >
              {displayLabel}
            </Typography>
          </ListItemButton>
        ))}
        {filteredOptions.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
            {t('font_no_results')}
          </Typography>
        )}
      </List>
    </Popover>
  );
}
