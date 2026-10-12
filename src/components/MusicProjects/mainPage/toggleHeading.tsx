'use client';

/* eslint-disable react-refresh/only-export-components -- style commands live with the heading node */

import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { ReactNodeViewProps } from '@tiptap/react';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { IconButton } from '@mui/material';
import { Node } from '@tiptap/core';
import { Plugin, TextSelection } from '@tiptap/pm/state';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { COLUMN_NODE, TOGGLE_HEADING_NODE } from '@/utils/projectMainPage';

export type PageTextStyle = 'paragraph' | 'caption'
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'toggle1' | 'toggle2' | 'toggle3';

const TOGGLE_LEVELS = [1, 2, 3] as const;

type ToggleLevel = (typeof TOGGLE_LEVELS)[number];

function isToggleLevel(value: unknown): value is ToggleLevel {
  return typeof value === 'number' && (TOGGLE_LEVELS as readonly number[]).includes(value);
}

function toggleLevelFromStyle(style: PageTextStyle): ToggleLevel | null {
  if (style === 'toggle1' || style === 'toggle2' || style === 'toggle3') {
    return Number(style.slice(6)) as ToggleLevel;
  }
  return null;
}

function isFlowParent(node: ProseMirrorNode) {
  return node.type.name === 'doc'
    || node.type.name === COLUMN_NODE
    || node.type.name === TOGGLE_HEADING_NODE;
}

type BlockRange = {
  from: number;
  to: number;
  node: ProseMirrorNode;
  parentDepth: number;
};

function currentBlock(editor: Editor): BlockRange | null {
  const { $from } = editor.state.selection;
  if ($from.nodeAfter?.isBlock && ($from.depth === 0 || isFlowParent($from.parent))) {
    const node = $from.nodeAfter;
    return { from: $from.pos, to: $from.pos + node.nodeSize, node, parentDepth: $from.depth };
  }
  for (let depth = $from.depth; depth >= 1; depth -= 1) {
    const parent = $from.node(depth - 1);
    if (depth === 1 || isFlowParent(parent)) {
      return {
        from: $from.before(depth),
        to: $from.after(depth),
        node: $from.node(depth),
        parentDepth: depth - 1,
      };
    }
  }
  return null;
}

function isToggleTitle(block: BlockRange, $fromParentName: string, index: number) {
  return block.node.type.name === 'heading'
    && $fromParentName === TOGGLE_HEADING_NODE
    && index === 0;
}

function outermostReject(editor: Editor, level: ToggleLevel, fromDepth: number): number | null {
  const { $from } = editor.state.selection;
  let rejected: number | null = null;
  for (let depth = fromDepth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name !== TOGGLE_HEADING_NODE) {
      continue;
    }
    if (level > Number(node.attrs.level)) {
      break;
    }
    rejected = depth;
  }
  return rejected;
}

function headingNode(schema: Editor['schema'], source: ProseMirrorNode | null, level: ToggleLevel) {
  const heading = schema.nodes.heading;
  if (!heading) {
    return null;
  }
  const textAlign = source && (source.type.name === 'heading' || source.type.name === 'paragraph')
    ? source.attrs.textAlign
    : null;
  const content = source && (source.type.name === 'heading' || source.type.name === 'paragraph')
    ? source.content
    : null;
  return heading.create({ level, ...(textAlign ? { textAlign } : {}) }, content);
}

function toggleNode(
  schema: Editor['schema'],
  source: ProseMirrorNode | null,
  level: ToggleLevel,
  collapsed: boolean,
  body: ProseMirrorNode[] = [],
) {
  const type = schema.nodes[TOGGLE_HEADING_NODE];
  const heading = headingNode(schema, source, level);
  const spacer = body.length === 0 ? schema.nodes.paragraph?.create() ?? null : null;
  if (!type || !heading) {
    return null;
  }
  return type.create({ level, collapsed }, spacer ? [heading, spacer] : [heading, ...body]);
}

function isChecklistTitle(doc: ProseMirrorNode, block: BlockRange) {
  if (block.node.type.name !== 'heading' || block.node.attrs.level !== 3) {
    return false;
  }
  return doc.nodeAt(block.to)?.type.name === 'taskList';
}

function focusAt(editor: Editor, tr: Editor['state']['tr'], pos: number) {
  const clamped = Math.max(1, Math.min(pos, tr.doc.content.size));
  tr.setSelection(TextSelection.near(tr.doc.resolve(clamped)));
  editor.view.dispatch(tr.scrollIntoView());
  editor.view.focus();
}

