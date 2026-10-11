'use client';

import type { ReactNodeViewProps } from '@tiptap/react';
import type { DragEvent } from 'react';
import type { PageImage } from '@/utils/projectMainPage';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Close from '@mui/icons-material/Close';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import { Box, Dialog, DialogContent, IconButton, Skeleton, Typography } from '@mui/material';
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { useMainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import { BlockShell } from '@/components/MusicProjects/mainPage/mainPageNodes';
import { MediaSizeFrame } from '@/components/MusicProjects/mainPage/mediaSizeFrame';
import { acceptedPageImageFiles, uploadPageImage } from '@/components/MusicProjects/mainPage/pageImageUpload';
import { parseMediaSize, parsePageImages, PROJECT_IMAGES_NODE } from '@/utils/projectMainPage';

const navButtonSx = (side: 'left' | 'right') => ({
  'position': 'absolute' as const,
  [side]: 8,
  'top': '50%',
  'transform': 'translateY(-50%)',
  'bgcolor': 'rgba(0,0,0,0.3)',
  'color': 'white',
  '&:hover': {
    bgcolor: 'rgba(0,0,0,0.5)',
  },
});

const deleteButtonSx = {
  'position': 'absolute' as const,
  'top': 8,
  'right': 8,
  'zIndex': 1,
  'bgcolor': 'rgba(0,0,0,0.5)',
  'color': 'white',
  'opacity': 0,
  'borderRadius': 1,
  '&:hover': {
    bgcolor: 'rgba(0,0,0,0.7)',
  },
};

function readPending(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function PageImagesView({ node, editor, updateAttributes, deleteNode, getPos }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const { canEdit, locale, projectId } = useMainPageEditorContext();
  const images = parsePageImages(node.attrs.images);
  const pending = readPending(node.attrs.pending);
  const dragDepth = useRef(0);
  const [dropActive, setDropActive] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deleteAnchor, setDeleteAnchor] = useState<HTMLElement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const preview = previewIndex == null ? null : images[previewIndex] ?? null;
  const gallery = images.length + pending > 1;
  const canAppend = canEdit && images.length > 0 && pending === 0;

  const closePreview = () => setPreviewIndex(null);
  const goToPrev = () => {
    setPreviewIndex((current) => {
      if (current == null || images.length === 0) {
        return current;
      }
      return current <= 0 ? images.length - 1 : current - 1;
    });
  };
  const goToNext = () => {
    setPreviewIndex((current) => {
      if (current == null || images.length === 0) {
        return current;
      }
      return current >= images.length - 1 ? 0 : current + 1;
    });
  };

  const confirmRemove = () => {
    const next = images.filter(image => image.id !== deleteId);
    setDeleteAnchor(null);
    setDeleteId(null);
    setPreviewIndex(null);
    if (next.length === 0 && pending === 0) {
      deleteNode();
      return;
    }
    updateAttributes({ images: next });
  };

  const appendFiles = async (files: File[]) => {
    if (files.length === 0 || pending > 0 || images.length === 0) {
      return;
    }
    updateAttributes({ pending: files.length });
    const uploaded = (await Promise.all(
      files.map(file => uploadPageImage(locale, projectId, file)),
    )).filter(image => image != null);
    const pos = getPos();
    const current = typeof pos === 'number' ? editor.state.doc.nodeAt(pos) : null;
    if (!current) {
      return;
    }
    updateAttributes({
      images: [...parsePageImages(current.attrs.images), ...uploaded],
      pending: 0,
    });
  };

  const fileDrag = (event: DragEvent<HTMLElement>) => (
    canEdit && (event.dataTransfer?.types.includes('Files') ?? false)
  );

  const onDragEnter = (event: DragEvent<HTMLElement>) => {
    if (!fileDrag(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current += 1;
    if (canAppend) {
      setDropActive(true);
    }
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!fileDrag(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    if (!fileDrag(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setDropActive(false);
    }
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!fileDrag(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setDropActive(false);
    if (!canAppend) {
      return;
    }
    void appendFiles(acceptedPageImageFiles(event.dataTransfer?.files ?? []));
  };

  const askRemove = (anchor: HTMLElement, id: string) => {
    setDeleteAnchor(anchor);
    setDeleteId(id);
  };

  const skeletons = Array.from({ length: pending }, (_, index) => (
    <Skeleton
      key={`pending-${index}`}
      variant="rounded"
      sx={{
        width: '100%',
        height: gallery ? 'auto' : 240,
        aspectRatio: gallery ? '1' : undefined,
        borderRadius: gallery ? 2 : 1,
        transform: 'none',
      }}
    />
  ));

  return (
    <BlockShell getPos={getPos}>
      <Box
        contentEditable={false}
        data-project-images=""
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        sx={{
          borderRadius: 1,
          outline: dropActive ? '1px dashed' : '1px solid transparent',
          outlineColor: dropActive ? 'primary.main' : 'transparent',
          bgcolor: dropActive ? 'action.hover' : 'transparent',
        }}
      >
        {images.length === 0 && pending <= 1
          ? skeletons
          : gallery
            ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 2,
                  }}
                >
                  {images.map((image, index) => (
                    <Box
                      key={image.id}
                      sx={{
                        'position': 'relative',
                        '&:hover [data-image-delete]': { opacity: 1 },
                      }}
                    >
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setPreviewIndex(index)}
                        aria-label={image.name || t('page_add_images')}
                        sx={{
                          'p': 0,
                          'border': 0,
                          'width': '100%',
                          'aspectRatio': '1',
                          'borderRadius': 2,
                          'overflow': 'hidden',
                          'cursor': 'pointer',
                          'bgcolor': 'transparent',
                          '&:hover img': { opacity: 0.9 },
                        }}
                      >
                        <Box
                          component="img"
                          src={image.url}
                          alt=""
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </Box>
                      {canEdit && (
                        <IconButton
                          size="small"
                          aria-label={t('page_remove')}
                          data-image-delete=""
                          data-open={deleteId === image.id ? 'true' : 'false'}
                          onMouseDown={event => event.preventDefault()}
                          onClick={(event) => {
                            event.stopPropagation();
                            askRemove(event.currentTarget, image.id);
                          }}
                          sx={{
                            ...deleteButtonSx,
                            'opacity': deleteId === image.id ? 1 : 0,
                            '&[data-open="true"]': { opacity: 1 },
                          }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  {skeletons}
                </Box>
              )
            : (
                <Box>
                  {images[0] && (
                    <MediaSizeFrame
                      size={parseMediaSize(node.attrs.size)}
                      canResize={canEdit}
                      onSize={size => updateAttributes({ size })}
                    >
                      <Box
                        sx={{
                          'position': 'relative',
                          '&:hover [data-image-delete]': { opacity: 1 },
                        }}
                      >
                        <Box
                          component="img"
                          src={images[0].url}
                          alt={images[0].name}
                          sx={{ display: 'block', width: '100%', height: 'auto', borderRadius: 1 }}
                        />
                        {canEdit && (
                          <IconButton
                            size="small"
                            aria-label={t('page_remove')}
                            data-image-delete=""
                            data-open={deleteId === images[0].id ? 'true' : 'false'}
                            onMouseDown={event => event.preventDefault()}
                            onClick={event => askRemove(event.currentTarget, images[0]?.id ?? '')}
                            sx={{
                              ...deleteButtonSx,
                              'opacity': deleteId === images[0].id ? 1 : 0,
                              '&[data-open="true"]': { opacity: 1 },
                            }}
                          >
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </MediaSizeFrame>
                  )}
                </Box>
              )}
      </Box>
      <ConfirmPopover
        open={deleteAnchor != null}
        anchorEl={deleteAnchor}
        onClose={() => {
          setDeleteAnchor(null);
          setDeleteId(null);
        }}
        onConfirm={confirmRemove}
        message={t('page_image_remove_confirm')}
        confirmLabel={t('page_remove')}
        cancelLabel={t('page_image_cancel')}
        confirmColor="error"
      />
      <Dialog
        open={preview != null}
        onClose={closePreview}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { maxHeight: '90vh', bgcolor: 'background.paper' } } }}
      >
        {preview && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                {preview.name}
              </Typography>
              <IconButton size="small" onClick={closePreview} aria-label={t('page_image_close')}>
                <Close />
              </IconButton>
            </Box>
            <DialogContent
              sx={{
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {images.length > 1 && (
                <>
                  <IconButton onClick={goToPrev} sx={navButtonSx('left')} aria-label={t('page_image_previous')}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton onClick={goToNext} sx={navButtonSx('right')} aria-label={t('page_image_next')}>
                    <ChevronRight />
                  </IconButton>
                </>
              )}
              <Box
                component="img"
                src={preview.url}
                alt={preview.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </BlockShell>
  );
}

export const ProjectImagesNode = Node.create({
  name: PROJECT_IMAGES_NODE,
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() {
    return {
      images: { default: [] as PageImage[] },
      pending: { default: 0 },
      batchId: { default: null as string | null },
      size: { default: 4 },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-project-images]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-project-images': 'true' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(PageImagesView);
  },
});
