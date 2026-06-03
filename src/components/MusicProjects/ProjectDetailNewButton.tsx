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
import { CreateSongPopover } from './CreateSongPopover';
import { GradientIcon } from './GradientIcon';
import { primaryGradientSx } from './musicListToolbarStyles';

const menuItemSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  fontSize: '0.75rem',
  px: 1,
  py: 0.45,
  minHeight: 28,
} as const;

type ProjectDetailNewButtonProps = {
  locale: string;
  projectId: number;
};

type PopoverType = 'album' | 'song' | null;

export function ProjectDetailNewButton({ locale, projectId }: ProjectDetailNewButtonProps) {
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

  const menuItems = [
    { type: 'song' as const, label: tMusic('new_song') },
    { type: 'album' as const, label: tMusic('new_album') },
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
          ...primaryGradientSx,
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

      <Menu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: theme => ({
              ...glassPaperSx(theme),
              minWidth: 160,
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
    </>
  );
}
