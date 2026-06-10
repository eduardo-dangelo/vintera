'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { getCreatePopoverAnchorPositionFromClick } from './createMusicPopoverStyles';

export type ProjectCreatePopoverType = 'album' | 'song' | 'member' | 'event';

export function useProjectCreatePopovers(locale: string, projectId: number) {
  const router = useRouter();
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
      router.push(`/${locale}/songs/${songId}`);
      router.refresh();
    },
    [handlePopoverClose, locale, router],
  );

  const handleAlbumCreated = useCallback(
    (albumId: number) => {
      handlePopoverClose();
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
