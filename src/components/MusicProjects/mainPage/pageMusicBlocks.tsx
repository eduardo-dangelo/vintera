'use client';

import type { Editor } from '@tiptap/core';
import type { ReactNodeViewProps } from '@tiptap/react';
import type { ReactNode } from 'react';
import type { SongListItem } from '@/queries/hooks/songs';
import type { PageBlockView, PageListMode } from '@/utils/projectMainPage';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AlbumCard } from '@/components/MusicProjects/AlbumCard';
import { useMainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import { BlockShell } from '@/components/MusicProjects/mainPage/mainPageNodes';
import { SongCard } from '@/components/MusicProjects/SongCard';
import { toAlbumListItem } from '@/components/MusicProjects/tabs/projectAlbumUtils';
import { toFallbackSongListItem } from '@/components/MusicProjects/tabs/projectSongUtils';
import { hasAlbumsTab, hasSongsTab, OVERVIEW_PREVIEW_LIMIT } from '@/components/MusicProjects/tabs/projectTabVisibility';
import { sortByRecent, takeRecent } from '@/components/MusicProjects/tabs/recentItems';
import { AlbumListView } from '@/components/MusicProjects/Views/AlbumListView';
import { SongListView } from '@/components/MusicProjects/Views/SongListView';
import { useSongs } from '@/queries/hooks/songs';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import {
  PROJECT_ALBUM_LIST_NODE,
  PROJECT_ALBUM_NODE,
  PROJECT_SONG_LIST_NODE,
  PROJECT_SONG_NODE,
} from '@/utils/projectMainPage';

function readPos(getPos: ReactNodeViewProps['getPos']): number | null {
  if (typeof getPos !== 'function') {
    return null;
  }
  const pos = getPos();
  return typeof pos === 'number' ? pos : null;
}

function readView(value: unknown): PageBlockView {
  return value === 'card' ? 'card' : 'row';
}

function readMode(value: unknown): PageListMode {
  return value === 'custom' ? 'custom' : 'recent';
}

function readTitle(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readItemId(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function readItemIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids: number[] = [];
  for (const item of value) {
    const id = readItemId(item);
    if (id != null && !ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

function patchAttrs(
  editor: Editor,
  getPos: ReactNodeViewProps['getPos'],
  patch: Record<string, unknown>,
) {
  const pos = readPos(getPos);
  if (pos == null) {
    return;
  }
  const node = editor.state.doc.nodeAt(pos);
  if (!node) {
    return;
  }
  editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, {
    ...node.attrs,
    ...patch,
  }));
}

function ListTitleField({
  value,
  fallback,
  onCommit,
}: {
  value: string;
  fallback: string;
  onCommit: (next: string) => void;
}) {
  const { canEdit } = useMainPageEditorContext();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const shown = value.trim() || fallback;

  useEffect(() => {
    if (!editing) {
      return;
    }
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  if (!canEdit || !editing) {
    return (
      <Typography
        variant="h6"
        onClick={() => {
          if (!canEdit) {
            return;
          }
          setDraft(value);
          setEditing(true);
        }}
        sx={{
          fontWeight: 700,
          fontSize: '1.05rem',
          cursor: canEdit ? 'text' : 'default',
        }}
      >
        {shown}
      </Typography>
    );
  }

  return (
    <Box
      component="input"
      ref={inputRef}
      value={draft}
      aria-label={fallback}
      onChange={event => setDraft(event.target.value)}
      onMouseDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}
      onBlur={() => {
        setEditing(false);
        onCommit(draft.trim());
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          setDraft(value);
          setEditing(false);
        }
      }}
      sx={{
        border: 0,
        outline: 0,
        p: 0,
        m: 0,
        width: '100%',
        background: 'transparent',
        color: 'inherit',
        font: 'inherit',
        fontWeight: 700,
        fontSize: '1.05rem',
      }}
    />
  );
}

function useSongItems(mode: 'recent' | 'custom' | 'one', ids: number[]): SongListItem[] {
  const ctx = useMainPageEditorContext();
  const { data: allSongs } = useSongs(ctx.locale);
  const idsKey = ids.join(',');
  return useMemo(() => {
    const songsById = new Map(allSongs?.map(song => [song.id, song]) ?? []);
    const wanted = idsKey ? idsKey.split(',').map(Number) : [];
    const source = mode === 'recent'
      ? takeRecent(sortByRecent(ctx.songs, song => song.updatedAt), OVERVIEW_PREVIEW_LIMIT)
      : wanted.flatMap((id) => {
          const song = ctx.songs.find(item => item.id === id);
          return song ? [song] : [];
        });
    return source.map(song => (
      songsById.get(song.id) ?? toFallbackSongListItem(song, ctx.projectId, ctx.project, ctx.albums)
    ));
  }, [allSongs, ctx.albums, ctx.project, ctx.projectId, ctx.songs, idsKey, mode]);
}

function useAlbumItems(mode: 'recent' | 'custom' | 'one', ids: number[]) {
  const ctx = useMainPageEditorContext();
  const idsKey = ids.join(',');
  return useMemo(() => {
    const wanted = idsKey ? idsKey.split(',').map(Number) : [];
    const source = mode === 'recent'
      ? takeRecent(sortByRecent(ctx.albums, album => album.updatedAt), OVERVIEW_PREVIEW_LIMIT)
      : wanted.flatMap((id) => {
          const album = ctx.albums.find(item => item.id === id);
          return album ? [album] : [];
        });
    return source.map(album => toAlbumListItem(album, ctx.project, ctx.songs));
  }, [ctx.albums, ctx.project, ctx.songs, idsKey, mode]);
}

function SongItems({ songs, view }: { songs: SongListItem[]; view: PageBlockView }) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  if (songs.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {t('no_songs')}
      </Typography>
    );
  }
  if (view === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
        {songs.map(song => (
          <SongCard
            key={song.id}
            song={song}
            locale={ctx.locale}
            projectId={ctx.projectId}
            cardSize="small"
            hideItemActions
          />
        ))}
      </Box>
    );
  }
  return <SongListView songs={songs} locale={ctx.locale} projectId={ctx.projectId} hideItemActions />;
}

