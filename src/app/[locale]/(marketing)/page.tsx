import type { Metadata } from 'next';
import { Box } from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  Footer,
  Hero,
  Navigation,
} from '@/components/landingPage';

type IIndexProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IIndexProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IIndexProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation />
      <Hero />
      <Footer />
    </Box>
  );
};
