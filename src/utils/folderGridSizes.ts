import type { ListFolderCardSize } from '@/utils/listViewPrefs';

export function getFolderGridSizes(cardSize: ListFolderCardSize): Record<string, string> {
  switch (cardSize) {
    case 'small':
      return { xs: '50%', sm: '33.33%', md: '25%', lg: '20%', xl: '16.66%' };
    case 'large':
      return { xs: '100%', sm: '100%', md: '50%', lg: '33.33%', xl: '25%' };
    case 'medium':
    default:
      return { xs: '50%', sm: '50%', md: '33.33%', lg: '25%', xl: '20%' };
  }
}
