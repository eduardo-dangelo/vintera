'use client';

import type { PointerEvent, ReactNode } from 'react';
import type { MediaAlign, MediaSize } from '@/utils/projectMainPage';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { mediaSizeWidth, nearestMediaSize } from '@/utils/projectMainPage';

type MediaSizeFrameProps = {
  size: MediaSize;
  align: MediaAlign;
  canResize: boolean;
  onSize: (size: MediaSize) => void;
  children: ReactNode;
};

export function MediaSizeFrame({ size, align, canResize, onSize, children }: MediaSizeFrameProps) {
  const t = useTranslations('MusicProjects');
  const columnRef = useRef<HTMLDivElement>(null);
  const dragSizeRef = useRef<MediaSize | null>(null);
  const [dragSize, setDragSize] = useState<MediaSize | null>(null);
  const shown = dragSize ?? size;

  const finishDrag = (event: PointerEvent<HTMLElement>, commit: boolean) => {
    const next = dragSizeRef.current;
    dragSizeRef.current = null;
    setDragSize(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (commit && next != null && next !== size) {
      onSize(next);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragSizeRef.current = size;
    setDragSize(size);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (dragSizeRef.current == null || !columnRef.current) {
      return;
    }
    const column = columnRef.current.getBoundingClientRect();
    if (column.width <= 0) {
      return;
    }
    const next = nearestMediaSize((event.clientX - column.left) / column.width);
    dragSizeRef.current = next;
    setDragSize(next);
  };

  return (
    <Box
      ref={columnRef}
      sx={{
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        width: '100%',
      }}
    >
      <Box
        sx={{
          'position': 'relative',
          'width': mediaSizeWidth(shown),
          'maxWidth': '100%',
          '@media (prefers-reduced-motion: no-preference)': {
            transition: 'width 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
          '&:hover [data-media-resize]': { opacity: 1 },
        }}
      >
        {children}
        {canResize && (
          <Box
            data-media-resize=""
            role="slider"
            aria-valuemin={25}
            aria-valuemax={100}
            aria-valuenow={shown * 25}
            aria-label={t('page_drag')}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={event => finishDrag(event, true)}
            onPointerCancel={event => finishDrag(event, false)}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 4,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 12,
              height: 36,
              transform: 'translateY(-50%)',
              cursor: 'ew-resize',
              opacity: dragSize == null ? 0 : 1,
              touchAction: 'none',
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 28,
                borderRadius: 1,
                bgcolor: 'text.primary',
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
