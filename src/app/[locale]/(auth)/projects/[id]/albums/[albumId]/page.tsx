import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ locale: string; id: string; albumId: string }>;
};

export default async function ProjectAlbumDetailPage(props: PageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);

  const projectId = Number.parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    notFound();
  }

  redirect(`/${locale}/projects/${projectId}?tab=albums`);
}
