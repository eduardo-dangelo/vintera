'use client';

import type { ReactNode } from 'react';
import type { MusicItemKind, MusicItemMenuTarget } from './MusicProjects/musicItemMenuTypes';
import { SignOutButton } from '@clerk/nextjs';
import {
  ExpandMore as ExpandMoreIcon,
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
import { discreetScrollbarStyles } from '@/utils/discreetScrollbarStyles';
import { globalTopbarGlassSx } from '@/utils/glassPaperStyles';
import { BreadcrumbProvider } from './BreadcrumbContext';
import { GlobalTopbar } from './GlobalTopbar';
import { GlobalTopbarContentProvider } from './GlobalTopbarContentContext';
import { Logo } from './Logo';
import { GradientIcon } from './MusicProjects/GradientIcon';
import { MusicCoverImage } from './MusicProjects/MusicCoverImage';
import { MusicItemActionsButton } from './MusicProjects/MusicItemActionsButton';
import { SidebarNewButton } from './MusicProjects/SidebarNewButton';
import { useMusicItemContextMenu } from './MusicProjects/useMusicItemContextMenu';
import { SidebarRecentsSkeleton } from './SidebarRecentsSkeleton';
import { TopbarActions } from './TopbarActions';

type SidebarItem = {
  key: string;
  href: string;
  label: string;
  name: string;
  icon: React.ComponentType<{ sx?: object }>;
  kind: MusicItemKind;
  id: number;
  coverImageUrl?: string | null;
};

const SIDEBAR_PREVIEW_LIMIT = 5;

type SidebarSectionProps = {
  title: string;
  listHref?: string;
  viewMoreLabel?: string;
  viewLessLabel?: string;
  items: SidebarItem[];
  showAll: boolean;
  canToggleShowAll: boolean;
  onToggleShowAll: () => void;
  isActive: (href: string) => boolean;
  onItemClick: (href: string) => void;
  onItemHover: (href: string | null) => void;
  onItemContextMenu: (event: React.MouseEvent, item: SidebarItem) => void;
  onOpenActions: (event: React.MouseEvent<HTMLElement>, target: MusicItemMenuTarget) => void;
  openMenuTarget: MusicItemMenuTarget | null;
};

function SidebarSection({
  title,
  listHref,
  viewMoreLabel,
  viewLessLabel,
  items,
  showAll,
  canToggleShowAll,
  onToggleShowAll,
  isActive,
  onItemClick,
  onItemHover,
  onItemContextMenu,
  onOpenActions,
  openMenuTarget,
}: SidebarSectionProps) {
  const theme = useTheme();
  const { playHoverSound } = useHoverSound();
  const [expanded, setExpanded] = useState(true);

  const menuItemIconColor = 'rgba(200, 200, 210, 0.9)';

  const rowSx = (active: boolean) => ({
    borderRadius: 1,
    color: active ? theme.palette.sidebar.textPrimary : theme.palette.sidebar.textSecondary,
    bgcolor: active ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
    pl: 1,
    pr: 3.25,
    py: 0.25,
    minHeight: 28,
    transition: 'background-color 0.15s ease-in-out, color 0.15s ease-in-out',
  });

  const rowHoverSx = (active: boolean) => ({
    'bgcolor': 'rgba(255, 255, 255, 0.06)',
    'color': theme.palette.sidebar.textPrimary,
    '& .MuiListItemIcon-root svg': {
      ...(active ? {} : { color: 'rgba(244, 244, 245, 0.95)' }),
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
          color: theme.palette.sidebar.textSecondary,
        }}
      >
        {listHref
          ? (
              <Typography
                component={Link}
                href={listHref}
                variant="caption"
                onMouseEnter={playHoverSound}
                sx={{
                  'fontWeight': 500,
                  'color': 'inherit',
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
                  color: 'inherit',
                  fontSize: '0.6875rem',
                }}
              >
                {title}
              </Typography>
            )}
        <IconButton
          size="small"
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
          onMouseEnter={playHoverSound}
          onClick={() => setExpanded(prev => !prev)}
          sx={{
            'height': 20,
            'width': 20,
            'p': 0,
            'borderRadius': 1,
            'color': 'inherit',
            'bgcolor': 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              color: theme.palette.sidebar.textPrimary,
            },
          }}
        >
          <ExpandMoreIcon
            sx={{
              fontSize: 16,
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </IconButton>
      </Box>

      <List disablePadding>
        <TransitionGroup component={null}>
          {expanded
            && items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const menuTarget: MusicItemMenuTarget = {
                kind: item.kind,
                id: item.id,
                href: item.href,
                name: item.name,
              };
              const actionsOpen = openMenuTarget?.kind === item.kind
                && openMenuTarget.id === item.id;

              return (
                <Collapse key={item.key} timeout={200}>
                  <ListItem
                    disablePadding
                    onMouseEnter={() => {
                      playHoverSound();
                      onItemHover(item.href);
                    }}
                    onMouseLeave={() => onItemHover(null)}
                    sx={{
                      'mb': 0.125,
                      'position': 'relative',
                      // Keep row hover while pointer is over MoreHoriz (sibling of the button)
                      // or while that row's actions menu is open.
                      '&:hover .MuiListItemButton-root, &:has([data-sidebar-actions][data-open="true"]) .MuiListItemButton-root':
                        rowHoverSx(active),
                      '&:hover [data-sidebar-actions], & [data-sidebar-actions][data-open="true"]': {
                        opacity: 1,
                        pointerEvents: 'auto',
                      },
                    }}
                  >
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={() => onItemClick(item.href)}
                      onContextMenu={e => onItemContextMenu(e, item)}
                      sx={rowSx(active)}
                    >
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        {item.kind === 'project' && item.coverImageUrl
                          ? (
                              <MusicCoverImage
                                imageUrl={item.coverImageUrl}
                                type="project"
                                size={16}
                              />
                            )
                          : active
                            ? (
                                <GradientIcon
                                  kind={item.kind}
                                  fontSize={16}
                                  sx={{ display: 'block' }}
                                />
                              )
                            : (
                                <Icon
                                  sx={{
                                    fontSize: 16,
                                    color: menuItemIconColor,
                                  }}
                                />
                              )}
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
                    <Box
                      data-sidebar-actions=""
                      data-open={actionsOpen ? 'true' : undefined}
                      sx={{
                        position: 'absolute',
                        right: 5,
                        top: 2,
                        // transform: 'translateY(-50%)',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity 0.15s ease',
                        zIndex: 1,
                      }}
                    >
                      <MusicItemActionsButton
                        target={menuTarget}
                        onOpen={onOpenActions}
                        sx={{
                          'color': theme.palette.sidebar.textSecondary,
                          'p': 0.125,
                          'height': 20,
                          'width': 20,
                          'borderRadius': 1,
                          '&:hover': {
                            color: theme.palette.sidebar.textPrimary,
                            bgcolor: 'rgba(255, 255, 255, 0.08)',
                          },
                          '& .MuiSvgIcon-root': { fontSize: 14 },
                        }}
                      />
                    </Box>
                  </ListItem>
                </Collapse>
              );
            })}
          {expanded && canToggleShowAll && viewMoreLabel && viewLessLabel && (
            <Collapse key="view-more" timeout={200}>
              <ListItem disablePadding sx={{ mb: 0.125 }}>
                <ListItemButton
                  onMouseEnter={playHoverSound}
                  onClick={onToggleShowAll}
                  sx={{
                    ...rowSx(false),
                    ...{
                      'color': theme.palette.sidebar.textSecondary,
                      'pr': 1,
                      '&:hover': rowHoverSx(false),
                    },
                  }}
                >
                  <ListItemText
                    primary={`... ${showAll ? viewLessLabel : viewMoreLabel}`}
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
          )}
        </TransitionGroup>
      </List>
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
    viewLess: string;
  };
};

