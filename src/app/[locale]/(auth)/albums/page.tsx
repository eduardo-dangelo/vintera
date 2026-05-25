import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AlbumsClient } from './AlbumsClient';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('albums_page_title') };
}

export default async function AlbumsPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AlbumsClient locale={locale} />;
}
