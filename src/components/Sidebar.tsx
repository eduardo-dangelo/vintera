'use client';

import type { ReactNode } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import {
  Album as AlbumIcon,
  LibraryMusic as LibraryMusicIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MusicNote as MusicNoteIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { useHoverSound } from '@/hooks/useHoverSound';
import { useGetSidebarRecents } from '@/queries/hooks/sidebar';
import { BreadcrumbProvider } from './BreadcrumbContext';
import { GlobalTopbar } from './GlobalTopbar';
import { GlobalTopbarContentProvider } from './GlobalTopbarContentContext';
import { Logo } from './Logo';
import { NewAlbumButton } from './MusicProjects/NewAlbumButton';
import { NewMusicProjectButton } from './MusicProjects/NewMusicProjectButton';
import { NewSongButton } from './MusicProjects/NewSongButton';
import { TopbarActions } from './TopbarActions';

type SidebarItem = {
  key: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ sx?: object }>;
};

const SKELETON_ROW_WIDTHS = ['75%', '60%', '85%'] as const;
const skeletonSx = { bgcolor: 'rgba(255, 255, 255, 0.08)' };

type SidebarSectionProps = {
  title: string;
  headerAction?: ReactNode;
  viewAllHref?: string;
  viewAllLabel?: string;
  items: SidebarItem[];
  emptyAction?: ReactNode;
  isLoading?: boolean;
  isActive: (href: string) => boolean;
  onItemClick: (href: string) => void;
  onItemHover: (href: string | null) => void;
};

