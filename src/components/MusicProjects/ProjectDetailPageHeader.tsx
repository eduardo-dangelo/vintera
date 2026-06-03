'use client';

import {
  PhotoCamera as PhotoCameraIcon,
  TextFields as TextFieldsIcon,
} from '@mui/icons-material';
import {
  Box,
  Breadcrumbs,
  IconButton,
  ThemeProvider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { EventColorPickerPopover } from '@/components/common/EventColorPickerPopover';
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import {
  DEFAULT_HEADER_TEXT_COLOR,
  HEADER_TEXT_COLOR_COLUMNS,
  HEADER_TEXT_COLOR_ROWS,
  resolveProjectHeaderTextColor,
} from '@/components/MusicProjects/headerTextColors';
import { MusicCoverImage } from '@/components/MusicProjects/MusicCoverImage';
import {
  createHeroDarkTheme,
  getHeroBackgroundSx,
  getHeroBandSx,
  getHeroOverlaySx,
  getHeroTitleSx,
  getHeroToolbarWrapperSx,
  getStickyBarSx,
} from '@/components/MusicProjects/musicListPageHeaderStyles';
import {
  getHeroActionsDividerSx,
  getHeroActionsToolbarSx,
} from '@/components/MusicProjects/musicListToolbarStyles';
import { MusicStatBadge, MusicStatBadgeRow } from '@/components/MusicProjects/MusicStatBadge';
import { ProjectDetailNewButton } from '@/components/MusicProjects/ProjectDetailNewButton';
import {
  getProjectDetailActionsSx,
  getProjectDetailBreadcrumbSx,
  getProjectDetailBreadcrumbWrapperSx,
  getProjectDetailLeftGroupSx,
  getProjectDetailLogoAbsoluteSx,
  getProjectDetailLogoButtonSx,
  getProjectDetailLogoSpacerSx,
  getProjectDetailMainRowSx,
  getProjectDetailStickyBarContentSx,
  getProjectDetailTitleGroupSx,
  PROJECT_DETAIL_LOGO_SIZE,
} from '@/components/MusicProjects/projectDetailPageHeaderStyles';
import { ProjectEditableTitle } from '@/components/MusicProjects/ProjectEditableTitle';
import { ProjectTitleFontPicker } from '@/components/MusicProjects/ProjectTitleFontPicker';
import {
  DEFAULT_TITLE_FONT_FAMILY,
  ensureTitleFontLoaded,
} from '@/components/MusicProjects/projectTitleFonts';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import {
  mergeMusicProjectMetadata,
  parseMusicProjectMetadata,
} from '@/utils/musicProjectMetadata';

const DEFAULT_HERO_IMAGE = '/assets/images/music-projects-hero.png';

const heroImageStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center',
};

const TITLE_COLOR_EARLY_SWITCH_PX = 28;

