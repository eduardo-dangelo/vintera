'use client';

import type { SongListItem } from '@/queries/hooks/songs';
import type { ListFolderCardSize } from '@/utils/listViewPrefs';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import {
  getMusicCardActionAreaSx,
  getMusicCardContentPadding,
  getMusicCardCoverSize,
  getMusicCardHoverSx,
  getMusicCardTitleVariant,
} from './musicCardStyles';
import { MusicCoverImage } from './MusicCoverImage';
import { MusicItemActionsButton } from './MusicItemActionsButton';
import { MusicPeopleAvatarGroup } from './MusicPeopleAvatarGroup';
import { useMusicItemContextMenu } from './useMusicItemContextMenu';

type SongCardProps = {
  song: SongListItem;
  locale: string;
  cardSize?: ListFolderCardSize;
};

export function SongCard({ song, locale, cardSize = 'medium' }: SongCardProps) {
  const compact = cardSize === 'small';

  const menuTarget = {
    kind: 'song' as const,
    id: song.id,
    href: `/${locale}/songs/${song.id}`,
  };

  const { openFromButton, openFromContextMenu, renderMenus } = useMusicItemContextMenu(locale);

  return (
    <>
      <Card
        elevation={0}
        onContextMenu={e => openFromContextMenu(e, menuTarget)}
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          ...getMusicCardHoverSx(),
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        >
          <MusicItemActionsButton target={menuTarget} onOpen={openFromButton} />
        </Box>
        <CardActionArea
          component={Link}
          href={menuTarget.href}
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
              imageUrl={song.coverImageUrl}
              type="song"
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
                {song.title}
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
                {song.projectName}
              </Typography>
              <MusicPeopleAvatarGroup
                people={song.authors}
                size={compact ? 22 : 24}
              />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
      {renderMenus()}
    </>
  );
}
