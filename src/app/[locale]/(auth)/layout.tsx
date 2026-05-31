import { ClerkProvider } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ConditionalSidebar } from '@/components/ConditionalSidebar';
import { DevCronScheduler } from '@/components/DevCronScheduler';
import { Sidebar } from '@/components/Sidebar';
import { routing } from '@/libs/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';

const DRAWER_WIDTH = 280;

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale] ?? ClerkLocalizations.defaultLocale;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let projectsUrl = '/projects';
  let afterSignOutUrl = '/';

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    projectsUrl = `/${locale}${projectsUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk',
      }}
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={projectsUrl}
      signUpFallbackRedirectUrl={projectsUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      <DevCronScheduler />
      <ConditionalSidebar
        sidebarContent={(
          <Sidebar
            drawerWidth={DRAWER_WIDTH}
            signOutLabel={t('sign_out')}
            sectionLabels={{
              projects: t('sidebar_projects'),
              songs: t('sidebar_songs'),
              albums: t('sidebar_albums'),
              viewAll: t('sidebar_view_all'),
            }}
          >
            {props.children}
          </Sidebar>
        )}
      >
        {props.children}
      </ConditionalSidebar>
    </ClerkProvider>
  );
}