function AlbumItems({
  albums,
  view,
}: {
  albums: ReturnType<typeof toAlbumListItem>[];
  view: PageBlockView;
}) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  if (albums.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {t('no_albums')}
      </Typography>
    );
  }
  if (view === 'card') {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
        {albums.map(album => (
          <AlbumCard key={album.id} album={album} locale={ctx.locale} cardSize="small" hideItemActions />
        ))}
      </Box>
    );
  }
  return <AlbumListView albums={albums} locale={ctx.locale} hideItemActions />;
}

function ItemPicker({
  anchorPosition,
  options,
  selectedIds,
  emptyLabel,
  onToggle,
  onClose,
}: {
  anchorPosition: { top: number; left: number } | null;
  options: { id: number; label: string }[];
  selectedIds: number[];
  emptyLabel: string;
  onToggle: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <Menu
      open={anchorPosition != null}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? undefined}
      slotProps={getGlassMenuSlotProps({ minWidth: 220 })}
    >
      {options.length === 0
        ? (
            <MenuItem disabled sx={glassMenuItemSx}>
              {emptyLabel}
            </MenuItem>
          )
        : options.map(option => (
            <MenuItem
              key={option.id}
              selected={selectedIds.includes(option.id)}
              sx={glassMenuItemSx}
              onClick={() => onToggle(option.id)}
            >
              {option.label}
            </MenuItem>
          ))}
    </Menu>
  );
}

