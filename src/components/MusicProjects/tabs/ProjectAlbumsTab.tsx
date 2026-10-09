'use client';

import type { ProjectTabProject } from './projectSongUtils';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { PageCollection } from '@/utils/projectMainPage';
import QueueMusic from '@mui/icons-material/QueueMusic';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { SongCard } from '@/components/MusicProjects/SongCard';
import { OVERVIEW_PREVIEW_LIMIT } from '@/components/MusicProjects/tabs/projectTabVisibility';
import { sortByRecent, takeRecent } from '@/components/MusicProjects/tabs/recentItems';
import { SongListView } from '@/components/MusicProjects/Views/SongListView';
import { toFallbackSongListItem } from './projectSongUtils';

type ProjectAlbumsTabProps = {
  locale: string;
  projectId: number;
  project: ProjectTabProject;
  songs: MusicProjectDetail['songs'];
  albums: MusicProjectDetail['albums'];
  collections: PageCollection[];
};

export function ProjectAlbumsTab({
  locale,
  projectId,
  project,
  songs,
  albums,
  collections,
}: ProjectAlbumsTabProps) {
  const t = useTranslations('MusicProjects');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {collections.map((collection) => {
        const source = collection.mode === 'recent'
          ? takeRecent(sortByRecent(songs, song => song.updatedAt), OVERVIEW_PREVIEW_LIMIT)
          : collection.itemIds.flatMap((id) => {
              const song = songs.find(item => item.id === id);
              return song ? [song] : [];
            });
        const items = source.map(song => toFallbackSongListItem(song, projectId, project, albums));
        const title = collection.mode === 'recent'
          ? t('overview_recent_songs')
          : (collection.title.trim() || t('page_song_list'));
        const key = `${collection.mode}:${title}:${collection.itemIds.join(',')}`;
        return (
          <Box key={key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
              <QueueMusic sx={{ fontSize: 22, color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Box>
            {items.length === 0
              ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('no_songs')}
                  </Typography>
                )
              : collection.view === 'card'
                ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
                      {items.map(song => (
                        <SongCard
                          key={song.id}
                          song={song}
                          locale={locale}
                          projectId={projectId}
                          cardSize="small"
                        />
                      ))}
                    </Box>
                  )
                : (
                    <SongListView songs={items} locale={locale} projectId={projectId} />
                  )}
          </Box>
        );
      })}
    </Box>
  );
}
