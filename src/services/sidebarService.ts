import { AlbumService } from '@/services/albumService';
import { MusicProjectService } from '@/services/musicProjectService';
import { SongService } from '@/services/songService';

export type SidebarRecents = {
  projects: Array<{
    id: number;
    name: string;
    slug: string;
    color: string | null;
    updatedAt: Date;
  }>;
  songs: Array<{
    id: number;
    title: string;
    musicProjectId: number;
    projectName: string;
    updatedAt: Date;
  }>;
  albums: Array<{
    id: number;
    name: string;
    musicProjectId: number;
    projectName: string;
    updatedAt: Date;
  }>;
};

export class SidebarService {
  static async getRecents(userId: string, limit = 5): Promise<SidebarRecents> {
    const [projects, songs, albums] = await Promise.all([
      MusicProjectService.getRecentProjectsByUserId(userId, limit),
      SongService.getRecentSongsByUserId(userId, limit),
      AlbumService.getRecentAlbumsByUserId(userId, limit),
    ]);

    return { projects, songs, albums };
  }
}
