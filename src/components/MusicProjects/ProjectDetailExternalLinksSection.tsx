'use client';

import type { ExternalLinkDraft } from '@/components/MusicProjects/ExternalLinkFormPopover';
import type { ExternalLink } from '@/utils/externalLinkEmbed';
import { Add as AddIcon } from '@mui/icons-material';
import {
  Box,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { ExternalLinkFormPopover } from '@/components/MusicProjects/ExternalLinkFormPopover';
import { ExternalLinkRow } from '@/components/MusicProjects/ExternalLinkRow';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { buildExternalLink } from '@/utils/externalLinkEmbed';
import { mergeExternalLinks, parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';

type ProjectDetailExternalLinksSectionProps = {
  locale: string;
  projectId: number;
  metadata: unknown;
  accent: string;
  readOnly?: boolean;
};

const EMPTY_DRAFT: ExternalLinkDraft = { url: '', title: '' };

export function ProjectDetailExternalLinksSection({
  locale,
  projectId,
  metadata,
  accent,
  readOnly = false,
}: ProjectDetailExternalLinksSectionProps) {
  const t = useTranslations('MusicProjects');
  const updateProject = useUpdateMusicProject(locale);

  const parsedMetadata = parseMusicProjectMetadata(metadata);
  const links = parsedMetadata.externalLinks ?? [];

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverMode, setPopoverMode] = useState<'create' | 'edit'>('create');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExternalLinkDraft>(EMPTY_DRAFT);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [pendingDeleteLinkId, setPendingDeleteLinkId] = useState<string | null>(null);
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);

  const persistLinks = useCallback(async (nextLinks: ExternalLink[]) => {
    const merged = mergeExternalLinks(metadata, nextLinks);
    await updateProject.mutateAsync({
      projectId,
      data: { metadata: merged },
    });
  }, [metadata, projectId, updateProject]);

  const handleClosePopover = () => {
    setPopoverOpen(false);
    setPopoverAnchorEl(null);
    setEditingLinkId(null);
    setDraft(EMPTY_DRAFT);
    setUrlError(null);
  };

  const handleAddLink = (anchorEl: HTMLElement) => {
    setPopoverAnchorEl(anchorEl);
    setPopoverMode('create');
    setEditingLinkId(null);
    setDraft(EMPTY_DRAFT);
    setUrlError(null);
    setPopoverOpen(true);
  };

  const handleEditLink = (link: ExternalLink, anchorEl: HTMLElement) => {
    setPopoverAnchorEl(anchorEl);
    setPopoverMode('edit');
    setEditingLinkId(link.id);
    setDraft({
      id: link.id,
      url: link.url,
      title: link.title ?? '',
    });
    setUrlError(null);
    setPopoverOpen(true);
  };

  const handleDraftChange = (field: 'url' | 'title', value: string) => {
    setUrlError(null);
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const trimmedUrl = draft.url.trim();
    if (!trimmedUrl) {
      setUrlError(t('invalid_url'));
      return;
    }

    const built = buildExternalLink(trimmedUrl, draft.title, draft.id);
    if (!built) {
      setUrlError(t('invalid_url'));
      return;
    }

    const nextLinks = popoverMode === 'edit' && editingLinkId
      ? links.map(link => (link.id === editingLinkId ? built : link))
      : [...links, built];

    await persistLinks(nextLinks);
    handleClosePopover();
  };

  const closeDeleteConfirm = () => {
    setPendingDeleteLinkId(null);
    setDeleteConfirmAnchor(null);
  };

  const handleRequestDelete = (linkId: string, anchorEl: HTMLElement) => {
    setPendingDeleteLinkId(linkId);
    setDeleteConfirmAnchor(anchorEl);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteLinkId) {
      return;
    }

    const linkId = pendingDeleteLinkId;
    const nextLinks = links.filter(link => link.id !== linkId);
    await persistLinks(nextLinks);
    closeDeleteConfirm();
    if (editingLinkId === linkId) {
      handleClosePopover();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('external_links')}
        </Typography>
        {!readOnly && (
          <IconButton
            size="small"
            onClick={e => handleAddLink(e.currentTarget)}
            disabled={updateProject.isPending}
            aria-label={t('add_external_link')}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {links.length === 0
        ? (
            <Typography variant="body2" color="text.secondary">
              {t('no_external_links')}
            </Typography>
          )
        : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {links.map(link => (
                <ExternalLinkRow
                  key={link.id}
                  link={link}
                  accent={accent}
                  readOnly={readOnly}
                  onEdit={handleEditLink}
                  onDelete={handleRequestDelete}
                />
              ))}
            </Box>
          )}

      <ExternalLinkFormPopover
        open={popoverOpen}
        anchorEl={popoverAnchorEl}
        mode={popoverMode}
        draft={draft}
        urlError={urlError}
        isPending={updateProject.isPending}
        onDraftChange={handleDraftChange}
        onSave={() => void handleSave()}
        onClose={handleClosePopover}
      />

      <ConfirmPopover
        open={Boolean(pendingDeleteLinkId && deleteConfirmAnchor)}
        anchorEl={deleteConfirmAnchor}
        onClose={closeDeleteConfirm}
        onConfirm={() => void handleConfirmDelete()}
        message={t('external_link_delete_confirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmColor="error"
        loading={updateProject.isPending}
      />
    </Box>
  );
}
