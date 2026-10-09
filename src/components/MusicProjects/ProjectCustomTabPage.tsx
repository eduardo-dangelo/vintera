'use client';

import type { JSONContent } from '@tiptap/core';
import type { ProjectTabName } from '@/components/MusicProjects/tabs/projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { useTranslations } from 'next-intl';
import { MainPageEditor } from '@/components/MusicProjects/MainPageEditor';

type ProjectCustomTabPageProps = {
  locale: string;
  projectId: number;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
  page: JSONContent;
  onChange: (page: JSONContent) => void;
  onFlush: () => void;
  onNavigateToTab?: (tab: ProjectTabName) => void;
};

export function ProjectCustomTabPage({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit,
  page,
  onChange,
  onFlush,
  onNavigateToTab,
}: ProjectCustomTabPageProps) {
  const t = useTranslations('MusicProjects');

  return (
    <MainPageEditor
      value={page}
      onChange={onChange}
      onFocusChange={(focused) => {
        if (!focused) {
          onFlush();
        }
      }}
      locale={locale}
      projectId={projectId}
      accent={project.color || '#7c3aed'}
      project={project}
      albums={albums}
      songs={songs}
      canEdit={canEdit}
      onNavigateToTab={onNavigateToTab}
      placeholder={t('custom_page_placeholder')}
    />
  );
}
