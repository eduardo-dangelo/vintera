'use client';

import type { Editor, JSONContent } from '@tiptap/core';
import type { EditorView } from '@tiptap/pm/view';
import type { ProjectTabName } from '@/components/MusicProjects/tabs/projectTabVisibility';
import type { MusicProjectDetail } from '@/queries/hooks/music-projects/useMusicProject';
import CheckBoxOutlined from '@mui/icons-material/CheckBoxOutlined';
import EventNote from '@mui/icons-material/EventNote';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import LinkOff from '@mui/icons-material/LinkOff';
import LockOpenOutlined from '@mui/icons-material/LockOpenOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import TitleIcon from '@mui/icons-material/Title';
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
  Typography,
} from '@mui/material';
import Link from '@tiptap/extension-link';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import { MainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import {
  ProjectAlbumsNode,
  ProjectEmbedNode,
  ProjectSongsNode,
} from '@/components/MusicProjects/mainPage/mainPageNodes';
import { ProjectCreatePopovers } from '@/components/MusicProjects/ProjectCreatePopovers';
import { useProjectCreatePopovers } from '@/components/MusicProjects/useProjectCreatePopovers';
import { richTextContentSx } from '@/components/RichTextEditor/richTextContentSx';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import {
  mainPageHasNode,
  pastedSingleUrl,
  PROJECT_ALBUMS_NODE,
  PROJECT_SONGS_NODE,
} from '@/utils/projectMainPage';

type SlashKind = 'albums' | 'songs';

type SlashState = {
  from: number;
  to: number;
  query: string;
  top: number;
  left: number;
  index: number;
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
  onNavigateToTab,
  onFocusChange,
}: MainPageEditorProps) {
  const t = useTranslations('MusicProjects');
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const pasteRef = useRef<(view: EditorView, event: ClipboardEvent) => boolean>(() => false);
  const keyRef = useRef<(view: EditorView, event: KeyboardEvent) => boolean>(() => false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [styleAnchor, setStyleAnchor] = useState<HTMLElement | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  lockedRef.current = locked;
  const [, setSelectionTick] = useState(0);
  const editing = canEdit && !locked;
  const createPopovers = useProjectCreatePopovers(locale, projectId);

  const placeholder = t('main_page_placeholder');
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
    ProjectAlbumsNode,
    ProjectSongsNode,
    ProjectEmbedNode,
    TaskList,
    TaskItem.configure({ nested: true }),
  ], [placeholder]);

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

  function syncSlash(ed: Editor) {
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
    setSlash(prev => ({
      from: $from.before(),
      to: $from.after(),
      query,
      top: coords.bottom + 4,
      left: coords.left,
      index: prev?.query === query ? prev.index : 0,
    }));
  }

  const slashItems = useMemo(() => {
    const query = (slash?.query ?? '').toLowerCase();
    const doc = editor?.getJSON() ?? value;
    const items: Array<{ id: SlashKind; label: string }> = [];
    if (albums.length > 0 && !mainPageHasNode(doc, PROJECT_ALBUMS_NODE)) {
      items.push({ id: 'albums', label: t('albums') });
    }
    if (songs.length > 0 && !mainPageHasNode(doc, PROJECT_SONGS_NODE)) {
      items.push({ id: 'songs', label: t('songs') });
    }
    return items.filter(item =>
      item.id.includes(query) || item.label.toLowerCase().includes(query),
    );
  }, [albums.length, editor, slash?.query, songs.length, t, value]);

  const applySlash = (kind: SlashKind) => {
    if (!editor || !slash) {
      return;
    }
    editor.chain().focus().insertContentAt(
      { from: slash.from, to: slash.to },
      { type: kind === 'albums' ? PROJECT_ALBUMS_NODE : PROJECT_SONGS_NODE },
    ).run();
    setSlash(null);
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

  keyRef.current = (_view, event) => {
    if (!slash || slashItems.length === 0) {
      return false;
    }
    if (event.key === 'Escape') {
      setSlash(null);
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
    if (!editor) {
      return;
    }
    const existing = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(existing ?? 'https://');
    setLinkOpen(true);
  };

  const applyLink = () => {
    if (!editor) {
      return;
    }
    const trimmed = linkUrl.trim();
    if (!trimmed || trimmed === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
    }
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
                    onChange={() => editor.chain().focus().toggleTaskList().run()}
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
                    color={editor.isActive('link') ? 'primary' : 'default'}
                    onClick={openLink}
                  >
                    <LinkIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
              </>
            )}
            <Tooltip title={t('song_detail_title')}>
              <IconButton size="small" onClick={event => createPopovers.openPopoverFromClick('song', event)}>
                <GradientIcon kind="song" fontSize={18} gradientOnHover aria-hidden />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('album_detail_title')}>
              <IconButton size="small" onClick={event => createPopovers.openPopoverFromClick('album', event)}>
                <GradientIcon kind="album" fontSize={18} gradientOnHover aria-hidden />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('event_detail_title')}>
              <IconButton size="small" onClick={event => createPopovers.openPopoverFromClick('event', event)}>
                <EventNote sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />
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
              '& > * + *': { mt: 1.5 },
              '& h1': { fontSize: '1.5rem', fontWeight: 700, m: 0, mb: 0.75 },
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
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('add_link')}</Typography>
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
          sx={{ mb: 1.5 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {editor?.isActive('link') && (
            <IconButton
              size="small"
              aria-label={t('main_page_remove_link')}
              onClick={() => {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                setLinkOpen(false);
              }}
            >
              <LinkOff fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" color="primary" aria-label={t('add_link')} onClick={applyLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Box>
      </Popover>

      <Menu
        open={Boolean(slash) && slashItems.length > 0}
        onClose={() => setSlash(null)}
        anchorReference="anchorPosition"
        anchorPosition={slash ? { top: slash.top, left: slash.left } : undefined}
        slotProps={getGlassMenuSlotProps({ minWidth: 160 })}
      >
        {slashItems.map((item, index) => (
          <MenuItem
            key={item.id}
            selected={index === (slash?.index ?? 0)}
            sx={glassMenuItemSx}
            onMouseDown={event => event.preventDefault()}
            onClick={() => applySlash(item.id)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <ProjectCreatePopovers state={createPopovers} />
    </MainPageEditorContext>
  );
}
