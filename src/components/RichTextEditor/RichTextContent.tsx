'use client';

import { Box, Button } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isRichTextEmpty,
  sanitizeRichTextHtml,
  toRichTextEditorContent,
} from '@/utils/sanitizeRichTextHtml';
import {
  RICH_TEXT_COLLAPSED_MAX_HEIGHT,
  richTextContentSx,
} from './richTextContentSx';

type RichTextContentProps = {
  value: string | null;
  accent?: string;
  emptyLabel?: string;
  viewMoreLabel?: string;
  viewLessLabel?: string;
};

export function RichTextContent({
  value,
  accent = '#7c3aed',
  emptyLabel,
  viewMoreLabel = 'View more',
  viewLessLabel = 'View less',
}: RichTextContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const html = toRichTextEditorContent(value);
  const isEmpty = isRichTextEmpty(html);

  const measureOverflow = useCallback(() => {
    const el = contentRef.current;
    if (!el || isEmpty) {
      setIsOverflowing(false);
      return;
    }
    setIsOverflowing(el.scrollHeight > RICH_TEXT_COLLAPSED_MAX_HEIGHT + 1);
  }, [isEmpty]);

  useEffect(() => {
    setIsExpanded(false);
  }, [value]);

  useEffect(() => {
    measureOverflow();
  }, [html, measureOverflow]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      measureOverflow();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [measureOverflow]);

  if (isEmpty) {
    return (
      <Box component="p" sx={{ m: 0, fontSize: '0.875rem', color: 'text.disabled', fontStyle: 'italic' }}>
        {emptyLabel}
      </Box>
    );
  }

  const showToggle = isOverflowing;

  return (
    <Box>
      <Box
        ref={contentRef}
        sx={{
          ...richTextContentSx(accent),
          ...(showToggle && !isExpanded
            ? {
                maxHeight: RICH_TEXT_COLLAPSED_MAX_HEIGHT,
                overflow: 'hidden',
              }
            : {}),
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(html) }}
      />
      {showToggle && (
        <Button
          size="small"
          onClick={() => setIsExpanded(prev => !prev)}
          sx={{
            mt: 0.5,
            p: 0,
            minWidth: 0,
            textTransform: 'none',
            color: accent,
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          {isExpanded ? viewLessLabel : viewMoreLabel}
        </Button>
      )}
    </Box>
  );
}