function SidebarSectionSkeletonRows() {
  return (
    <List disablePadding>
      {SKELETON_ROW_WIDTHS.map(width => (
        <ListItem key={width} disablePadding sx={{ mb: 0.125 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 1,
              pr: 1,
              py: 0.25,
              minHeight: 28,
              width: '100%',
            }}
          >
            <Skeleton
              variant="circular"
              width={16}
              height={16}
              sx={{ flexShrink: 0, ...skeletonSx }}
            />
            <Skeleton
              variant="rounded"
              height={12}
              sx={{ flex: 1, maxWidth: width, ...skeletonSx }}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
}

function SidebarSectionHeaderSkeleton() {
  return (
    <>
      <Skeleton
        variant="rounded"
        width={52}
        height={11}
        sx={skeletonSx}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <Skeleton
          variant="rounded"
          width={22}
          height={22}
          sx={skeletonSx}
        />
        <Skeleton
          variant="rounded"
          width={36}
          height={11}
          sx={{ ...skeletonSx, mx: 0.5 }}
        />
      </Box>
    </>
  );
}

function SidebarSection({
  title,
  headerAction,
  viewAllHref,
  viewAllLabel,
  items,
  emptyAction,
  isLoading = false,
  isActive,
  onItemClick,
  onItemHover,
}: SidebarSectionProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();

  const menuItemIconColor = 'rgba(200, 200, 210, 0.9)';
  const menuItemIconColorActive = 'rgba(244, 244, 245, 0.95)';

  const rowSx = (active: boolean) => ({
    'borderRadius': 1,
    'color': active ? theme.palette.sidebar.textPrimary : theme.palette.sidebar.textSecondary,
    'bgcolor': active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    'pl': 1,
    'pr': 1,
    'py': 0.25,
    'minHeight': 28,
    'transition': 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
    '&:hover': {
      'bgcolor': 'rgba(255, 255, 255, 0.06)',
      'color': theme.palette.sidebar.textPrimary,
      '& .MuiListItemIcon-root svg': {
        color: menuItemIconColorActive,
      },
    },
  });

  return (
    <Box sx={{ mb: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 0.5,
          mb: 0.5,
        }}
      >
        {isLoading
          ? <SidebarSectionHeaderSkeleton />
          : (
              <>
                {viewAllHref
                  ? (
                      <Typography
                        component={Link}
                        href={viewAllHref}
                        variant="caption"
                        onMouseEnter={playHoverSound}
                        sx={{
                          'fontWeight': 500,
                          'color': theme.palette.sidebar.textSecondary,
                          'fontSize': '0.6875rem',
                          'textDecoration': 'none',
                          '&:hover': { color: theme.palette.sidebar.textPrimary },
                        }}
                      >
                        {title}
                      </Typography>
                    )
                  : (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.sidebar.textSecondary,
                          fontSize: '0.6875rem',
                        }}
                      >
                        {title}
                      </Typography>
                    )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  {headerAction}
                  {viewAllHref && viewAllLabel && (
                    <Typography
                      component={Link}
                      href={viewAllHref}
                      variant="caption"
                      onMouseEnter={playHoverSound}
                      sx={{
                        'color': theme.palette.sidebar.textSecondary,
                        'textDecoration': 'none',
                        'fontSize': '0.6875rem',
                        'px': 0.5,
                        '&:hover': { color: theme.palette.sidebar.textPrimary },
                      }}
                    >
                      {viewAllLabel}
                    </Typography>
                  )}
                </Box>
              </>
            )}
      </Box>

      {isLoading
        ? <SidebarSectionSkeletonRows />
        : items.length === 0
          ? emptyAction
          : (
              <List disablePadding>
                <TransitionGroup component={null}>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Collapse key={item.key} timeout={200}>
                        <ListItem disablePadding sx={{ mb: 0.125 }}>
                          <ListItemButton
                            component={Link}
                            href={item.href}
                            onMouseEnter={() => {
                              playHoverSound();
                              onItemHover(item.href);
                            }}
                            onMouseLeave={() => onItemHover(null)}
                            onClick={() => onItemClick(item.href)}
                            sx={rowSx(active)}
                          >
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Icon
                                sx={{
                                  fontSize: 16,
                                  color: active ? menuItemIconColorActive : menuItemIconColor,
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.label}
                              primaryTypographyProps={{
                                fontSize: '0.75rem',
                                fontWeight: 400,
                                noWrap: true,
                                sx: { textOverflow: 'ellipsis' },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </Collapse>
                    );
                  })}
                </TransitionGroup>
              </List>
            )}
    </Box>
  );
}

type SidebarProps = {
  children: ReactNode;
  drawerWidth: number;
  signOutLabel: string;
  sectionLabels: {
    projects: string;
    songs: string;
    albums: string;
    viewAll: string;
  };
};

export function Sidebar({
  children,
  drawerWidth,
  signOutLabel,
  sectionLabels,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clickedHref, setClickedHref] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const { playHoverSound } = useHoverSound();

  const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] ?? 'en';
  const { data: recentsData, isPending: isRecentsLoading } = useGetSidebarRecents(locale);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => {
    const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}\//, '/');
    const hrefWithoutLocale = href.replace(/^\/[a-z]{2}\//, '/');
    const hrefPath = hrefWithoutLocale.split('?')[0] ?? hrefWithoutLocale;

    if (clickedHref) {
      const clickedWithoutLocale = clickedHref.replace(/^\/[a-z]{2}\//, '/');
      return hrefWithoutLocale === clickedWithoutLocale
        || clickedWithoutLocale.startsWith(`${hrefPath}?`);
    }

    if (pathnameWithoutLocale !== hrefPath && !pathnameWithoutLocale.startsWith(`${hrefPath}/`)) {
      return false;
    }

    return pathnameWithoutLocale === hrefPath;
  };

  useEffect(() => {
    setClickedHref(null);
  }, [pathname]);

  const projectItems: SidebarItem[] = recentsData?.projects.map(project => ({
    key: `project-${project.id}`,
    href: `/${locale}/projects/${project.id}`,
    label: project.name,
    icon: LibraryMusicIcon,
  })) ?? [];

  const songItems: SidebarItem[] = recentsData?.songs.map(song => ({
    key: `song-${song.id}`,
    href: `/${locale}/songs/${song.id}`,
    label: `${song.title} (${song.projectName})`,
    icon: MusicNoteIcon,
  })) ?? [];

  const albumItems: SidebarItem[] = recentsData?.albums.map(album => ({
    key: `album-${album.id}`,
    href: `/${locale}/albums/${album.id}`,
    label: `${album.name} (${album.projectName})`,
    icon: AlbumIcon,
  })) ?? [];

  const sectionHeaderButtonSx = {
    'color': theme.palette.sidebar.textSecondary,
    'bgcolor': 'transparent',
    'borderRadius': 1,
    'height': 22,
    'width': 22,
    '&:hover': {
      color: theme.palette.sidebar.textPrimary,
      bgcolor: 'rgba(255, 255, 255, 0.06)',
    },
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {!isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.25,
            pt: 1.5,
            pb: 1,
            gap: 1,
            minWidth: 0,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Logo variant="light" compact />
          </Box>
          <TopbarActions variant="sidebar" />
        </Box>
      )}

      <Box sx={{ flexGrow: 1, px: 1.25, py: isMobile ? 3 : 1, mt: isMobile ? 5 : 0, overflowY: 'auto' }}>
        <SidebarSection
          title={sectionLabels.projects}
          viewAllHref={`/${locale}/projects`}
          viewAllLabel={sectionLabels.viewAll}
          items={projectItems}
          isLoading={isRecentsLoading}
          isActive={isActive}
          onItemClick={setClickedHref}
          onItemHover={() => {}}
          emptyAction={<NewMusicProjectButton locale={locale} variant="listItem" />}
          headerAction={(
            <NewMusicProjectButton locale={locale} iconButtonSx={sectionHeaderButtonSx} />
          )}
        />

        <SidebarSection
          title={sectionLabels.songs}
          viewAllHref={`/${locale}/songs`}
          viewAllLabel={sectionLabels.viewAll}
          items={songItems}
          isLoading={isRecentsLoading}
          isActive={isActive}
          onItemClick={setClickedHref}
          onItemHover={() => {}}
          emptyAction={<NewSongButton locale={locale} variant="listItem" />}
          headerAction={<NewSongButton locale={locale} iconButtonSx={sectionHeaderButtonSx} />}
        />

        <SidebarSection
          title={sectionLabels.albums}
          viewAllHref={`/${locale}/albums`}
          viewAllLabel={sectionLabels.viewAll}
          items={albumItems}
          isLoading={isRecentsLoading}
          isActive={isActive}
          onItemClick={setClickedHref}
          onItemHover={() => {}}
          emptyAction={<NewAlbumButton locale={locale} variant="listItem" />}
          headerAction={<NewAlbumButton locale={locale} iconButtonSx={sectionHeaderButtonSx} />}
        />
      </Box>

      <Box>
        <List sx={{ px: 1.25, py: 1.5 }}>
          <ListItem disablePadding>
            <SignOutButton>
              <ListItemButton
                onMouseEnter={playHoverSound}
                sx={{
                  'borderRadius': 1,
                  'color': theme.palette.sidebar.textSecondary,
                  'pl': 1,
                  'pr': 1,
                  'py': 0.25,
                  'minHeight': 28,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.06)',
                    color: theme.palette.sidebar.textPrimary,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 24 }}>
                  <LogoutIcon
                    sx={{
                      fontSize: 16,
                      color: 'rgba(200, 200, 210, 0.9)',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={signOutLabel}
                  primaryTypographyProps={{
                    fontSize: '0.75rem',
                    fontWeight: 400,
                  }}
                />
              </ListItemButton>
            </SignOutButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: theme.palette.background.default, overflow: 'hidden' }}>
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: mobileOpen
              ? 'transparent'
              : theme.palette.mode === 'light'
                ? 'rgba(248, 249, 250, 0.8)'
                : 'rgba(37, 37, 38, 0.8)',
            display: { xs: 'block', lg: 'none' },
            zIndex: theme => theme.zIndex.drawer + 1,
            transition: 'background-color 0.3s ease',
            backdropFilter: mobileOpen ? 'none' : 'blur(2px)',
          }}
        >
          <Toolbar
            sx={{ justifyContent: 'space-between' }}
            onClick={(e) => {
              if (mobileOpen) {
                handleDrawerToggle();
              } else {
                e.stopPropagation();
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  mr: 0.5,
                  color: mobileOpen
                    ? theme.palette.text.primary
                    : (theme.palette.mode === 'dark' ? theme.palette.text.primary : '#1a1a1a'),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Logo variant={mobileOpen ? 'light' : (theme.palette.mode === 'dark' ? 'light' : 'dark')} compact />
              </Box>
            </Box>
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center' }}>
              <TopbarActions />
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            'display': { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.sidebar.background,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Box>{drawerContent}</Box>
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            'display': { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              bgcolor: theme.palette.sidebar.background,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <BreadcrumbProvider>
        <GlobalTopbarContentProvider>
          <Box
            component="main"
            sx={{
              'flexGrow': 1,
              'height': '100vh',
              'overflow': 'auto',
              'bgcolor': 'background.default',
              '&::-webkit-scrollbar': {
                border: '1px solid red',
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                'background': theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(0, 0, 0, 0.2)',
                'borderRadius': '4px',
                '&:hover': {
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.3)'
                    : 'rgba(0, 0, 0, 0.3)',
                },
              },
              'scrollbarWidth': 'thin',
              'scrollbarColor': theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2) transparent'
                : 'rgba(0, 0, 0, 0.2) transparent',
              'scrollbarGutter': 'unset',
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                pb: { xs: 2, sm: 3 },
              }}
            >
              <GlobalTopbar />
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 1400,
                  mx: 'auto',
                  pt: { xs: 8, lg: 0 },
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </GlobalTopbarContentProvider>
      </BreadcrumbProvider>
    </Box>
  );
}
