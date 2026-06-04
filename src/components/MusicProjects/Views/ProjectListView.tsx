'use client';

import type { MusicProjectListItem } from '@/queries/hooks/music-projects/useMusicProjects';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MusicPeopleAvatarGroup } from '@/components/MusicProjects/MusicPeopleAvatarGroup';
import { MusicStatBadge } from '@/components/MusicProjects/MusicStatBadge';
import { resolveProjectTitleFontFamily } from '@/utils/musicProjectMetadata';
import { MusicListTable } from './MusicListTable';

type ProjectListViewProps = {
  projects: MusicProjectListItem[];
  locale: string;
};

function buildProjectSubtitle(project: MusicProjectListItem) {
  if (project.genre) {
    return `Project • ${project.genre}`;
  }
  return 'Project';
}

export function ProjectListView({ projects, locale }: ProjectListViewProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();

  return (
    <MusicListTable
      locale={locale}
      rows={projects.map(project => ({
        id: project.id,
        coverImageUrl: project.coverImageUrl,
        coverType: 'project' as const,
        title: project.name,
        titleFontFamily: resolveProjectTitleFontFamily(project.metadata),
        subtitle: buildProjectSubtitle(project),
        menuTarget: {
          kind: 'project',
          id: project.id,
          href: `/${locale}/projects/${project.id}`,
        },
        statPrimary: (
          <MusicStatBadge
            count={project.albumCount}
            label={t('albums_stat_label')}
            compact
          />
        ),
        statSecondary: (
          <MusicStatBadge
            count={project.songCount}
            label={t('songs_stat_label')}
            compact
          />
        ),
        meta: <MusicPeopleAvatarGroup people={project.members} size={22} />,
        trailing: format(new Date(project.updatedAt), 'MMM d, yyyy'),
        onClick: () => router.push(`/${locale}/projects/${project.id}`),
      }))}
    />
  );
}
