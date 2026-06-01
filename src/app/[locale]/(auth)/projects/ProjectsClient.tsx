'use client';

import {
  Box,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { MusicFolderGrid } from '@/components/MusicProjects/MusicFolderGrid';
import { MusicListContentSkeleton } from '@/components/MusicProjects/MusicListContentSkeleton';
import { MusicListEmptyState } from '@/components/MusicProjects/MusicListEmptyState';
import { MusicListPageHeader } from '@/components/MusicProjects/MusicListPageHeader';
import { MusicListToolbar } from '@/components/MusicProjects/MusicListToolbar';
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
  const { viewMode, cardSize, setViewMode, setCardSize } = useListViewPrefs(locale);

  const filteredProjects = useMemo(
    () => filterBySearchQuery(
      projects ?? [],
      searchQuery,
      p => [p.name, p.genre, p.description].filter(Boolean).join(' '),
    ),
    [projects, searchQuery],
  );

  if (error) {
    return (
      <Typography color="error">
        Failed to load projects
      </Typography>
    );
  }

  const isEmpty = !projects?.length;
  const newProjectButton = <NewMusicProjectButton locale={locale} variant="toolbar" />;

  return (
    <Box>
      <MusicListPageHeader
        title={t('page_title')}
        heroImageSrc="/assets/images/music-projects-hero.png"
        toolbar={!isLoading
          ? isEmpty
            ? newProjectButton
            : (
                <MusicListToolbar
                  showViewControls
                  viewMode={viewMode}
                  cardSize={cardSize}
                  onViewModeChange={setViewMode}
                  onCardSizeChange={setCardSize}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchPlaceholder="Search projects"
                  newButton={newProjectButton}
                />
              )
          : undefined}
      />

      {isLoading
        ? (
            <MusicListContentSkeleton viewMode={viewMode} cardSize={cardSize} />
          )
        : isEmpty
          ? (
              <MusicListEmptyState
                kind="project"
                title={t('empty_title')}
                description={t('empty_description')}
              />
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
    </Box>
  );
}
