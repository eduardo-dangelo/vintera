'use client';

import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { ProjectSongsTab } from './tabs/ProjectSongsTab';

type ProjectDetailSongsSectionProps = {
  locale: string;
  projectId: number;
  project: Pick<MusicProjectDetail['project'], 'name' | 'color' | 'coverImageUrl'>;
  songs: MusicProjectDetail['songs'];
  albums: MusicProjectDetail['albums'];
};

export function ProjectDetailSongsSection(props: ProjectDetailSongsSectionProps) {
  return <ProjectSongsTab {...props} />;
}
