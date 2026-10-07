'use client';

import {
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import {
  Popover,
  POSITION_BELOW_ANCHOR_ORIGIN,
  POSITION_BELOW_TRANSFORM_ORIGIN,
} from '@/components/common/Popover';
import {
  createPopoverFieldSx,
  createPopoverTitleSx,
  TITLE_ROW_MARGIN_BOTTOM,
} from '@/components/MusicProjects/createMusicPopoverStyles';
import {
  useGetOrCreateCalendarFeed,
  useRotateCalendarFeed,
} from '@/queries/hooks/calendar-feeds';
import {
  glassPaperSx,
  glassPopoverCancelButtonSx,
} from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 360;

type CalendarSubscribePopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  locale: string;
  projectId: number;
  canRotate: boolean;
  onClose: () => void;
};

export function CalendarSubscribePopover({
  open,
  anchorEl,
  locale,
  projectId,
  canRotate,
  onClose,
}: CalendarSubscribePopoverProps) {
  const t = useTranslations('MusicProjects');
  const { data, isLoading, isError, error } = useGetOrCreateCalendarFeed(
    locale,
    projectId,
    open,
  );
  const rotateFeed = useRotateCalendarFeed(locale, projectId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  const handleCopy = async () => {
    if (!data?.url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      paperSx={glassPaperSx}
      showArrow
      anchorOrigin={POSITION_BELOW_ANCHOR_ORIGIN}
      transformOrigin={POSITION_BELOW_TRANSFORM_ORIGIN}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            mb: TITLE_ROW_MARGIN_BOTTOM,
          }}
        >
          <LinkIcon sx={{ fontSize: 18, color: 'text.secondary' }} aria-hidden />
          <Typography component="h2" sx={createPopoverTitleSx}>
            {t('calendar_subscribe_title')}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.75rem' }}>
          {t('calendar_subscribe_help')}
        </Typography>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={22} />
          </Box>
        )}

        {isError && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1.5 }}>
            {error instanceof Error ? error.message : t('calendar_subscribe_error')}
          </Typography>
        )}

        {data?.url && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              value={data.url}
              InputProps={{ readOnly: true }}
              sx={createPopoverFieldSx}
            />
            <IconButton
              size="small"
              onClick={() => {
                void handleCopy();
              }}
              aria-label={t('calendar_subscribe_copy')}
              sx={{ mt: 0.5, borderRadius: 1 }}
            >
              {copied
                ? <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                : <CopyIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {t('calendar_subscribe_refresh_note')}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
          {canRotate && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              disabled={rotateFeed.isPending || isLoading}
              onClick={() => {
                void rotateFeed.mutateAsync();
              }}
              sx={glassPopoverCancelButtonSx}
            >
              {t('calendar_subscribe_rotate')}
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={onClose}
            sx={glassPopoverCancelButtonSx}
          >
            {t('cancel')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
