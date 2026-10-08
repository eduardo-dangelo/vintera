'use client';

import type { ProjectTabName } from '@/components/MusicProjects/tabs/projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { createContext, use } from 'react';

export type MainPageEditorContextValue = {
  locale: string;
  projectId: number;
  accent: string;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
  onNavigateToTab?: (tab: ProjectTabName) => void;
};

export const MainPageEditorContext = createContext<MainPageEditorContextValue | null>(null);

export function useMainPageEditorContext(): MainPageEditorContextValue {
  const value = use(MainPageEditorContext);
  if (!value) {
    throw new Error('Main page block rendered outside MainPageEditor');
  }
  return value;
}
