'use client';

import type { MusicItemMenuTarget } from './musicItemMenuTypes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { useDeleteAlbumById } from '@/queries/hooks/albums/useDeleteAlbumById';
import { useDeleteMusicProject } from '@/queries/hooks/music-projects/useDeleteMusicProject';
import { useDeleteSongById } from '@/queries/hooks/songs/useDeleteSongById';
import { MusicItemContextMenuPopover } from './MusicItemContextMenuPopover';

type MenuState = {
  target: MusicItemMenuTarget;
  anchorEl: HTMLElement | null;
  anchorPosition: { top: number; left: number } | null;
};

export function useMusicItemContextMenu(locale: string) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const deleteProject = useDeleteMusicProject(locale);
  const deleteSong = useDeleteSongById(locale);
  const deleteAlbum = useDeleteAlbumById(locale);

  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);
  const [deleteConfirmAnchorPosition, setDeleteConfirmAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MusicItemMenuTarget | null>(null);

  const closeMenu = useCallback(() => {
    setMenuState(null);
  }, []);

  const openFromButton = useCallback((event: React.MouseEvent<HTMLElement>, target: MusicItemMenuTarget) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuState({
      target,
      anchorEl: event.currentTarget,
      anchorPosition: null,
    });
  }, []);

  const openFromContextMenu = useCallback((event: React.MouseEvent, target: MusicItemMenuTarget) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuState({
      target,
      anchorEl: null,
      anchorPosition: { top: event.clientY, left: event.clientX },
    });
  }, []);

  const handleView = useCallback(() => {
    if (!menuState) {
      return;
    }
    router.push(menuState.target.href);
    closeMenu();
  }, [menuState, router, closeMenu]);

  const handleDeleteClick = useCallback(() => {
    if (!menuState) {
      return;
    }
    const { target, anchorEl, anchorPosition } = menuState;
    closeMenu();
    setPendingDelete(target);
    setDeleteConfirmAnchor(anchorEl);
    setDeleteConfirmAnchorPosition(anchorPosition);
  }, [menuState, closeMenu]);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmAnchor(null);
    setDeleteConfirmAnchorPosition(null);
    setPendingDelete(null);
  }, []);

  const getDeleteConfirmMessage = useCallback((target: MusicItemMenuTarget) => {
    switch (target.kind) {
      case 'project':
        return t('delete_confirm');
      case 'song':
        return t('song_delete_confirm');
      case 'album':
        return t('album_delete_confirm');
    }
  }, [t]);

  const getListHrefAfterDelete = useCallback((kind: MusicItemMenuTarget['kind']) => {
    switch (kind) {
      case 'project':
        return `/${locale}/projects`;
      case 'song':
        return `/${locale}/songs`;
      case 'album':
        return `/${locale}/albums`;
    }
  }, [locale]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) {
      return;
    }
    const { kind, id } = pendingDelete;
    try {
      if (kind === 'project') {
        await deleteProject.mutateAsync(id);
      } else if (kind === 'song') {
        await deleteSong.mutateAsync({ songId: id });
      } else {
        await deleteAlbum.mutateAsync({ albumId: id });
      }
      closeDeleteConfirm();
      router.push(getListHrefAfterDelete(kind));
    } catch {
      // Keep confirm open on error
    }
  }, [
    pendingDelete,
    deleteProject,
    deleteSong,
    deleteAlbum,
    closeDeleteConfirm,
    router,
    getListHrefAfterDelete,
  ]);

  const isDeleting = deleteProject.isPending || deleteSong.isPending || deleteAlbum.isPending;

  const renderMenus = useCallback(() => (
    <>
      <MusicItemContextMenuPopover
        open={Boolean(menuState)}
        anchorEl={menuState?.anchorEl ?? null}
        anchorPosition={menuState?.anchorPosition ?? null}
        onClose={closeMenu}
        onView={handleView}
        onDelete={handleDeleteClick}
      />
      <ConfirmPopover
        open={Boolean(pendingDelete && (deleteConfirmAnchor ?? deleteConfirmAnchorPosition))}
        anchorEl={deleteConfirmAnchor}
        anchorPosition={deleteConfirmAnchorPosition}
        onClose={closeDeleteConfirm}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        message={pendingDelete ? getDeleteConfirmMessage(pendingDelete) : ''}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmColor="error"
        loading={isDeleting}
      />
    </>
  ), [
    menuState,
    closeMenu,
    handleView,
    handleDeleteClick,
    deleteConfirmAnchor,
    deleteConfirmAnchorPosition,
    pendingDelete,
    closeDeleteConfirm,
    handleConfirmDelete,
    getDeleteConfirmMessage,
    t,
    isDeleting,
  ]);

  return {
    openFromButton,
    openFromContextMenu,
    closeMenu,
    renderMenus,
  };
}
