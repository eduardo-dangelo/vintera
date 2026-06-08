'use client';

import type { GradientMusicIconKind } from './GradientIcon';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Popover } from '@/components/common/Popover';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import {
  CONTENT_GAP,
  CREATE_POPOVER_CLICK_ANCHOR_ORIGIN,
  CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN,
  createPopoverCancelButtonSx,
  createPopoverCreateButtonSx,
  createPopoverTitleSx,
  FIELDS_STACK_PADDING_TOP,
  POPOVER_PADDING,
  TITLE_ROW_MARGIN_BOTTOM,
} from './createMusicPopoverStyles';
import { GradientIcon } from './GradientIcon';

export type MusicCreateTitleIconKind = GradientMusicIconKind;

export type MusicCreatePopoverLayoutProps = {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  title: string;
  titleIconKind: MusicCreateTitleIconKind;
  width: number;
  maxHeight?: number;
  onSubmit: (e: React.FormEvent) => void;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  children: React.ReactNode;
  footerStart?: React.ReactNode;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
};

export function MusicCreatePopoverLayout({
  open,
  anchorPosition,
  onClose,
  title,
  titleIconKind,
  width,
  maxHeight,
  onSubmit,
  submitDisabled = false,
  submitLoading = false,
  children,
  footerStart,
  initialFocusRef,
}: MusicCreatePopoverLayoutProps) {
  const t = useTranslations('MusicProjects');

  const handleEntered = () => {
    if (!initialFocusRef) {
      return;
    }
    window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });
  };

  return (
    <Popover
      open={open}
      anchorEl={null}
      anchorPosition={anchorPosition}
      anchorOrigin={CREATE_POPOVER_CLICK_ANCHOR_ORIGIN}
      transformOrigin={CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN}
      onClose={onClose}
      onEntered={handleEntered}
      minWidth={width}
      maxWidth={width}
      maxHeight={maxHeight}
      showArrow={false}
      paperSx={glassPaperSx}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          p: POPOVER_PADDING,
          display: 'flex',
          flexDirection: 'column',
          gap: CONTENT_GAP,
          ...(maxHeight != null && { maxHeight }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 0.75,
            flexShrink: 0,
            mb: TITLE_ROW_MARGIN_BOTTOM,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <GradientIcon kind={titleIconKind} fontSize={16} aria-hidden />
            <Typography component="h2" sx={createPopoverTitleSx}>
              {title}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            disabled={submitLoading}
            aria-label="Close"
            sx={{ flexShrink: 0, mt: -0.25, mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: CONTENT_GAP,
            pt: FIELDS_STACK_PADDING_TOP,
            overflow: 'visible',
            ...(maxHeight != null && {
              overflowY: 'auto',
              overflowX: 'visible',
              minHeight: 0,
              flex: 1,
              pr: 0.25,
            }),
          }}
        >
          {children}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.75,
            flexShrink: 0,
            width: '100%',
          }}
        >
          {footerStart != null && (
            <Box sx={{ mr: 'auto' }}>{footerStart}</Box>
          )}
          <Button
            type="button"
            size="small"
            variant="outlined"
            onClick={onClose}
            disabled={submitLoading}
            sx={createPopoverCancelButtonSx}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            size="small"
            variant="contained"
            disabled={submitDisabled || submitLoading}
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            sx={createPopoverCreateButtonSx}
          >
            {t('create')}
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}
