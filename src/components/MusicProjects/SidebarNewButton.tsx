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
import { CreateAlbumDialog } from './CreateAlbumDialog';
import { CreateProjectDialog } from './CreateProjectDialog';
import { CreateSongDialog } from './CreateSongDialog';
import { primaryGradientSx } from './musicListToolbarStyles';

const menuItemSx = {
  fontSize: '0.75rem',
  py: 0.45,
  minHeight: 28,
} as const;

type SidebarNewButtonProps = {
  locale: string;
};

type DialogType = 'album' | 'project' | 'song' | null;

export function SidebarNewButton({ locale }: SidebarNewButtonProps) {
  const tDashboard = useTranslations('DashboardLayout');
  const tMusic = useTranslations('MusicProjects');
  const router = useRouter();
  const { playHoverSound } = useHoverSound();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    playHoverSound();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (type: DialogType) => {
    handleMenuClose();
    setOpenDialog(type);
  };

  const handleProjectCreated = (id: number) => {
    setOpenDialog(null);
    router.push(`/${locale}/projects/${id}`);
    router.refresh();
  };

  const handleSongCreated = (songId: number) => {
    setOpenDialog(null);
    router.push(`/${locale}/songs/${songId}`);
    router.refresh();
  };

  const handleAlbumCreated = (albumId: number) => {
    setOpenDialog(null);
    router.push(`/${locale}/albums/${albumId}`);
    router.refresh();
  };

  const menuItems = [
    { type: 'album' as const, label: tMusic('album_detail_title') },
    { type: 'project' as const, label: tMusic('select_project') },
    { type: 'song' as const, label: tMusic('song_detail_title') },
  ];

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
          ...primaryGradientSx,
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
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: anchorEl?.offsetWidth ?? undefined,
              mt: 0.5,
            },
          },
        }}
      >
        {menuItems.map(({ type, label }) => (
          <MenuItem
            key={type}
            onClick={() => handleSelect(type)}
            onMouseEnter={playHoverSound}
            sx={menuItemSx}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      <CreateProjectDialog
        open={openDialog === 'project'}
        onClose={() => setOpenDialog(null)}
        locale={locale}
        onCreated={handleProjectCreated}
      />
      <CreateSongDialog
        open={openDialog === 'song'}
        onClose={() => setOpenDialog(null)}
        locale={locale}
        onCreated={handleSongCreated}
      />
      <CreateAlbumDialog
        open={openDialog === 'album'}
        onClose={() => setOpenDialog(null)}
        locale={locale}
        onCreated={handleAlbumCreated}
      />
    </>
  );
}
