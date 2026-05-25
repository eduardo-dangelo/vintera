import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AlbumDetailClient } from './AlbumDetailClient';

type PageProps = {
  params: Promise<{ locale: string; albumId: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('album_detail_title') };
}

export default async function AlbumDetailPage(props: PageProps) {
  const { locale, albumId: albumIdStr } = await props.params;
  setRequestLocale(locale);

  const albumId = Number.parseInt(albumIdStr, 10);
  if (Number.isNaN(albumId)) {
    return null;
  }

  return <AlbumDetailClient locale={locale} albumId={albumId} />;
}
