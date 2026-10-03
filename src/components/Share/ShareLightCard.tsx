'use client';

import {
  Album as AlbumIcon,
  LibraryMusic as ProjectIcon,
  MusicNote as SongIcon,
} from '@mui/icons-material';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { MusicCoverImage } from '@/components/MusicProjects/MusicCoverImage';
import type { ShareKind } from '@/utils/shareUrls';

export type ShareLightCardProps = {
  kind: ShareKind;
  name: string;
  coverImageUrl: string | null;
  color?: string | null;
  mode: 'page' | 'embed';
  signInHref?: string;
  signUpHref?: string;
  openHref?: string;
};

function kindLabelKey(kind: ShareKind) {
  switch (kind) {
    case 'project':
      return 'share_kind_project' as const;
    case 'song':
      return 'share_kind_song' as const;
    case 'album':
      return 'share_kind_album' as const;
  }
}

function KindFallbackIcon({ kind }: { kind: ShareKind }) {
  if (kind === 'album') {
    return <AlbumIcon sx={{ fontSize: 28 }} />;
  }
  if (kind === 'song') {
    return <SongIcon sx={{ fontSize: 28 }} />;
  }
  return <ProjectIcon sx={{ fontSize: 28 }} />;
}

export function ShareLightCard({
  kind,
  name,
  coverImageUrl,
  color,
  mode,
  signInHref,
  signUpHref,
  openHref,
}: ShareLightCardProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const accent = color || theme.palette.primary.main;
  const isEmbed = mode === 'embed';
  const logoVariant = theme.palette.mode === 'dark' ? 'light' : 'dark';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isEmbed ? '100%' : 360,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        boxShadow: isEmbed ? 'none' : 4,
      }}
    >
      <Box
        sx={{
          height: 4,
          bgcolor: accent,
        }}
      />
      <Box sx={{ p: isEmbed ? 1.5 : 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
            {t(kindLabelKey(kind))}
          </Typography>
          <Logo variant={logoVariant} compact />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {coverImageUrl
            ? (
                <MusicCoverImage imageUrl={coverImageUrl} type={kind} size={isEmbed ? 56 : 72} />
              )
            : (
                <Box
                  sx={{
                    width: isEmbed ? 56 : 72,
                    height: isEmbed ? 56 : 72,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <KindFallbackIcon kind={kind} />
                </Box>
              )}
          <Typography
            variant={isEmbed ? 'subtitle1' : 'h6'}
            sx={{
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minWidth: 0,
            }}
          >
            {name}
          </Typography>
        </Box>

        {isEmbed
          ? (
              openHref && (
                <Button
                  component={Link}
                  href={openHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  {t('share_open_in_vintera')}
                </Button>
              )
            )
          : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {signInHref && (
                  <Button
                    component={Link}
                    href={signInHref}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('share_log_in')}
                  </Button>
                )}
                {signUpHref && (
                  <Button
                    component={Link}
                    href={signUpHref}
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {t('share_sign_up')}
                  </Button>
                )}
              </Box>
            )}
      </Box>
    </Box>
  );
}
