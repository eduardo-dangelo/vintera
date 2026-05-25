import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SongDetailClient } from '@/app/[locale]/(auth)/songs/[songId]/SongDetailClient';
import { SongService } from '@/services/songService';

type PageProps = {
  params: Promise<{ locale: string; id: string; songId: string }>;
};

export default async function ProjectSongDetailPage(props: PageProps) {
  const { locale, id, songId: songIdStr } = await props.params;
  setRequestLocale(locale);

  const projectId = Number.parseInt(id, 10);
  const songId = Number.parseInt(songIdStr, 10);
  if (Number.isNaN(projectId) || Number.isNaN(songId)) {
    notFound();
  }

  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const song = await SongService.getSongById(songId, projectId, userId);
  if (!song) {
    notFound();
  }

  return (
    <SongDetailClient
      locale={locale}
      songId={songId}
      breadcrumbProjectId={projectId}
    />
  );
}
