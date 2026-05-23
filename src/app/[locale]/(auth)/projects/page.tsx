import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProjectsClient } from './ProjectsClient';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('meta_title') };
}

export default async function ProjectsPage(props: PageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ProjectsClient locale={locale} />;
}
