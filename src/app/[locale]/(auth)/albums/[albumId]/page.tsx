import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AlbumService } from '@/services/albumService';

type PageProps = {
  params: Promise<{ locale: string; albumId: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('tabs_albums') };
}

export default async function AlbumDetailPage(props: PageProps) {
  const { locale, albumId: albumIdStr } = await props.params;
  setRequestLocale(locale);

  const albumId = Number.parseInt(albumIdStr, 10);
  const { userId } = await auth();
  if (userId && !Number.isNaN(albumId)) {
    const album = await AlbumService.getAlbumByIdForUser(albumId, userId);
    if (album?.project.id) {
      redirect(`/${locale}/projects/${album.project.id}?tab=albums`);
    }
  }

  redirect(`/${locale}/projects`);
}
