'use client';

import type { Editor, JSONContent } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import type { ProjectTabName } from '@/components/MusicProjects/tabs/projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import Add from '@mui/icons-material/Add';
import Album from '@mui/icons-material/Album';
import CheckBoxOutlined from '@mui/icons-material/CheckBoxOutlined';
import EventNote from '@mui/icons-material/EventNote';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import History from '@mui/icons-material/History';
import LibraryMusic from '@mui/icons-material/LibraryMusic';
import LinkIcon from '@mui/icons-material/Link';
import LockOpenOutlined from '@mui/icons-material/LockOpenOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import QueueMusic from '@mui/icons-material/QueueMusic';
import TitleIcon from '@mui/icons-material/Title';
import Tune from '@mui/icons-material/Tune';
import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TextField,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { NodeSelection } from '@tiptap/pm/state';
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import { createProjectTaskItem, toggleChecklist } from '@/components/MusicProjects/mainPage/checklistCommands';
import { ChecklistItemView, ProjectTaskList } from '@/components/MusicProjects/mainPage/checklistNode';
import { MainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import { ProjectEmbedNode } from '@/components/MusicProjects/mainPage/mainPageNodes';
import { markPageBlockEntering, PAGE_BLOCK_MOTION_MS, requestPageBlockExit } from '@/components/MusicProjects/mainPage/pageBlockMotion';
import {
  ProjectEventNode,
  ProjectSongListNode,
  ProjectSongNode,
} from '@/components/MusicProjects/mainPage/pageMusicBlocks';
import { ProjectCreatePopovers } from '@/components/MusicProjects/ProjectCreatePopovers';
import { useProjectCreatePopovers } from '@/components/MusicProjects/useProjectCreatePopovers';
import { richTextContentSx } from '@/components/RichTextEditor/richTextContentSx';
import { useGetCalendarEventsByProject } from '@/queries/hooks/calendar-events/useGetCalendarEventsByProject';
import { normalizeExternalLinkUrl } from '@/utils/externalLinkEmbed';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import {
  pageEventIds,
  pageHasRecentCollection,
  pastedSingleUrl,
  PROJECT_EVENT_NODE,
  PROJECT_SONG_LIST_NODE,
  PROJECT_SONG_NODE,
} from '@/utils/projectMainPage';

const PAGE_MUSIC_BLOCK_TYPES = new Set([
  PROJECT_SONG_NODE,
  PROJECT_SONG_LIST_NODE,
  PROJECT_EVENT_NODE,
]);

function selectedMusicBlockPos(state: EditorView['state']): number | null {
  const { selection } = state;
  if (!(selection instanceof NodeSelection)) {
    return null;
  }
  if (!PAGE_MUSIC_BLOCK_TYPES.has(selection.node.type.name)) {
    return null;
  }
  return selection.from;
}

type SlashItemId = 'songList' | 'recent' | 'custom';

type SlashState = {
  from: number;
  to: number;
  query: string;
  top: number;
  left: number;
  index: number;
  step: 'pick' | 'mode';
  listKind: 'song' | 'album' | null;
};

type MainPageEditorProps = {
  value: JSONContent;
  onChange: (next: JSONContent) => void;
  locale: string;
  projectId: number;
  accent: string;
  project: MusicProjectDetail['project'];
  albums: MusicProjectDetail['albums'];
  songs: MusicProjectDetail['songs'];
  canEdit: boolean;
  focusOnMount?: boolean;
  /** Overview inserts song and album blocks. Custom pages leave this off. */
  includeMusicBlocks?: boolean;
  placeholder?: string;
  onNavigateToTab?: (tab: ProjectTabName) => void;
  onFocusChange?: (focused: boolean) => void;
};

export function MainPageEditor({
  value,
  onChange,
  locale,
  projectId,
  accent,
  project,
  albums,
  songs,
  canEdit,
  focusOnMount = false,
  includeMusicBlocks = true,
  placeholder: placeholderOverride,
  onNavigateToTab,
  onFocusChange,
}: MainPageEditorProps) {
  const t = useTranslations('MusicProjects');
  const tCal = useTranslations('Calendar');
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const pasteRef = useRef<(view: EditorView, event: ClipboardEvent) => boolean>(() => false);
  const keyRef = useRef<(view: EditorView, event: KeyboardEvent) => boolean>(() => false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [styleAnchor, setStyleAnchor] = useState<HTMLElement | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [insertMenu, setInsertMenu] = useState<{ kind: 'song' | 'album'; anchor: HTMLElement } | null>(null);
  const [eventMenu, setEventMenu] = useState<HTMLElement | null>(null);
  const [existingEventMenu, setExistingEventMenu] = useState<HTMLElement | null>(null);
  const [existingMenu, setExistingMenu] = useState<{
    kind: 'song' | 'album';
    anchor: HTMLElement;
  } | null>(null);
  const [listMenu, setListMenu] = useState<{
    kind: 'song' | 'album';
    anchor: HTMLElement;
  } | null>(null);
  const [collectionPicker, setCollectionPicker] = useState<{
    anchorEl: HTMLElement | null;
    anchorPosition: { top: number; left: number } | null;
    pos: number;
  } | null>(null);
  const collectionPickerRef = useRef(collectionPicker);
  collectionPickerRef.current = collectionPicker;
  const holdMenusRef = useRef(false);
  const dismissPageMenus = () => {
    setListMenu(null);
    setExistingMenu(null);
    setExistingEventMenu(null);
    setCollectionPicker(null);
    setInsertMenu(null);
    setEventMenu(null);
    setSlash(null);
  };
  const onPageMenuClose = (event: unknown, reason: string) => {
    if (holdMenusRef.current) {
      return;
    }
    const target = typeof event === 'object' && event != null && 'target' in event
      ? (event as { target: EventTarget | null }).target
      : null;
    if (reason === 'backdropClick' && target instanceof Element && target.closest('.MuiMenu-paper, [role="menu"]')) {
      return;
    }
    dismissPageMenus();
  };
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const [, setSelectionTick] = useState(0);
  const editing = canEdit && !locked;
  const cursorRef = useRef<number | null>(null);
  const insertCreatedRef = useRef<(kind: 'song' | 'album', id: number) => void>(() => {});
  const insertEventRef = useRef<(eventId: number) => void>(() => {});
  const freshEventIdsRef = useRef(new Set<number>());
  const createPopovers = useProjectCreatePopovers(locale, projectId, {
    onSongCreated: id => insertCreatedRef.current('song', id),
    onAlbumCreated: id => insertCreatedRef.current('album', id),
    onEventCreated: id => insertEventRef.current(id),
  });

  const placeholder = placeholderOverride ?? t('main_page_placeholder');
  const checklistTitle = t('main_page_checklist_title');
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    Placeholder.configure({
      placeholder,
      showOnlyCurrent: true,
      showOnlyWhenEditable: true,
    }),
    ...(includeMusicBlocks
      ? [ProjectSongNode, ProjectSongListNode, ProjectEventNode]
      : []),
    ProjectEmbedNode,
    ProjectTaskList,
    createProjectTaskItem(checklistTitle).extend({
      addNodeView() {
        return ReactNodeViewRenderer(ChecklistItemView);
      },
    }),
  ], [checklistTitle, includeMusicBlocks, placeholder]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: canEdit,
    extensions,
    content: value,
    editorProps: {
      handlePaste: (view, event) => pasteRef.current(view, event),
      handleKeyDown: (view, event) => keyRef.current(view, event),
    },
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.getJSON());
    },
    onSelectionUpdate: ({ editor: ed }) => {
      setSelectionTick(tick => tick + 1);
      syncSlash(ed);
    },
  });

  const { data: projectEvents, isSuccess: eventsLoaded } = useGetCalendarEventsByProject(
    locale,
    includeMusicBlocks ? projectId : null,
  );
  useEffect(() => {
    if (!canEdit || !eventsLoaded || !editor) {
      return;
    }
    const byId = new Map((projectEvents ?? []).map(event => [event.id, event]));
    const ranges: { from: number; to: number }[] = [];
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name !== PROJECT_EVENT_NODE) {
        return;
      }
      const id = typeof node.attrs.id === 'number' ? node.attrs.id : null;
      if (id == null) {
        ranges.push({ from: offset, to: offset + node.nodeSize });
        return;
      }
      const event = byId.get(id);
      if (!event) {
        if (!freshEventIdsRef.current.has(id)) {
          ranges.push({ from: offset, to: offset + node.nodeSize });
        }
        return;
      }
      freshEventIdsRef.current.delete(id);
      if (new Date(event.end).getTime() <= Date.now()) {
        ranges.push({ from: offset, to: offset + node.nodeSize });
      }
    });
    if (ranges.length === 0) {
      return;
    }
    let tr = editor.state.tr;
    for (const range of [...ranges].reverse()) {
      tr = tr.delete(range.from, range.to);
    }
    editor.view.dispatch(tr);
  }, [canEdit, editor, eventsLoaded, projectEvents]);

  function syncSlash(ed: Editor) {
    if (collectionPickerRef.current || holdMenusRef.current) {
      return;
    }
    if (!ed.isEditable) {
      setSlash(null);
      return;
    }
    const { $from } = ed.state.selection;
    if (!$from.parent.isTextblock || $from.depth !== 1) {
      setSlash(null);
      return;
    }
    const text = $from.parent.textContent;
    if (!text.startsWith('/') || /\s/.test(text) || text.length > 24) {
      setSlash(null);
      return;
    }
    const coords = ed.view.coordsAtPos($from.start());
    const query = text.slice(1);
    const from = $from.before();
    const to = $from.after();
    setSlash((prev) => {
      if (prev && prev.step === 'mode' && prev.from === from && prev.to === to) {
        return { ...prev, top: coords.bottom + 4, left: coords.left };
      }
      return {
        from,
        to,
        query,
        top: coords.bottom + 4,
        left: coords.left,
        index: prev?.query === query ? prev.index : 0,
        step: 'pick',
        listKind: null,
      };
    });
  }

  const slashItems = useMemo(() => {
    if (!includeMusicBlocks || !slash) {
      return [];
    }
    if (slash.step === 'mode') {
      return [
        { id: 'recent' as const, label: t('page_list_recent'), disabled: pageHasRecentCollection(value) },
        { id: 'custom' as const, label: t('page_list_custom'), disabled: false },
      ];
    }
    const query = slash.query.toLowerCase();
    const items: Array<{ id: SlashItemId; label: string; disabled: boolean }> = [];
    if (songs.length > 0) {
      items.push({ id: 'songList', label: t('page_song_list'), disabled: false });
    }
    return items.filter(item => `${item.label} collection songs`.toLowerCase().includes(query));
  }, [includeMusicBlocks, slash, songs.length, t, value]);

  const applySlash = (itemId: SlashItemId, anchor?: HTMLElement) => {
    if (!editor || !slash) {
      return;
    }
    if (itemId === 'songList') {
      setSlash(current => current
        ? {
            ...current,
            step: 'mode',
            listKind: 'song',
            index: 0,
          }
        : current);
      return;
    }
    if (itemId === 'recent' && pageHasRecentCollection(editor.getJSON())) {
      return;
    }
    const type = PROJECT_SONG_LIST_NODE;
    markPageBlockEntering(slash.from);
    if (itemId === 'custom') {
      const nextPicker = {
        anchorEl: anchor ?? null,
        anchorPosition: anchor ? null : { top: slash.top, left: slash.left },
        pos: slash.from,
      };
      holdMenusRef.current = true;
      collectionPickerRef.current = nextPicker;
      setCollectionPicker(nextPicker);
    }
    editor.chain().focus().insertContentAt(
      { from: slash.from, to: slash.to },
      {
        type,
        attrs: {
          mode: itemId === 'custom' ? 'custom' : 'recent',
          title: '',
          itemIds: [],
          view: 'row',
        },
      },
    ).run();
    holdMenusRef.current = false;
    if (itemId === 'custom') {
      return;
    }
    setCollectionPicker(null);
    setSlash(null);
  };

  const insertBlockAtCursor = (block: ProseMirrorNode) => {
    if (!editor) {
      return null;
    }
    const stored = cursorRef.current;
    const pos = stored == null
      ? editor.state.doc.content.size
      : Math.max(0, Math.min(stored, editor.state.doc.content.size));
    const $pos = editor.state.doc.resolve(pos);
    let tr = editor.state.tr;
    let insertPos = pos;
    if ($pos.depth >= 1 && $pos.node(1).isTextblock) {
      const from = $pos.before(1);
      const textblock = $pos.node(1);
      const to = from + textblock.nodeSize;
      if (textblock.type.name === 'paragraph' && textblock.textContent.trim() === '') {
        insertPos = from;
        tr = tr.replaceWith(from, to, block);
      } else {
        insertPos = to;
        tr = tr.insert(to, block);
      }
    } else {
      tr = tr.insert(pos, block);
    }
    markPageBlockEntering(insertPos);
    editor.view.dispatch(tr.scrollIntoView());
    return insertPos;
  };

  insertEventRef.current = (eventId) => {
    if (pageEventIds(editor?.getJSON()).includes(eventId)) {
      return;
    }
    freshEventIdsRef.current.add(eventId);
    const type = editor?.schema.nodes[PROJECT_EVENT_NODE];
    if (!type) {
      return;
    }
    insertBlockAtCursor(type.create({ id: eventId }));
  };

  const pageEvents = pageEventIds(value);
  const upcomingEvents = (projectEvents ?? []).filter(
    event => new Date(event.end).getTime() > Date.now(),
  );
  const addableEvents = upcomingEvents.filter(event => !pageEvents.includes(event.id));

  insertCreatedRef.current = (kind, id) => {
    if (kind !== 'song') {
      return;
    }
    const type = editor?.schema.nodes[PROJECT_SONG_NODE];
    if (!type) {
      return;
    }
    insertBlockAtCursor(type.create({ id, view: 'row' }));
  };

  const insertListAtCursor = (mode: 'recent' | 'custom') => {
    if (!editor || (mode === 'recent' && pageHasRecentCollection(editor.getJSON()))) {
      return null;
    }
    const type = editor.schema.nodes[PROJECT_SONG_LIST_NODE];
    if (!type) {
      return null;
    }
    return insertBlockAtCursor(type.create({
      mode,
      title: '',
      itemIds: [],
      view: 'row',
    }));
  };

  const collectionSongIds = (() => {
    if (!collectionPicker || !editor) {
      return [] as number[];
    }
    const ids = editor.state.doc.nodeAt(collectionPicker.pos)?.attrs.itemIds;
    return Array.isArray(ids) ? ids.filter((id): id is number => typeof id === 'number') : [];
  })();

  const toggleCollectionSong = (songId: number) => {
    if (!editor || !collectionPicker) {
      return;
    }
    const node = editor.state.doc.nodeAt(collectionPicker.pos);
    if (!node) {
      return;
    }
    const itemIds = Array.isArray(node.attrs.itemIds)
      ? node.attrs.itemIds.filter((id): id is number => typeof id === 'number')
      : [];
    const next = itemIds.includes(songId)
      ? itemIds.filter(id => id !== songId)
      : [...itemIds, songId];
    editor.view.dispatch(editor.state.tr.setNodeMarkup(collectionPicker.pos, undefined, {
      ...node.attrs,
      itemIds: next,
    }));
  };

  pasteRef.current = (view, event) => {
    if (!canEdit || lockedRef.current) {
      return false;
    }
    const url = pastedSingleUrl(event.clipboardData?.getData('text/plain') ?? '');
    if (!url) {
      return false;
    }
    const embedType = view.state.schema.nodes.projectEmbed;
    if (!embedType) {
      return false;
    }
    const embed = embedType.create({ url, title: null });
    const { $from } = view.state.selection;
    const tr = view.state.tr;
    if ($from.parent.isTextblock && $from.depth === 1 && $from.parent.textContent.trim() === '') {
      tr.replaceWith($from.before(), $from.after(), embed);
    } else if ($from.depth >= 1) {
      tr.insert($from.after(1), embed);
    } else {
      tr.replaceSelectionWith(embed);
    }
    view.dispatch(tr.scrollIntoView());
    return true;
  };

  keyRef.current = (view, event) => {
    if ((event.key === 'Backspace' || event.key === 'Delete') && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const pos = selectedMusicBlockPos(view.state);
      if (pos != null) {
        requestPageBlockExit([pos], () => {
          const node = view.state.doc.nodeAt(pos);
          if (!node || !PAGE_MUSIC_BLOCK_TYPES.has(node.type.name)) {
            return;
          }
          view.dispatch(
            view.state.tr.delete(pos, pos + node.nodeSize).setMeta('pageBlockExit', true),
          );
        });
        return true;
      }
    }
    if (!slash || slashItems.length === 0) {
      return false;
    }
    if (event.key === 'Escape') {
      dismissPageMenus();
      return true;
    }
    if (event.key === 'ArrowDown') {
      setSlash(current => current
        ? { ...current, index: (current.index + 1) % slashItems.length }
        : current);
      return true;
    }
    if (event.key === 'ArrowUp') {
      setSlash(current => current
        ? { ...current, index: (current.index - 1 + slashItems.length) % slashItems.length }
        : current);
      return true;
    }
    if (event.key === 'Enter') {
      const item = slashItems[Math.min(slash.index, slashItems.length - 1)];
      if (item) {
        applySlash(item.id);
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!editor) {
      return;
    }
    const next = JSON.stringify(value);
    if (next !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(canEdit && !locked);
  }, [editor, canEdit, locked]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    const onFocus = () => {
      onFocusChange?.(true);
    };
    const onBlur = () => {
      onFocusChange?.(false);
    };
    editor.on('focus', onFocus);
    editor.on('blur', onBlur);
    return () => {
      editor.off('focus', onFocus);
      editor.off('blur', onBlur);
    };
  }, [editor, onFocusChange]);

  useEffect(() => {
    if (focusOnMount && editor) {
      editor.commands.focus('end');
    }
  }, [focusOnMount, editor]);

  const showBar = canEdit && Boolean(editor);

  const activeStyle = !editor
    ? 'paragraph'
    : editor.isActive('heading', { level: 1 })
      ? 'h1'
      : editor.isActive('heading', { level: 2 })
        ? 'h2'
        : editor.isActive('heading', { level: 3 })
          ? 'h3'
          : 'paragraph';

  const setStyle = (style: 'paragraph' | 'h1' | 'h2' | 'h3') => {
    if (!editor) {
      return;
    }
    const chain = editor.chain().focus();
    if (style === 'paragraph') {
      chain.setParagraph().run();
    } else if (style === 'h1') {
      chain.toggleHeading({ level: 1 }).run();
    } else if (style === 'h2') {
      chain.toggleHeading({ level: 2 }).run();
    } else {
      chain.toggleHeading({ level: 3 }).run();
    }
    setStyleAnchor(null);
  };

  const openLink = () => {
    setLinkUrl('https://');
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) {
      return;
    }
    const url = normalizeExternalLinkUrl(linkUrl);
    const type = editor.schema.nodes.projectEmbed;
    if (!url || !type) {
      return;
    }
    insertBlockAtCursor(type.create({ url, title: null }));
    setLinkUrl('');
    setLinkOpen(false);
  };

  const pageContext = useMemo(() => ({
    locale,
    projectId,
    accent,
    project,
    albums,
    songs,
    canEdit: editing,
    onNavigateToTab,
  }), [accent, albums, editing, locale, onNavigateToTab, project, projectId, songs]);

  return (
    <MainPageEditorContext value={pageContext}>
      <Box>
        {showBar && editor && (
          <Box
            onMouseDown={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest('input, textarea')) {
                return;
              }
              event.preventDefault();
            }}
            sx={{
              position: 'sticky',
              top: 8,
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              width: 'fit-content',
              maxWidth: '100%',
              mb: 1.5,
              px: 0.75,
              py: 0.25,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: 2,
            }}
          >
            {editing && (
              <>
                <Tooltip title={t('main_page_style')}>
                  <IconButton size="small" onClick={event => setStyleAnchor(event.currentTarget)}>
                    <TitleIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
                <Tooltip title={t('main_page_bold')}>
                  <ToggleButton
                    size="small"
                    value="bold"
                    selected={editor.isActive('bold')}
                    onChange={() => editor.chain().focus().toggleBold().run()}
                    sx={{ border: 'none', p: 0.75 }}
                  >
                    <FormatBold sx={{ fontSize: 18 }} />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title={t('main_page_italic')}>
                  <ToggleButton
                    size="small"
                    value="italic"
                    selected={editor.isActive('italic')}
                    onChange={() => editor.chain().focus().toggleItalic().run()}
                    sx={{ border: 'none', p: 0.75 }}
                  >
                    <FormatItalic sx={{ fontSize: 18 }} />
                  </ToggleButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
                <Tooltip title={t('main_page_bullet_list')}>
                  <ToggleButton
                    size="small"
                    value="bullet"
                    selected={editor.isActive('bulletList')}
                    onChange={() => editor.chain().focus().toggleBulletList().run()}
                    sx={{ border: 'none', p: 0.75 }}
                  >
                    <FormatListBulleted sx={{ fontSize: 18 }} />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title={t('main_page_numbered_list')}>
                  <ToggleButton
                    size="small"
                    value="ordered"
                    selected={editor.isActive('orderedList')}
                    onChange={() => editor.chain().focus().toggleOrderedList().run()}
                    sx={{ border: 'none', p: 0.75 }}
                  >
                    <FormatListNumbered sx={{ fontSize: 18 }} />
                  </ToggleButton>
                </Tooltip>
                <Tooltip title={t('main_page_checkbox')}>
                  <ToggleButton
                    size="small"
                    value="task"
                    selected={editor.isActive('taskList')}
                    onChange={() => toggleChecklist(editor, checklistTitle)}
                    sx={{ border: 'none', p: 0.75 }}
                  >
                    <CheckBoxOutlined sx={{ fontSize: 18 }} />
                  </ToggleButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
                <Tooltip title={t('add_link')}>
                  <IconButton
                    ref={linkButtonRef}
                    size="small"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      cursorRef.current = editor.state.selection.from;
                    }}
                    onClick={openLink}
                  >
                    <LinkIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              </>
            )}
            {includeMusicBlocks && (
              <>
                <Tooltip title={t('song_detail_title')}>
                  <IconButton
                    size="small"
                    aria-label={t('song_detail_title')}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      cursorRef.current = editor?.state.selection.from ?? null;
                    }}
                    onClick={event => setInsertMenu({ kind: 'song', anchor: event.currentTarget })}
                  >
                    <GradientIcon kind="song" fontSize={18} gradientOnHover aria-hidden />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('event_detail_title')}>
                  <IconButton
                    size="small"
                    aria-label={t('event_detail_title')}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      cursorRef.current = editor?.state.selection.from ?? null;
                    }}
                    onClick={event => setEventMenu(event.currentTarget)}
                  >
                    <EventNote sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              </>
            )}
            <Tooltip title={locked ? t('main_page_unlock') : t('main_page_lock')}>
              <IconButton
                size="small"
                onClick={() => {
                  setLocked(current => !current);
                  setSlash(null);
                  setStyleAnchor(null);
                  setLinkOpen(false);
                }}
              >
                {locked
                  ? <LockOutlined sx={{ fontSize: 18 }} />
                  : <LockOpenOutlined sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box
          sx={{
            '& .ProseMirror': {
              ...richTextContentSx(accent),
              'outline': 'none',
              'minHeight': 160,
              'lineHeight': 1.4,
              '& p': { m: 0 },
              '& > * + *': { mt: 0.5 },
              '& h1': { fontSize: '1.5rem', fontWeight: 700, m: 0, mb: 0.25, lineHeight: 1.25 },
              '& h2': { fontSize: '1.125rem', fontWeight: 700, m: 0, mt: 0.5, mb: 0.25, lineHeight: 1.25 },
              '& h3': { fontSize: '1rem', fontWeight: 600, m: 0, mt: 0.25, mb: 0, lineHeight: 1.2 },
              '& h3:has(+ [data-project-checklist])': { mb: 0, mt: 0.25, lineHeight: 1.2 },
              '& [data-project-checklist]': { mt: 0 },
              '& .MuiCardActionArea-root': { color: 'inherit', textDecoration: 'none' },
              '@keyframes pageBlockIn': {
                from: { opacity: 0, transform: 'translateY(-6px)' },
                to: { opacity: 1, transform: 'none' },
              },
              '@keyframes pageBlockOut': {
                from: { opacity: 1, transform: 'none' },
                to: { opacity: 0, transform: 'translateY(-6px)' },
              },
              '& [data-page-block-motion="in"]': {
                animation: `pageBlockIn ${PAGE_BLOCK_MOTION_MS}ms ease`,
              },
              '& [data-page-block-motion="out"]': {
                animation: `pageBlockOut ${PAGE_BLOCK_MOTION_MS}ms ease forwards`,
              },
              '& ul[data-type="taskList"]': { listStyle: 'none', pl: 0, my: 0 },
              '& p.is-editor-empty:first-of-type::before, & p.is-empty::before': {
                color: 'text.disabled',
                content: 'attr(data-placeholder)',
                float: 'left',
                height: 0,
                pointerEvents: 'none',
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Box>

      <Menu
        anchorEl={styleAnchor}
        open={Boolean(styleAnchor)}
        onClose={() => setStyleAnchor(null)}
        slotProps={getGlassMenuSlotProps({ minWidth: 160 })}
      >
        {([
          ['paragraph', t('main_page_paragraph')],
          ['h1', t('main_page_heading_1')],
          ['h2', t('main_page_heading_2')],
          ['h3', t('main_page_heading_3')],
        ] as const).map(([id, label]) => (
          <MenuItem
            key={id}
            selected={activeStyle === id}
            sx={glassMenuItemSx}
            onMouseDown={event => event.preventDefault()}
            onClick={() => setStyle(id)}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      <Popover
        open={linkOpen}
        anchorEl={linkButtonRef.current}
        onClose={() => setLinkOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, width: 280 } } }}
      >
        <TextField
          size="small"
          fullWidth
          label={t('link_url')}
          value={linkUrl}
          onChange={event => setLinkUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              applyLink();
            }
          }}
        />
      </Popover>

      <Menu
        anchorEl={insertMenu?.anchor}
        open={insertMenu != null}
        onClose={onPageMenuClose}
        slotProps={getGlassMenuSlotProps({ minWidth: 180 })}
      >
        <MenuItem
          sx={glassMenuItemSx}
          onClick={(event) => {
            const kind = insertMenu?.kind;
            setListMenu(null);
            setExistingMenu(null);
            setInsertMenu(null);
            if (kind) {
              createPopovers.openPopoverFromClick(kind, event);
            }
          }}
        >
          <Add sx={{ fontSize: 16 }} />
          {insertMenu?.kind === 'album' ? t('new_album') : t('new_song')}
        </MenuItem>
        <MenuItem
          sx={glassMenuItemSx}
          disabled={insertMenu?.kind === 'album' ? albums.length === 0 : songs.length === 0}
          onClick={(event) => {
            const kind = insertMenu?.kind;
            setListMenu(null);
            if (kind) {
              setExistingMenu({ kind, anchor: event.currentTarget });
            }
          }}
        >
          {insertMenu?.kind === 'album'
            ? <Album sx={{ fontSize: 16 }} />
            : <LibraryMusic sx={{ fontSize: 16 }} />}
          {insertMenu?.kind === 'album' ? t('page_select_album') : t('page_select_song')}
        </MenuItem>
        <MenuItem
          sx={glassMenuItemSx}
          disabled={insertMenu?.kind === 'album' ? albums.length === 0 : songs.length === 0}
          onClick={(event) => {
            const kind = insertMenu?.kind;
            setExistingMenu(null);
            if (kind) {
              setListMenu({ kind, anchor: event.currentTarget });
            }
          }}
        >
          {insertMenu?.kind === 'album'
            ? <PlaylistAdd sx={{ fontSize: 16 }} />
            : <QueueMusic sx={{ fontSize: 16 }} />}
          {insertMenu?.kind === 'album' ? t('page_album_list') : t('page_song_list')}
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={listMenu?.anchor}
        open={listMenu != null}
        onClose={onPageMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={getGlassMenuSlotProps({ minWidth: 160 })}
      >
        <MenuItem
          sx={glassMenuItemSx}
          disabled={pageHasRecentCollection(value)}
          onClick={() => {
            if (listMenu) {
              insertListAtCursor('recent');
            }
            setListMenu(null);
            setInsertMenu(null);
          }}
        >
          <History sx={{ fontSize: 16 }} />
          {t('page_list_recent')}
        </MenuItem>
        <MenuItem
          sx={glassMenuItemSx}
          onClick={(event) => {
            const anchorEl = event.currentTarget;
            holdMenusRef.current = true;
            const pos = insertListAtCursor('custom');
            holdMenusRef.current = false;
            if (pos == null) {
              return;
            }
            const nextPicker = { anchorEl, anchorPosition: null, pos };
            collectionPickerRef.current = nextPicker;
            setCollectionPicker(nextPicker);
          }}
        >
          <Tune sx={{ fontSize: 16 }} />
          {t('page_list_custom')}
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={collectionPicker?.anchorEl ?? undefined}
        anchorReference={collectionPicker?.anchorEl ? 'anchorEl' : 'anchorPosition'}
        anchorPosition={collectionPicker?.anchorPosition ?? undefined}
        open={collectionPicker != null}
        onClose={onPageMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={getGlassMenuSlotProps({ minWidth: 220 })}
      >
        {songs.length === 0
          ? (
              <MenuItem disabled sx={glassMenuItemSx}>
                {t('no_songs')}
              </MenuItem>
            )
          : songs.map(song => (
              <MenuItem
                key={song.id}
                selected={collectionSongIds.includes(song.id)}
                sx={glassMenuItemSx}
                onClick={() => toggleCollectionSong(song.id)}
              >
                <LibraryMusic sx={{ fontSize: 16 }} />
                {song.title}
              </MenuItem>
            ))}
      </Menu>
      <Menu
        anchorEl={existingMenu?.anchor}
        open={existingMenu != null}
        onClose={onPageMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={getGlassMenuSlotProps({ minWidth: 220 })}
      >
        {(existingMenu?.kind === 'album' ? albums : songs).map(item => (
          <MenuItem
            key={item.id}
            sx={glassMenuItemSx}
            onClick={() => {
              if (existingMenu) {
                insertCreatedRef.current(existingMenu.kind, item.id);
              }
              setExistingMenu(null);
              setInsertMenu(null);
            }}
          >
            {existingMenu?.kind === 'album'
              ? <Album sx={{ fontSize: 16 }} />
              : <LibraryMusic sx={{ fontSize: 16 }} />}
            {'title' in item ? item.title : item.name}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        open={Boolean(slash) && slashItems.length > 0}
        onClose={onPageMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={slash ? { top: slash.top, left: slash.left } : undefined}
        slotProps={getGlassMenuSlotProps({ minWidth: 160 })}
      >
        {slashItems.map((item, index) => (
          <MenuItem
            key={item.id}
            selected={index === (slash?.index ?? 0)}
            disabled={item.disabled}
            sx={glassMenuItemSx}
            onMouseDown={event => event.preventDefault()}
            onClick={event => applySlash(item.id, event.currentTarget)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={eventMenu}
        open={eventMenu != null}
        onClose={onPageMenuClose}
        slotProps={getGlassMenuSlotProps({ minWidth: 200 })}
      >
        <MenuItem
          sx={glassMenuItemSx}
          onClick={(event) => {
            setExistingEventMenu(null);
            setEventMenu(null);
            createPopovers.openPopoverFromClick('event', event);
          }}
        >
          <Add sx={{ fontSize: 16 }} />
          {tCal('new_event')}
        </MenuItem>
        <MenuItem
          sx={glassMenuItemSx}
          disabled={addableEvents.length === 0}
          onClick={event => setExistingEventMenu(event.currentTarget)}
        >
          <EventNote sx={{ fontSize: 16 }} />
          {t('page_select_event')}
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={existingEventMenu}
        open={existingEventMenu != null}
        onClose={onPageMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={getGlassMenuSlotProps({ minWidth: 220 })}
      >
        {upcomingEvents.map(event => (
          <MenuItem
            key={event.id}
            disabled={pageEvents.includes(event.id)}
            sx={glassMenuItemSx}
            onClick={() => {
              insertEventRef.current(event.id);
              dismissPageMenus();
            }}
          >
            <EventNote sx={{ fontSize: 16 }} />
            {event.name}
          </MenuItem>
        ))}
      </Menu>
      <ProjectCreatePopovers state={createPopovers} />
    </MainPageEditorContext>
  );
}