type ProjectDetailPageHeaderProps = {
  locale: string;
  projectId: number;
  name: string;
  coverImageUrl: string | null;
  headerTextColor?: string | null;
  metadata: unknown;
  albumCount: number;
  songCount: number;
  memberCount: number;
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
  headerTextColor,
  metadata: metadataRaw,
  albumCount,
  songCount,
  memberCount,
}: ProjectDetailPageHeaderProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const updateProject = useUpdateMusicProject(locale);

  const parsedMetadata = useMemo(() => parseMusicProjectMetadata(metadataRaw), [metadataRaw]);
  const heroImageSrc = parsedMetadata.heroImageUrl ?? DEFAULT_HERO_IMAGE;
  const serverTitleFontFamily = parsedMetadata.titleFontFamily ?? DEFAULT_TITLE_FONT_FAMILY;

  const [optimisticHeaderColor, setOptimisticHeaderColor] = useState<string | null>(null);
  const [optimisticTitleFontFamily, setOptimisticTitleFontFamily] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [isHeroOutOfView, setIsHeroOutOfView] = useState(false);
  const [isHeroTextOutOfView, setIsHeroTextOutOfView] = useState(false);
  const [fontPickerAnchor, setFontPickerAnchor] = useState<null | HTMLElement>(null);
  const [colorPickerAnchor, setColorPickerAnchor] = useState<null | HTMLElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);

  const heroBandRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const useCompactHeader = isMobile || isStuck;
  const hasHeroImage = Boolean(heroImageSrc);
  const topOffset = isMobile ? 56 : 0;
  const onHeroImage = hasHeroImage && !(theme.palette.mode === 'light' && isHeroTextOutOfView);
  const iconButtonSize = useCompactHeader ? 26 : 32;

  const resolvedHeaderColor = optimisticHeaderColor && headerTextColor !== optimisticHeaderColor
    ? optimisticHeaderColor
    : resolveProjectHeaderTextColor(headerTextColor);

  const titleFontFamily = optimisticTitleFontFamily
    && parsedMetadata.titleFontFamily !== optimisticTitleFontFamily
    ? optimisticTitleFontFamily
    : serverTitleFontFamily;

  useEffect(() => {
    ensureTitleFontLoaded(titleFontFamily);
  }, [titleFontFamily]);

  useEffect(() => {
    const heroBand = heroBandRef.current;
    const stickyBar = stickyBarRef.current;
    if (!stickyBar) {
      return undefined;
    }

    const scrollRoot = stickyBar.closest('main');

    const updateHeaderState = () => {
      const { top } = stickyBar.getBoundingClientRect();
      setIsStuck(top <= topOffset + 0.5);

      if (!hasHeroImage || !heroBand) {
        setIsHeroOutOfView(true);
        setIsHeroTextOutOfView(true);
        return;
      }

      const heroBottom = heroBand.getBoundingClientRect().bottom;
      setIsHeroOutOfView(heroBottom <= topOffset + 0.5);
      setIsHeroTextOutOfView(heroBottom <= topOffset + TITLE_COLOR_EARLY_SWITCH_PX);
    };

    const initialUpdateFrame = window.requestAnimationFrame(updateHeaderState);
    scrollRoot?.addEventListener('scroll', updateHeaderState, { passive: true });
    window.addEventListener('resize', updateHeaderState);

    return () => {
      window.cancelAnimationFrame(initialUpdateFrame);
      scrollRoot?.removeEventListener('scroll', updateHeaderState);
      window.removeEventListener('resize', updateHeaderState);
    };
  }, [hasHeroImage, topOffset]);

  const heroDarkTheme = useMemo(() => createHeroDarkTheme(theme), [theme]);
  const useHeroBarTheme = hasHeroImage && !(theme.palette.mode === 'light' && isHeroTextOutOfView);
  const showStickyGlass = hasHeroImage ? isHeroOutOfView : isStuck;
  const barTheme = useHeroBarTheme ? heroDarkTheme : theme;

  const headerTextSx = { color: resolvedHeaderColor };

  const heroTitleStyle = {
    ...getHeroTitleSx(
      hasHeroImage,
      useCompactHeader,
      isHeroTextOutOfView,
      theme,
    ),
    ...headerTextSx,
  } as Record<string, unknown>;

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
    updateProject
      .mutateAsync({
        projectId,
        data: { color: hex },
      })
      .catch(() => {
        setOptimisticHeaderColor(null);
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
    try {
      const url = await uploadProjectImage(locale, projectId, file, 'hero');
      await updateProject.mutateAsync({
        projectId,
        data: {
          metadata: mergeMusicProjectMetadata(metadataRaw, { heroImageUrl: url }),
        },
      });
    } finally {
      setUploadingHero(false);
    }
  };

  const onLogoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      void handleLogoFile(file);
    }
  };

  const onHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      void handleHeroFile(file);
    }
  };

  const iconButtonSx = {
    flexShrink: 0,
    width: iconButtonSize,
    height: iconButtonSize,
  };

  const titleAdornments = (
    <>
      <Tooltip title={t('title_font')}>
        <IconButton
          size="small"
          aria-label={t('title_font')}
          onClick={e => setFontPickerAnchor(e.currentTarget)}
          sx={{
            ...iconButtonSx,
            'color': `${resolvedHeaderColor} !important`,
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
          aria-label={t('title_color')}
          onClick={e => setColorPickerAnchor(e.currentTarget)}
          sx={iconButtonSx}
        >
          <Box
            component="span"
            sx={{
              width: useCompactHeader ? 14 : 16,
              height: useCompactHeader ? 14 : 16,
              borderRadius: '50%',
              bgcolor: resolvedHeaderColor,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.35)',
              display: 'block',
            }}
          />
        </IconButton>
      </Tooltip>
    </>
  );

  const statsRow = (
    <MusicStatBadgeRow compact={useCompactHeader} nowrap>
      <MusicStatBadge count={songCount} label={t('songs_stat_label')} compact labelColor={resolvedHeaderColor} />
      <MusicStatBadge count={albumCount} label={t('albums_stat_label')} compact labelColor={resolvedHeaderColor} />
      <MusicStatBadge count={memberCount} label={t('members_stat_label')} compact labelColor={resolvedHeaderColor} />
    </MusicStatBadgeRow>
  );

  return (
    <Fragment>
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        hidden
        onChange={onLogoInputChange}
      />
      <input
        ref={heroInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        hidden
        onChange={onHeroInputChange}
      />

      <Box ref={heroBandRef} sx={getHeroBandSx()}>
        <Box sx={getHeroBackgroundSx(theme)}>
          <Image
            src={heroImageSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            style={heroImageStyle}
          />
        </Box>
        <Box sx={getHeroOverlaySx(theme, hasHeroImage)} />

        <Box sx={getProjectDetailBreadcrumbWrapperSx()}>
          <Breadcrumbs aria-label="breadcrumb" sx={getProjectDetailBreadcrumbSx()}>
            <Link href={`/${locale}/projects`}>
              {t('breadcrumb_projects')}
            </Link>
            <Typography
              component="span"
              color="inherit"
              sx={{
                fontSize: 'inherit',
                fontWeight: 500,
                maxWidth: { xs: 140, sm: 280 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {name}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Tooltip title={t('upload_hero')}>
          <IconButton
            aria-label={t('upload_hero')}
            onClick={() => heroInputRef.current?.click()}
            disabled={uploadingHero}
            sx={{
              'position': 'absolute',
              'top': { xs: 12, md: 16 },
              'right': { xs: 16, sm: 24 },
              'zIndex': 2,
              'bgcolor': 'rgba(0, 0, 0, 0.45)',
              'color': '#fff',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.6)' },
            }}
          >
            <PhotoCameraIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        ref={stickyBarRef}
        sx={{
          ...getStickyBarSx(theme, isMobile, showStickyGlass),
          overflow: 'visible',
        }}
      >
        <Box sx={getProjectDetailStickyBarContentSx(isStuck)}>
          <ThemeProvider theme={barTheme}>
            <Box sx={getProjectDetailMainRowSx(isStuck)}>
              <Box sx={getProjectDetailLeftGroupSx()}>
                <Box sx={getProjectDetailLogoSpacerSx()} aria-hidden />
                <Box sx={getProjectDetailLogoAbsoluteSx()}>
                  <Tooltip title={t('upload_logo')}>
                    <Box
                      component="button"
                      type="button"
                      aria-label={t('upload_logo')}
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      sx={{
                        ...getProjectDetailLogoButtonSx(),
                        'opacity': uploadingLogo ? 0.6 : 1,
                        'cursor': uploadingLogo ? 'wait' : 'pointer',
                        '&:hover': { opacity: 0.9 },
                      }}
                    >
                      {coverImageUrl
                        ? (
                            <MusicCoverImage
                              imageUrl={coverImageUrl}
                              type="project"
                              size={PROJECT_DETAIL_LOGO_SIZE}
                            />
                          )
                        : (
                            <Box
                              sx={{
                                width: PROJECT_DETAIL_LOGO_SIZE,
                                height: PROJECT_DETAIL_LOGO_SIZE,
                                borderRadius: 1,
                                bgcolor: 'action.hover',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <GradientIcon kind="project" fontSize={46} aria-hidden />
                            </Box>
                          )}
                    </Box>
                  </Tooltip>
                </Box>

                <Box sx={getProjectDetailTitleGroupSx()}>
                  <ProjectEditableTitle
                    name={name}
                    fontFamily={titleFontFamily}
                    compact={useCompactHeader}
                    truncate
                    heroTitleStyle={heroTitleStyle}
                    titleAdornments={titleAdornments}
                    keepAdornmentsVisible={Boolean(fontPickerAnchor) || Boolean(colorPickerAnchor)}
                    onSave={handleSaveName}
                  />
                </Box>
              </Box>

              <Box sx={getProjectDetailActionsSx()}>
                <Box
                  sx={getHeroToolbarWrapperSx(
                    hasHeroImage,
                    useCompactHeader,
                    isHeroTextOutOfView,
                    theme,
                  )}
                >
                  <Box sx={getHeroActionsToolbarSx()}>
                    {statsRow}
                    <Box
                      component="span"
                      sx={getHeroActionsDividerSx(theme, onHeroImage)}
                      aria-hidden
                    />
                    <ProjectDetailNewButton locale={locale} projectId={projectId} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </ThemeProvider>
        </Box>
      </Box>

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
        value={resolvedHeaderColor}
        onChange={handleColorSelect}
        valueMode="hex"
        colorRows={HEADER_TEXT_COLOR_ROWS}
        columns={HEADER_TEXT_COLOR_COLUMNS}
        defaultCustomHex={DEFAULT_HEADER_TEXT_COLOR}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      />
    </Fragment>
  );
}
