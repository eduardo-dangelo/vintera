'use client';

import type { JSONContent } from '@tiptap/core';
import type { ProjectTabName } from '@/components/MusicProjects/tabs/projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MainPageEditor } from '@/components/MusicProjects/MainPageEditor';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { mergeMainPage, parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';
import { mainPageHasEditableContent, resolveMainPage } from '@/utils/projectMainPage';

const SAVE_DELAY_MS = 500;

type ProjectDetailMainProps = {
  locale: string;
  projectId: number;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
  onNavigateToTab?: (tab: ProjectTabName) => void;
};

export function ProjectDetailMain({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit,
  onNavigateToTab,
}: ProjectDetailMainProps) {
  const updateProject = useUpdateMusicProject(locale);
  const metadataRef = useRef(project.metadata);
  metadataRef.current = project.metadata;
  const saveTimer = useRef<number | null>(null);

  const resolved = useMemo(() => {
    const parsed = parseMusicProjectMetadata(project.metadata);
    return resolveMainPage(parsed.mainPage, parsed.mainSections, albums.length, songs.length);
  }, [albums.length, project.metadata, songs.length]);

  const resolvedKey = JSON.stringify(resolved);
  const [syncedKey, setSyncedKey] = useState(resolvedKey);
  const [doc, setDoc] = useState<JSONContent>(resolved);
  const focusedRef = useRef(false);
  const docRef = useRef(doc);
  docRef.current = doc;

  if (syncedKey !== resolvedKey && !focusedRef.current) {
    setSyncedKey(resolvedKey);
    setDoc(resolved);
  }

  const persist = useCallback((next: JSONContent) => {
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      void updateProject.mutateAsync({
        projectId,
        data: { metadata: mergeMainPage(metadataRef.current, next) },
      });
    }, SAVE_DELAY_MS);
  }, [projectId, updateProject]);

  useEffect(() => () => {
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
    }
  }, []);

  const handleFocusChange = useCallback((isFocused: boolean) => {
    focusedRef.current = isFocused;
    if (isFocused || !canEdit) {
      return;
    }
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
      void updateProject.mutateAsync({
        projectId,
        data: { metadata: mergeMainPage(metadataRef.current, docRef.current) },
      });
    }
  }, [canEdit, projectId, updateProject]);

  return (
    <MainPageEditor
      value={doc}
      onChange={(next) => {
        setDoc(next);
        if (canEdit) {
          persist(next);
        }
      }}
      onFocusChange={handleFocusChange}
      locale={locale}
      projectId={projectId}
      accent={project.color || '#7c3aed'}
      project={project}
      albums={albums}
      songs={songs}
      canEdit={canEdit}
      focusOnMount={canEdit && !mainPageHasEditableContent(doc)}
      onNavigateToTab={onNavigateToTab}
    />
  );
}
