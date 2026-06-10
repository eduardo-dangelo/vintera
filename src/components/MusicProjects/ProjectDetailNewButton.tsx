'use client';

import type { Theme } from '@mui/material/styles';
import {
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ThemeProvider,
  Tooltip,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AddProjectMemberPopover } from '@/components/MusicProjects/AddProjectMemberPopover';
import { useHoverSound } from '@/hooks/useHoverSound';
import { glassMenuItemSx, glassMenuPaperSx } from '@/utils/glassPaperStyles';
import { CreateAlbumPopover } from './CreateAlbumPopover';
import { getCreatePopoverAnchorPositionFromClick } from './createMusicPopoverStyles';
import { CreateSongPopover } from './CreateSongPopover';
import { GradientIcon } from './GradientIcon';

type ProjectDetailNewButtonProps = {
  locale: string;
  projectId: number;
  appTheme: Theme;
};

type PopoverType = 'album' | 'song' | 'member' | null;

type MenuEntry
  = | { kind: 'action'; type: PopoverType; label: string; iconKind: 'song' | 'album' | 'member' }
    | { kind: 'stub'; id: 'event'; label: string };

function getProjectNewMenuSlotProps(appTheme: Theme, minWidth = 160) {
  const isLight = appTheme.palette.mode === 'light';

  return {
    paper: {
      sx: isLight
        ? {
            mt: 0.5,
            minWidth,
            bgcolor: appTheme.palette.background.paper,
            border: `1px solid ${appTheme.palette.divider}`,
            boxShadow: appTheme.shadows[8],
          }
        : glassMenuPaperSx(appTheme, { minWidth }),
    },
  } as const;
}

export function ProjectDetailNewButton({ locale, projectId, appTheme }: ProjectDetailNewButtonProps) {
  const tDashboard = useTranslations('DashboardLayout');
  const tMusic = useTranslations('MusicProjects');
  const router = useRouter();
  const { playHoverSound } = useHoverSound();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [openPopover, setOpenPopover] = useState<PopoverType>(null);
  const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    playHoverSound();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSelect = (type: PopoverType, event: React.MouseEvent<HTMLElement>) => {
    setPopoverAnchorPosition(getCreatePopoverAnchorPositionFromClick(event));
    handleMenuClose();
    setOpenPopover(type);
  };

  const handlePopoverClose = () => {
    setOpenPopover(null);
    setPopoverAnchorPosition(null);
  };

  const handleSongCreated = (songId: number) => {
    handlePopoverClose();
    router.push(`/${locale}/songs/${songId}`);
    router.refresh();
  };

  const handleAlbumCreated = (albumId: number) => {
    handlePopoverClose();
    router.push(`/${locale}/albums/${albumId}`);
    router.refresh();
  };

  const menuItems: MenuEntry[] = [
    { kind: 'action', type: 'song', label: tMusic('song_detail_title'), iconKind: 'song' },
    { kind: 'action', type: 'album', label: tMusic('album_detail_title'), iconKind: 'album' },
    { kind: 'action', type: 'member', label: tMusic('member_detail_title'), iconKind: 'member' },
    { kind: 'stub', id: 'event', label: tMusic('event_detail_title') },
  ];

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleMenuOpen}
        onMouseEnter={playHoverSound}
        endIcon={<ArrowDropDownIcon />}
        startIcon={<AddIcon />}
        sx={{
          'textTransform': 'none',
          'fontWeight': 600,
          'borderRadius': '6px',
          'boxShadow': 'none',
          'flexShrink': 0,
          '&:hover': {
            boxShadow: 'none',
            filter: 'brightness(1.05)',
          },
        }}
      >
        {tDashboard('sidebar_new')}
      </Button>

      <ThemeProvider theme={appTheme}>
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={getProjectNewMenuSlotProps(appTheme, 160)}
        >
          {menuItems.map((item) => {
            if (item.kind === 'action') {
              return (
                <MenuItem
                  key={item.type}
                  onClick={e => handleSelect(item.type, e)}
                  onMouseEnter={playHoverSound}
                  sx={glassMenuItemSx}
                >
                  <GradientIcon kind={item.iconKind} fontSize={16} gradientOnHover aria-hidden />
                  {item.label}
                </MenuItem>
              );
            }

            return (
              <Tooltip key={item.id} title={tMusic('coming_soon')} placement="left">
                <Box component="span" sx={{ display: 'block' }}>
                  <MenuItem disabled sx={glassMenuItemSx}>
                    <EventNoteIcon sx={{ fontSize: 16, color: 'action.active' }} aria-hidden />
                    {item.label}
                  </MenuItem>
                </Box>
              </Tooltip>
            );
          })}
        </Menu>
      </ThemeProvider>

      <CreateSongPopover
        open={openPopover === 'song'}
        onClose={handlePopoverClose}
        locale={locale}
        projectId={projectId}
        onCreated={handleSongCreated}
        anchorPosition={popoverAnchorPosition}
      />
      <CreateAlbumPopover
        open={openPopover === 'album'}
        onClose={handlePopoverClose}
        locale={locale}
        projectId={projectId}
        onCreated={handleAlbumCreated}
        anchorPosition={popoverAnchorPosition}
      />
      <AddProjectMemberPopover
        open={openPopover === 'member'}
        anchorPosition={popoverAnchorPosition}
        locale={locale}
        projectId={projectId}
        onClose={handlePopoverClose}
        onAdded={handlePopoverClose}
      />
    </>
  );
}