function viewMenu(
  view: PageBlockView,
  onView: (next: PageBlockView) => void,
  close: () => void,
  labels: { row: string; card: string },
) {
  return (
    <>
      <MenuItem
        selected={view === 'row'}
        sx={glassMenuItemSx}
        onClick={() => {
          onView('row');
          close();
        }}
      >
        {labels.row}
      </MenuItem>
      <MenuItem
        selected={view === 'card'}
        sx={glassMenuItemSx}
        onClick={() => {
          onView('card');
          close();
        }}
      >
        {labels.card}
      </MenuItem>
    </>
  );
}

function SongBlockView({ editor, node, getPos, deleteNode }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const id = readItemId(node.attrs.id);
  const view = readView(node.attrs.view);
  const songs = useSongItems('one', id == null ? [] : [id]);
  return (
    <BlockShell
      editor={editor}
      getPos={getPos}
      deleteNode={deleteNode}
      allowDelete
      extraMenu={close => viewMenu(view, (next) => {
        patchAttrs(editor, getPos, { view: next });
      }, close, { row: t('page_view_row'), card: t('page_view_card') })}
    >
      <SongItems songs={songs} view={view} />
    </BlockShell>
  );
}

function AlbumBlockView({ editor, node, getPos, deleteNode }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const id = readItemId(node.attrs.id);
  const view = readView(node.attrs.view);
  const albums = useAlbumItems('one', id == null ? [] : [id]);
  return (
    <BlockShell
      editor={editor}
      getPos={getPos}
      deleteNode={deleteNode}
      allowDelete
      extraMenu={close => viewMenu(view, (next) => {
        patchAttrs(editor, getPos, { view: next });
      }, close, { row: t('page_view_row'), card: t('page_view_card') })}
    >
      <AlbumItems albums={albums} view={view} />
    </BlockShell>
  );
}

function SongListBlockView({ editor, node, getPos, deleteNode }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  const mode = readMode(node.attrs.mode);
  const title = readTitle(node.attrs.title);
  const view = readView(node.attrs.view);
  const itemIds = readItemIds(node.attrs.itemIds);
  const songs = useSongItems(mode === 'recent' ? 'recent' : 'custom', itemIds);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const songsHaveTab = hasSongsTab(ctx.songs.length);
  const fallback = mode === 'recent' ? t('overview_recent_songs') : t('songs');

  return (
    <>
      <BlockShell
        editor={editor}
        getPos={getPos}
        deleteNode={deleteNode}
        allowDelete
        deleteLabel={t('page_remove_list')}
        title={(
          <ListTitleField
            value={title}
            fallback={fallback}
            onCommit={next => patchAttrs(editor, getPos, { title: next })}
          />
        )}
        viewAllLabel={mode === 'recent' && songsHaveTab && ctx.onNavigateToTab ? t('overview_view_all') : undefined}
        onViewAll={ctx.onNavigateToTab ? () => ctx.onNavigateToTab?.('songs') : undefined}
        extraMenu={close => (
          <>
            {viewMenu(view, (next) => {
              patchAttrs(editor, getPos, { view: next });
            }, close, { row: t('page_view_row'), card: t('page_view_card') })}
            {mode === 'custom' && (
              <MenuItem
                sx={glassMenuItemSx}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setPickerPos({ top: rect.bottom, left: rect.left });
                  close();
                }}
              >
                {t('page_add_songs')}
              </MenuItem>
            )}
          </>
        )}
      >
        <SongItems songs={songs} view={view} />
      </BlockShell>
      {mode === 'custom' && (
        <ItemPicker
          anchorPosition={pickerPos}
          options={ctx.songs.map(song => ({ id: song.id, label: song.title }))}
          selectedIds={itemIds}
          emptyLabel={t('no_songs')}
          onClose={() => setPickerPos(null)}
          onToggle={(songId) => {
            const next = itemIds.includes(songId)
              ? itemIds.filter(item => item !== songId)
              : [...itemIds, songId];
            patchAttrs(editor, getPos, { itemIds: next });
          }}
        />
      )}
    </>
  );
}