function setToggleHeading(editor: Editor, level: ToggleLevel) {
  const block = currentBlock(editor);
  if (!block) {
    return;
  }
  const { state } = editor;
  const { $from } = state.selection;
  const parent = block.parentDepth > 0 ? $from.node(block.parentDepth) : state.doc;
  const title = isToggleTitle(block, parent.type.name, $from.index(block.parentDepth));
  if (!title && isChecklistTitle(state.doc, block)) {
    return;
  }
  if (title && Number(parent.attrs.level) === level) {
    return;
  }
  const rejected = outermostReject(editor, level, title ? block.parentDepth - 1 : block.parentDepth);
  const tr = state.tr;
  if (title && parent.type.name === TOGGLE_HEADING_NODE) {
    const body: ProseMirrorNode[] = [];
    parent.forEach((child, _offset, index) => {
      if (index > 0) {
        body.push(child);
      }
    });
    const next = toggleNode(state.schema, parent.child(0), level, parent.attrs.collapsed === true, body);
    if (!next) {
      return;
    }
    const togglePos = $from.before(block.parentDepth);
    if (rejected == null) {
      tr.replaceWith(togglePos, togglePos + parent.nodeSize, next);
      focusAt(editor, tr, togglePos + 2);
      return;
    }
    const anchor = $from.node(rejected);
    const after = $from.before(rejected) + anchor.nodeSize;
    tr.delete(togglePos, togglePos + parent.nodeSize);
    const at = tr.mapping.map(after);
    tr.insert(at, next);
    focusAt(editor, tr, at + 2);
    return;
  }
  const textBlock = block.node.type.name === 'paragraph' || block.node.type.name === 'heading';
  const next = toggleNode(state.schema, textBlock ? block.node : null, level, false);
  if (!next) {
    return;
  }
  if (rejected != null) {
    const anchor = $from.node(rejected);
    const after = $from.before(rejected) + anchor.nodeSize;
    if (textBlock) {
      tr.delete(block.from, block.to);
    }
    const at = tr.mapping.map(after);
    tr.insert(at, next);
    focusAt(editor, tr, at + 2);
    return;
  }
  if (textBlock) {
    tr.replaceWith(block.from, block.to, next);
    focusAt(editor, tr, block.from + 2);
    return;
  }
  tr.insert(block.to, next);
  focusAt(editor, tr, block.to + 2);
}

function styledTitle(schema: Editor['schema'], heading: ProseMirrorNode, style: PageTextStyle) {
  const textAlign = heading.attrs.textAlign;
  const align = textAlign ? { textAlign } : {};
  if (style === 'paragraph' || style === 'caption') {
    return schema.nodes.paragraph?.create(
      { ...align, ...(style === 'caption' ? { caption: true } : {}) },
      heading.content,
    ) ?? null;
  }
  if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4' || style === 'h5' || style === 'h6') {
    return schema.nodes.heading?.create(
      { ...align, level: Number(style.slice(1)) },
      heading.content,
    ) ?? null;
  }
  return null;
}

function unwrapToggleTitle(editor: Editor, style: PageTextStyle) {
  const block = currentBlock(editor);
  if (!block) {
    return false;
  }
  const { schema, selection } = editor.state;
  const { $from } = selection;
  const parent = block.parentDepth > 0 ? $from.node(block.parentDepth) : null;
  if (!parent || !isToggleTitle(block, parent.type.name, $from.index(block.parentDepth))) {
    return false;
  }
  const title = styledTitle(schema, parent.child(0), style);
  if (!title) {
    return false;
  }
  const body: ProseMirrorNode[] = [];
  parent.forEach((child, _offset, index) => {
    if (index > 0) {
      body.push(child);
    }
  });
  const pos = $from.before(block.parentDepth);
  const tr = editor.state.tr.replaceWith(pos, pos + parent.nodeSize, [title, ...body]);
  focusAt(editor, tr, pos + 1);
  return true;
}

