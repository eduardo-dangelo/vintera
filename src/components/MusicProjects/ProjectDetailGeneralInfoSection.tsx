'use client';

import {
  Box,
  Button,
  Chip,
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

/** Whole genre column max length (comma-joined tags). */
const GENRE_MAX_LENGTH = 100;

type EditingField = 'genre' | 'description' | null;

type ProjectDetailGeneralInfoSectionProps = {
  locale: string;
  projectId: number;
  genre: string | null;
  description: string | null;
  accent: string;
  readOnly?: boolean;
};

function parseGenres(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of value.split(',')) {
    const tag = sanitizeDisplayText(part);
    if (!tag) {
      continue;
    }
    const key = tag.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

function serializeGenres(tags: string[]): string {
  return tags.join(', ').slice(0, GENRE_MAX_LENGTH);
}

function canAddGenreTag(tags: string[], nextTag: string): boolean {
  if (!nextTag) {
    return false;
  }
  if (tags.some(tag => tag.toLowerCase() === nextTag.toLowerCase())) {
    return false;
  }
  return serializeGenres([...tags, nextTag]).length <= GENRE_MAX_LENGTH;
}

export function ProjectDetailGeneralInfoSection({
  locale,
  projectId,
  genre,
  description,
  accent,
  readOnly = false,
}: ProjectDetailGeneralInfoSectionProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const updateProject = useUpdateMusicProject(locale);
  const primary = theme.palette.primary.main;

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [draftGenres, setDraftGenres] = useState<string[]>(() => parseGenres(genre));
  const [genreInput, setGenreInput] = useState('');
  const [draftDescription, setDraftDescription] = useState(description ?? '');

  useEffect(() => {
    if (editingField !== 'genre') {
      setDraftGenres(parseGenres(genre));
      setGenreInput('');
    }
  }, [genre, editingField]);

  useEffect(() => {
    if (editingField !== 'description') {
      setDraftDescription(description ?? '');
    }
  }, [description, editingField]);

  const startEdit = (field: Exclude<EditingField, null>) => {
    if (readOnly) {
      return;
    }
    setDraftGenres(parseGenres(genre));
    setGenreInput('');
    setDraftDescription(description ?? '');
    setEditingField(field);
  };

  const handleCancel = () => {
    setDraftGenres(parseGenres(genre));
    setGenreInput('');
    setDraftDescription(description ?? '');
    setEditingField(null);
  };

  const commitGenreInput = useCallback((raw: string, currentTags: string[]) => {
    const tag = sanitizeDisplayText(stripInvisibleFormatChars(raw));
    if (!canAddGenreTag(currentTags, tag)) {
      return currentTags;
    }
    return [...currentTags, tag];
  }, []);

  const handleSaveGenre = useCallback(async () => {
    const tagsWithPending = commitGenreInput(genreInput, draftGenres);
    const nextGenre = serializeGenres(tagsWithPending);
    const currentGenre = serializeGenres(parseGenres(genre));

    if (nextGenre === currentGenre) {
      setEditingField(null);
      setGenreInput('');
      return;
    }

    await updateProject.mutateAsync({
      projectId,
      data: { genre: nextGenre || '' },
    });
    setEditingField(null);
    setGenreInput('');
  }, [commitGenreInput, draftGenres, genre, genreInput, projectId, updateProject]);

  const handleSaveDescription = useCallback(async () => {
    const normalizedDescription = normalizeRichTextForSave(draftDescription);
    const currentDescription = description ?? '';

    if (normalizedDescription === currentDescription) {
      setEditingField(null);
      return;
    }

    await updateProject.mutateAsync({
      projectId,
      data: { description: normalizedDescription || '' },
    });
    setEditingField(null);
  }, [draftDescription, description, projectId, updateProject]);

  const displayGenres = parseGenres(genre);
  const chipSx = getSurfaceAccentChipSx(accent, theme);
  const clickableSx = readOnly
    ? {}
    : {
        cursor: 'pointer',
        borderRadius: 1,
        '@media (prefers-reduced-motion: no-preference)': {
          transition: 'opacity 0.15s ease',
        },
        '&:hover': {
          opacity: 0.85,
        },
      };

  const fieldActions = (onSave: () => void) => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
      <Button onClick={handleCancel} disabled={updateProject.isPending} size="small">
        {t('cancel')}
      </Button>
      <Button
        variant="contained"
        onClick={() => void onSave()}
        disabled={updateProject.isPending}
        size="small"
      >
        {t('save')}
      </Button>
    </Box>
  );

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        {t('general_info')}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 0.75, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          {t('genre')}
        </Typography>
        {editingField === 'genre'
          ? (
              <>
                <TextField
                  autoFocus
                  label={t('genre')}
                  placeholder={draftGenres.length === 0 ? t('genre_placeholder') : undefined}
                  value={genreInput}
                  onChange={(e) => {
                    const raw = stripInvisibleFormatChars(e.target.value);
                    if (raw.includes(',')) {
                      const parts = raw.split(',');
                      let nextTags = draftGenres;
                      for (let i = 0; i < parts.length - 1; i += 1) {
                        nextTags = commitGenreInput(parts[i] ?? '', nextTags);
                      }
                      setDraftGenres(nextTags);
                      setGenreInput(parts[parts.length - 1] ?? '');
                      return;
                    }
                    setGenreInput(raw);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (genreInput.trim()) {
                        const nextTags = commitGenreInput(genreInput, draftGenres);
                        setDraftGenres(nextTags);
                        setGenreInput('');
                      } else {
                        void handleSaveGenre();
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      handleCancel();
                    } else if (e.key === 'Backspace' && !genreInput && draftGenres.length > 0) {
                      e.preventDefault();
                      setDraftGenres(prev => prev.slice(0, -1));
                    }
                  }}
                  size="small"
                  fullWidth
                  disabled={updateProject.isPending}
                  InputProps={{
                    startAdornment: draftGenres.length > 0
                      ? (
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 0.5,
                              mr: 0.5,
                              maxWidth: '100%',
                              py: 0.25,
                            }}
                          >
                            {draftGenres.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onDelete={updateProject.isPending
                                  ? undefined
                                  : () => {
                                      setDraftGenres(prev => prev.filter(g => g !== tag));
                                    }}
                                sx={chipSx}
                              />
                            ))}
                          </Box>
                        )
                      : undefined,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      'flexWrap': 'wrap',
                      'alignItems': 'center',
                      'bgcolor': 'background.paper',
                      'borderRadius': 2,
                      'py': draftGenres.length > 0 ? 0.5 : undefined,
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
                        borderColor: primary,
                        borderWidth: 1,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 1px ${primary}55`,
                      },
                      '& .MuiOutlinedInput-input': {
                        minWidth: 80,
                        width: 'auto',
                        flex: 1,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: primary,
                    },
                  }}
                />
                {fieldActions(handleSaveGenre)}
              </>
            )
          : displayGenres.length > 0
            ? (
                <Box
                  onClick={readOnly ? undefined : () => startEdit('genre')}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    ...clickableSx,
                  }}
                >
                  {displayGenres.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={chipSx}
                    />
                  ))}
                </Box>
              )
            : (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  onClick={readOnly ? undefined : () => startEdit('genre')}
                  sx={{ fontStyle: 'italic', ...clickableSx, display: 'inline-block' }}
                >
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
        {editingField === 'description'
          ? (
              <>
                <RichTextEditor
                  value={draftDescription}
                  onChange={(html) => {
                    setDraftDescription(sanitizeRichTextHtml(html));
                  }}
                  placeholder={t('description_placeholder')}
                  accent={primary}
                  disabled={updateProject.isPending}
                  linkLabels={{
                    addLink: t('add_link'),
                    linkUrl: t('link_url'),
                  }}
                />
                {fieldActions(handleSaveDescription)}
              </>
            )
          : (
              <Box
                onClick={(e) => {
                  if (readOnly) {
                    return;
                  }
                  if ((e.target as HTMLElement).closest('button')) {
                    return;
                  }
                  startEdit('description');
                }}
                sx={clickableSx}
              >
                <RichTextContent
                  value={description}
                  accent={accent}
                  emptyLabel={t('description_empty')}
                  viewMoreLabel={t('view_more')}
                  viewLessLabel={t('view_less')}
                />
              </Box>
            )}
      </Box>
    </Box>
  );
}
