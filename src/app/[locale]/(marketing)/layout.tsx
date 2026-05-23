import { setRequestLocale } from 'next-intl/server';
import { MarketingThemeProvider } from '@/components/landingPage/MarketingThemeProvider';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <MarketingThemeProvider>
      {props.children}
    </MarketingThemeProvider>
  );
}
