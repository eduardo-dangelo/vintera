import type { ListFolderCardSize } from '@/utils/listViewPrefs';

export function getMusicCardHoverSx(accent: string) {
  return {
    'transition': 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 12px 40px ${accent}33`,
    },
  };
}

export function getMusicCardContentPadding(cardSize: ListFolderCardSize) {
  switch (cardSize) {
    case 'small':
      return 2;
    case 'large':
      return 3.5;
    case 'medium':
    default:
      return 3;
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
      return 48;
    case 'large':
      return 84;
    case 'medium':
    default:
      return 68;
  }
}

export function getMusicCardDescriptionLines(cardSize: ListFolderCardSize) {
  switch (cardSize) {
    case 'small':
      return 1;
    case 'large':
      return 3;
    case 'medium':
    default:
      return 2;
  }
}
