'use client';

import type { HeroBackgroundPreset } from '@/components/MusicProjects/heroBackgroundPresets';
import type { HeroBackgroundOverrides, MusicProjectMetadata } from '@/utils/musicProjectMetadata';
import {
  TextFields as TextFieldsIcon,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EventColorPickerPopover } from '@/components/common/EventColorPickerPopover';
import {
  DEFAULT_HEADER_TEXT_COLOR,
  HEADER_TEXT_COLOR_COLUMNS,
  HEADER_TEXT_COLOR_ROWS,
  resolveProjectHeaderTextColor,
} from '@/components/MusicProjects/headerTextColors';
import {
  applyHeroPresetRecipe,
  resolveHeroBackground,
} from '@/components/MusicProjects/heroBackgroundPresets';
import { MusicDetailPageHeader } from '@/components/MusicProjects/MusicDetailPageHeader';
import { MusicStatBadge, MusicStatBadgeRow } from '@/components/MusicProjects/MusicStatBadge';
import { ProjectDetailNewButton } from '@/components/MusicProjects/ProjectDetailNewButton';
import { getProjectDetailGlassPanelSx } from '@/components/MusicProjects/projectDetailPageHeaderStyles';
import { ProjectHeroBackgroundPicker } from '@/components/MusicProjects/ProjectHeroBackgroundPicker';
import { ProjectTitleFontPicker } from '@/components/MusicProjects/ProjectTitleFontPicker';
import {
  DEFAULT_TITLE_FONT_FAMILY,
  ensureTitleFontLoaded,
} from '@/components/MusicProjects/projectTitleFonts';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import {
  resolveHeroChromeTextColor,
} from '@/utils/heroChromeTextColor';
import {
  buildHeroBackgroundMetadataPatch,
  mergeHeroBackgroundOverrides,
  mergeMusicProjectMetadata,
  parseMusicProjectMetadata,
} from '@/utils/musicProjectMetadata';

type ProjectDetailPageHeaderProps = {
  locale: string;
  projectId: number;
  name: string;
  coverImageUrl: string | null;
  /** Project.color — title and title adornments only */
  titleColor?: string | null;
  metadata: unknown;
  albumCount: number;
  songCount: number;
  memberCount: number;
  readOnly?: boolean;
};

