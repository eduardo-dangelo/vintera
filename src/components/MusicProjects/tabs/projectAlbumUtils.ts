import type { ProjectTabProject } from './projectSongUtils';
import type { AlbumListItem } from '@/queries/hooks/albums';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';

export function toAlbumListItem(
  album: MusicProjectDetail['albums'][number],
  project: ProjectTabProject,
  songs: MusicProjectDetail['songs'],
): AlbumListItem {
  return {
    id: album.id,
    name: album.name,
    musicProjectId: album.musicProjectId,
    updatedAt: new Date(album.updatedAt),
    coverImageUrl: album.coverImageUrl,
    projectName: project.name,
    projectColor: project.color,
    songCount: songs.filter(s => s.albumId === album.id).length,
  };
}
