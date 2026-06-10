'use client';

import type { ReactNode, RefObject } from 'react';
import type { GradientMusicIconKind } from '@/components/MusicProjects/GradientIcon';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
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
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import { resolveProjectHeaderTextColor } from '@/components/MusicProjects/headerTextColors';
import { resolveHeroBackground } from '@/components/MusicProjects/heroBackgroundPresets';
import { MusicCoverImage } from '@/components/MusicProjects/MusicCoverImage';
import {
  createHeroDarkTheme,
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
import {
  getProjectDetailActionsSx,
  getProjectDetailBreadcrumbSx,
  getProjectDetailBreadcrumbWrapperSx,
  getProjectDetailLeftGroupSx,
  getProjectDetailLogoAbsoluteSx,
  getProjectDetailLogoButtonSx,
  getProjectDetailLogoPlaceholderSx,
  getProjectDetailLogoSize,
  getProjectDetailLogoSpacerSx,
  getProjectDetailMainRowSx,
  getProjectDetailStickyBarContentSx,
  getProjectDetailTitleGroupSx,
} from '@/components/MusicProjects/projectDetailPageHeaderStyles';
import { ProjectEditableTitle } from '@/components/MusicProjects/ProjectEditableTitle';
import { ensureTitleFontLoaded } from '@/components/MusicProjects/projectTitleFonts';
import {
  resolveHeroChromeTextColor,
  resolveStickyBarChromeTextColor,
  resolveTitleChromeColor,
} from '@/utils/heroChromeTextColor';
import { parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';

const heroImageStyle = {
  objectFit: 'cover' as const,
  objectPosition: 'center',
};

const TITLE_COLOR_EARLY_SWITCH_PX = 28;

export type MusicDetailBreadcrumb = {
  label: string;
  href?: string;
};

export type MusicDetailCustomization = {
  heroBackground: boolean;
  logoUpload: boolean;
  titleEdit: boolean;
  fontPicker: boolean;
  colorPicker: boolean;
};

export type MusicDetailPageHeaderProps = {
  locale: string;
  breadcrumbs: MusicDetailBreadcrumb[];
  title: string;
  coverImageUrl: string | null;
  titleColor?: string | null;
  titleFontFamily: string;
  metadata: unknown;
  readOnly?: boolean;
  customization: MusicDetailCustomization;
  logoKind?: GradientMusicIconKind;
  coverImageType?: 'project' | 'song' | 'album';
  stats?: ReactNode;
  renderStats?: (ctx: {
    onHeroImage: boolean;
    useCompactHeader: boolean;
    statsChromeColor: string;
  }) => ReactNode;
  actions?: ReactNode;
  titleAdornments?: ReactNode;
  renderTitleAdornments?: (ctx: {
    titleChromeColor: string;
    useCompactHeader: boolean;
  }) => ReactNode;
  keepAdornmentsVisible?: boolean;
  onSaveTitle?: (name: string) => Promise<void>;
  onLogoFile?: (file: File) => Promise<void>;
  onHeroPickerOpen?: (anchor: HTMLElement) => void;
  onHeroFile?: (file: File) => Promise<void>;
  uploadingLogo?: boolean;
  uploadingHero?: boolean;
  heroPickerSlot?: ReactNode;
  /** When true, stats and actions are separated by a divider in the toolbar row. */
  showStatsDivider?: boolean;
  heroFileInputRef?: RefObject<HTMLInputElement | null>;
};

export function MusicDetailPageHeader({
  breadcrumbs,
  title,
  coverImageUrl,
  titleColor,
  titleFontFamily,
  metadata,
  readOnly = false,
  customization,
  logoKind = 'project',
  coverImageType = 'project',
  stats,
  renderStats,
  actions,
  titleAdornments,
  renderTitleAdornments,
  keepAdornmentsVisible = false,
  onSaveTitle,
  onLogoFile,
  onHeroPickerOpen,
  onHeroFile,
  uploadingLogo = false,
  uploadingHero = false,
  heroPickerSlot,
  showStatsDivider = true,
  heroFileInputRef,
}: MusicDetailPageHeaderProps) {
  const t = useTranslations('MusicProjects');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const resolvedHero = useMemo(
    () => resolveHeroBackground(parseMusicProjectMetadata(metadata), theme),
    [metadata, theme],
  );

  const heroBandRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const internalHeroInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = heroFileInputRef ?? internalHeroInputRef;

  const [isStuck, setIsStuck] = useState(false);
  const [isHeroOutOfView, setIsHeroOutOfView] = useState(false);
  const [isHeroTextOutOfView, setIsHeroTextOutOfView] = useState(false);

  const useCompactHeader = isMobile || isStuck;
  const logoSize = getProjectDetailLogoSize(isStuck, isMobile);
  const hasHeroBackdrop = resolvedHero.hasHeroBackdrop;
  const topOffset = isMobile ? 56 : 0;
  const onHeroImage = hasHeroBackdrop && !(theme.palette.mode === 'light' && isHeroTextOutOfView);

  const resolvedTitleColor = resolveProjectHeaderTextColor(titleColor);

  const heroChromeColor = useMemo(() => {
    const saved = parseMusicProjectMetadata(metadata).heroChromeTextColor;
    if (saved) {
      return saved;
    }
    return resolveHeroChromeTextColor(resolvedHero, theme);
  }, [metadata, resolvedHero, theme]);

  const titleChromeColor = resolveTitleChromeColor(onHeroImage, resolvedTitleColor, theme);
  const statsChromeColor = onHeroImage
    ? heroChromeColor
    : resolveStickyBarChromeTextColor(theme);

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

      if (!hasHeroBackdrop || !heroBand) {
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
  }, [hasHeroBackdrop, topOffset]);

  const heroDarkTheme = useMemo(() => createHeroDarkTheme(theme), [theme]);
  const useHeroBarTheme = hasHeroBackdrop && !(theme.palette.mode === 'light' && isHeroTextOutOfView);
  const showStickyGlass = hasHeroBackdrop ? isHeroOutOfView : isStuck;
  const barTheme = useHeroBarTheme ? heroDarkTheme : theme;

  const titleTextSx = {
    'color': titleChromeColor,
    '@media (prefers-reduced-motion: no-preference)': {
      transition: 'color 0.2s ease',
    },
  };

  const heroTitleStyle = {
    ...getHeroTitleSx(
      hasHeroBackdrop,
      useCompactHeader,
      isHeroTextOutOfView,
      theme,
    ),
    ...titleTextSx,
  } as Record<string, unknown>;

  const breadcrumbSx = useMemo(
    () => getProjectDetailBreadcrumbSx(heroChromeColor),
    [heroChromeColor],
  );

  const canUploadLogo = customization.logoUpload && !readOnly && onLogoFile;
  const canEditHero = customization.heroBackground && !readOnly && onHeroPickerOpen;
  const canUploadHeroFile = customization.heroBackground && !readOnly && onHeroFile;

  const onLogoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && onLogoFile) {
      void onLogoFile(file);
    }
  };

  const onHeroInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && onHeroFile) {
      void onHeroFile(file);
    }
  };

  const hasToolbarContent = Boolean(stats) || Boolean(renderStats) || Boolean(actions);
  const titleReadOnly = readOnly || !customization.titleEdit || !onSaveTitle;

  const statsContent = renderStats
    ? renderStats({ onHeroImage, useCompactHeader, statsChromeColor })
    : stats;

  const titleAdornmentsContent = renderTitleAdornments
    ? renderTitleAdornments({ titleChromeColor, useCompactHeader })
    : titleAdornments;

  return (
    <Fragment>
      {canUploadLogo && (
        <input
          ref={logoInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          hidden
          onChange={onLogoInputChange}
        />
      )}
      {canUploadHeroFile && (
        <input
          ref={heroInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          hidden
          onChange={onHeroInputChange}
        />
      )}

      <Box ref={heroBandRef} sx={getHeroBandSx()}>
        <Box sx={resolvedHero.backgroundSx}>
          {resolvedHero.kind === 'image' && resolvedHero.imageUrl && (
            <Image
              src={resolvedHero.imageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              style={heroImageStyle}
            />
          )}
        </Box>
        <Box sx={getHeroOverlaySx(theme, hasHeroBackdrop, resolvedHero.overlayKind)} />

        <Box sx={getProjectDetailBreadcrumbWrapperSx()}>
          <Breadcrumbs aria-label="breadcrumb" sx={breadcrumbSx}>
            {breadcrumbs.map((crumb) => {
              const isLast = crumb === breadcrumbs[breadcrumbs.length - 1];
              const crumbKey = crumb.href ?? crumb.label;
              if (isLast || !crumb.href) {
                return (
                  <Typography
                    key={crumbKey}
                    component="span"
                    color="inherit"
                    sx={{
                      fontSize: 'inherit',
                      fontWeight: isLast ? 500 : undefined,
                      maxWidth: isLast ? { xs: 140, sm: 280 } : undefined,
                      overflow: isLast ? 'hidden' : undefined,
                      textOverflow: isLast ? 'ellipsis' : undefined,
                      whiteSpace: isLast ? 'nowrap' : undefined,
                      display: isLast ? 'block' : undefined,
                    }}
                  >
                    {crumb.label}
                  </Typography>
                );
              }
              return (
                <Link key={crumb.href} href={crumb.href}>
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {canEditHero && (
          <Tooltip title={t('hero_background')}>
            <IconButton
              aria-label={t('hero_background')}
              onClick={e => onHeroPickerOpen(e.currentTarget)}
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
        )}
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
                <Box sx={getProjectDetailLogoSpacerSx(isStuck, isMobile)} aria-hidden />
                <Box sx={getProjectDetailLogoAbsoluteSx()}>
                  <Tooltip title={canUploadLogo ? t('upload_logo') : ''}>
                    <Box
                      component={canUploadLogo ? 'button' : 'div'}
                      type={canUploadLogo ? 'button' : undefined}
                      aria-label={canUploadLogo ? t('upload_logo') : undefined}
                      disabled={canUploadLogo ? uploadingLogo : undefined}
                      onClick={canUploadLogo ? () => logoInputRef.current?.click() : undefined}
                      sx={{
                        ...getProjectDetailLogoButtonSx(),
                        'opacity': uploadingLogo ? 0.6 : 1,
                        'cursor': canUploadLogo
                          ? uploadingLogo ? 'wait' : 'pointer'
                          : 'default',
                        '&:hover': canUploadLogo ? { opacity: 0.9 } : {},
                      }}
                    >
                      {coverImageUrl
                        ? (
                            <MusicCoverImage
                              imageUrl={coverImageUrl}
                              type={coverImageType}
                              size={logoSize}
                            />
                          )
                        : (
                            <Box
                              sx={{
                                width: logoSize,
                                height: logoSize,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                ...getProjectDetailLogoPlaceholderSx(theme, onHeroImage),
                              }}
                            >
                              <GradientIcon
                                kind={logoKind}
                                fontSize={Math.round(logoSize * 0.44)}
                                aria-hidden
                              />
                            </Box>
                          )}
                    </Box>
                  </Tooltip>
                </Box>

                <Box sx={getProjectDetailTitleGroupSx()}>
                  <ProjectEditableTitle
                    name={title}
                    fontFamily={titleFontFamily}
                    compact={useCompactHeader}
                    truncate
                    readOnly={titleReadOnly}
                    heroTitleStyle={heroTitleStyle}
                    titleAdornments={titleAdornmentsContent}
                    keepAdornmentsVisible={keepAdornmentsVisible}
                    onSave={onSaveTitle ?? (async () => {})}
                  />
                </Box>
              </Box>

              {hasToolbarContent && (
                <Box sx={getProjectDetailActionsSx()}>
                  <Box
                    sx={getHeroToolbarWrapperSx(
                      hasHeroBackdrop,
                      useCompactHeader,
                      isHeroTextOutOfView,
                      theme,
                    )}
                  >
                    <Box sx={getHeroActionsToolbarSx()}>
                      {statsContent}
                      {showStatsDivider && statsContent && actions && (
                        <Box
                          component="span"
                          sx={getHeroActionsDividerSx(theme, onHeroImage)}
                          aria-hidden
                        />
                      )}
                      {actions}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </ThemeProvider>
        </Box>
      </Box>

      {heroPickerSlot}
    </Fragment>
  );
}
