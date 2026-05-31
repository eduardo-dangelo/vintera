'use client';

import { MusicNote } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { CreateProjectDialog } from '@/components/MusicProjects/CreateProjectDialog';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { MusicListPageHeader } from '@/components/MusicProjects/MusicListPageHeader';
import { MusicListToolbar } from '@/components/MusicProjects/MusicListToolbar';
import { primaryGradientSx } from '@/components/MusicProjects/musicListToolbarStyles';
import { NewMusicProjectButton } from '@/components/MusicProjects/NewMusicProjectButton';
import { ProjectCard } from '@/components/MusicProjects/ProjectCard';
import { ProjectListView } from '@/components/MusicProjects/Views/ProjectListView';
import { useListViewPrefs } from '@/hooks/useListViewPrefs';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';
import { filterBySearchQuery } from '@/utils/filterMusicListItems';

type ProjectsClientProps = {
  locale: string;
};

export function ProjectsClient({ locale }: ProjectsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: projects, isLoading, error } = useMusicProjects(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

  const filteredProjects = useMemo(
    () => filterBySearchQuery(
      projects ?? [],
      searchQuery,
      p => [p.name, p.genre, p.description].filter(Boolean).join(' '),
    ),
    [projects, searchQuery],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Failed to load projects
      </Typography>
    );
  }

  const isEmpty = !projects?.length;

  return (
    <Box>
      <MusicListPageHeader
        title={t('page_title')}
        heroImageSrc="/assets/images/music-projects-hero.png"
        toolbar={!isEmpty
          ? (
              <MusicListToolbar
                showViewControls
                viewMode={viewMode}
                cardSize={cardSize}
                onViewModeChange={setViewMode}
                onCardSizeChange={setCardSize}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search projects"
                newButton={<NewMusicProjectButton locale={locale} variant="toolbar" />}
              />
            )
          : undefined}
      />

      {isEmpty
        ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                px: 3,
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <MusicNote sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('empty_title')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                {t('empty_description')}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setDialogOpen(true)}
                sx={{
                  ...primaryGradientSx,
                  textTransform: 'none',
                }}
              >
                {t('create_project')}
              </Button>
            </Box>
          )
        : filteredProjects.length === 0 && searchQuery
          ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                {`No results for "${searchQuery}"`}
              </Typography>
            )
          : viewMode === 'list'
            ? (
                <ProjectListView projects={filteredProjects} locale={locale} />
              )
            : (
                <MusicFolderGrid
                  cardSize={cardSize}
                  items={filteredProjects.map(project => ({
                    id: project.id,
                    content: (
                      <ProjectCard
                        project={project}
                        locale={locale}
                        cardSize={cardSize}
                      />
                    ),
                  }))}
                />
              )}

      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        locale={locale}
      />
    </Box>
  );
}
