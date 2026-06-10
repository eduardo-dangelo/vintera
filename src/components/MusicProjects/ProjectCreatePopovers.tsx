'use client';

import type { ProjectCreatePopoversState } from './useProjectCreatePopovers';
import { CreateEventPopover } from '@/components/Calendar/CreateEventPopover';
import { AddProjectMemberPopover } from '@/components/MusicProjects/AddProjectMemberPopover';
import { CreateAlbumPopover } from './CreateAlbumPopover';
import { CreateSongPopover } from './CreateSongPopover';

type ProjectCreatePopoversProps = {
  state: ProjectCreatePopoversState;
};

export function ProjectCreatePopovers({ state }: ProjectCreatePopoversProps) {
  const {
    openPopover,
    popoverAnchorPosition,
    handlePopoverClose,
    handleSongCreated,
    handleAlbumCreated,
    handleEventCreated,
    locale,
    projectId,
  } = state;

  return (
    <>
      <CreateSongPopover
        open={openPopover === 'song'}
        onClose={handlePopoverClose}
        locale={locale}
        projectId={projectId}
        onCreated={handleSongCreated}
        anchorPosition={popoverAnchorPosition}
      />
      <CreateAlbumPopover
        open={openPopover === 'album'}
        onClose={handlePopoverClose}
        locale={locale}
        projectId={projectId}
        onCreated={handleAlbumCreated}
        anchorPosition={popoverAnchorPosition}
      />
      <AddProjectMemberPopover
        open={openPopover === 'member'}
        anchorPosition={popoverAnchorPosition}
        locale={locale}
        projectId={projectId}
        onClose={handlePopoverClose}
        onAdded={handlePopoverClose}
      />
      <CreateEventPopover
        open={openPopover === 'event'}
        anchorPosition={popoverAnchorPosition}
        onClose={handlePopoverClose}
        initialDate={new Date()}
        musicProjectId={projectId}
        locale={locale}
        onCreateSuccess={handleEventCreated}
      />
    </>
  );
}
