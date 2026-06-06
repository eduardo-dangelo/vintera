'use client';

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreHoriz,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { RichTextContent } from '@/components/RichTextEditor/RichTextContent';
import { RichTextEditor } from '@/components/RichTextEditor/RichTextEditor';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { getSurfaceAccentChipSx } from '@/utils/heroChromeTextColor';
import { sanitizeDisplayText, stripInvisibleFormatChars } from '@/utils/sanitizeDisplayText';
import { normalizeRichTextForSave, sanitizeRichTextHtml } from '@/utils/sanitizeRichTextHtml';

const GENRE_MAX_LENGTH = 100;

type ProjectDetailGeneralInfoSectionProps = {
  locale: string;
  projectId: number;
  genre: string | null;
  description: string | null;
  accent: string;
  onDeleteRequest: () => void;
};

export function ProjectDetailGeneralInfoSection({
  locale,
  projectId,
  genre,
  description,
  accent,
  onDeleteRequest,
}: ProjectDetailGeneralInfoSectionProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const updateProject = useUpdateMusicProject(locale);

  const [isEditing, setIsEditing] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [draftGenre, setDraftGenre] = useState(genre ?? '');
  const [draftDescription, setDraftDescription] = useState(description ?? '');

  useEffect(() => {
    if (!isEditing) {
      setDraftGenre(genre ?? '');
      setDraftDescription(description ?? '');
    }
  }, [genre, description, isEditing]);

  const handleEnterEdit = () => {
    setDraftGenre(genre ?? '');
    setDraftDescription(description ?? '');
    setIsEditing(true);
    setMenuAnchor(null);
  };

  const handleCancel = () => {
    setDraftGenre(genre ?? '');
    setDraftDescription(description ?? '');
    setIsEditing(false);
  };

  const handleSave = useCallback(async () => {
    const sanitizedGenre = sanitizeDisplayText(draftGenre).slice(0, GENRE_MAX_LENGTH);
    const normalizedDescription = normalizeRichTextForSave(draftDescription);
    const currentGenre = genre ?? '';
    const currentDescription = description ?? '';

    if (sanitizedGenre === currentGenre && normalizedDescription === currentDescription) {
      setIsEditing(false);
      return;
    }

    await updateProject.mutateAsync({
      projectId,
      data: {
        genre: sanitizedGenre || '',
        description: normalizedDescription || '',
      },
    });
    setIsEditing(false);
  }, [draftDescription, draftGenre, description, genre, projectId, updateProject]);

  const displayGenre = sanitizeDisplayText(genre ?? '');

  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t('general_info')}
        </Typography>
        {!isEditing && (
          <>
            <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)}>
              <MoreHoriz />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={handleEnterEdit}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {t('edit')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  onDeleteRequest();
                }}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                {t('delete')}
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {isEditing
        ? (
            <>
              <TextField
                label={t('genre')}
                placeholder={t('genre_placeholder')}
                value={draftGenre}
                onChange={(e) => {
                  const value = stripInvisibleFormatChars(e.target.value).slice(0, GENRE_MAX_LENGTH);
                  setDraftGenre(value);
                }}
                size="small"
                fullWidth
                inputProps={{ maxLength: GENRE_MAX_LENGTH }}
                sx={{
                  'mb': 2,
                  '& .MuiOutlinedInput-root': {
                    'bgcolor': 'background.paper',
                    'borderRadius': 2,
                    '@media (prefers-reduced-motion: no-preference)': {
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    },
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'divider',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: accent,
                      borderWidth: 1,
                    },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 1px ${accent}55`,
                    },
                  },
                }}
              />

              <Typography
                component="label"
                variant="body2"
                color="text.secondary"
                sx={{ display: 'block', mb: 0.75, fontWeight: 500 }}
              >
                {t('project_description')}
              </Typography>

              <RichTextEditor
                value={draftDescription}
                onChange={(html) => {
                  setDraftDescription(sanitizeRichTextHtml(html));
                }}
                placeholder={t('description_placeholder')}
                accent={accent}
                disabled={updateProject.isPending}
                linkLabels={{
                  addLink: t('add_link'),
                  linkUrl: t('link_url'),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                <Button onClick={handleCancel} disabled={updateProject.isPending}>
                  {t('cancel')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={updateProject.isPending}
                >
                  {t('save')}
                </Button>
              </Box>
            </>
          )
        : (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.75, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  {t('genre')}
                </Typography>
                {displayGenre
                  ? (
                      <Chip
                        label={displayGenre}
                        size="small"
                        sx={getSurfaceAccentChipSx(accent, theme)}
                      />
                    )
                  : (
                      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                        {t('genre_empty')}
                      </Typography>
                    )}
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.75, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  {t('project_description')}
                </Typography>
                <RichTextContent
                  value={description}
                  accent={accent}
                  emptyLabel={t('description_empty')}
                  viewMoreLabel={t('view_more')}
                  viewLessLabel={t('view_less')}
                />
              </Box>
            </>
          )}
    </Box>
  );
}
