'use client';

import type { ReactNodeViewProps } from '@tiptap/react';
import type { ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import { mergeAttributes, Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ExternalLinkEmbed } from '@/components/MusicProjects/ExternalLinkEmbed';
import { useMainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import {
  clearPageBlockEntering,
  getPageBlockExitVersion,
  isPageBlockEntering,
  isPageBlockExiting,
  PAGE_BLOCK_MOTION_MS,
  subscribePageBlockExit,
} from '@/components/MusicProjects/mainPage/pageBlockMotion';
import { buildExternalLink } from '@/utils/externalLinkEmbed';
import { PROJECT_EMBED_NODE } from '@/utils/projectMainPage';

function readPos(getPos: ReactNodeViewProps['getPos']): number | null {
  if (typeof getPos !== 'function') {
    return null;
  }
  const pos = getPos();
  return typeof pos === 'number' ? pos : null;
}

type BlockShellProps = {
  getPos: ReactNodeViewProps['getPos'];
  hidden?: boolean;
  title?: ReactNode;
  viewAllLabel?: string;
  onViewAll?: () => void;
  headerActions?: ReactNode;
  children: ReactNode;
};

export function BlockShell({
  getPos,
  hidden = false,
  title,
  viewAllLabel,
  onViewAll,
  headerActions,
  children,
}: BlockShellProps) {
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
  const showHeader = Boolean(title) || Boolean(headerActions) || Boolean(viewAllLabel && onViewAll);

  if (hidden) {
    return <NodeViewWrapper style={{ display: 'none' }} />;
  }

  return (
    <NodeViewWrapper
      data-page-block-motion={exiting ? 'out' : entering ? 'in' : undefined}
      style={{ position: 'relative', margin: '0.35rem 0' }}
    >
      {showHeader && (
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
        </Box>
      )}
      {children}
    </NodeViewWrapper>
  );
}

function EmbedBlockView({ node, getPos }: ReactNodeViewProps) {
  const ctx = useMainPageEditorContext();
  const url = typeof node.attrs.url === 'string' ? node.attrs.url : '';
  const title = typeof node.attrs.title === 'string' ? node.attrs.title : undefined;
  const link = buildExternalLink(url, title, 'page-embed');
  if (!link) {
    return <NodeViewWrapper style={{ display: 'none' }} />;
  }
  return (
    <BlockShell getPos={getPos}>
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
