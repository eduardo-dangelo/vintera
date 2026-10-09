'use client';

import {
  Box,
  Grid,
  Typography,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ProjectDetailPageHeader } from '@/components/MusicProjects/ProjectDetailPageHeader';
import { ProjectDetailPageSkeleton } from '@/components/MusicProjects/ProjectDetailPageSkeleton';
import { ProjectDetailSidebar } from '@/components/MusicProjects/ProjectDetailSidebar';
import { ProjectDetailTabs } from '@/components/MusicProjects/ProjectDetailTabs';
import { useMusicProject } from '@/queries/hooks/music-projects/useMusicProject';
import { parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';
import { appendAlbumCollections, gatherCollections, resolveMainPage } from '@/utils/projectMainPage';

type ProjectDetailClientProps = {
  locale: string;
  projectId: number;
};

export function ProjectDetailClient({ locale, projectId }: ProjectDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, error } = useMusicProject(locale, projectId);

  useEffect(() => {
    const songParam = searchParams.get('song');
    const albumParam = searchParams.get('album');

    if (songParam) {
      const songId = Number.parseInt(songParam, 10);
      if (!Number.isNaN(songId)) {
        router.replace(`/${locale}/songs/${songId}`);
      }
      return;
    }

    if (albumParam) {
      router.replace(`/${locale}/projects/${projectId}?tab=albums`);
    }
  }, [searchParams, locale, projectId, router]);

  if (isLoading) {
    return <ProjectDetailPageSkeleton />;
  }

  if (error || !data) {
    return (
      <Typography color="error">
        Project not found
      </Typography>
    );
  }

  const { project, albums, songs, members, viewerPermission } = data;
  const accent = project.color || '#7c3aed';
  const meta = parseMusicProjectMetadata(project.metadata);
  const overview = resolveMainPage(meta.mainPage, meta.mainSections, albums.length, songs.length);
  const collectionPages = [
    meta.collectionsMigratedFromAlbums ? overview : appendAlbumCollections(overview, albums, songs),
    ...(meta.customTabs ?? []).map(tab => tab.page),
  ];
  const collectionCount = gatherCollections(collectionPages).length;
  const canEdit = viewerPermission === 'owner'
    || viewerPermission === 'edit'
    || viewerPermission === 'admin';

  return (
    <Box>
      <ProjectDetailPageHeader
        locale={locale}
        projectId={projectId}
        name={project.name}
        coverImageUrl={project.coverImageUrl}
        titleColor={project.color}
        metadata={project.metadata}
        albumCount={collectionCount}
        songCount={songs.length}
        memberCount={members.length}
        readOnly={!canEdit}
      />

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProjectDetailSidebar
            locale={locale}
            projectId={projectId}
            genre={project.genre}
            description={project.description}
            accent={accent}
            members={members}
            metadata={project.metadata}
            viewerPermission={viewerPermission}
            readOnly={!canEdit}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <ProjectDetailTabs
            locale={locale}
            projectId={projectId}
            project={project}
            albums={albums}
            songs={songs}
            canEdit={canEdit}
          />
        </Grid>
      </Grid>

    </Box>
  );
}