function mapProjectItems(
  projects: Array<{
    id: number;
    name: string;
    coverImageUrl?: string | null;
  }> | undefined,
  locale: string,
): SidebarItem[] {
  return projects?.map(project => ({
    key: `project-${project.id}`,
    href: `/${locale}/projects/${project.id}`,
    label: project.name,
    name: project.name,
    icon: LibraryMusicIcon,
    kind: 'project' as const,
    id: project.id,
    coverImageUrl: project.coverImageUrl,
  })) ?? [];
}

function mapSongItems(
  songs: Array<{
    id: number;
    title: string;
    projectName: string | null;
  }> | undefined,
  locale: string,
): SidebarItem[] {
  return songs?.map(song => ({
    key: `song-${song.id}`,
    href: `/${locale}/songs/${song.id}`,
    label: song.projectName ? `${song.title} (${song.projectName})` : song.title,
    name: song.title,
    icon: MusicNoteIcon,
    kind: 'song' as const,
    id: song.id,
  })) ?? [];
}

export function Sidebar({
  children,
  drawerWidth,
  signOutLabel,
  sectionLabels,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [clickedHref, setClickedHref] = useState<string | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const pathname = usePathname();
  const { playHoverSound } = useHoverSound();

  const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] ?? 'en';
  const { data: recentsData, isPending: isRecentsLoading } = useGetSidebarRecents(locale, {
    limit: SIDEBAR_PREVIEW_LIMIT,
  });
  const needsAllRecents = showAllProjects || showAllSongs;
  const { data: allRecentsData } = useGetSidebarRecents(locale, {
    limit: 'all',
    enabled: needsAllRecents,
  });
  const {
    openFromButton,
    openFromContextMenu,
    renderMenus,
    menuTarget: openMenuTarget,
  } = useMusicItemContextMenu(locale);

  const handleItemContextMenu = (event: React.MouseEvent, item: SidebarItem) => {
    openFromContextMenu(event, {
      kind: item.kind,
      id: item.id,
      href: item.href,
      name: item.name,
    });
  };

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

  const projectPreviewItems = mapProjectItems(recentsData?.projects, locale);
  const songPreviewItems = mapSongItems(recentsData?.songs, locale);

  const projectAllItems = mapProjectItems(allRecentsData?.projects, locale);
  const songAllItems = mapSongItems(allRecentsData?.songs, locale);

  const projectItems = showAllProjects && projectAllItems.length > 0
    ? projectAllItems
    : projectPreviewItems;
  const songItems = showAllSongs && songAllItems.length > 0
    ? songAllItems
    : songPreviewItems;

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

      <Box sx={{ px: 1.25, py: 1.25, mt: isMobile ? 6 : 0 }}>
        <SidebarNewButton locale={locale} />
      </Box>

      <Box
        sx={theme => ({
          flexGrow: 1,
          px: 1.25,
          py: isMobile ? 1 : 0,
          overflowY: 'auto',
          mt: 1.25,
          ...discreetScrollbarStyles({ onDarkSurface: true })(theme),
        })}
      >
        {isRecentsLoading && <SidebarRecentsSkeleton />}

        {!isRecentsLoading && projectPreviewItems.length > 0 && (
          <SidebarSection
            title={sectionLabels.projects}
            listHref={`/${locale}/projects`}
            viewMoreLabel={sectionLabels.viewAll}
            viewLessLabel={sectionLabels.viewLess}
            items={projectItems}
            showAll={showAllProjects}
            canToggleShowAll={
              projectPreviewItems.length >= SIDEBAR_PREVIEW_LIMIT || showAllProjects
            }
            onToggleShowAll={() => setShowAllProjects(prev => !prev)}
            isActive={isActive}
            onItemClick={setClickedHref}
            onItemHover={() => {}}
            onItemContextMenu={handleItemContextMenu}
            onOpenActions={openFromButton}
            openMenuTarget={openMenuTarget}
          />
        )}

        {!isRecentsLoading && songPreviewItems.length > 0 && (
          <SidebarSection
            title={sectionLabels.songs}
            listHref={`/${locale}/songs`}
            viewMoreLabel={sectionLabels.viewAll}
            viewLessLabel={sectionLabels.viewLess}
            items={songItems}
            showAll={showAllSongs}
            canToggleShowAll={
              songPreviewItems.length >= SIDEBAR_PREVIEW_LIMIT || showAllSongs
            }
            onToggleShowAll={() => setShowAllSongs(prev => !prev)}
            isActive={isActive}
            onItemClick={setClickedHref}
            onItemHover={() => {}}
            onItemContextMenu={handleItemContextMenu}
            onOpenActions={openFromButton}
            openMenuTarget={openMenuTarget}
          />
        )}

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
      {renderMenus()}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            ...(mobileOpen ? { bgcolor: 'transparent' } : globalTopbarGlassSx(theme)),
            display: { xs: 'block', lg: 'none' },
            zIndex: theme => theme.zIndex.drawer + 1,
            transition: 'background-color 0.3s ease',
            ...(mobileOpen ? { backdropFilter: 'none', WebkitBackdropFilter: 'none' } : {}),
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
                    ? theme.palette.sidebar.textPrimary
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
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
              bgcolor: 'background.default',
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
