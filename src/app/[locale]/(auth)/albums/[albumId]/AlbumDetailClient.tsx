'use client';

import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAlbum } from '@/queries/hooks/albums';

type AlbumDetailClientProps = {
  locale: string;
  albumId: number;
  breadcrumbProjectId?: number;
};

export function AlbumDetailClient({ locale, albumId, breadcrumbProjectId }: AlbumDetailClientProps) {
  const t = useTranslations('MusicProjects');
  const { data, isLoading, error } = useAlbum(locale, albumId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Typography color="error">
        {t('album_not_found')}
      </Typography>
    );
  }

  const { album, project } = data;
  const accent = project.color || '#7c3aed';
  const projectHref = `/${locale}/projects/${project.id}`;
  const albumsListHref = `/${locale}/albums`;

  const statusLabel = (status: string) => {
    const key = `status_${status}` as 'status_draft' | 'status_released';
    return t(key);
  };

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }} aria-label="breadcrumb">
        <Link href={`/${locale}/projects`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {t('breadcrumb_projects')}
        </Link>
        {(breadcrumbProjectId ?? project.id) && (
          <Link href={projectHref} style={{ textDecoration: 'none', color: 'inherit' }}>
            {project.name}
          </Link>
        )}
        <Typography color="text.primary">{album.name}</Typography>
      </Breadcrumbs>

      <Button
        component={Link}
        href={breadcrumbProjectId ? projectHref : albumsListHref}
        startIcon={<ArrowBack />}
        sx={{ mb: 3, textTransform: 'none', color: 'text.secondary' }}
      >
        {breadcrumbProjectId ? project.name : t('back_to_albums')}
      </Button>

      <Box
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          background: `linear-gradient(160deg, ${accent}22 0%, transparent 60%)`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {album.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={project.name}
            size="small"
            component={Link}
            href={projectHref}
            clickable
            sx={{ bgcolor: `${accent}33`, color: accent }}
          />
          <Chip label={statusLabel(album.status)} size="small" />
        </Box>
        {album.description && (
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {album.description}
          </Typography>
        )}
        {album.releaseDate && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
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
