'use client';

import type { ReactNodeViewProps } from '@tiptap/react';
import type { ChangeEvent } from 'react';
import type { PageImage } from '@/utils/projectMainPage';
import Add from '@mui/icons-material/Add';
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
import { PAGE_IMAGE_ACCEPT, uploadPageImage } from '@/components/MusicProjects/mainPage/pageImageUpload';
import { parsePageImages, PROJECT_IMAGES_NODE } from '@/utils/projectMainPage';

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
  const addInputRef = useRef<HTMLInputElement>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [deleteAnchor, setDeleteAnchor] = useState<HTMLElement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const preview = previewIndex == null ? null : images[previewIndex] ?? null;
  const gallery = images.length + pending > 1;
  const showAdd = canEdit && images.length > 0;

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

  const onAddFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0 || pending > 0) {
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

  const addTile = showAdd
    ? (
        <Box
          component="button"
          type="button"
          aria-label={t('page_image_add')}
          disabled={pending > 0}
          onMouseDown={event => event.preventDefault()}
          onClick={() => addInputRef.current?.click()}
          sx={{
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            'width': gallery ? '100%' : 140,
            'aspectRatio': '1',
            'mt': gallery ? 0 : 1,
            'p': 0,
            'border': '1px dashed',
            'borderColor': 'divider',
            'borderRadius': 2,
            'bgcolor': 'transparent',
            'color': 'text.secondary',
            'cursor': 'pointer',
            '&:disabled': { cursor: 'default', opacity: 0.5 },
          }}
        >
          <Add />
        </Box>
      )
    : null;

  return (
    <BlockShell getPos={getPos}>
      <Box contentEditable={false}>
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
                  {addTile}
                </Box>
              )
            : (
                <Box>
                  {images[0] && (
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
                  )}
                  {addTile}
                </Box>
              )}
        {showAdd && (
          <input
            ref={addInputRef}
            type="file"
            accept={PAGE_IMAGE_ACCEPT}
            multiple
            hidden
            onChange={event => void onAddFiles(event)}
          />
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
