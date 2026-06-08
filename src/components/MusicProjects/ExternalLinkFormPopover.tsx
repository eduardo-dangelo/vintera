'use client';

import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { Popover } from '@/components/common/Popover';
import {
  createPopoverCancelButtonSx,
  createPopoverCreateButtonSx,
  createPopoverFieldSx,
  createPopoverTitleSx,
  TITLE_ROW_MARGIN_BOTTOM,
} from '@/components/MusicProjects/createMusicPopoverStyles';
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import { glassPaperSx } from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 320;

export type ExternalLinkDraft = {
  id?: string;
  url: string;
  title: string;
};

type ExternalLinkFormPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  mode: 'create' | 'edit';
  draft: ExternalLinkDraft;
  urlError: string | null;
  isPending: boolean;
  onDraftChange: (field: 'url' | 'title', value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export function ExternalLinkFormPopover({
  open,
  anchorEl,
  mode,
  draft,
  urlError,
  isPending,
  onDraftChange,
  onSave,
  onClose,
}: ExternalLinkFormPopoverProps) {
  const t = useTranslations('MusicProjects');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const raf = window.requestAnimationFrame(() => {
        urlInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      paperSx={glassPaperSx}
      showArrow
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.75,
            mb: TITLE_ROW_MARGIN_BOTTOM,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <GradientIcon kind="link" fontSize={16} aria-hidden />
            <Typography component="h2" sx={createPopoverTitleSx}>
              {mode === 'create' ? t('new_external_link') : t('edit_external_link')}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            aria-label={t('cancel')}
            sx={{ mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            fullWidth
            size="small"
            label={t('link_url')}
            value={draft.url}
            onChange={e => onDraftChange('url', e.target.value)}
            placeholder="https://"
            inputRef={urlInputRef}
            sx={createPopoverFieldSx}
          />
          <TextField
            fullWidth
            size="small"
            label={t('link_title')}
            value={draft.title}
            onChange={e => onDraftChange('title', e.target.value)}
            placeholder={t('link_title_optional')}
            sx={createPopoverFieldSx}
          />
          {urlError && (
            <Typography variant="caption" color="error">
              {urlError}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            disabled={isPending}
            sx={createPopoverCancelButtonSx}
          >
            {t('cancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onSave}
            disabled={isPending}
            sx={createPopoverCreateButtonSx}
          >
            {t('save')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
