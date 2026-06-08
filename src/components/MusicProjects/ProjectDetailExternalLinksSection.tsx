'use client';

import type { ExternalLink } from '@/utils/externalLinkEmbed';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';
import { ExternalLinkEmbed } from '@/components/MusicProjects/ExternalLinkEmbed';
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

type DraftLink = {
  id?: string;
  url: string;
  title: string;
};

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

  const [isEditing, setIsEditing] = useState(false);
  const [draftLinks, setDraftLinks] = useState<DraftLink[]>([]);
  const [urlError, setUrlError] = useState<string | null>(null);

  const persistLinks = useCallback(async (nextLinks: ExternalLink[]) => {
    const merged = mergeExternalLinks(metadata, nextLinks);
    await updateProject.mutateAsync({
      projectId,
      data: { metadata: merged },
    });
  }, [metadata, projectId, updateProject]);

  const handleEnterEdit = () => {
    setDraftLinks(
      links.map(link => ({
        id: link.id,
        url: link.url,
        title: link.title ?? '',
      })),
    );
    setUrlError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftLinks([]);
    setUrlError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const built: ExternalLink[] = [];
    for (const draft of draftLinks) {
      const trimmedUrl = draft.url.trim();
      if (!trimmedUrl) {
        continue;
      }
      const link = buildExternalLink(trimmedUrl, draft.title, draft.id);
      if (!link) {
        setUrlError(t('invalid_url'));
        return;
      }
      built.push(link);
    }

    await persistLinks(built);
    setIsEditing(false);
    setDraftLinks([]);
    setUrlError(null);
  };

  const handleAddLink = () => {
    setDraftLinks(prev => [...prev, { url: '', title: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setDraftLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleDraftChange = (index: number, field: 'url' | 'title', value: string) => {
    setUrlError(null);
    setDraftLinks(prev => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('external_links')}
        </Typography>
        {!readOnly && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {isEditing && (
              <IconButton size="small" onClick={handleAddLink} aria-label={t('add_external_link')}>
                <AddIcon fontSize="small" />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={() => {
                if (isEditing) {
                  void handleSave();
                } else {
                  handleEnterEdit();
                }
              }}
              disabled={updateProject.isPending}
              aria-label={isEditing ? t('save') : t('edit')}
            >
              {isEditing ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
            </IconButton>
          </Box>
        )}
      </Box>

      {isEditing
        ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {draftLinks.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t('no_external_links')}
                </Typography>
              )}
              {draftLinks.map((draft, index) => (
                <Box
                  key={draft.id ?? `draft-${index}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label={t('link_url')}
                    value={draft.url}
                    onChange={e => handleDraftChange(index, 'url', e.target.value)}
                    placeholder="https://"
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label={t('link_title')}
                    value={draft.title}
                    onChange={e => handleDraftChange(index, 'title', e.target.value)}
                    placeholder={t('link_title_optional')}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveLink(index)}
                    sx={{ mt: 0.5, color: 'error.main' }}
                    aria-label={t('remove_link')}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
              {urlError && (
                <Typography variant="caption" color="error">
                  {urlError}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" onClick={handleCancelEdit} disabled={updateProject.isPending}>
                  {t('cancel')}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={updateProject.isPending}
                >
                  {t('save')}
                </Button>
              </Box>
            </Box>
          )
        : links.length === 0
          ? (
              <Typography variant="body2" color="text.secondary">
                {t('no_external_links')}
              </Typography>
            )
          : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {links.map(link => (
                  <ExternalLinkEmbed key={link.id} link={link} accent={accent} />
                ))}
              </Box>
            )}
    </Box>
  );
}
