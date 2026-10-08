'use client';

import type { Editor } from '@tiptap/core';
import type { ReactNodeViewProps } from '@tiptap/react';
import type { ReactNode } from 'react';
import {
  DeleteOutline as DeleteIcon,
  MoreHoriz,
  ArrowDownward as MoveDownIcon,
  ArrowUpward as MoveUpIcon,
} from '@mui/icons-material';
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ExternalLinkEmbed } from '@/components/MusicProjects/ExternalLinkEmbed';
import { useMainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import { OverviewAlbumsPreview, OverviewSongsPreview } from '@/components/MusicProjects/tabs/OverviewMusicPreviews';
import { hasAlbumsTab, hasSongsTab } from '@/components/MusicProjects/tabs/projectTabVisibility';
import { buildExternalLink } from '@/utils/externalLinkEmbed';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import { PROJECT_ALBUMS_NODE, PROJECT_EMBED_NODE, PROJECT_SONGS_NODE } from '@/utils/projectMainPage';

function readPos(getPos: ReactNodeViewProps['getPos']): number | null {
  if (typeof getPos !== 'function') {
    return null;
  }
  const pos = getPos();
  return typeof pos === 'number' ? pos : null;
}

function moveAtomBlock(editor: Editor, pos: number, direction: -1 | 1) {
  const { state } = editor;
  const node = state.doc.nodeAt(pos);
  if (!node || !node.isBlock) {
    return;
  }
  const index = state.doc.resolve(pos).index(0);
  const target = index + direction;
  if (target < 0 || target >= state.doc.childCount) {
    return;
  }
  const neighbor = state.doc.child(target);
  const insertAt = direction === -1
    ? pos - neighbor.nodeSize
    : pos + node.nodeSize + neighbor.nodeSize;
  const tr = state.tr;
  tr.delete(pos, pos + node.nodeSize);
  tr.insert(insertAt, node);
  editor.view.dispatch(tr);
}

type BlockShellProps = {
  editor: Editor;
  getPos: ReactNodeViewProps['getPos'];
  deleteNode: () => void;
  /** Embeds can be deleted. Albums and songs stay on the page. */
  allowDelete?: boolean;
  hidden?: boolean;
  title?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: ReactNode;
};

function BlockShell({
  editor,
  getPos,
  deleteNode,
  allowDelete = false,
  hidden = false,
  title,
  viewAllLabel,
  onViewAll,
  children,
}: BlockShellProps) {
  const t = useTranslations('MusicProjects');
  const { canEdit } = useMainPageEditorContext();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const pos = readPos(getPos);
  const index = pos == null ? -1 : editor.state.doc.resolve(pos).index(0);
  const canMoveUp = index > 0;
  const canMoveDown = index >= 0 && index < editor.state.doc.childCount - 1;
  const showActions = canEdit && (hovered || Boolean(menuAnchor));

  if (hidden) {
    return <NodeViewWrapper style={{ display: 'none' }} />;
  }

  return (
    <NodeViewWrapper
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!menuAnchor) {
          setHovered(false);
        }
      }}
      style={{ position: 'relative', margin: '0.35rem 0' }}
    >
      {(title || canEdit) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: title ? 1 : 0, minHeight: 28 }}>
          {title
            ? (
                <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, minWidth: 0, fontSize: '1.05rem' }}>
                  {title}
                </Typography>
              )
            : <Box sx={{ flex: 1 }} />}
          {viewAllLabel && onViewAll && (
            <Button
              size="small"
              onClick={onViewAll}
              sx={{ textTransform: 'none', fontWeight: 500, flexShrink: 0 }}
            >
              {viewAllLabel}
            </Button>
          )}
          {canEdit && (
            <IconButton
              size="small"
              aria-label={t('context_menu_actions')}
              onClick={event => setMenuAnchor(event.currentTarget)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                opacity: showActions ? 1 : 0,
              }}
            >
              <MoreHoriz sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      )}
      {children}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setHovered(false);
        }}
        slotProps={getGlassMenuSlotProps()}
      >
        <MenuItem
          disabled={!canMoveUp}
          sx={glassMenuItemSx}
          onClick={() => {
            if (pos != null) {
              moveAtomBlock(editor, pos, -1);
            }
            setMenuAnchor(null);
          }}
        >
          <MoveUpIcon sx={{ fontSize: 16 }} />
          {t('sidebar_section_move_up')}
        </MenuItem>
        <MenuItem
          disabled={!canMoveDown}
          sx={glassMenuItemSx}
          onClick={() => {
            if (pos != null) {
              moveAtomBlock(editor, pos, 1);
            }
            setMenuAnchor(null);
          }}
        >
          <MoveDownIcon sx={{ fontSize: 16 }} />
          {t('sidebar_section_move_down')}
        </MenuItem>
        {allowDelete && (
          <MenuItem
            sx={{ ...glassMenuItemSx, color: 'error.main' }}
            onClick={() => {
              setMenuAnchor(null);
              deleteNode();
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
            {t('delete')}
          </MenuItem>
        )}
      </Menu>
    </NodeViewWrapper>
  );
}

