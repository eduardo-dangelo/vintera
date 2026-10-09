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
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ExternalLinkEmbed } from '@/components/MusicProjects/ExternalLinkEmbed';
import { useMainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import {
  clearPageBlockEntering,
  getPageBlockExitVersion,
  isPageBlockEntering,
  isPageBlockExiting,
  PAGE_BLOCK_MOTION_MS,
  requestPageBlockExit,
  subscribePageBlockExit,
} from '@/components/MusicProjects/mainPage/pageBlockMotion';
import { buildExternalLink } from '@/utils/externalLinkEmbed';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import { PROJECT_EMBED_NODE } from '@/utils/projectMainPage';

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
  /** Removes this block from the page. Does not delete the songs or albums. */
  allowDelete?: boolean;
  deleteLabel?: string;
  hidden?: boolean;
  title?: ReactNode;
  viewAllLabel?: string;
  onViewAll?: () => void;
  headerActions?: ReactNode;
  extraMenu?: (close: () => void) => ReactNode;
  children: ReactNode;
};

export function BlockShell({
  editor,
  getPos,
  deleteNode: _deleteNode,
  allowDelete = false,
  deleteLabel,
  hidden = false,
  title,
  viewAllLabel,
  onViewAll,
  headerActions,
  extraMenu,
  children,
}: BlockShellProps) {
  const t = useTranslations('MusicProjects');
  const { canEdit } = useMainPageEditorContext();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  useSyncExternalStore(subscribePageBlockExit, getPageBlockExitVersion, getPageBlockExitVersion);
  const pos = readPos(getPos);
  const exiting = pos != null && isPageBlockExiting(pos);
  const enteringRef = useRef<boolean | null>(null);
  if (enteringRef.current == null) {
    enteringRef.current = pos != null && isPageBlockEntering(pos);
  }
  const entering = enteringRef.current === true;
  useEffect(() => {
    if (!entering || pos == null) {
      return;
    }
    const timer = window.setTimeout(() => {
      clearPageBlockEntering(pos);
    }, PAGE_BLOCK_MOTION_MS);
    return () => window.clearTimeout(timer);
  }, [entering, pos]);
  const index = pos == null ? -1 : editor.state.doc.resolve(pos).index(0);
  const canMoveUp = index > 0;
  const canMoveDown = index >= 0 && index < editor.state.doc.childCount - 1;

  if (hidden) {
    return <NodeViewWrapper style={{ display: 'none' }} />;
  }

  const beginRemove = () => {
    if (pos == null) {
      return;
    }
    setMenuAnchor(null);
    requestPageBlockExit([pos], () => {
      const current = readPos(getPos);
      if (current == null) {
        return;
      }
      const node = editor.state.doc.nodeAt(current);
      if (!node) {
        return;
      }
      editor.view.dispatch(
        editor.state.tr.delete(current, current + node.nodeSize).setMeta('pageBlockExit', true),
      );
    });
  };

  return (
    <NodeViewWrapper
      data-page-block-motion={exiting ? 'out' : entering ? 'in' : undefined}
      style={{ position: 'relative', margin: '0.35rem 0' }}
    >
      {(title || canEdit) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: title ? 1 : 0, minHeight: 28 }}>
          {title
            ? <Box sx={{ flex: 1, minWidth: 0 }}>{title}</Box>
            : <Box sx={{ flex: 1 }} />}
          {headerActions}
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
        onClose={() => setMenuAnchor(null)}
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
        {extraMenu?.(() => setMenuAnchor(null))}
        {allowDelete && (
          <MenuItem
            sx={{ ...glassMenuItemSx, color: 'error.main' }}
            onClick={beginRemove}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
            {deleteLabel ?? t('page_remove')}
          </MenuItem>
        )}
      </Menu>
    </NodeViewWrapper>
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
