'use client';

import type { ExternalLink } from '@/utils/externalLinkEmbed';
import { Box } from '@mui/material';
import { ExternalLinkCard } from '@/components/MusicProjects/ExternalLinkCard';
import { getSpotifyEmbedUrl, getYouTubeEmbedUrl } from '@/utils/externalLinkEmbed';

type ExternalLinkEmbedProps = {
  link: ExternalLink;
  accent: string;
};

export function ExternalLinkEmbed({ link, accent }: ExternalLinkEmbedProps) {
  if (link.kind === 'youtube') {
    const embedUrl = getYouTubeEmbedUrl(link.url);
    if (!embedUrl) {
      return <ExternalLinkCard link={link} accent={accent} />;
    }

    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          component="iframe"
          src={embedUrl}
          title={link.title ?? 'YouTube'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </Box>
    );
  }

  if (link.kind === 'spotify') {
    const embedUrl = getSpotifyEmbedUrl(link.url);
    if (!embedUrl) {
      return <ExternalLinkCard link={link} accent={accent} />;
    }

    return (
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          component="iframe"
          src={embedUrl}
          title={link.title ?? 'Spotify'}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          sx={{
            width: '100%',
            height: 152,
            border: 0,
            display: 'block',
          }}
        />
      </Box>
    );
  }

  return <ExternalLinkCard link={link} accent={accent} />;
}
