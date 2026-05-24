import { setRequestLocale } from 'next-intl/server';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <AuthPageLayout>
      {props.children}
    </AuthPageLayout>
  );
}
