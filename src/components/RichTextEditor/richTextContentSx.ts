import type { SystemStyleObject, Theme } from '@mui/system';

export function richTextContentSx(accent: string): SystemStyleObject<Theme> {
  return {
    'fontSize': '0.875rem',
    'lineHeight': 1.7,
    'color': 'text.primary',
    '& p': { 'm': 0, 'mb': 1, '&:last-child': { mb: 0 } },
    '& h2': { fontSize: '1.125rem', fontWeight: 700, m: 0, mb: 0.75, mt: 0.5 },
    '& h3': { fontSize: '1rem', fontWeight: 600, m: 0, mb: 0.5, mt: 0.5 },
    '& ul, & ol': { pl: 2.5, my: 0.5 },
    '& li': { mb: 0.25 },
    '& a': { color: accent, textDecoration: 'underline' },
  };
}

export const RICH_TEXT_COLLAPSED_MAX_HEIGHT = 120;