function AlbumListBlockView({ editor, node, getPos, deleteNode }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  const mode = readMode(node.attrs.mode);
  const title = readTitle(node.attrs.title);
  const view = readView(node.attrs.view);
  const itemIds = readItemIds(node.attrs.itemIds);
  const albums = useAlbumItems(mode === 'recent' ? 'recent' : 'custom', itemIds);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);
  const albumsHaveTab = hasAlbumsTab(ctx.albums.length);
  const fallback = mode === 'recent' ? t('overview_recent_albums') : t('albums');

  return (
    <>
      <BlockShell
        editor={editor}
        getPos={getPos}
        deleteNode={deleteNode}
        allowDelete
        deleteLabel={t('page_remove_list')}
        title={(
          <ListTitleField
            value={title}
            fallback={fallback}
            onCommit={next => patchAttrs(editor, getPos, { title: next })}
          />
        )}
        viewAllLabel={mode === 'recent' && albumsHaveTab && ctx.onNavigateToTab ? t('overview_view_all') : undefined}
        onViewAll={ctx.onNavigateToTab ? () => ctx.onNavigateToTab?.('albums') : undefined}
        extraMenu={close => (
          <>
            {viewMenu(view, (next) => {
              patchAttrs(editor, getPos, { view: next });
            }, close, { row: t('page_view_row'), card: t('page_view_card') })}
            {mode === 'custom' && (
              <MenuItem
                sx={glassMenuItemSx}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  setPickerPos({ top: rect.bottom, left: rect.left });
                  close();
                }}
              >
                {t('page_add_albums')}
              </MenuItem>
            )}
          </>
        )}
      >
        <AlbumItems albums={albums} view={view} />
      </BlockShell>
      {mode === 'custom' && (
        <ItemPicker
          anchorPosition={pickerPos}
          options={ctx.albums.map(album => ({ id: album.id, label: album.name }))}
          selectedIds={itemIds}
          emptyLabel={t('no_albums')}
          onClose={() => setPickerPos(null)}
          onToggle={(albumId) => {
            const next = itemIds.includes(albumId)
              ? itemIds.filter(item => item !== albumId)
              : [...itemIds, albumId];
            patchAttrs(editor, getPos, { itemIds: next });
          }}
        />
      )}
    </>
  );
}

function itemNode(name: string, dataAttr: string, view: (props: ReactNodeViewProps) => ReactNode) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,
    addAttributes() {
      return {
        id: { default: null as number | null },
        view: { default: 'row' as PageBlockView },
      };
    },
    parseHTML() {
      return [{ tag: `div[${dataAttr}]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes, { [dataAttr]: '' })];
    },
    addNodeView() {
      return ReactNodeViewRenderer(view);
    },
  });
}

function listNode(name: string, dataAttr: string, view: (props: ReactNodeViewProps) => ReactNode) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,
    addAttributes() {
      return {
        mode: { default: 'recent' as PageListMode },
        title: { default: '' },
        itemIds: { default: [] as number[] },
        view: { default: 'row' as PageBlockView },
      };
    },
    parseHTML() {
      return [{ tag: `div[${dataAttr}]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes, { [dataAttr]: '' })];
    },
    addNodeView() {
      return ReactNodeViewRenderer(view);
    },
  });
}

export const ProjectSongNode = itemNode(PROJECT_SONG_NODE, 'data-project-song', SongBlockView);
export const ProjectAlbumNode = itemNode(PROJECT_ALBUM_NODE, 'data-project-album', AlbumBlockView);
export const ProjectSongListNode = listNode(PROJECT_SONG_LIST_NODE, 'data-project-song-list', SongListBlockView);
export const ProjectAlbumListNode = listNode(PROJECT_ALBUM_LIST_NODE, 'data-project-album-list', AlbumListBlockView);