async function uploadProjectImage(
  locale: string,
  projectId: number,
  file: File,
  type: 'logo' | 'hero',
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch(`/${locale}/api/music-projects/${projectId}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload image');
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

export function ProjectDetailPageHeader({
  locale,
  projectId,
  name,
  coverImageUrl,
  titleColor,
  metadata: metadataRaw,
  albumCount,
  songCount,
  memberCount,
  readOnly = false,
}: ProjectDetailPageHeaderProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const updateProject = useUpdateMusicProject(locale);

  const parsedMetadata = useMemo(() => parseMusicProjectMetadata(metadataRaw), [metadataRaw]);
  const serverTitleFontFamily = parsedMetadata.titleFontFamily ?? DEFAULT_TITLE_FONT_FAMILY;

  const [optimisticHeaderColor, setOptimisticHeaderColor] = useState<string | null>(null);
  const [optimisticTitleFontFamily, setOptimisticTitleFontFamily] = useState<string | null>(null);
  const [optimisticHeroMetadata, setOptimisticHeroMetadata] = useState<MusicProjectMetadata | null>(null);
  const [fontPickerAnchor, setFontPickerAnchor] = useState<null | HTMLElement>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [heroPickerAnchor, setHeroPickerAnchor] = useState<null | HTMLElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const pendingHeroMetadata = useMemo(() => {
    if (!optimisticHeroMetadata) {
      return null;
    }
    const server = parseMusicProjectMetadata(metadataRaw);
    if (JSON.stringify(server) === JSON.stringify(optimisticHeroMetadata)) {
      return null;
    }
    return optimisticHeroMetadata;
  }, [metadataRaw, optimisticHeroMetadata]);

  const effectiveMetadata = useMemo(
    () => mergeMusicProjectMetadata(metadataRaw, pendingHeroMetadata ?? {}),
    [metadataRaw, pendingHeroMetadata],
  );

  const resolvedHero = useMemo(
    () => resolveHeroBackground(effectiveMetadata, theme),
    [effectiveMetadata, theme],
  );

  const pendingTitleColor
    = optimisticHeaderColor && titleColor !== optimisticHeaderColor
      ? optimisticHeaderColor
      : null;

  const resolvedTitleColor
    = pendingTitleColor ?? resolveProjectHeaderTextColor(titleColor);

  const titleFontFamily
    = optimisticTitleFontFamily
      && parsedMetadata.titleFontFamily !== optimisticTitleFontFamily
      ? optimisticTitleFontFamily
      : serverTitleFontFamily;

  useEffect(() => {
    ensureTitleFontLoaded(titleFontFamily);
  }, [titleFontFamily]);

  const iconButtonSize = isMobile ? 26 : 32;

  const persistHeroBackground = async (patch: MusicProjectMetadata) => {
    const prev = parseMusicProjectMetadata(metadataRaw);
    let merged = mergeMusicProjectMetadata(metadataRaw, patch);
    let titleColorPatch: string | undefined;
    const presetChanged = patch.heroBackgroundPreset !== undefined
      && patch.heroBackgroundPreset !== prev.heroBackgroundPreset;
    const kindChanged = patch.heroBackgroundKind !== undefined
      && patch.heroBackgroundKind !== prev.heroBackgroundKind
      && patch.heroBackgroundKind !== 'image';
    if (presetChanged || kindChanged) {
      const resolved = resolveHeroBackground(merged, theme);
      const chromeColor = resolveHeroChromeTextColor(resolved, theme);
      merged = {
        ...merged,
        heroChromeTextColor: chromeColor,
      };
      titleColorPatch = chromeColor;
    }
    setOptimisticHeroMetadata(merged);
    if (titleColorPatch) {
      setOptimisticHeaderColor(titleColorPatch);
    }
    try {
      await updateProject.mutateAsync({
        projectId,
        data: {
          metadata: merged,
          ...(titleColorPatch ? { color: titleColorPatch } : {}),
        },
      });
    } catch {
      setOptimisticHeroMetadata(null);
      if (titleColorPatch) {
        setOptimisticHeaderColor(null);
      }
      throw new Error('Failed to save hero background');
    }
  };

  const handleSaveName = async (newName: string) => {
    await updateProject.mutateAsync({
      projectId,
      data: { name: newName },
    });
  };

  const handleFontSelect = (fontValue: string) => {
    ensureTitleFontLoaded(fontValue);
    setOptimisticTitleFontFamily(fontValue);
    setFontPickerAnchor(null);
    updateProject
      .mutateAsync({
        projectId,
        data: {
          metadata: mergeMusicProjectMetadata(metadataRaw, { titleFontFamily: fontValue }),
        },
      })
      .catch(() => {
        setOptimisticTitleFontFamily(null);
      });
  };

  const handleColorSelect = (hex: string) => {
    setOptimisticHeaderColor(hex);
    setColorPickerAnchor(null);
    const merged = mergeMusicProjectMetadata(metadataRaw, { heroChromeTextColor: hex });
    setOptimisticHeroMetadata(merged);
    void updateProject
      .mutateAsync({
        projectId,
        data: {
          color: hex,
          metadata: merged,
        },
      })
      .catch(() => {
        setOptimisticHeaderColor(null);
        setOptimisticHeroMetadata(null);
      });
  };

  const handleLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const url = await uploadProjectImage(locale, projectId, file, 'logo');
      await updateProject.mutateAsync({
        projectId,
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
      const url = await uploadProjectImage(locale, projectId, file, 'hero');
      await persistHeroBackground(buildHeroBackgroundMetadataPatch('image', { imageUrl: url }));
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSelectPreset = (preset: HeroBackgroundPreset) => {
    void persistHeroBackground(applyHeroPresetRecipe(metadataRaw, preset));
  };

  const handleSelectCustomSolid = (hex: string) => {
    void persistHeroBackground(
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
    const merged = mergeHeroBackgroundOverrides(effectiveMetadata, partial);
    setOptimisticHeroMetadata(merged);
  };

  const handleApplyCustom = (partial: Partial<HeroBackgroundOverrides>) => {
    const merged = mergeHeroBackgroundOverrides(effectiveMetadata, partial);
    const overridesOnly: MusicProjectMetadata = {
      heroBackgroundOverrides: merged.heroBackgroundOverrides,
    };
    const prev = parseMusicProjectMetadata(metadataRaw);
    if (prev.heroBackgroundKind !== 'composed' && prev.heroBackgroundKind !== 'image') {
      overridesOnly.heroBackgroundKind = 'composed';
    }
    void persistHeroBackground(overridesOnly);
  };

  const titleAdornmentButtonSx = {
    'flexShrink': 0,
    'width': iconButtonSize,
    'height': iconButtonSize,
    'bgcolor': 'transparent',
    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
  };

  const renderTitleAdornments = ({
    titleChromeColor,
    useCompactHeader,
  }: {
    titleChromeColor: string;
    useCompactHeader: boolean;
  }) => (
    readOnly
      ? null
      : (
          <>
            <Tooltip title={t('title_font')}>
              <IconButton
                size="small"
                disableRipple
                aria-label={t('title_font')}
                onClick={e => setFontPickerAnchor(e.currentTarget)}
                sx={{
                  ...titleAdornmentButtonSx,
                  'width': useCompactHeader ? 26 : 32,
                  'height': useCompactHeader ? 26 : 32,
                  'color': `${titleChromeColor} !important`,
                  '& .MuiSvgIcon-root': {
                    color: 'inherit !important',
                  },
                }}
              >
                <TextFieldsIcon sx={{ fontSize: useCompactHeader ? 16 : 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('title_color')}>
              <IconButton
                size="small"
                disableRipple
                aria-label={t('title_color')}
                onClick={e => setColorPickerAnchor(e.currentTarget)}
                sx={{
                  ...titleAdornmentButtonSx,
                  width: useCompactHeader ? 26 : 32,
                  height: useCompactHeader ? 26 : 32,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: useCompactHeader ? 14 : 16,
                    height: useCompactHeader ? 14 : 16,
                    borderRadius: '50%',
                    bgcolor: resolvedTitleColor,
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
                    display: 'block',
                  }}
                />
              </IconButton>
            </Tooltip>
          </>
        )
  );

  const hasStats = songCount >= 1 || albumCount >= 1 || memberCount >= 1;

  const renderStats = ({
    onHeroImage,
    useCompactHeader,
    statsChromeColor,
  }: {
    onHeroImage: boolean;
    useCompactHeader: boolean;
    statsChromeColor: string;
  }) => {
    if (!hasStats) {
      return null;
    }

    const statsBadges = (
      <MusicStatBadgeRow compact={useCompactHeader} nowrap>
        {songCount >= 1 && (
          <MusicStatBadge count={songCount} label={t('songs_stat_label')} compact chromeColor={statsChromeColor} />
        )}
        {albumCount >= 1 && (
          <MusicStatBadge count={albumCount} label={t('albums_stat_label')} compact chromeColor={statsChromeColor} />
        )}
        {memberCount >= 1 && (
          <MusicStatBadge count={memberCount} label={t('members_stat_label')} compact chromeColor={statsChromeColor} />
        )}
      </MusicStatBadgeRow>
    );

    return onHeroImage
      ? <Box sx={getProjectDetailGlassPanelSx()}>{statsBadges}</Box>
      : statsBadges;
  };

  const breadcrumbs = [
    { label: t('breadcrumb_projects'), href: `/${locale}/projects` },
    { label: name },
  ];

  return (
    <>
      <MusicDetailPageHeader
        locale={locale}
        breadcrumbs={breadcrumbs}
        title={name}
        coverImageUrl={coverImageUrl}
        titleColor={resolvedTitleColor}
        titleFontFamily={titleFontFamily}
        metadata={effectiveMetadata}
        readOnly={readOnly}
        customization={{
          heroBackground: true,
          logoUpload: true,
          titleEdit: true,
          fontPicker: true,
          colorPicker: true,
        }}
        logoKind="project"
        coverImageType="project"
        renderStats={renderStats}
        actions={!readOnly
          ? (
              <ProjectDetailNewButton locale={locale} projectId={projectId} appTheme={theme} />
            )
          : null}
        renderTitleAdornments={renderTitleAdornments}
        keepAdornmentsVisible={
          Boolean(fontPickerAnchor)
          || Boolean(colorPickerAnchor)
          || Boolean(heroPickerAnchor)
        }
        onSaveTitle={handleSaveName}
        onLogoFile={handleLogoFile}
        onHeroPickerOpen={setHeroPickerAnchor}
        onHeroFile={handleHeroFile}
        uploadingLogo={uploadingLogo}
        uploadingHero={uploadingHero}
        heroFileInputRef={heroInputRef}
        heroPickerSlot={(
          <>
            <ProjectTitleFontPicker
              anchorEl={fontPickerAnchor}
              open={Boolean(fontPickerAnchor)}
              onClose={() => setFontPickerAnchor(null)}
              previewLabel={name}
              selectedFontFamily={titleFontFamily}
              onSelect={handleFontSelect}
            />

            <EventColorPickerPopover
              open={Boolean(colorPickerAnchor)}
              anchorEl={colorPickerAnchor}
              onClose={() => setColorPickerAnchor(null)}
              value={resolvedTitleColor}
              onChange={handleColorSelect}
              valueMode="hex"
              colorRows={HEADER_TEXT_COLOR_ROWS}
              columns={HEADER_TEXT_COLOR_COLUMNS}
              defaultCustomHex={DEFAULT_HEADER_TEXT_COLOR}
              swatchVariant="square"
              customColorAriaLabel={t('hero_bg_custom_color')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            />

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
              textColor={resolvedTitleColor}
              onTextColorChange={handleColorSelect}
            />
          </>
        )}
      />

    </>
  );
}
