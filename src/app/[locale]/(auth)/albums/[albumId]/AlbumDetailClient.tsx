'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { AlbumDetailPageHeader } from '@/components/MusicProjects/AlbumDetailPageHeader';
import { MusicEntityDetailPageSkeleton } from '@/components/MusicProjects/MusicEntityDetailPageSkeleton';
import { useAlbum } from '@/queries/hooks/albums';

type AlbumDetailClientProps = {
  locale: string;
  albumId: number;
  breadcrumbProjectId?: number;
};

export function AlbumDetailClient({ locale, albumId }: AlbumDetailClientProps) {
  const t = useTranslations('MusicProjects');
  const { data, isLoading, error } = useAlbum(locale, albumId);

  if (isLoading) {
    return <MusicEntityDetailPageSkeleton bodyVariant="album" />;
  }

  if (error || !data) {
    return (
      <Typography color="error">
        {t('album_not_found')}
      </Typography>
    );
  }

  const { album, project, songCount } = data;

  return (
    <Box>
      <AlbumDetailPageHeader
        locale={locale}
        albumId={albumId}
        album={album}
        project={project}
        songCount={songCount}
      />

      <Box>
        {album.description && (
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
            {album.description}
          </Typography>
        )}
        {album.releaseDate && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {t('release_date')}
            :
            {' '}
            {album.releaseDate}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
