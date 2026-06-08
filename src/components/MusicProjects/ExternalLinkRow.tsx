'use client';

import type { ExternalLink } from '@/utils/externalLinkEmbed';
import { Delete as DeleteIcon, Edit as EditIcon, MoreHoriz } from '@mui/icons-material';
import {
  Box,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ExternalLinkEmbed } from '@/components/MusicProjects/ExternalLinkEmbed';
import { getSpotifyEmbedUrl, getYouTubeEmbedUrl } from '@/utils/externalLinkEmbed';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';

type ExternalLinkRowProps = {
  link: ExternalLink;
  accent: string;
  readOnly?: boolean;
  onEdit: (link: ExternalLink, anchorEl: HTMLElement) => void;
  onDelete: (linkId: string, anchorEl: HTMLElement) => void;
};

function usesExternalLinkCard(link: ExternalLink): boolean {
  if (link.kind === 'website') {
    return true;
  }
  if (link.kind === 'youtube') {
    return !getYouTubeEmbedUrl(link.url);
  }
  if (link.kind === 'spotify') {
    return !getSpotifyEmbedUrl(link.url);
  }
  return true;
}

export function ExternalLinkRow({
  link,
  accent,
  readOnly = false,
  onEdit,
  onDelete,
}: ExternalLinkRowProps) {
  const t = useTranslations('MusicProjects');
  const [isHovered, setIsHovered] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const showActions = isHovered || Boolean(menuAnchor);
  const isCardLayout = usesExternalLinkCard(link);

  const moreButton = (
    <IconButton
      size="small"
      onClick={e => setMenuAnchor(e.currentTarget)}
      aria-label={t('edit')}
    >
      <MoreHoriz fontSize="small" />
    </IconButton>
  );

  const actionsTransition = (
    <Collapse
      orientation="horizontal"
      in={showActions}
      timeout={200}
      sx={{ '& .MuiCollapse-wrapperInner': { display: 'flex' } }}
    >
      {moreButton}
    </Collapse>
  );

  return (
    <Box
      sx={{ position: 'relative' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!menuAnchor) {
          setIsHovered(false);
        }
      }}
    >
      <ExternalLinkEmbed
        link={link}
        accent={accent}
        actions={!readOnly && isCardLayout ? actionsTransition : undefined}
      />

      {!readOnly && !isCardLayout && (
        <Collapse
          orientation="horizontal"
          in={showActions}
          timeout={200}
          sx={{
            'position': 'absolute',
            'top': 8,
            'right': 8,
            'zIndex': 1,
            '& .MuiCollapse-wrapperInner': { display: 'flex' },
          }}
        >
          <IconButton
            size="small"
            onClick={e => setMenuAnchor(e.currentTarget)}
            aria-label={t('edit')}
            sx={{
              'bgcolor': 'background.paper',
              'boxShadow': 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Collapse>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setIsHovered(false);
        }}
        slotProps={getGlassMenuSlotProps()}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              onEdit(link, menuAnchor);
            }
            setMenuAnchor(null);
            setIsHovered(false);
          }}
          sx={glassMenuItemSx}
        >
          <EditIcon sx={{ fontSize: 16, mr: 0.75 }} />
          {t('edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuAnchor) {
              onDelete(link.id, menuAnchor);
            }
            setMenuAnchor(null);
            setIsHovered(false);
          }}
          sx={{ ...glassMenuItemSx, color: 'error.main' }}
        >
          <DeleteIcon sx={{ fontSize: 16, mr: 0.75 }} />
          {t('remove_link')}
        </MenuItem>
      </Menu>
    </Box>
  );
}
