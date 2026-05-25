import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SongsClient } from './SongsClient';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('songs_page_title') };
}

export default async function SongsPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <SongsClient locale={locale} />;
}
