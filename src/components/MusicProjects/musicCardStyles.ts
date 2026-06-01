import type { ListFolderCardSize } from '@/utils/listViewPrefs';

export function getMusicCardHoverSx() {
  return {
    'transition': 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 2,
    },
  };
}

export function getMusicCardActionAreaSx() {
  return {
    '&:hover': {
      bgcolor: 'transparent',
    },
    '& .MuiCardActionArea-focusHighlight': {
      bgcolor: 'transparent',
    },
  };
}

export function getMusicCardContentPadding(cardSize: ListFolderCardSize) {
  switch (cardSize) {
    case 'small':
      return 2;
    case 'large':
      return 2;
    case 'medium':
    default:
      return 2;
  }
}

export function getMusicCardTitleVariant(cardSize: ListFolderCardSize): 'subtitle1' | 'h6' | 'h5' {
  switch (cardSize) {
    case 'small':
      return 'subtitle1';
    case 'large':
      return 'h5';
    case 'medium':
    default:
      return 'h6';
  }
}

export function getMusicCardCoverSize(cardSize: ListFolderCardSize) {
  switch (cardSize) {
    case 'small':
      return 56;
    case 'large':
      return 96;
    case 'medium':
    default:
      return 80;
  }
}

export const MUSIC_LIST_COVER_SIZE = 56;
