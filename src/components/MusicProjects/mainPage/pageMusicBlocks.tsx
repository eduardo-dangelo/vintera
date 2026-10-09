'use client';

import type { Editor } from '@tiptap/core';
import type { ReactNodeViewProps } from '@tiptap/react';
import type { ReactNode } from 'react';
import type { SongListItem } from '@/queries/hooks/songs';
import type { PageBlockView, PageListMode } from '@/utils/projectMainPage';
import { Album, LibraryMusic, ViewList, ViewModule } from '@mui/icons-material';
import { Box, Button, Collapse, Menu, MenuItem, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useTheme } from '@mui/material';
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
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
import { useAlbums } from '@/queries/hooks/albums';
import { useSongs } from '@/queries/hooks/songs';
import { getButtonGroupSx } from '@/utils/buttonGroupStyles';
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
    if (mode === 'recent') {
      return takeRecent(sortByRecent(ctx.songs, song => song.updatedAt), OVERVIEW_PREVIEW_LIMIT)
        .map(song => songsById.get(song.id) ?? toFallbackSongListItem(song, ctx.projectId, ctx.project, ctx.albums));
    }
    return wanted.flatMap((id) => {
      const projectSong = ctx.songs.find(item => item.id === id);
      if (projectSong) {
        return [songsById.get(id) ?? toFallbackSongListItem(projectSong, ctx.projectId, ctx.project, ctx.albums)];
      }
      const listed = songsById.get(id);
      return listed && listed.musicProjectId === ctx.projectId ? [listed] : [];
    });
  }, [allSongs, ctx.albums, ctx.project, ctx.projectId, ctx.songs, idsKey, mode]);
}

function useAlbumItems(mode: 'recent' | 'custom' | 'one', ids: number[]) {
  const ctx = useMainPageEditorContext();
  const { data: allAlbums } = useAlbums(ctx.locale);
  const idsKey = ids.join(',');
  return useMemo(() => {
    const albumsById = new Map(allAlbums?.map(album => [album.id, album]) ?? []);
    const wanted = idsKey ? idsKey.split(',').map(Number) : [];
    if (mode === 'recent') {
      return takeRecent(sortByRecent(ctx.albums, album => album.updatedAt), OVERVIEW_PREVIEW_LIMIT)
        .map(album => toAlbumListItem(album, ctx.project, ctx.songs));
    }
    return wanted.flatMap((id) => {
      const projectAlbum = ctx.albums.find(item => item.id === id);
      if (projectAlbum) {
        return [toAlbumListItem(projectAlbum, ctx.project, ctx.songs)];
      }
      const listed = albumsById.get(id);
      return listed && listed.musicProjectId === ctx.projectId ? [listed] : [];
    });
  }, [allAlbums, ctx.albums, ctx.project, ctx.projectId, ctx.songs, idsKey, mode]);
}

const CARD_LIST_COLLAPSE_MS = 300;

function PageCardGrid({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1.5 }}>
      <TransitionGroup component={null}>
        {children}
      </TransitionGroup>
    </Box>
  );
}

function EmptyItems({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {action}
    </Box>
  );
}

function SongItems({
  songs,
  view,
  emptyAction,
}: {
  songs: SongListItem[];
  view: PageBlockView;
  emptyAction?: ReactNode;
}) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  if (view === 'card') {
    return (
      <>
        {songs.length === 0 && <EmptyItems label={t('no_songs')} action={emptyAction} />}
        <PageCardGrid>
          {songs.map(song => (
            <Collapse key={song.id} timeout={CARD_LIST_COLLAPSE_MS} sx={{ minWidth: 0 }}>
              <SongCard
                song={song}
                locale={ctx.locale}
                projectId={ctx.projectId}
                cardSize="small"
                hideItemActions
              />
            </Collapse>
          ))}
        </PageCardGrid>
      </>
    );
  }
  if (songs.length === 0) {
    return <EmptyItems label={t('no_songs')} action={emptyAction} />;
  }
  return <SongListView songs={songs} locale={ctx.locale} projectId={ctx.projectId} hideItemActions />;
}

function AlbumItems({
  albums,
  view,
  emptyAction,
}: {
  albums: ReturnType<typeof toAlbumListItem>[];
  view: PageBlockView;
  emptyAction?: ReactNode;
}) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  if (view === 'card') {
    return (
      <>
        {albums.length === 0 && <EmptyItems label={t('no_albums')} action={emptyAction} />}
        <PageCardGrid>
          {albums.map(album => (
            <Collapse key={album.id} timeout={CARD_LIST_COLLAPSE_MS} sx={{ minWidth: 0 }}>
              <AlbumCard album={album} locale={ctx.locale} cardSize="small" hideItemActions />
            </Collapse>
          ))}
        </PageCardGrid>
      </>
    );
  }
  if (albums.length === 0) {
    return <EmptyItems label={t('no_albums')} action={emptyAction} />;
  }
  return <AlbumListView albums={albums} locale={ctx.locale} hideItemActions />;
}

