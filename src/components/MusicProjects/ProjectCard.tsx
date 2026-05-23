'use client';

import type { MusicProjectListItem } from '@/queries/hooks/music-projects/useMusicProjects';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type ProjectCardProps = {
  project: MusicProjectListItem;
  locale: string;
};

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const t = useTranslations('MusicProjects');
  const accent = project.color || '#7c3aed';

  return (
    <Card
      elevation={0}
      sx={{
        'height': '100%',
        'borderRadius': 3,
        'overflow': 'hidden',
        'border': '1px solid',
        'borderColor': 'divider',
        'transition': 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 40px ${accent}33`,
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={`/${locale}/projects/${project.id}`}
        sx={{ height: '100%' }}
      >
        <Box
          sx={{
            height: 8,
            background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {project.name}
          </Typography>
          {project.genre && (
            <Chip
              label={project.genre}
              size="small"
              sx={{
                mb: 1.5,
                bgcolor: `${accent}22`,
                color: accent,
                fontWeight: 500,
              }}
            />
          )}
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {project.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {t('album_count', { count: project.albumCount })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('song_count', { count: project.songCount })}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
