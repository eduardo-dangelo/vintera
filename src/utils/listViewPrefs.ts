export type ListViewMode = 'folder' | 'list';
export type ListFolderCardSize = 'small' | 'medium' | 'large';

export type ListViewPrefs = {
  viewMode: ListViewMode;
  cardSize: ListFolderCardSize;
};

const STORAGE_PREFIX = 'vintera:listViewPrefs:';

const VALID_VIEW: ListViewMode[] = ['folder', 'list'];
const VALID_CARD_SIZE: ListFolderCardSize[] = ['small', 'medium', 'large'];

const defaults: ListViewPrefs = {
  viewMode: 'folder',
  cardSize: 'medium',
};

function normalizeCardSize(raw: unknown): ListFolderCardSize {
  if (VALID_CARD_SIZE.includes(raw as ListFolderCardSize)) {
    return raw as ListFolderCardSize;
  }
  return defaults.cardSize;
}

export function loadListViewPrefs(locale: string): ListViewPrefs {
  if (typeof window === 'undefined') {
    return defaults;
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${locale}`);
    if (!raw) {
      return defaults;
    }
    const p = JSON.parse(raw) as Partial<ListViewPrefs>;
    const viewMode = VALID_VIEW.includes(p.viewMode as ListViewMode)
      ? (p.viewMode as ListViewMode)
      : defaults.viewMode;
    const cardSize = normalizeCardSize(p.cardSize);
    return { viewMode, cardSize };
  } catch {
    return defaults;
  }
}

export function saveListViewPrefs(locale: string, prefs: ListViewPrefs) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${locale}`, JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}
