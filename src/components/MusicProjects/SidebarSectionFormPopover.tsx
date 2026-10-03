'use client';

import type { ProjectSidebarSection, SidebarSectionKind } from '@/utils/projectSidebarSections';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import {
  createPopoverCancelButtonSx,
  createPopoverCreateButtonSx,
  createPopoverFieldSx,
  createPopoverTitleSx,
  TITLE_ROW_MARGIN_BOTTOM,
} from '@/components/MusicProjects/createMusicPopoverStyles';
import { RichTextEditor } from '@/components/RichTextEditor/RichTextEditor';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import {
  createLinkSection,
  createTextSection,
  createVideoSection,
} from '@/utils/projectSidebarSections';
import { sanitizeRichTextHtml } from '@/utils/sanitizeRichTextHtml';

const POPOVER_WIDTH = 320;

export type SidebarSectionFormDraft = {
  url: string;
  title: string;
  body: string;
};

export const EMPTY_SIDEBAR_SECTION_DRAFT: SidebarSectionFormDraft = {
  url: '',
  title: '',
  body: '',
};

type SidebarSectionFormPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  mode: 'create' | 'edit';
  kind: Extract<SidebarSectionKind, 'video' | 'link' | 'text'>;
  draft: SidebarSectionFormDraft;
  editingId?: string;
  urlError: string | null;
  isPending: boolean;
  onDraftChange: (field: keyof SidebarSectionFormDraft, value: string) => void;
  onBuilt: (section: ProjectSidebarSection) => void;
  onClose: () => void;
  onUrlError: (message: string | null) => void;
};

export function SidebarSectionFormPopover({
  open,
  anchorEl,
  mode,
  kind,
  draft,
  editingId,
  urlError,
  isPending,
  onDraftChange,
  onBuilt,
  onClose,
  onUrlError,
}: SidebarSectionFormPopoverProps) {
  const t = useTranslations('MusicProjects');
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [localBody, setLocalBody] = useState(draft.body);

  useEffect(() => {
    if (open) {
      setLocalBody(draft.body);
      const raf = window.requestAnimationFrame(() => {
        urlInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }
    return undefined;
  }, [open, draft.body]);

  const titleKey = mode === 'create'
    ? (
        kind === 'video'
          ? 'sidebar_section_new_video'
          : kind === 'link'
            ? 'sidebar_section_new_link'
            : 'sidebar_section_new_text'
      )
    : (
        kind === 'video'
          ? 'sidebar_section_edit_video'
          : kind === 'link'
            ? 'sidebar_section_edit_link'
            : 'sidebar_section_edit_text'
      );

  const handleSave = () => {
    onUrlError(null);
    if (kind === 'text') {
      onBuilt(createTextSection(localBody, draft.title, editingId));
      return;
    }

    const built = kind === 'video'
      ? createVideoSection(draft.url, draft.title, editingId)
      : createLinkSection(draft.url, draft.title, editingId);

    if (!built) {
      onUrlError(kind === 'video' ? t('sidebar_section_invalid_video_url') : t('invalid_url'));
      return;
    }
    onBuilt(built);
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
          <Typography component="h2" sx={createPopoverTitleSx}>
            {t(titleKey)}
          </Typography>
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
          {(kind === 'video' || kind === 'link') && (
            <TextField
              fullWidth
              size="small"
              label={t('link_url')}
              value={draft.url}
              onChange={(e) => {
                onUrlError(null);
                onDraftChange('url', e.target.value);
              }}
              placeholder="https://"
              inputRef={urlInputRef}
              sx={createPopoverFieldSx}
            />
          )}
          <TextField
            fullWidth
            size="small"
            label={t('link_title')}
            value={draft.title}
            onChange={e => onDraftChange('title', e.target.value)}
            placeholder={t('link_title_optional')}
            sx={createPopoverFieldSx}
          />
          {kind === 'text' && (
            <RichTextEditor
              value={localBody}
              onChange={(html) => {
                const next = sanitizeRichTextHtml(html);
                setLocalBody(next);
                onDraftChange('body', next);
              }}
              placeholder={t('sidebar_section_text_placeholder')}
              accent="#8b5cf6"
              disabled={isPending}
              linkLabels={{
                addLink: t('add_link'),
                linkUrl: t('link_url'),
              }}
            />
          )}
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
            onClick={handleSave}
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
