import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AlbumDetailClient } from '@/app/[locale]/(auth)/albums/[albumId]/AlbumDetailClient';
import { AlbumService } from '@/services/albumService';

type PageProps = {
  params: Promise<{ locale: string; id: string; albumId: string }>;
};

export default async function ProjectAlbumDetailPage(props: PageProps) {
  const { locale, id, albumId: albumIdStr } = await props.params;
  setRequestLocale(locale);

  const projectId = Number.parseInt(id, 10);
  const albumId = Number.parseInt(albumIdStr, 10);
  if (Number.isNaN(projectId) || Number.isNaN(albumId)) {
    notFound();
  }

  const { userId } = await auth();
  if (!userId) {
    notFound();
  }

  const album = await AlbumService.getAlbumById(albumId, projectId, userId);
  if (!album) {
    notFound();
  }

  return (
    <AlbumDetailClient
      locale={locale}
      albumId={albumId}
      breadcrumbProjectId={projectId}
    />
  );
}
