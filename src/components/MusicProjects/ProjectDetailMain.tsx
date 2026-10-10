'use client';

import type { JSONContent } from '@tiptap/core';
import type { ProjectTabName } from '@/components/MusicProjects/tabs/projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MainPageEditor } from '@/components/MusicProjects/MainPageEditor';
import { useUpdateMusicProject } from '@/queries/hooks/music-projects/useUpdateMusicProject';
import { mergeCollectionsMigration, mergeMainPage, parseMusicProjectMetadata } from '@/utils/musicProjectMetadata';
import { appendAlbumCollections, mainPageHasEditableContent, resolveMainPage } from '@/utils/projectMainPage';

const SAVE_DELAY_MS = 500;

type ProjectDetailMainProps = {
  locale: string;
  projectId: number;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
  onNavigateToTab?: (tab: ProjectTabName) => void;
  onOverviewPage?: (page: JSONContent | null) => void;
};

export function ProjectDetailMain({
  locale,
  projectId,
  project,
  albums,
  songs,
  canEdit,
  onNavigateToTab,
  onOverviewPage,
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
  const [doc, setDoc] = useState<JSONContent>(resolved);
  const focusedRef = useRef(false);
  const docRef = useRef(doc);
  docRef.current = doc;
  const ackedKeyRef = useRef(resolvedKey);
  const seenUpdatedAtRef = useRef(project.updatedAt);
  const migratedKeyRef = useRef<string | null>(null);
  const migrationSavedRef = useRef<string | null>(null);
  const docKey = JSON.stringify(doc);
  const parsedMeta = parseMusicProjectMetadata(project.metadata);
  const migrationKey = `${projectId}:${albums.map(album => album.id).join(',')}`;
  const onOverviewPageRef = useRef(onOverviewPage);
  onOverviewPageRef.current = onOverviewPage;

  if (
    canEdit
    && !parsedMeta.collectionsMigratedFromAlbums
    && migratedKeyRef.current !== migrationKey
  ) {
    migratedKeyRef.current = migrationKey;
    const next = appendAlbumCollections(doc, albums, songs);
    if (JSON.stringify(next) !== docKey) {
      setDoc(next);
    }
  }

  if (docKey === resolvedKey) {
    ackedKeyRef.current = resolvedKey;
    if (project.updatedAt > seenUpdatedAtRef.current) {
      seenUpdatedAtRef.current = project.updatedAt;
    }
  } else if (
    !focusedRef.current
    && project.updatedAt >= seenUpdatedAtRef.current
    && docKey === ackedKeyRef.current
  ) {
    ackedKeyRef.current = resolvedKey;
    seenUpdatedAtRef.current = project.updatedAt;
    setDoc(resolved);
  }

  const persistMetadata = useCallback((next: JSONContent) => {
    const alreadyMigrated = parseMusicProjectMetadata(metadataRef.current).collectionsMigratedFromAlbums
      || migratedKeyRef.current != null;
    const merge = alreadyMigrated ? mergeCollectionsMigration : mergeMainPage;
    return updateProject.mutateAsync({
      projectId,
      data: { metadata: merge(metadataRef.current, next) },
    });
  }, [projectId, updateProject]);

  const persist = useCallback((next: JSONContent) => {
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      void persistMetadata(next);
    }, SAVE_DELAY_MS);
  }, [persistMetadata]);

  useEffect(() => {
    onOverviewPageRef.current?.(docKey === resolvedKey ? null : doc);
  }, [doc, docKey, resolvedKey]);

  useEffect(() => () => {
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
    }
  }, []);

  useEffect(() => {
    if (!canEdit || migrationSavedRef.current === migrationKey) {
      return;
    }
    if (parseMusicProjectMetadata(metadataRef.current).collectionsMigratedFromAlbums) {
      migrationSavedRef.current = migrationKey;
      return;
    }
    if (migratedKeyRef.current !== migrationKey) {
      return;
    }
    migrationSavedRef.current = migrationKey;
    void persistMetadata(docRef.current);
  }, [canEdit, migrationKey, persistMetadata]);

  const handleFocusChange = useCallback((isFocused: boolean) => {
    focusedRef.current = isFocused;
    if (isFocused || !canEdit) {
      return;
    }
    if (saveTimer.current != null) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
      void persistMetadata(docRef.current);
    }
  }, [canEdit, persistMetadata]);

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
