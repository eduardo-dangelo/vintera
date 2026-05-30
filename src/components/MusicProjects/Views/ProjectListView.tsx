'use client';

import type { MusicProjectListItem } from '@/queries/hooks/music-projects/useMusicProjects';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MusicListTable } from './MusicListTable';

type ProjectListViewProps = {
  projects: MusicProjectListItem[];
  locale: string;
};

function buildProjectSubtitle(
  project: MusicProjectListItem,
  t: ReturnType<typeof useTranslations<'MusicProjects'>>,
) {
  if (project.genre) {
    return `Project • ${project.genre}`;
  }
  return `Project • ${t('album_count', { count: project.albumCount })}, ${t('song_count', { count: project.songCount })}`;
}

export function ProjectListView({ projects, locale }: ProjectListViewProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();

  return (
    <MusicListTable
      rows={projects.map(project => ({
        id: project.id,
        coverImageUrl: project.coverImageUrl,
        coverType: 'project' as const,
        title: project.name,
        subtitle: buildProjectSubtitle(project, t),
        trailing: format(new Date(project.updatedAt), 'MMM d, yyyy'),
        onClick: () => router.push(`/${locale}/projects/${project.id}`),
      }))}
    />
  );
}
