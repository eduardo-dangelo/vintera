import { auth } from '@clerk/nextjs/server';
import { Box } from '@mui/material';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { ShareLightCard } from '@/components/Share/ShareLightCard';
import { ShareService } from '@/services/shareService';
import { getShareItemHref, parseShareKind } from '@/utils/shareUrls';

type SharePageProps = {
  params: Promise<{ locale: string; kind: string; id: string }>;
};

export default async function SharePage(props: SharePageProps) {
  const { locale, kind: kindStr, id: idStr } = await props.params;
  setRequestLocale(locale);

  const kind = parseShareKind(kindStr);
  const id = Number.parseInt(idStr, 10);
  if (!kind || Number.isNaN(id) || id < 1) {
    notFound();
  }

  const itemHref = getShareItemHref(locale, kind, id);
  const { userId } = await auth();
  if (userId) {
    redirect(itemHref);
  }

  const teaser = await ShareService.getTeaser(kind, id);
  if (!teaser) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'MusicProjects' });
  const redirectParam = encodeURIComponent(itemHref);
  const signInHref = `/${locale}/sign-in?redirect_url=${redirectParam}`;
  const signUpHref = `/${locale}/sign-up?redirect_url=${redirectParam}`;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        <ShareLightCard
          kind={teaser.kind}
          name={teaser.name}
          coverImageUrl={teaser.coverImageUrl}
          color={teaser.color}
          mode="page"
          signInHref={signInHref}
          signUpHref={signUpHref}
        />
        <Box
          component="p"
          sx={{
            mt: 2,
            textAlign: 'center',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            m: 0,
            pt: 2,
          }}
        >
          {t('share_guest_prompt')}
        </Box>
      </Box>
    </Box>
  );
}
