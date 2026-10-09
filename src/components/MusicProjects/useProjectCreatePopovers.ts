'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { getCreatePopoverAnchorPositionFromClick } from './createMusicPopoverStyles';

export type ProjectCreatePopoverType = 'album' | 'song' | 'member' | 'event';

type CreatePopoverHandlers = {
  onSongCreated?: (songId: number) => void;
  onAlbumCreated?: (albumId: number) => void;
};

export function useProjectCreatePopovers(
  locale: string,
  projectId: number,
  handlers?: CreatePopoverHandlers,
) {
  const router = useRouter();
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const [openPopover, setOpenPopover] = useState<ProjectCreatePopoverType | null>(null);
  const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handlePopoverClose = useCallback(() => {
    setOpenPopover(null);
    setPopoverAnchorPosition(null);
  }, []);

  const openPopoverFromClick = useCallback(
    (type: ProjectCreatePopoverType, event: React.MouseEvent<HTMLElement>) => {
      setPopoverAnchorPosition(getCreatePopoverAnchorPositionFromClick(event));
      setOpenPopover(type);
    },
    [],
  );

  const handleSongCreated = useCallback(
    (songId: number) => {
      handlePopoverClose();
      const custom = handlersRef.current?.onSongCreated;
      if (custom) {
        custom(songId);
        return;
      }
      router.push(`/${locale}/songs/${songId}`);
      router.refresh();
    },
    [handlePopoverClose, locale, router],
  );

  const handleAlbumCreated = useCallback(
    (albumId: number) => {
      handlePopoverClose();
      const custom = handlersRef.current?.onAlbumCreated;
      if (custom) {
        custom(albumId);
        return;
      }
      router.push(`/${locale}/albums/${albumId}`);
      router.refresh();
    },
    [handlePopoverClose, locale, router],
  );

  const handleEventCreated = useCallback(() => {
    handlePopoverClose();
    router.refresh();
  }, [handlePopoverClose, router]);

  return {
    openPopover,
    popoverAnchorPosition,
    openPopoverFromClick,
    handlePopoverClose,
    handleSongCreated,
    handleAlbumCreated,
    handleEventCreated,
    locale,
    projectId,
  };
}

export type ProjectCreatePopoversState = ReturnType<typeof useProjectCreatePopovers>;
