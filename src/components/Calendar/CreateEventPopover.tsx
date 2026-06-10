'use client';

import type { AssetOption } from './CreateEventForm';
import type { CalendarEvent } from './types';
import { Box } from '@mui/material';
import { Popover } from '@/components/common/Popover';
import {
  CREATE_POPOVER_CLICK_ANCHOR_ORIGIN,
  CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN,
} from '@/components/MusicProjects/createMusicPopoverStyles';
import { glassPaperSx } from '@/utils/glassPaperStyles';
import { CreateEventForm } from './CreateEventForm';

const POPOVER_WIDTH = 360;
const POPOVER_MAX_HEIGHT = 580;

type CreateEventPopoverProps = {
  open: boolean;
  anchorEl?: HTMLElement | null;
  anchorPosition?: { top: number; left: number } | null;
  onClose: () => void;
  initialDate?: Date;
  assetId?: number;
  musicProjectId?: number;
  assets?: AssetOption[];
  locale: string;
  /** @deprecated Use onSuccess with mode="create" instead. */
  onCreateSuccess?: (event: CalendarEvent) => void;
  mode?: 'create' | 'edit';
  event?: CalendarEvent | null;
  onSuccess?: (event: CalendarEvent) => void;
  onDeleteSuccess?: (eventId: number) => void;
};

export function CreateEventPopover({
  open,
  anchorEl = null,
  anchorPosition,
  onClose,
  initialDate,
  assetId,
  musicProjectId,
  assets,
  locale,
  onCreateSuccess,
  mode = 'create',
  event,
  onSuccess,
  onDeleteSuccess,
}: CreateEventPopoverProps) {
  const handleSuccess = (savedEvent: CalendarEvent) => {
    onSuccess?.(savedEvent);
    onCreateSuccess?.(savedEvent);
    onClose();
  };

  const usePositionAnchor = anchorPosition != null;

  return (
    <Popover
      open={open}
      anchorEl={usePositionAnchor ? null : anchorEl}
      anchorPosition={anchorPosition}
      anchorOrigin={usePositionAnchor ? CREATE_POPOVER_CLICK_ANCHOR_ORIGIN : undefined}
      transformOrigin={usePositionAnchor ? CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN : undefined}
      onClose={onClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      maxHeight={POPOVER_MAX_HEIGHT}
      showArrow={!usePositionAnchor}
      paperSx={glassPaperSx}
    >
      <Box sx={{ maxHeight: POPOVER_MAX_HEIGHT, overflow: 'auto' }}>
        <CreateEventForm
          open={open}
          initialDate={initialDate}
          assetId={assetId}
          musicProjectId={musicProjectId}
          assets={assets}
          locale={locale}
          onSuccess={handleSuccess}
          onCancel={onClose}
          onDeleteSuccess={onDeleteSuccess}
          variant="popover"
          mode={mode}
          event={event}
        />
      </Box>
    </Popover>
  );
}
