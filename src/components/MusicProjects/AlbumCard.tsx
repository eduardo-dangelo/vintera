'use client';

import type { AlbumListItem } from '@/queries/hooks/albums';
import type { ListFolderCardSize } from '@/utils/listViewPrefs';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
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
import { MusicStatBadge } from './MusicStatBadge';

type AlbumCardProps = {
  album: AlbumListItem;
  locale: string;
  cardSize?: ListFolderCardSize;
};

export function AlbumCard({ album, locale, cardSize = 'medium' }: AlbumCardProps) {
  const t = useTranslations('MusicProjects');
  const compact = cardSize === 'small';

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
        href={`/${locale}/albums/${album.id}`}
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
            imageUrl={album.coverImageUrl}
            type="album"
            size={getMusicCardCoverSize(cardSize)}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={getMusicCardTitleVariant(cardSize)}
              sx={{
                fontWeight: 700,
                mb: cardSize === 'small' ? 0.5 : 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {album.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: cardSize === 'small' ? 1 : 1.5,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {album.projectName}
            </Typography>
            <MusicStatBadge
              count={album.songCount}
              label={t('songs_stat_label')}
              compact={compact}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
