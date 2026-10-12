import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin, TextSelection } from '@tiptap/pm/state';
import { COLUMN_LAYOUT_NODE, COLUMN_NODE } from '@/utils/projectMainPage';

type ColumnFix
  = { kind: 'nested'; pos: number; node: ProseMirrorNode }
    | { kind: 'empty'; pos: number; node: ProseMirrorNode }
    | { kind: 'short'; pos: number; node: ProseMirrorNode };

function nextColumnFix(doc: ProseMirrorNode): ColumnFix | null {
  let nested: ColumnFix | null = null;
  let empty: ColumnFix | null = null;
  let short: ColumnFix | null = null;
  doc.descendants((node, pos) => {
    if (node.type.name === COLUMN_NODE) {
      let hasLayout = false;
      node.forEach((child) => {
        if (child.type.name === COLUMN_LAYOUT_NODE) {
          hasLayout = true;
        }
      });
      if (hasLayout && !nested) {
        nested = { kind: 'nested', pos, node };
      }
      if (node.childCount === 0 && !empty) {
        empty = { kind: 'empty', pos, node };
      }
    }
    if (node.type.name === COLUMN_LAYOUT_NODE && node.childCount < 2 && !short) {
      short = { kind: 'short', pos, node };
    }
    return true;
  });
  return nested ?? empty ?? short;
}

export const ColumnLayout = Node.create({
  name: COLUMN_LAYOUT_NODE,
  group: 'block',
  content: 'column*',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-column-layout]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-column-layout': '' }), 0];
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) {
            return null;
          }
          if (transactions.some(tr => tr.getMeta('columnPrune'))) {
            return null;
          }
          const tr = newState.tr;
          let changed = false;
          for (let guard = 0; guard < 40; guard += 1) {
            const fix = nextColumnFix(tr.doc);
            if (!fix) {
              break;
            }
            changed = true;
            if (fix.kind === 'nested') {
              const pieces: ProseMirrorNode[] = [];
              let blocks: ProseMirrorNode[] = [];
              const flush = () => {
                if (blocks.length === 0) {
                  return;
                }
                const column = tr.doc.type.schema.nodes[COLUMN_NODE];
                if (column) {
                  pieces.push(column.create(null, blocks));
                }
                blocks = [];
              };
              fix.node.forEach((child) => {
                if (child.type.name === COLUMN_LAYOUT_NODE) {
                  flush();
                  child.forEach(inner => pieces.push(inner));
                  return;
                }
                blocks.push(child);
              });
              flush();
              if (pieces.length === 0) {
                tr.delete(fix.pos, fix.pos + fix.node.nodeSize);
              } else {
                tr.replaceWith(fix.pos, fix.pos + fix.node.nodeSize, pieces);
              }
            } else if (fix.kind === 'empty') {
              tr.delete(fix.pos, fix.pos + fix.node.nodeSize);
            } else if (fix.node.childCount === 0) {
              tr.delete(fix.pos, fix.pos + fix.node.nodeSize);
            } else {
              tr.replaceWith(fix.pos, fix.pos + fix.node.nodeSize, fix.node.child(0).content);
            }
          }
          if (!changed) {
            return null;
          }
          return tr.setMeta('columnPrune', true);
        },
      }),
    ];
  },
});

export const Column = Node.create({
  name: COLUMN_NODE,
  content: 'block*',
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: 'div[data-column]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-column': '' }), 0];
  },
});

function blankColumn(schema: Editor['schema']) {
  const column = schema.nodes[COLUMN_NODE];
  const paragraph = schema.nodes.paragraph;
  if (!column || !paragraph) {
    return null;
  }
  return column.create(null, paragraph.create());
}

export function addPageColumn(editor: Editor) {
  const { state } = editor;
  const layoutType = state.schema.nodes[COLUMN_LAYOUT_NODE];
  const column = blankColumn(state.schema);
  if (!layoutType || !column) {
    return;
  }
  const { $from } = state.selection;
  let columnDepth: number | null = null;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === COLUMN_NODE) {
      columnDepth = depth;
      break;
    }
  }
  const tr = state.tr;
  let cursor = 1;
  if (columnDepth != null) {
    const after = $from.after(columnDepth);
    tr.insert(after, column);
    cursor = after + 2;
  } else if ($from.depth >= 1 && $from.node(1).type.name === COLUMN_LAYOUT_NODE) {
    const layout = $from.node(1);
    const at = $from.before(1) + 1 + layout.content.size;
    tr.insert(at, column);
    cursor = at + 2;
  } else if ($from.depth >= 1) {
    const from = $from.before(1);
    const node = $from.node(1);
    const columnType = state.schema.nodes[COLUMN_NODE];
    if (!columnType) {
      return;
    }
    tr.replaceWith(from, from + node.nodeSize, layoutType.create(null, [
      columnType.create(null, node),
      column,
    ]));
    cursor = from + node.nodeSize + 5;
  } else if ($from.nodeAfter?.isBlock) {
    const node = $from.nodeAfter;
    const from = $from.pos;
    const columnType = state.schema.nodes[COLUMN_NODE];
    if (!columnType) {
      return;
    }
    tr.replaceWith(from, from + node.nodeSize, layoutType.create(null, [
      columnType.create(null, node),
      column,
    ]));
    cursor = from + node.nodeSize + 5;
  } else {
    return;
  }
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(cursor, tr.doc.content.size))));
  editor.view.dispatch(tr.scrollIntoView());
  editor.view.focus();
}

export type ColumnSplitTarget = {
  kind: 'layout' | 'block';
  start: number;
  columnFrom: number | null;
};

export function moveBlockBeside(
  view: EditorView,
  from: number,
  end: number,
  target: ColumnSplitTarget,
  side: 'left' | 'right',
) {
  const slice = view.state.doc.slice(from, end);
  if (slice.content.size === 0) {
    return;
  }
  const schema = view.state.schema;
  const columnType = schema.nodes[COLUMN_NODE];
  const layoutType = schema.nodes[COLUMN_LAYOUT_NODE];
  if (!columnType || !layoutType) {
    return;
  }
  const tr = view.state.tr;
  const draggedFirst = end <= target.start;
  if (draggedFirst) {
    tr.delete(from, end);
  }
  const map = (pos: number) => tr.mapping.map(pos);
  if (target.kind === 'layout') {
    const layoutPos = map(target.start);
    const layout = tr.doc.nodeAt(layoutPos);
    if (layout?.type.name !== COLUMN_LAYOUT_NODE) {
      return;
    }
    const at = side === 'left' ? layoutPos + 1 : layoutPos + 1 + layout.content.size;
    tr.insert(at, columnType.create(null, slice.content));
  } else if (target.columnFrom != null) {
    const columnPos = map(target.columnFrom);
    const columnNode = tr.doc.nodeAt(columnPos);
    if (columnNode?.type.name !== COLUMN_NODE) {
      return;
    }
    const at = side === 'left' ? columnPos : columnPos + columnNode.nodeSize;
    tr.insert(at, columnType.create(null, slice.content));
  } else {
    const start = map(target.start);
    const node = tr.doc.nodeAt(start);
    if (!node) {
      return;
    }
    const dragged = columnType.create(null, slice.content);
    const current = columnType.create(null, node);
    tr.replaceWith(start, start + node.nodeSize, layoutType.create(null, side === 'left'
      ? [dragged, current]
      : [current, dragged]));
  }
  if (!draggedFirst) {
    tr.delete(tr.mapping.map(from), tr.mapping.map(end));
  }
  view.dispatch(tr);
}
