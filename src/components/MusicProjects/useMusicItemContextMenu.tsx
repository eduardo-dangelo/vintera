'use client';

import type { MusicItemMenuTarget } from './musicItemMenuTypes';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { useDeleteAlbumById } from '@/queries/hooks/albums/useDeleteAlbumById';
import { useDuplicateAlbumById } from '@/queries/hooks/albums/useDuplicateAlbumById';
import { useDeleteMusicProject } from '@/queries/hooks/music-projects/useDeleteMusicProject';
import { useDuplicateMusicProject } from '@/queries/hooks/music-projects/useDuplicateMusicProject';
import { useDeleteSongById } from '@/queries/hooks/songs/useDeleteSongById';
import { useDuplicateSongById } from '@/queries/hooks/songs/useDuplicateSongById';
import { getSharePageHref } from '@/utils/shareUrls';
import { MusicItemContextMenuPopover } from './MusicItemContextMenuPopover';
import { MusicItemRenamePopover } from './MusicItemRenamePopover';

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
  const duplicateProject = useDuplicateMusicProject(locale);
  const duplicateSong = useDuplicateSongById(locale);
  const duplicateAlbum = useDuplicateAlbumById(locale);

  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const [renameTarget, setRenameTarget] = useState<MusicItemMenuTarget | null>(null);
  const [renameAnchor, setRenameAnchor] = useState<HTMLElement | null>(null);
  const [renameAnchorPosition, setRenameAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);
  const [deleteConfirmAnchorPosition, setDeleteConfirmAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MusicItemMenuTarget | null>(null);

  const closeMenu = useCallback(() => {
    setMenuState(null);
    setLinkCopied(false);
  }, []);

  const openFromButton = useCallback((event: React.MouseEvent<HTMLElement>, target: MusicItemMenuTarget) => {
    event.stopPropagation();
    event.preventDefault();
    setLinkCopied(false);
    setMenuState({
      target,
      anchorEl: event.currentTarget,
      anchorPosition: null,
    });
  }, []);

  const openFromContextMenu = useCallback((event: React.MouseEvent, target: MusicItemMenuTarget) => {
    event.preventDefault();
    event.stopPropagation();
    setLinkCopied(false);
    setMenuState({
      target,
      anchorEl: null,
      anchorPosition: { top: event.clientY, left: event.clientX },
    });
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!menuState) {
      return;
    }
    const sharePath = getSharePageHref(locale, menuState.target.kind, menuState.target.id);
    const url = `${window.location.origin}${sharePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => {
        closeMenu();
      }, 700);
    } catch {
      // Keep menu open if copy fails
    }
  }, [menuState, locale, closeMenu]);

  const handleDuplicate = useCallback(async () => {
    if (!menuState) {
      return;
    }
    const { kind, id } = menuState.target;
    try {
      if (kind === 'project') {
        await duplicateProject.mutateAsync(id);
      } else if (kind === 'song') {
        await duplicateSong.mutateAsync({ songId: id });
      } else {
        await duplicateAlbum.mutateAsync({ albumId: id });
      }
      closeMenu();
    } catch {
      // Keep menu open on error
    }
  }, [menuState, duplicateProject, duplicateSong, duplicateAlbum, closeMenu]);

  const handleRenameClick = useCallback(() => {
    if (!menuState) {
      return;
    }
    const { target, anchorEl, anchorPosition } = menuState;
    closeMenu();
    setRenameTarget(target);
    setRenameAnchor(anchorEl);
    setRenameAnchorPosition(anchorPosition);
  }, [menuState, closeMenu]);

  const closeRename = useCallback(() => {
    setRenameTarget(null);
    setRenameAnchor(null);
    setRenameAnchorPosition(null);
  }, []);

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
  const isDuplicating = duplicateProject.isPending || duplicateSong.isPending || duplicateAlbum.isPending;

  const renderMenus = useCallback(() => (
    <>
      <MusicItemContextMenuPopover
        open={Boolean(menuState)}
        anchorEl={menuState?.anchorEl ?? null}
        anchorPosition={menuState?.anchorPosition ?? null}
        onClose={closeMenu}
        onCopyLink={() => {
          void handleCopyLink();
        }}
        onDuplicate={() => {
          void handleDuplicate();
        }}
        onRename={handleRenameClick}
        onDelete={handleDeleteClick}
        duplicating={isDuplicating}
        linkCopied={linkCopied}
      />
      <MusicItemRenamePopover
        open={Boolean(renameTarget && (renameAnchor ?? renameAnchorPosition))}
        target={renameTarget}
        locale={locale}
        anchorEl={renameAnchor}
        anchorPosition={renameAnchorPosition}
        onClose={closeRename}
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
        confirmLabel={t('context_menu_move_to_trash')}
        cancelLabel={t('cancel')}
        confirmColor="error"
        loading={isDeleting}
      />
    </>
  ), [
    menuState,
    closeMenu,
    handleCopyLink,
    handleDuplicate,
    handleRenameClick,
    handleDeleteClick,
    isDuplicating,
    linkCopied,
    renameTarget,
    renameAnchor,
    renameAnchorPosition,
    locale,
    closeRename,
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
    menuTarget: menuState?.target ?? renameTarget ?? null,
  };
}
