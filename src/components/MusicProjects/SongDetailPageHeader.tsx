'use client';

import type { HeroBackgroundPreset } from '@/components/MusicProjects/heroBackgroundPresets';
import type { SongAlbumSummary, SongDetail, SongProjectSummary } from '@/queries/hooks/songs/useSong';
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
import { useUpdateSongById } from '@/queries/hooks/songs/useUpdateSongById';
import {
  mergeEntityHeroMetadata,
  mergeSongEntityMetadata,
  resolveInheritedTitleFontFamily,
  resolveSongCoverImageUrl,
} from '@/utils/musicEntityHeroMetadata';
import {
  buildHeroBackgroundMetadataPatch,
  mergeHeroBackgroundOverrides,
  mergeMusicProjectMetadata,
  parseMusicProjectMetadata,
} from '@/utils/musicProjectMetadata';

type SongDetailPageHeaderProps = {
  locale: string;
  songId: number;
  song: SongDetail;
  project: SongProjectSummary | null;
  album: SongAlbumSummary | null;
  readOnly?: boolean;
};

async function uploadSongImage(
  locale: string,
  songId: number,
  file: File,
  type: 'logo' | 'hero',
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch(`/${locale}/api/songs/${songId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload image');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

export function SongDetailPageHeader({
  locale,
  songId,
  song,
  project,
  album,
  readOnly = false,
}: SongDetailPageHeaderProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const updateSong = useUpdateSongById(locale);

  const [optimisticEntityMetadata, setOptimisticEntityMetadata] = useState<MusicProjectMetadata | null>(null);
  const [heroPickerAnchor, setHeroPickerAnchor] = useState<null | HTMLElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const entityMetadataRaw = song.metadata;
  const projectMetadata = project?.metadata ?? null;

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
  const titleColor = resolveProjectHeaderTextColor(project?.color);
  const coverImageUrl = resolveSongCoverImageUrl({
    songMetadata: effectiveEntityMetadata,
    albumCoverImageUrl: album?.coverImageUrl,
    projectCoverImageUrl: project?.coverImageUrl,
  });

  const displayTitle = song.trackNumber
    ? `${song.trackNumber}. ${song.title}`
    : song.title;

  const breadcrumbs = [
    { label: t('breadcrumb_projects'), href: `/${locale}/projects` },
    ...(project
      ? [{ label: project.name, href: `/${locale}/projects/${project.id}` }]
      : []),
    { label: song.title },
  ];

  const persistEntityHeroMetadata = async (patch: MusicProjectMetadata) => {
    const merged = mergeMusicProjectMetadata(entityMetadataRaw, patch);
    setOptimisticEntityMetadata(merged);
    try {
      await updateSong.mutateAsync({
        songId,
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
      const url = await uploadSongImage(locale, songId, file, 'logo');
      const merged = mergeSongEntityMetadata(entityMetadataRaw, { coverImageUrl: url });
      await updateSong.mutateAsync({
        songId,
        data: { metadata: merged },
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeroFile = async (file: File) => {
    setUploadingHero(true);
    setHeroPickerAnchor(null);
    try {
      const url = await uploadSongImage(locale, songId, file, 'hero');
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
    const hasBpm = song.bpm != null && song.bpm > 0;
    const hasKey = Boolean(song.key);
    if (!hasBpm && !hasKey) {
      return null;
    }

    const badges = (
      <MusicStatBadgeRow compact={useCompactHeader} nowrap>
        {hasKey && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: statsChromeColor,
              fontSize: useCompactHeader ? '0.65rem' : undefined,
            }}
          >
            {song.key}
          </Typography>
        )}
        {hasBpm && (
          <MusicStatBadge count={song.bpm!} label="BPM" compact chromeColor={statsChromeColor} />
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
      title={displayTitle}
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
      logoKind="song"
      coverImageType="song"
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
