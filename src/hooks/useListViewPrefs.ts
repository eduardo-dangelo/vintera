'use client';

import type { ListFolderCardSize, ListViewMode } from '@/utils/listViewPrefs';
import { useEffect, useState } from 'react';
import {

  loadListViewPrefs,
  saveListViewPrefs,
} from '@/utils/listViewPrefs';

export function useListViewPrefs(locale: string) {
  const [viewMode, setViewMode] = useState<ListViewMode>(() => loadListViewPrefs(locale).viewMode);
  const [cardSize, setCardSize] = useState<ListFolderCardSize>(() => loadListViewPrefs(locale).cardSize);

  useEffect(() => {
    const prefs = loadListViewPrefs(locale);
    setViewMode(prefs.viewMode);
    setCardSize(prefs.cardSize);
  }, [locale]);

  useEffect(() => {
    saveListViewPrefs(locale, { viewMode, cardSize });
  }, [locale, viewMode, cardSize]);

  return {
    viewMode,
    cardSize,
    setViewMode,
    setCardSize,
  };
}
