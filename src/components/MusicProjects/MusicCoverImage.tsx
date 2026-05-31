'use client';

import { Album as AlbumIcon, MusicNote as MusicNoteIcon, LibraryMusic as SongIcon } from '@mui/icons-material';
import { Box } from '@mui/material';

export type MusicCoverType = 'project' | 'album' | 'song';

type MusicCoverImageProps = {
  imageUrl?: string | null;
  type: MusicCoverType;
  size?: number;
};

function getPlaceholderIcon(type: MusicCoverType) {
  if (type === 'album') {
    return AlbumIcon;
  }
  if (type === 'song') {
    return MusicNoteIcon;
  }
  return SongIcon;
}

export function MusicCoverImage({ imageUrl, type, size = 48 }: MusicCoverImageProps) {
  const PlaceholderIcon = getPlaceholderIcon(type);

  if (imageUrl) {
    return (
      <Box
        component="img"
        src={imageUrl}
        alt=""
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <PlaceholderIcon
        sx={{
          fontSize: size * 0.4,
          color: 'text.disabled',
        }}
      />
    </Box>
  );
}
