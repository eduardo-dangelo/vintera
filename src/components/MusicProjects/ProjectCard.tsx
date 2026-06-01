'use client';

import type { MusicProjectListItem } from '@/queries/hooks/music-projects/useMusicProjects';
import type { ListFolderCardSize } from '@/utils/listViewPrefs';
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
import {
  getMusicCardActionAreaSx,
  getMusicCardContentPadding,
  getMusicCardCoverSize,
  getMusicCardHoverSx,
  getMusicCardTitleVariant,
} from './musicCardStyles';
import { MusicCoverImage } from './MusicCoverImage';
import { MusicPeopleAvatarGroup } from './MusicPeopleAvatarGroup';
import { MusicStatBadge, MusicStatBadgeRow } from './MusicStatBadge';

type ProjectCardProps = {
  project: MusicProjectListItem;
  locale: string;
  cardSize?: ListFolderCardSize;
};

export function ProjectCard({ project, locale, cardSize = 'medium' }: ProjectCardProps) {
  const t = useTranslations('MusicProjects');
  const accent = project.color || '#7c3aed';
  const compact = cardSize === 'small';
  const hideStatLabels = cardSize !== 'large';
  const showGenre = cardSize === 'large' && Boolean(project.genre);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        ...getMusicCardHoverSx(),
      }}
    >
      <CardActionArea
        component={Link}
        href={`/${locale}/projects/${project.id}`}
        sx={{ height: '100%', ...getMusicCardActionAreaSx() }}
      >
        <CardContent
          sx={{
            p: getMusicCardContentPadding(cardSize),
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <MusicCoverImage
            imageUrl={project.coverImageUrl}
            type="project"
            size={getMusicCardCoverSize(cardSize)}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={getMusicCardTitleVariant(cardSize)}
              sx={{
                fontWeight: 700,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {project.name}
            </Typography>
            {showGenre && (
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
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
                mt: showGenre ? 0 : 1,
              }}
            >
              <MusicStatBadgeRow compact={compact}>
                <MusicStatBadge
                  count={project.albumCount}
                  label={t('albums_stat_label')}
                  compact={compact}
                  hideLabel={hideStatLabels}
                  tooltip={t('album_count', { count: project.albumCount })}
                />
                <MusicStatBadge
                  count={project.songCount}
                  label={t('songs_stat_label')}
                  compact={compact}
                  hideLabel={hideStatLabels}
                  tooltip={t('song_count', { count: project.songCount })}
                />
              </MusicStatBadgeRow>
              <MusicPeopleAvatarGroup
                people={project.members}
                size={compact ? 22 : 24}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
