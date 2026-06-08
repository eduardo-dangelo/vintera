'use client';

import type { ProjectTabName } from './tabs/ProjectOverviewTab';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import {
  Album as AlbumIcon,
  Dashboard as DashboardIcon,
  MusicNote as SongIcon,
} from '@mui/icons-material';
import { Box, Tab, Tabs, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { ProjectAlbumsTab } from './tabs/ProjectAlbumsTab';
import { ProjectOverviewTab } from './tabs/ProjectOverviewTab';
import { ProjectSongsTab } from './tabs/ProjectSongsTab';
import { getVisibleTabs } from './tabs/projectTabVisibility';

type ProjectDetailTabsProps = {
  locale: string;
  projectId: number;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
};

function getTabIcon(tabName: ProjectTabName) {
  const iconSx = { fontSize: 18 };
  switch (tabName) {
    case 'overview':
      return <DashboardIcon sx={iconSx} />;
    case 'songs':
      return <SongIcon sx={iconSx} />;
    case 'albums':
      return <AlbumIcon sx={iconSx} />;
    default:
      return <DashboardIcon sx={iconSx} />;
  }
}

function TabLabel({ tabName, label }: { tabName: ProjectTabName; label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        component="span"
        sx={{
          'display': 'inline-flex',
          'lineHeight': 0,
          'color': 'text.secondary',
          'WebkitTextFillColor': 'initial',
          '.Mui-selected &': {
            color: 'primary.main',
            WebkitTextFillColor: 'initial',
          },
        }}
      >
        {getTabIcon(tabName)}
      </Box>
      <Box component="span">{label}</Box>
    </Box>
  );
}

export function ProjectDetailTabs({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit,
}: ProjectDetailTabsProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const visibleTabs = useMemo(
    () => getVisibleTabs(albums.length, songs.length),
    [albums.length, songs.length],
  );

  const tabFromUrl = searchParams.get('tab');
  const currentTabIndex = visibleTabs.includes(tabFromUrl as ProjectTabName)
    ? visibleTabs.indexOf(tabFromUrl as ProjectTabName)
    : 0;

  const updateUrlForTab = useCallback(
    (tabName: ProjectTabName | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tabName) {
        params.set('tab', tabName);
      } else {
        params.delete('tab');
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (visibleTabs.length === 0) {
      if (searchParams.has('tab')) {
        updateUrlForTab(null);
      }
      return;
    }

    const tab = searchParams.get('tab');
    if (!tab || !visibleTabs.includes(tab as ProjectTabName)) {
      updateUrlForTab(visibleTabs[0] ?? 'overview');
    }
  }, [searchParams, updateUrlForTab, visibleTabs]);

  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: number) => {
    const tabName = visibleTabs[newValue];
    if (tabName) {
      updateUrlForTab(tabName);
    }
  };

  const activeTab = visibleTabs[currentTabIndex] ?? 'overview';

  const renderTabContent = (tabName: ProjectTabName) => {
    switch (tabName) {
      case 'overview':
        return (
          <ProjectOverviewTab
            locale={locale}
            projectId={projectId}
            project={project}
            albums={albums}
            songs={songs}
            onNavigateToTab={updateUrlForTab}
          />
        );
      case 'songs':
        return (
          <ProjectSongsTab
            locale={locale}
            projectId={projectId}
            project={project}
            songs={songs}
            albums={albums}
          />
        );
      case 'albums':
        return (
          <ProjectAlbumsTab
            locale={locale}
            projectId={projectId}
            project={project}
            albums={albums}
            songs={songs}
            canEdit={canEdit}
          />
        );
      default:
        return null;
    }
  };

  if (visibleTabs.length === 0) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <ProjectAlbumsTab
            locale={locale}
            projectId={projectId}
            project={project}
            albums={albums}
            songs={songs}
            canEdit={canEdit}
          />
        </Box>
        <ProjectSongsTab
          locale={locale}
          projectId={projectId}
          project={project}
          songs={songs}
          albums={albums}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={currentTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.938rem',
              fontWeight: 500,
              minHeight: 48,
            },
            '& .MuiTab-root.Mui-selected .MuiSvgIcon-root': {
              WebkitTextFillColor: 'currentColor',
              color: theme.palette.primary.main,
            },
            '& .MuiTab-root:not(.Mui-selected) .MuiSvgIcon-root': {
              WebkitTextFillColor: 'currentColor',
              color: theme.palette.text.secondary,
            },
          }}
        >
          {visibleTabs.map(tabName => (
            <Tab
              key={tabName}
              label={<TabLabel tabName={tabName} label={t(`tabs_${tabName}` as 'tabs_overview')} />}
            />
          ))}
        </Tabs>
      </Box>

      {renderTabContent(activeTab)}
    </Box>
  );
}
