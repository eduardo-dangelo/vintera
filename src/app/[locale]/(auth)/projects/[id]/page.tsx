import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProjectDetailClient } from './ProjectDetailClient';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  return { title: t('meta_title') };
}

export default async function ProjectDetailPage(props: PageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const projectId = Number.parseInt(id, 10);

  return <ProjectDetailClient locale={locale} projectId={projectId} />;
}