function ItemPicker({
  anchorPosition,
  options,
  selectedIds,
  emptyLabel,
  kind,
  onToggle,
  onClose,
}: {
  anchorPosition: { top: number; left: number } | null;
  options: { id: number; label: string }[];
  selectedIds: number[];
  emptyLabel: string;
  kind: 'song' | 'album';
  onToggle: (id: number) => void;
  onClose: () => void;
}) {
  const ItemIcon = kind === 'album' ? Album : LibraryMusic;
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
              <ItemIcon sx={{ fontSize: 16 }} />
              {option.label}
            </MenuItem>
          ))}
    </Menu>
  );
}

function ViewModeToggle({
  view,
  onChange,
}: {
  view: PageBlockView;
  onChange: (next: PageBlockView) => void;
}) {
  const theme = useTheme();
  const t = useTranslations('MusicProjects');
  return (
    <ToggleButtonGroup
      size="small"
      exclusive
      value={view}
      onMouseDown={event => event.stopPropagation()}
      onChange={(_event, next: PageBlockView | null) => {
        if (next) {
          onChange(next);
        }
      }}
      sx={getButtonGroupSx(theme)}
    >
      <Tooltip title={t('page_view_row')}>
        <ToggleButton value="row" aria-label={t('page_view_row')}>
          <ViewList sx={{ fontSize: 18 }} />
        </ToggleButton>
      </Tooltip>
      <Tooltip title={t('page_view_card')}>
        <ToggleButton value="card" aria-label={t('page_view_card')}>
          <ViewModule sx={{ fontSize: 18 }} />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

function openPicker(event: { currentTarget: HTMLElement }, setPickerPos: (pos: { top: number; left: number }) => void) {
  const rect = event.currentTarget.getBoundingClientRect();
  setPickerPos({ top: rect.bottom, left: rect.left });
}

function viewSwitchItem(
  view: PageBlockView,
  onView: (next: PageBlockView) => void,
  close: () => void,
  labels: { row: string; card: string },
) {
  const next = view === 'row' ? 'card' : 'row';
  return (
    <MenuItem
      sx={glassMenuItemSx}
      onClick={() => {
        onView(next);
        close();
      }}
    >
      {next === 'card' ? <ViewModule sx={{ fontSize: 16 }} /> : <ViewList sx={{ fontSize: 16 }} />}
      {next === 'card' ? labels.card : labels.row}
    </MenuItem>
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
      extraMenu={close => viewSwitchItem(view, next => patchAttrs(editor, getPos, { view: next }), close, {
        row: t('page_view_row'),
        card: t('page_view_card'),
      })}
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
      extraMenu={close => viewSwitchItem(view, next => patchAttrs(editor, getPos, { view: next }), close, {
        row: t('page_view_row'),
        card: t('page_view_card'),
      })}
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
        headerActions={ctx.canEdit && (
          <ViewModeToggle
            view={view}
            onChange={next => patchAttrs(editor, getPos, { view: next })}
          />
        )}
        extraMenu={mode === 'custom'
          ? close => (
            <MenuItem
              sx={glassMenuItemSx}
              onClick={(event) => {
                openPicker(event, setPickerPos);
                close();
              }}
            >
              {t('page_select_songs')}
            </MenuItem>
          )
          : undefined}
      >
        <SongItems
          songs={songs}
          view={view}
          emptyAction={mode === 'custom' && ctx.canEdit
            ? (
                <Button
                  size="small"
                  onClick={event => openPicker(event, setPickerPos)}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  {t('page_select_songs')}
                </Button>
              )
            : undefined}
        />
      </BlockShell>
      {mode === 'custom' && (
        <ItemPicker
          anchorPosition={pickerPos}
          options={ctx.songs.map(song => ({ id: song.id, label: song.title }))}
          selectedIds={itemIds}
          emptyLabel={t('no_songs')}
          kind="song"
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
        headerActions={ctx.canEdit && (
          <ViewModeToggle
            view={view}
            onChange={next => patchAttrs(editor, getPos, { view: next })}
          />
        )}
        extraMenu={mode === 'custom'
          ? close => (
            <MenuItem
              sx={glassMenuItemSx}
              onClick={(event) => {
                openPicker(event, setPickerPos);
                close();
              }}
            >
              {t('page_select_albums')}
            </MenuItem>
          )
          : undefined}
      >
        <AlbumItems
          albums={albums}
          view={view}
          emptyAction={mode === 'custom' && ctx.canEdit
            ? (
                <Button
                  size="small"
                  onClick={event => openPicker(event, setPickerPos)}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  {t('page_select_albums')}
                </Button>
              )
            : undefined}
        />
      </BlockShell>
      {mode === 'custom' && (
        <ItemPicker
          anchorPosition={pickerPos}
          options={ctx.albums.map(album => ({ id: album.id, label: album.name }))}
          selectedIds={itemIds}
          emptyLabel={t('no_albums')}
          kind="album"
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
