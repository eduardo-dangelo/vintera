'use client';

import type { Theme } from '@mui/material/styles';
import type { ProjectCreatePopoverType } from './useProjectCreatePopovers';
import {
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import {
  Button,
  Menu,
  MenuItem,
  ThemeProvider,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useHoverSound } from '@/hooks/useHoverSound';
import { glassMenuItemSx, glassMenuPaperSx } from '@/utils/glassPaperStyles';
import { GradientIcon } from './GradientIcon';
import { ProjectCreatePopovers } from './ProjectCreatePopovers';
import { useProjectCreatePopovers } from './useProjectCreatePopovers';

type ProjectDetailNewButtonProps = {
  locale: string;
  projectId: number;
  appTheme: Theme;
};

type MenuEntry
  = | { type: ProjectCreatePopoverType; label: string; iconKind: 'song' | 'album' | 'member' }
    | { type: 'event'; label: string };

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

function renderMenuIcon(item: MenuEntry) {
  if (item.type === 'event') {
    return <EventNoteIcon sx={{ fontSize: 16, color: 'action.active' }} aria-hidden />;
  }
  return <GradientIcon kind={item.iconKind} fontSize={16} gradientOnHover aria-hidden />;
}

export function ProjectDetailNewButton({ locale, projectId, appTheme }: ProjectDetailNewButtonProps) {
  const tDashboard = useTranslations('DashboardLayout');
  const tMusic = useTranslations('MusicProjects');
  const { playHoverSound } = useHoverSound();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const popoverState = useProjectCreatePopovers(locale, projectId);

  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    playHoverSound();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSelect = (type: ProjectCreatePopoverType, event: React.MouseEvent<HTMLElement>) => {
    popoverState.openPopoverFromClick(type, event);
    handleMenuClose();
  };

  const menuItems: MenuEntry[] = [
    { type: 'song', label: tMusic('song_detail_title'), iconKind: 'song' },
    { type: 'album', label: tMusic('album_detail_title'), iconKind: 'album' },
    { type: 'member', label: tMusic('member_detail_title'), iconKind: 'member' },
    { type: 'event', label: tMusic('event_detail_title') },
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
            const key = item.type;
            return (
              <MenuItem
                key={key}
                onClick={e => handleSelect(item.type, e)}
                onMouseEnter={playHoverSound}
                sx={glassMenuItemSx}
              >
                {renderMenuIcon(item)}
                {item.label}
              </MenuItem>
            );
          })}
        </Menu>
      </ThemeProvider>

      <ProjectCreatePopovers state={popoverState} />
    </>
  );
}
