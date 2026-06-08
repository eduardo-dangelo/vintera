import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import type { SongListItem } from '@/queries/hooks/songs';

export type ProjectTabProject = Pick<
  MusicProjectDetail['project'],
  'name' | 'color' | 'coverImageUrl'
>;

export function toFallbackSongListItem(
  song: MusicProjectDetail['songs'][number],
  projectId: number,
  project: ProjectTabProject,
  albums: MusicProjectDetail['albums'],
): SongListItem {
  const album = albums.find(a => a.id === song.albumId);
  return {
    id: song.id,
    title: song.title,
    musicProjectId: projectId,
    albumId: song.albumId,
    updatedAt: new Date(song.updatedAt),
    projectName: project.name,
    projectColor: project.color,
    albumName: album?.name ?? null,
    coverImageUrl: album?.coverImageUrl ?? project.coverImageUrl,
    authors: [],
  };
}
