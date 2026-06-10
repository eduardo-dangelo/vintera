'use client';

import type { HeroBackgroundPreset } from '@/components/MusicProjects/heroBackgroundPresets';
import type { AlbumDetail, AlbumProjectSummary } from '@/queries/hooks/albums/useAlbum';
import type { HeroBackgroundOverrides, MusicProjectMetadata } from '@/utils/musicProjectMetadata';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { resolveProjectHeaderTextColor } from '@/components/MusicProjects/headerTextColors';
import {
  applyHeroPresetRecipe,
  resolveHeroBackground,
} from '@/components/MusicProjects/heroBackgroundPresets';
import { MusicDetailPageHeader } from '@/components/MusicProjects/MusicDetailPageHeader';
import { MusicStatBadge, MusicStatBadgeRow } from '@/components/MusicProjects/MusicStatBadge';
import { getProjectDetailGlassPanelSx } from '@/components/MusicProjects/projectDetailPageHeaderStyles';
import { ProjectHeroBackgroundPicker } from '@/components/MusicProjects/ProjectHeroBackgroundPicker';
import { useUpdateAlbumById } from '@/queries/hooks/albums/useUpdateAlbumById';
import {
  mergeEntityHeroMetadata,
  resolveAlbumCoverImageUrl,
  resolveInheritedTitleFontFamily,
} from '@/utils/musicEntityHeroMetadata';
import {
  buildHeroBackgroundMetadataPatch,
  mergeHeroBackgroundOverrides,
  mergeMusicProjectMetadata,
  parseMusicProjectMetadata,
} from '@/utils/musicProjectMetadata';

type AlbumDetailPageHeaderProps = {
  locale: string;
  albumId: number;
  album: AlbumDetail;
  project: AlbumProjectSummary;
  songCount: number;
  readOnly?: boolean;
};

