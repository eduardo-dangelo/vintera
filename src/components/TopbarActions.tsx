'use client';

import { useUser } from '@clerk/nextjs';
import {
  NotificationsOutlined,
  Settings,
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { useGetNotifications } from '@/queries/hooks/notifications';
import { NotificationsPopover } from './Notifications/NotificationsPopover';
import { SettingsPopover } from './Settings/SettingsPopover';
import { UserProfileModal } from './UserProfileModal';

type TopbarActionsProps = {
  variant?: 'default' | 'sidebar';
};

export function TopbarActions({ variant = 'default' }: TopbarActionsProps) {
  const { user } = useUser();
  const pathname = usePathname();
  const theme = useTheme();
  const t = useTranslations('GlobalTopbar');
  const isSidebar = variant === 'sidebar';

  const locale = pathname?.match(/^\/([a-z]{2})\//)?.[1] || 'en';

  const { playHoverSound } = useHoverSound();
  const { data: notifications = [], refetch } = useGetNotifications(locale);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLElement | null>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const iconColor = isSidebar ? theme.palette.sidebar.textSecondary : 'text.secondary';
  const iconHoverBg = isSidebar ? 'rgba(255, 255, 255, 0.06)' : 'action.hover';
  const iconHoverColor = isSidebar ? theme.palette.sidebar.textPrimary : undefined;
  const iconSize = isSidebar ? 16 : undefined;
  const avatarSize = isSidebar ? 22 : 26;
  const gap = isSidebar ? 0.25 : 1;

  const iconButtonSx = {
    'color': iconColor,
    '&:hover': {
      bgcolor: iconHoverBg,
      ...(iconHoverColor && { color: iconHoverColor }),
    },
  };

  useEffect(() => {
    const handleFocus = () => {
      void refetch();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap }}>
        <Tooltip title={t('tooltip_notifications')}>
          <IconButton
            onClick={e => setNotificationsAnchorEl(e.currentTarget)}
            onMouseEnter={playHoverSound}
            size="small"
            sx={iconButtonSx}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              invisible={unreadCount === 0}
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <NotificationsOutlined sx={{ fontSize: iconSize }} fontSize={isSidebar ? undefined : 'small'} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title={t('tooltip_user_profile')}>
          <IconButton
            onClick={() => setUserProfileModalOpen(true)}
            onMouseEnter={playHoverSound}
            size="small"
            sx={{
              'p': 0,
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Avatar
              src={user?.imageUrl}
              alt={user?.firstName || 'User'}
              sx={{
                width: avatarSize,
                height: avatarSize,
              }}
            >
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Tooltip title={t('tooltip_settings')}>
          <IconButton
            onClick={e => setSettingsAnchorEl(e.currentTarget)}
            onMouseEnter={playHoverSound}
            size="small"
            sx={iconButtonSx}
          >
            <Settings sx={{ fontSize: iconSize }} fontSize={isSidebar ? undefined : 'small'} />
          </IconButton>
        </Tooltip>
      </Box>

      <NotificationsPopover
        open={Boolean(notificationsAnchorEl)}
        anchorEl={notificationsAnchorEl}
        onClose={() => setNotificationsAnchorEl(null)}
        locale={locale}
      />

      <SettingsPopover
        open={Boolean(settingsAnchorEl)}
        anchorEl={settingsAnchorEl}
        onClose={() => setSettingsAnchorEl(null)}
      />

      <UserProfileModal
        open={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
      />
    </>
  );
}
