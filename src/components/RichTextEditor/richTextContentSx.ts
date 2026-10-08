import type { SystemStyleObject, Theme } from '@mui/system';
import { alpha } from '@mui/material/styles';

const CHECKED_MARK = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'none\' stroke=\'white\' stroke-width=\'1.8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M3.5 8.2 6.4 11 12.5 4.5\'/%3E%3C/svg%3E")';

export function richTextContentSx(accent: string): SystemStyleObject<Theme> {
  return {
    'fontSize': '0.875rem',
    'lineHeight': 1.7,
    'color': 'text.primary',
    '& p': { 'm': 0, 'mb': 1, '&:last-child': { mb: 0 } },
    '& h2': { fontSize: '1.125rem', fontWeight: 700, m: 0, mb: 0.75, mt: 0.5 },
    '& h3': { fontSize: '1rem', fontWeight: 600, m: 0, mb: 0.5, mt: 0.5 },
    '& ul': { listStyleType: 'disc', pl: 2.5, my: 0.5 },
    '& ol': { listStyleType: 'decimal', pl: 2.5, my: 0.5 },
    '& li': { mb: 0.25 },
    '& ul[data-type="taskList"]': {
      listStyle: 'none',
      pl: 0,
    },
    '& ul[data-type="taskList"] li': {
      display: 'block',
      mb: 0,
    },
    '& ul[data-type="taskList"] li label': {
      flex: '0 0 auto',
      mt: '0.2rem',
      userSelect: 'none',
    },
    '& ul[data-type="taskList"] li label > span': {
      display: 'none',
    },
    '& ul[data-type="taskList"] li label input[type="checkbox"]': {
      'appearance': 'none',
      'WebkitAppearance': 'none',
      'MozAppearance': 'none',
      'boxSizing': 'border-box',
      'width': 16,
      'height': 16,
      'm': 0,
      'p': 0,
      'borderRadius': '4px',
      'border': '1.5px solid',
      'borderColor': alpha(accent, 0.5),
      'bgcolor': 'transparent',
      'cursor': 'pointer',
      'backgroundRepeat': 'no-repeat',
      'backgroundPosition': 'center',
      'backgroundSize': '16px 16px',
      '&:hover': {
        borderColor: accent,
      },
      '&:checked': {
        bgcolor: accent,
        borderColor: accent,
        backgroundImage: CHECKED_MARK,
      },
    },
    '& a': { color: accent, textDecoration: 'underline' },
  };
}

export const RICH_TEXT_COLLAPSED_MAX_HEIGHT = 120;
