'use client';

import type { SxProps, Theme } from '@mui/material/styles';
import { SvgIcon } from '@mui/material';
import { useId } from 'react';
import { PRIMARY_GRADIENT_END, PRIMARY_GRADIENT_START } from './musicListToolbarStyles';

export type GradientMusicIconKind = 'project' | 'song' | 'album' | 'member';

const ICON_PATHS: Record<GradientMusicIconKind, string> = {
  project: 'M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4z',
  song: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3z',
  album: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5m0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1',
  member: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4',
};

type GradientIconProps = {
  'kind': GradientMusicIconKind;
  'fontSize'?: number;
  'gradientOnHover'?: boolean;
  'sx'?: SxProps<Theme>;
  'aria-hidden'?: boolean;
};

export function GradientIcon({
  kind,
  fontSize = 44,
  gradientOnHover = false,
  sx,
  'aria-hidden': ariaHidden,
}: GradientIconProps) {
  const gradientId = useId().replace(/:/g, '');
  const gradientFill = `url(#${gradientId})`;

  return (
    <SvgIcon
      aria-hidden={ariaHidden}
      sx={{
        fontSize,
        ...(gradientOnHover
          ? {
              'color': 'action.active',
              'transition': 'fill 0.2s ease',
              '& path': {
                fill: 'currentColor',
                transition: 'fill 0.2s ease',
              },
              '.MuiMenuItem-root:hover & path': {
                fill: gradientFill,
              },
            }
          : {
              fill: `${gradientFill} !important`,
            }),
        ...sx,
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={PRIMARY_GRADIENT_START} />
          <stop offset="100%" stopColor={PRIMARY_GRADIENT_END} />
        </linearGradient>
      </defs>
      <path d={ICON_PATHS[kind]} fill={gradientOnHover ? undefined : gradientFill} />
    </SvgIcon>
  );
}