export function applyPageTextStyle(editor: Editor, style: PageTextStyle) {
  const level = toggleLevelFromStyle(style);
  if (level != null) {
    setToggleHeading(editor, level);
    return;
  }
  if (unwrapToggleTitle(editor, style)) {
    return;
  }
  const chain = editor.chain().focus();
  if (style === 'paragraph') {
    chain.setParagraph().updateAttributes('paragraph', { caption: false }).run();
  } else if (style === 'caption') {
    chain.setParagraph().updateAttributes('paragraph', { caption: true }).run();
  } else if (style === 'h1' || style === 'h2' || style === 'h3' || style === 'h4' || style === 'h5' || style === 'h6') {
    chain.toggleHeading({ level: Number(style.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
  }
}

export function activeToggleStyle(editor: Editor | null): PageTextStyle | null {
  if (!editor) {
    return null;
  }
  const block = currentBlock(editor);
  if (!block) {
    return null;
  }
  const { $from } = editor.state.selection;
  const parent = block.parentDepth > 0 ? $from.node(block.parentDepth) : null;
  if (!parent || !isToggleTitle(block, parent.type.name, $from.index(block.parentDepth))) {
    return null;
  }
  const level = parent.attrs.level;
  if (!isToggleLevel(level)) {
    return null;
  }
  if (level === 1) {
    return 'toggle1';
  }
  if (level === 2) {
    return 'toggle2';
  }
  return 'toggle3';
}

function toggleFix(doc: ProseMirrorNode): { pos: number; node: ProseMirrorNode } | null {
  let found: { pos: number; node: ProseMirrorNode } | null = null;
  doc.descendants((node, pos) => {
    if (found || node.type.name !== TOGGLE_HEADING_NODE) {
      return !found;
    }
    const first = node.firstChild;
    const level = node.attrs.level;
    const valid = isToggleLevel(level)
      && first?.type.name === 'heading'
      && first.attrs.level === level;
    if (!valid) {
      found = { pos, node };
      return false;
    }
    return true;
  });
  return found;
}

const TOGGLE_LINE_HEIGHT: Record<ToggleLevel, string> = {
  1: 'calc(1.5rem * 1.25 + 4px)',
  2: 'calc(1.125rem * 1.25 + 4px)',
  3: 'calc(1rem * 1.2 + 4px)',
};

function ToggleHeadingView({ node, editor, getPos }: ReactNodeViewProps) {
  const collapsed = node.attrs.collapsed === true;
  const level = isToggleLevel(node.attrs.level) ? node.attrs.level : 1;
  const toggle = () => {
    if (!editor.isEditable || typeof getPos !== 'function') {
      return;
    }
    const pos = getPos();
    if (typeof pos !== 'number') {
      return;
    }
    const current = editor.state.doc.nodeAt(pos);
    if (!current) {
      return;
    }
    editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, {
      ...current.attrs,
      collapsed: current.attrs.collapsed !== true,
    }));
  };
  return (
    <NodeViewWrapper
      data-toggle-heading=""
      data-collapsed={collapsed ? 'true' : 'false'}
      data-level={node.attrs.level}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
        <IconButton
          size="small"
          disabled={!editor.isEditable}
          contentEditable={false}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={toggle}
          sx={{
            color: 'text.secondary',
            width: 22,
            height: TOGGLE_LINE_HEIGHT[level],
            minWidth: 0,
            minHeight: 0,
            p: 0,
            flexShrink: 0,
          }}
        >
          <ChevronRight sx={{
            fontSize: 18,
            transform: collapsed ? 'none' : 'rotate(90deg)',
            transition: 'transform 150ms ease',
          }}
          />
        </IconButton>
        <NodeViewContent style={{ flex: 1, minWidth: 0 }} />
      </div>
    </NodeViewWrapper>
  );
}

export const ToggleHeading = Node.create({
  name: TOGGLE_HEADING_NODE,
  group: 'block',
  content: 'heading block*',
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      level: {
        default: 1,
        parseHTML: (element: HTMLElement) => {
          const level = Number(element.getAttribute('data-level'));
          return isToggleLevel(level) ? level : 1;
        },
        renderHTML: (attributes: { level?: number }) => ({ 'data-level': String(attributes.level ?? 1) }),
      },
      collapsed: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes: { collapsed?: boolean }) => (
          attributes.collapsed ? { 'data-collapsed': 'true' } : {}
        ),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-toggle-heading]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, 'data-toggle-heading': '' }, 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ToggleHeadingView);
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) {
            return null;
          }
          if (transactions.some(tr => tr.getMeta('togglePrune'))) {
            return null;
          }
          const tr = newState.tr;
          let changed = false;
          for (let guard = 0; guard < 40; guard += 1) {
            const fix = toggleFix(tr.doc);
            if (!fix) {
              break;
            }
            changed = true;
            if (fix.node.childCount === 0) {
              tr.delete(fix.pos, fix.pos + fix.node.nodeSize);
            } else {
              tr.replaceWith(fix.pos, fix.pos + fix.node.nodeSize, fix.node.content);
            }
          }
          if (!changed) {
            return null;
          }
          return tr.setMeta('togglePrune', true);
        },
      }),
    ];
  },
});