async function uploadAlbumImage(
  locale: string,
  albumId: number,
  file: File,
  type: 'logo' | 'hero',
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch(`/${locale}/api/albums/${albumId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload image');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

export function AlbumDetailPageHeader({
  locale,
  albumId,
  album,
  project,
  songCount,
  readOnly = false,
}: AlbumDetailPageHeaderProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const updateAlbum = useUpdateAlbumById(locale);

  const [optimisticEntityMetadata, setOptimisticEntityMetadata] = useState<MusicProjectMetadata | null>(null);
  const [heroPickerAnchor, setHeroPickerAnchor] = useState<null | HTMLElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const entityMetadataRaw = album.metadata;
  const projectMetadata = project.metadata;

  const pendingEntityMetadata = useMemo(() => {
    if (!optimisticEntityMetadata) {
      return null;
    }
    const server = parseMusicProjectMetadata(entityMetadataRaw);
    if (JSON.stringify(server) === JSON.stringify(optimisticEntityMetadata)) {
      return null;
    }
    return optimisticEntityMetadata;
  }, [entityMetadataRaw, optimisticEntityMetadata]);

  const effectiveEntityMetadata = useMemo(
    () => mergeMusicProjectMetadata(entityMetadataRaw, pendingEntityMetadata ?? {}),
    [entityMetadataRaw, pendingEntityMetadata],
  );

  const effectiveHeaderMetadata = useMemo(
    () => mergeEntityHeroMetadata(projectMetadata, effectiveEntityMetadata),
    [projectMetadata, effectiveEntityMetadata],
  );

  const resolvedHero = useMemo(
    () => resolveHeroBackground(effectiveHeaderMetadata, theme),
    [effectiveHeaderMetadata, theme],
  );

  const titleFontFamily = resolveInheritedTitleFontFamily(projectMetadata);
  const titleColor = resolveProjectHeaderTextColor(project.color);
  const coverImageUrl = resolveAlbumCoverImageUrl({
    albumCoverImageUrl: album.coverImageUrl,
    projectCoverImageUrl: project.coverImageUrl,
  });

  const breadcrumbs = [
    { label: t('breadcrumb_projects'), href: `/${locale}/projects` },
    { label: project.name, href: `/${locale}/projects/${project.id}` },
    { label: album.name },
  ];

  const persistEntityHeroMetadata = async (patch: MusicProjectMetadata) => {
    const merged = mergeMusicProjectMetadata(entityMetadataRaw, patch);
    setOptimisticEntityMetadata(merged);
    try {
      await updateAlbum.mutateAsync({
        albumId,
        data: { metadata: merged },
      });
    } catch {
      setOptimisticEntityMetadata(null);
      throw new Error('Failed to save hero background');
    }
  };

  const handleLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadAlbumImage(locale, albumId, file, 'logo');
      await updateAlbum.mutateAsync({
        albumId,
        data: { coverImageUrl: url },
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroFile = async (file: File) => {
    setUploadingHero(true);
    setHeroPickerAnchor(null);
    try {
      const url = await uploadAlbumImage(locale, albumId, file, 'hero');
      await persistEntityHeroMetadata(buildHeroBackgroundMetadataPatch('image', { imageUrl: url }));
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSelectPreset = (preset: HeroBackgroundPreset) => {
    void persistEntityHeroMetadata(applyHeroPresetRecipe(entityMetadataRaw, preset));
  };

  const handleSelectCustomSolid = (hex: string) => {
    void persistEntityHeroMetadata(
      buildHeroBackgroundMetadataPatch('solid', {
        color: hex,
        overrides: {
          backgroundColor: hex,
          gradientStops: [hex],
          patternShapeId: null,
          patternPresetId: null,
        },
      }),
    );
  };

  const handlePreviewCustom = (partial: Partial<HeroBackgroundOverrides>) => {
    const merged = mergeHeroBackgroundOverrides(effectiveEntityMetadata, partial);
    setOptimisticEntityMetadata(merged);
  };

  const handleApplyCustom = (partial: Partial<HeroBackgroundOverrides>) => {
    const merged = mergeHeroBackgroundOverrides(effectiveEntityMetadata, partial);
    const overridesOnly: MusicProjectMetadata = {
      heroBackgroundOverrides: merged.heroBackgroundOverrides,
    };
    const prev = parseMusicProjectMetadata(entityMetadataRaw);
    if (prev.heroBackgroundKind !== 'composed' && prev.heroBackgroundKind !== 'image') {
      overridesOnly.heroBackgroundKind = 'composed';
    }
    void persistEntityHeroMetadata(overridesOnly);
  };

  const renderStats = ({
    onHeroImage,
    useCompactHeader,
    statsChromeColor,
  }: {
    onHeroImage: boolean;
    useCompactHeader: boolean;
    statsChromeColor: string;
  }) => {
    const hasSongCount = songCount >= 1;
    const hasReleaseDate = Boolean(album.releaseDate);
    if (!hasSongCount && !hasReleaseDate) {
      return null;
    }

    const badges = (
      <MusicStatBadgeRow compact={useCompactHeader} nowrap>
        {hasSongCount && (
          <MusicStatBadge
            count={songCount}
            label={t('songs_stat_label')}
            compact
            chromeColor={statsChromeColor}
          />
        )}
        {hasReleaseDate && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: statsChromeColor,
              fontSize: useCompactHeader ? '0.65rem' : undefined,
            }}
          >
            {album.releaseDate}
          </Typography>
        )}
      </MusicStatBadgeRow>
    );

    return onHeroImage
      ? <Box sx={getProjectDetailGlassPanelSx()}>{badges}</Box>
      : badges;
  };

  return (
    <MusicDetailPageHeader
      locale={locale}
      breadcrumbs={breadcrumbs}
      title={album.name}
      coverImageUrl={coverImageUrl}
      titleColor={titleColor}
      titleFontFamily={titleFontFamily}
      metadata={effectiveHeaderMetadata}
      readOnly={readOnly}
      customization={{
        heroBackground: true,
        logoUpload: true,
        titleEdit: false,
        fontPicker: false,
        colorPicker: false,
      }}
      logoKind="album"
      coverImageType="album"
      renderStats={renderStats}
      onLogoFile={handleLogoFile}
      onHeroPickerOpen={setHeroPickerAnchor}
      onHeroFile={handleHeroFile}
      uploadingLogo={uploadingLogo}
      uploadingHero={uploadingHero}
      heroFileInputRef={heroInputRef}
      heroPickerSlot={(
        <ProjectHeroBackgroundPicker
          anchorEl={heroPickerAnchor}
          open={Boolean(heroPickerAnchor)}
          onClose={() => setHeroPickerAnchor(null)}
          resolved={resolvedHero}
          onSelectPreset={handleSelectPreset}
          onSelectCustomSolid={handleSelectCustomSolid}
          onPreviewCustom={handlePreviewCustom}
          onApplyCustom={handleApplyCustom}
          onUploadClick={() => heroInputRef.current?.click()}
          uploading={uploadingHero}
          textColor={titleColor}
          onTextColorChange={() => {}}
        />
      )}
    />
  );
}
