'use client';

import type { ProjectSidebarSection, SidebarSectionKind } from '@/utils/projectSidebarSections';
import {
  Add as AddIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from '@mui/icons-material';
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

const POPOVER_WIDTH = 340;

export type SidebarSectionFormDraft = {
  title: string;
  body: string;
  urls: string[];
};

export const EMPTY_SIDEBAR_SECTION_DRAFT: SidebarSectionFormDraft = {
  title: '',
  body: '',
  urls: [''],
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
  onDraftChange: (next: SidebarSectionFormDraft) => void;
  onBuilt: (sections: ProjectSidebarSection[]) => void;
  onClose: () => void;
  onUrlError: (message: string | null) => void;
};

function splitPastedUrls(text: string): string[] {
  return text
    .split(/[,\s]+/)
    .map(part => part.trim())
    .filter(Boolean);
}

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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [localBody, setLocalBody] = useState(draft.body);
  const isMedia = kind === 'video' || kind === 'link';
  const allowMultiple = isMedia && mode === 'create';

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    setLocalBody(draft.body);
    const raf = window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(raf);
    // Sync + focus only when the popover opens — not on every draft.body keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional open-edge only
  }, [open]);

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

  const updateUrl = (index: number, value: string) => {
    onUrlError(null);
    const urls = draft.urls.map((url, i) => (i === index ? value : url));
    onDraftChange({ ...draft, urls });
  };

  const handleUrlPaste = (index: number, event: React.ClipboardEvent) => {
    if (!allowMultiple) {
      return;
    }
    const text = event.clipboardData.getData('text');
    const pasted = splitPastedUrls(text);
    if (pasted.length <= 1) {
      return;
    }
    event.preventDefault();
    onUrlError(null);
    const urls = [...draft.urls];
    urls[index] = pasted[0] ?? '';
    urls.splice(index + 1, 0, ...pasted.slice(1));
    onDraftChange({ ...draft, urls });
  };

  const handleSave = () => {
    onUrlError(null);
    if (kind === 'text') {
      onBuilt([createTextSection(localBody, draft.title, editingId)]);
      return;
    }

    const rows = draft.urls.map(url => url.trim()).filter(Boolean);
    if (rows.length === 0) {
      onUrlError(kind === 'video' ? t('sidebar_section_invalid_video_url') : t('invalid_url'));
      return;
    }

    const sharedTitle = draft.title.trim() || undefined;
    const built: ProjectSidebarSection[] = [];
    for (let i = 0; i < rows.length; i += 1) {
      const url = rows[i]!;
      const section = kind === 'video'
        ? createVideoSection(url, sharedTitle, i === 0 ? editingId : undefined)
        : createLinkSection(url, sharedTitle, i === 0 ? editingId : undefined);
      if (!section) {
        onUrlError(kind === 'video' ? t('sidebar_section_invalid_video_url') : t('invalid_url'));
        return;
      }
      built.push(section);
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
          <TextField
            fullWidth
            size="small"
            label={t('link_title')}
            value={draft.title}
            onChange={e => onDraftChange({ ...draft, title: e.target.value })}
            placeholder={t('link_title_optional')}
            inputRef={titleInputRef}
            sx={createPopoverFieldSx}
          />

          {isMedia && draft.urls.map((url, index) => (
            <Box
              key={`media-url-${index}`}
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}
            >
              <TextField
                fullWidth
                size="small"
                label={t('link_url')}
                value={url}
                onChange={e => updateUrl(index, e.target.value)}
                onPaste={e => handleUrlPaste(index, e)}
                placeholder="https://"
                sx={createPopoverFieldSx}
              />
              {allowMultiple && draft.urls.length > 1 && (
                <IconButton
                  size="small"
                  aria-label={t('delete')}
                  disabled={isPending}
                  onClick={() => {
                    onDraftChange({
                      ...draft,
                      urls: draft.urls.filter((_, i) => i !== index),
                    });
                  }}
                  sx={{ mt: 0.5, borderRadius: 1 }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          ))}

          {allowMultiple && (
            <Button
              size="small"
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onDraftChange({
                  ...draft,
                  urls: [...draft.urls, ''],
                });
              }}
              disabled={isPending}
              sx={{
                alignSelf: 'flex-start',
                textTransform: 'none',
                color: 'text.secondary',
              }}
            >
              {kind === 'video' ? t('sidebar_section_add_another_video') : t('sidebar_section_add_another_link')}
            </Button>
          )}

          {kind === 'text' && (
            <RichTextEditor
              value={localBody}
              onChange={(html) => {
                const next = sanitizeRichTextHtml(html);
                setLocalBody(next);
                onDraftChange({ ...draft, body: next });
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
