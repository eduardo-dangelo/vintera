'use client';

import type { ProjectCreatePopoverType } from './useProjectCreatePopovers';
import { EventNote as EventNoteIcon } from '@mui/icons-material';
import { Box, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useHoverSound } from '@/hooks/useHoverSound';
import { GradientIcon } from './GradientIcon';
import { ProjectCreatePopovers } from './ProjectCreatePopovers';
import {
  projectDetailEmptyStateCardDescSx,
  projectDetailEmptyStateCardSx,
  projectDetailEmptyStateCardTextSx,
  projectDetailEmptyStateCardTitleSx,
  projectDetailEmptyStateDescriptionSx,
  projectDetailEmptyStateGridSx,
  projectDetailEmptyStateIconContainerSx,
  projectDetailEmptyStateReadonlySx,
  projectDetailEmptyStateRootSx,
  projectDetailEmptyStateTitleSx,
} from './projectDetailEmptyStateStyles';
import { useProjectCreatePopovers } from './useProjectCreatePopovers';

type ProjectDetailEmptyStateProps = {
  locale: string;
  projectId: number;
  canEdit: boolean;
};

type ActionCardConfig = {
  type: ProjectCreatePopoverType;
  titleKey: 'song_detail_title' | 'album_detail_title' | 'member_detail_title' | 'event_detail_title';
  descKey:
    | 'empty_action_song_desc'
    | 'empty_action_album_desc'
    | 'empty_action_member_desc'
    | 'empty_action_event_desc';
  iconKind?: 'song' | 'album' | 'member';
};

const ACTION_CARDS: ActionCardConfig[] = [
  { type: 'song', titleKey: 'song_detail_title', descKey: 'empty_action_song_desc', iconKind: 'song' },
  { type: 'album', titleKey: 'album_detail_title', descKey: 'empty_action_album_desc', iconKind: 'album' },
  { type: 'member', titleKey: 'member_detail_title', descKey: 'empty_action_member_desc', iconKind: 'member' },
  { type: 'event', titleKey: 'event_detail_title', descKey: 'empty_action_event_desc' },
];

const ACTION_CARD_ICON_SIZE = 40;

function ActionCardIcon({ card }: { card: ActionCardConfig }) {
  if (card.type === 'event') {
    return (
      <EventNoteIcon
        sx={{ fontSize: ACTION_CARD_ICON_SIZE, color: 'primary.main' }}
        aria-hidden
      />
    );
  }
  return <GradientIcon kind={card.iconKind!} fontSize={ACTION_CARD_ICON_SIZE} aria-hidden />;
}

export function ProjectDetailEmptyState({ locale, projectId, canEdit }: ProjectDetailEmptyStateProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  const popoverState = useProjectCreatePopovers(locale, projectId);

  if (!canEdit) {
    return (
      <Box sx={projectDetailEmptyStateReadonlySx}>
        <Typography color="text.secondary">{t('overview_empty')}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box sx={projectDetailEmptyStateRootSx}>
        <Typography variant="h6" sx={projectDetailEmptyStateTitleSx}>
          {t('project_empty_title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={projectDetailEmptyStateDescriptionSx}>
          {t('project_empty_description')}
        </Typography>

        <Box sx={projectDetailEmptyStateGridSx}>
          {ACTION_CARDS.map((card) => {
            const title = t(card.titleKey);
            return (
              <Box
                key={card.type}
                component="button"
                type="button"
                onClick={e => popoverState.openPopoverFromClick(card.type, e)}
                onMouseEnter={playHoverSound}
                sx={{
                  ...projectDetailEmptyStateCardSx(theme),
                  font: 'inherit',
                  width: '100%',
                }}
                aria-label={title}
              >
                <Box
                  className="project-detail-empty-icon"
                  sx={projectDetailEmptyStateIconContainerSx(theme)}
                >
                  <ActionCardIcon card={card} />
                </Box>
                <Box sx={projectDetailEmptyStateCardTextSx}>
                  <Typography sx={projectDetailEmptyStateCardTitleSx}>{title}</Typography>
                  <Typography color="text.secondary" sx={projectDetailEmptyStateCardDescSx}>
                    {t(card.descKey)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <ProjectCreatePopovers state={popoverState} />
    </>
  );
}
