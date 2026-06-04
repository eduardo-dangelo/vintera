'use client';

import {
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import {
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import { CreateAlbumPopover } from './CreateAlbumPopover';
import { getCreatePopoverAnchorPositionFromClick } from './createMusicPopoverStyles';
import { CreateProjectPopover } from './CreateProjectPopover';
import { CreateSongPopover } from './CreateSongPopover';
import { GradientIcon } from './GradientIcon';

const menuItemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  fontSize: '0.75rem',
  px: 1,
  py: 0.45,
  minHeight: 28,
} as const;

type SidebarNewButtonProps = {
  locale: string;
};

type PopoverType = 'album' | 'project' | 'song' | null;

export function SidebarNewButton({ locale }: SidebarNewButtonProps) {
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

  const handleProjectCreated = (id: number) => {
    handlePopoverClose();
    router.push(`/${locale}/projects/${id}`);
    router.refresh();
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

  const menuItems = [
    { type: 'album' as const, label: tMusic('album_detail_title') },
    { type: 'project' as const, label: tMusic('select_project') },
    { type: 'song' as const, label: tMusic('song_detail_title') },
  ];

  const popoverAnchorProps = {
    anchorPosition: popoverAnchorPosition,
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleMenuOpen}
        onMouseEnter={playHoverSound}
        endIcon={<ArrowDropDownIcon sx={{ fontSize: 16 }} />}
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        sx={{
          'justifyContent': 'space-between',
          'textTransform': 'none',
          'fontWeight': 500,
          'fontSize': menuItemSx.fontSize,
          'borderRadius': 1,
          'py': menuItemSx.py,
          'px': 1,
          'minHeight': menuItemSx.minHeight,
          'boxShadow': 'none',
          '&:hover': {
            boxShadow: 'none',
            filter: 'brightness(1.05)',
          },
          '& .MuiButton-startIcon': {
            mr: 0.75,
          },
          '& .MuiButton-endIcon': {
            ml: 'auto',
          },
        }}
      >
        {tDashboard('sidebar_new')}
      </Button>

      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: theme => ({
              ...glassPaperSx(theme),
              minWidth: menuAnchorEl?.offsetWidth ?? undefined,
              mt: 0.5,
            }),
          },
        }}
      >
        {menuItems.map(({ type, label }) => (
          <MenuItem
            key={type}
            onClick={e => handleSelect(type, e)}
            onMouseEnter={playHoverSound}
            sx={menuItemSx}
          >
            <GradientIcon kind={type} fontSize={16} gradientOnHover aria-hidden />
            {label}
          </MenuItem>
        ))}
      </Menu>

      <CreateProjectPopover
        open={openPopover === 'project'}
        onClose={handlePopoverClose}
        locale={locale}
        onCreated={handleProjectCreated}
        {...popoverAnchorProps}
      />
      <CreateSongPopover
        open={openPopover === 'song'}
        onClose={handlePopoverClose}
        locale={locale}
        onCreated={handleSongCreated}
        {...popoverAnchorProps}
      />
      <CreateAlbumPopover
        open={openPopover === 'album'}
        onClose={handlePopoverClose}
        locale={locale}
        onCreated={handleAlbumCreated}
        {...popoverAnchorProps}
      />
    </>
  );
}
