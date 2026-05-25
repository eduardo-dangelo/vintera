import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SongDetailClient } from './SongDetailClient';

type PageProps = {
  params: Promise<{ locale: string; songId: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('song_detail_title') };
}

export default async function SongDetailPage(props: PageProps) {
  const { locale, songId: songIdStr } = await props.params;
  setRequestLocale(locale);

  const songId = Number.parseInt(songIdStr, 10);
  if (Number.isNaN(songId)) {
    return null;
  }

  return <SongDetailClient locale={locale} songId={songId} />;
}