function AlbumsBlockView({ editor, getPos, deleteNode }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  const albumsHaveTab = hasAlbumsTab(ctx.albums.length);
  return (
    <BlockShell
      editor={editor}
      getPos={getPos}
      deleteNode={deleteNode}
      hidden={ctx.albums.length === 0}
      title={albumsHaveTab ? t('overview_recent_albums') : t('albums')}
      viewAllLabel={albumsHaveTab && ctx.onNavigateToTab ? t('overview_view_all') : undefined}
      onViewAll={ctx.onNavigateToTab ? () => ctx.onNavigateToTab?.('albums') : undefined}
    >
      <OverviewAlbumsPreview
        locale={ctx.locale}
        project={ctx.project}
        albums={ctx.albums}
        songs={ctx.songs}
        hideChrome
      />
    </BlockShell>
  );
}

function SongsBlockView({ editor, getPos, deleteNode }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const ctx = useMainPageEditorContext();
  const songsHaveTab = hasSongsTab(ctx.songs.length);
  return (
    <BlockShell
      editor={editor}
      getPos={getPos}
      deleteNode={deleteNode}
      hidden={ctx.songs.length === 0}
      title={songsHaveTab ? t('overview_recent_songs') : t('songs')}
      viewAllLabel={songsHaveTab && ctx.onNavigateToTab ? t('overview_view_all') : undefined}
      onViewAll={ctx.onNavigateToTab ? () => ctx.onNavigateToTab?.('songs') : undefined}
    >
      <OverviewSongsPreview
        locale={ctx.locale}
        projectId={ctx.projectId}
        project={ctx.project}
        albums={ctx.albums}
        songs={ctx.songs}
        hideChrome
      />
    </BlockShell>
  );
}

function EmbedBlockView({ editor, node, getPos, deleteNode }: ReactNodeViewProps) {
  const ctx = useMainPageEditorContext();
  const url = typeof node.attrs.url === 'string' ? node.attrs.url : '';
  const title = typeof node.attrs.title === 'string' ? node.attrs.title : undefined;
  const link = buildExternalLink(url, title, 'page-embed');
  if (!link) {
    return <NodeViewWrapper style={{ display: 'none' }} />;
  }
  return (
    <BlockShell editor={editor} getPos={getPos} deleteNode={deleteNode} allowDelete>
      <ExternalLinkEmbed link={link} accent={ctx.accent} />
    </BlockShell>
  );
}

function atomNode(name: string, dataAttr: string, view: (props: ReactNodeViewProps) => ReactNode) {
  return Node.create({
    name,
    group: 'block',
    atom: true,
    selectable: true,
    draggable: false,
    parseHTML() {
      return [{ tag: `div[${dataAttr}]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['div', mergeAttributes(HTMLAttributes, { [dataAttr]: 'true' })];
    },
    addNodeView() {
      return ReactNodeViewRenderer(view);
    },
  });
}

export const ProjectAlbumsNode = atomNode(PROJECT_ALBUMS_NODE, 'data-project-albums', AlbumsBlockView);
export const ProjectSongsNode = atomNode(PROJECT_SONGS_NODE, 'data-project-songs', SongsBlockView);

export const ProjectEmbedNode = Node.create({
  name: PROJECT_EMBED_NODE,
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() {
    return {
      url: { default: '' },
      title: { default: null as string | null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-project-embed]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-project-embed': 'true' })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(EmbedBlockView);
  },
});
