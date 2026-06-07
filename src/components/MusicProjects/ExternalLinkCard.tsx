'use client';

import type { ExternalLink } from '@/utils/externalLinkEmbed';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, IconButton, Link, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { getDomainFromUrl } from '@/utils/externalLinkEmbed';

type ExternalLinkCardProps = {
  link: ExternalLink;
  accent: string;
};

export function ExternalLinkCard({ link, accent }: ExternalLinkCardProps) {
  const t = useTranslations('MusicProjects');
  const domain = getDomainFromUrl(link.url);
  const displayTitle = link.title || domain;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${accent}22 0%, transparent 70%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
          {displayTitle}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {domain}
        </Typography>
      </Box>
      <IconButton
        component={Link}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        aria-label={t('open_link')}
        sx={{ flexShrink: 0 }}
      >
        <OpenInNewIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
