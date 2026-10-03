'use client';

import type { MusicItemMenuTarget } from './musicItemMenuTypes';
import { Check as CheckIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import {
  Popover,
  POSITION_BELOW_ANCHOR_ORIGIN,
  POSITION_BELOW_TRANSFORM_ORIGIN,
} from '@/components/common/Popover';
import { useHoverSound } from '@/hooks/useHoverSound';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import {
  buildEmbedSnippet,
  getSharePageHref,
} from '@/utils/shareUrls';

const POPOVER_WIDTH = 320;

type MusicItemSharePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  target: MusicItemMenuTarget | null;
  locale: string;
};

export function MusicItemSharePopover({
  open,
  anchorEl,
  anchorPosition,
  onClose,
  target,
  locale,
}: MusicItemSharePopoverProps) {
  const t = useTranslations('MusicProjects');
  const { playHoverSound } = useHoverSound();
  const [origin, setOrigin] = useState('');
  const [copiedField, setCopiedField] = useState<'link' | 'embed' | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!open) {
      setCopiedField(null);
    }
  }, [open]);

  const shareUrl = useMemo(() => {
    if (!target || !origin) {
      return '';
    }
    return `${origin}${getSharePageHref(locale, target.kind, target.id)}`;
  }, [target, origin, locale]);

  const embedSnippet = useMemo(() => {
    if (!target || !origin) {
      return '';
    }
    return buildEmbedSnippet(origin, locale, target.kind, target.id);
  }, [target, origin, locale]);

  const isRightClickAnchor = anchorPosition != null;

  const copyText = async (value: string, field: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <Popover
      open={open && Boolean(target)}
      anchorEl={anchorEl}
      anchorPosition={anchorPosition}
      anchorOrigin={isRightClickAnchor ? POSITION_BELOW_ANCHOR_ORIGIN : undefined}
      transformOrigin={isRightClickAnchor ? POSITION_BELOW_TRANSFORM_ORIGIN : undefined}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      showArrow={false}
      paperSx={glassPaperSx}
    >
      <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('share_title')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            {t('share_link_label')}
          </Typography>
          <TextField
            size="small"
            value={shareUrl}
            fullWidth
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.75rem',
              },
            }}
          />
          <Button
            size="small"
            variant="outlined"
            onMouseEnter={playHoverSound}
            startIcon={copiedField === 'link' ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={() => {
              void copyText(shareUrl, 'link');
            }}
            sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
          >
            {copiedField === 'link' ? t('share_copied') : t('share_copy_link')}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            {t('share_embed_label')}
          </Typography>
          <TextField
            size="small"
            value={embedSnippet}
            fullWidth
            multiline
            minRows={3}
            InputProps={{ readOnly: true }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.6875rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              },
            }}
          />
          <Button
            size="small"
            variant="outlined"
            onMouseEnter={playHoverSound}
            startIcon={copiedField === 'embed' ? <CheckIcon /> : <ContentCopyIcon />}
            onClick={() => {
              void copyText(embedSnippet, 'embed');
            }}
            sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
          >
            {copiedField === 'embed' ? t('share_copied') : t('share_copy_embed')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
