import { Box } from '@mui/material';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ShareLightCard } from '@/components/Share/ShareLightCard';
import { ShareService } from '@/services/shareService';
import { getSharePageHref, parseShareKind } from '@/utils/shareUrls';

type EmbedPageProps = {
  params: Promise<{ locale: string; kind: string; id: string }>;
};

export default async function EmbedPage(props: EmbedPageProps) {
  const { locale, kind: kindStr, id: idStr } = await props.params;
  setRequestLocale(locale);

  const kind = parseShareKind(kindStr);
  const id = Number.parseInt(idStr, 10);
  if (!kind || Number.isNaN(id) || id < 1) {
    notFound();
  }

  const teaser = await ShareService.getTeaser(kind, id);
  if (!teaser) {
    notFound();
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        p: 0.75,
      }}
    >
      <ShareLightCard
        kind={teaser.kind}
        name={teaser.name}
        coverImageUrl={teaser.coverImageUrl}
        color={teaser.color}
        mode="embed"
        openHref={getSharePageHref(locale, kind, id)}
      />
    </Box>
  );
}
