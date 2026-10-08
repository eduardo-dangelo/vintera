'use client';

import type { ProjectTabName } from './projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { ProjectDetailMain } from '../ProjectDetailMain';

export type { ProjectTabName } from './projectTabVisibility';

type ProjectOverviewTabProps = {
  locale: string;
  projectId: number;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit?: boolean;
  onNavigateToTab: (tab: ProjectTabName) => void;
};

/** Thin wrapper: overview content is the customizable main section list. */
export function ProjectOverviewTab({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit = false,
  onNavigateToTab,
}: ProjectOverviewTabProps) {
  return (
    <ProjectDetailMain
      locale={locale}
      projectId={projectId}
      project={project}
      albums={albums}
      songs={songs}
      canEdit={canEdit}
      onNavigateToTab={onNavigateToTab}
    />
  );
}
