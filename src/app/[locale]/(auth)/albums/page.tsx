import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('tabs_albums') };
}

export default async function AlbumsPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  redirect(`/${locale}/projects`);
}
