'use client';

import type { Editor } from '@tiptap/core';
import type { EditorView } from '@tiptap/pm/view';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const HANDLE_SIZE = 22;
const EXTRA_REACH = 14;
const ROW_OVERLAP = 4;

const LIST_ITEM_NAMES = new Set(['listItem', 'taskItem']);
const LIST_NAMES = new Set(['bulletList', 'orderedList', 'taskList']);

type Extent = {
  from: number;
  to: number;
};

type PlacedHandle = Extent & {
  dom: HTMLElement;
  top: number;
  left: number;
  width: number;
  height: number;
  inset: number;
  parentFrom: number | null;
};

type HoverHandles = {
  item: PlacedHandle | null;
  block: PlacedHandle | null;
};

type RowSlot = {
  start: number;
  end: number;
  top: number;
  bottom: number;
};

type PageViewDesc = {
  node?: {
    isBlock: boolean;
    type: { name: string };
  };
  posBefore: number;
  posAfter: number;
  parent?: PageViewDesc;
};

function pageViewDesc(dom: Node | null): PageViewDesc | null {
  let node = dom;
  while (node) {
    if (node instanceof HTMLElement) {
      const desc = (node as HTMLElement & { pmViewDesc?: PageViewDesc }).pmViewDesc;
      if (desc?.node?.isBlock) {
        return desc;
      }
    }
    node = node.parentNode;
  }
  return null;
}

function blockRange(desc: PageViewDesc): Extent | null {
  try {
    return { from: desc.posBefore, to: desc.posAfter };
  } catch {
    return null;
  }
}

function blockExtent(view: EditorView, dom: HTMLElement): Extent | null {
  let desc = pageViewDesc(dom);
  while (desc?.parent?.node && desc.parent.node.type.name !== 'doc') {
    desc = desc.parent;
  }
  const fromDesc = desc ? blockRange(desc) : null;
  if (fromDesc) {
    return fromDesc;
  }
  try {
    const pos = view.posAtDOM(dom, 0);
    if (pos < 0) {
      return null;
    }
    const $pos = view.state.doc.resolve(Math.min(pos, view.state.doc.content.size));
    const node = $pos.nodeAfter;
    if ($pos.depth < 1 && node?.isBlock) {
      return { from: $pos.pos, to: $pos.pos + node.nodeSize };
    }
    if ($pos.depth >= 1) {
      return { from: $pos.before(1), to: $pos.after(1) };
    }
    return null;
  } catch {
    return null;
  }
}

function itemExtent(view: EditorView, dom: HTMLElement): (Extent & { parentFrom: number }) | null {
  let current: Node | null = dom;
  while (current) {
    if (current instanceof HTMLElement) {
      const desc = (current as HTMLElement & { pmViewDesc?: PageViewDesc }).pmViewDesc;
      const name = desc?.node?.type.name;
      const parent = desc?.parent;
      const parentName = parent?.node?.type.name;
      if (desc && name && LIST_ITEM_NAMES.has(name) && parent && parentName && LIST_NAMES.has(parentName)) {
        const range = blockRange(desc);
        const parentRange = blockRange(parent);
        if (range && parentRange) {
          return { ...range, parentFrom: parentRange.from };
        }
      }
    }
    current = current.parentNode;
  }
  try {
    const pos = view.posAtDOM(dom, 0);
    if (pos < 0) {
      return null;
    }
    const $pos = view.state.doc.resolve(Math.min(pos, view.state.doc.content.size));
    for (let depth = $pos.depth; depth > 1; depth -= 1) {
      if (!LIST_ITEM_NAMES.has($pos.node(depth).type.name)) {
        continue;
      }
      const parentName = $pos.node(depth - 1).type.name;
      if (!LIST_NAMES.has(parentName)) {
        return null;
      }
      return {
        from: $pos.before(depth),
        to: $pos.after(depth),
        parentFrom: $pos.before(depth - 1),
      };
    }
    return null;
  } catch {
    return null;
  }
}

function directChild(target: Element, prose: HTMLElement): HTMLElement | null {
  let node: Element | null = target;
  while (node && node.parentElement !== prose) {
    node = node.parentElement;
  }
  return node instanceof HTMLElement ? node : null;
}

function outermostList(target: Element, prose: HTMLElement): HTMLElement | null {
  let found: HTMLElement | null = null;
  let node: Element | null = target;
  while (node && node !== prose) {
    if (
      node instanceof HTMLElement
      && (node.tagName === 'UL' || node.tagName === 'OL')
      && !node.closest('[data-project-checklist]')
    ) {
      found = node;
    }
    node = node.parentElement;
  }
  return found;
}

function checklistAfterHeading(block: HTMLElement | null): HTMLElement | null {
  if (!block || block.tagName !== 'H3') {
    return null;
  }
  const next = block.nextElementSibling;
  if (!(next instanceof HTMLElement)) {
    return null;
  }
  if (next.matches('[data-project-checklist]')) {
    return next;
  }
  const inner = next.querySelector('[data-project-checklist]');
  return inner instanceof HTMLElement ? inner : null;
}

function checklistTitleElement(checklist: HTMLElement): HTMLElement | null {
  const named = checklist.closest('.node-taskList');
  const host = named instanceof HTMLElement ? named : checklist;
  const prev = host.previousElementSibling;
  return prev instanceof HTMLElement && prev.tagName === 'H3' ? prev : null;
}

function hoverTargets(target: Element, prose: HTMLElement): { item: HTMLElement | null; block: HTMLElement | null } {
  const checklist = target.closest('[data-project-checklist]');
  if (checklist instanceof HTMLElement && prose.contains(checklist)) {
    const item = target.closest('li');
    return {
      item: item instanceof HTMLElement && checklist.contains(item) ? item : null,
      block: checklist,
    };
  }
  const list = outermostList(target, prose);
  const item = target.closest('li');
  if (list && item instanceof HTMLElement && list.contains(item)) {
    return { item, block: list };
  }
  if (list && list.parentElement === prose) {
    return { item: null, block: list };
  }
  const block = directChild(target, prose);
  return { item: null, block: checklistAfterHeading(block) ?? block };
}

function placeHandle(
  dom: HTMLElement,
  frame: DOMRect,
  extent: Extent,
  boxLeft: number,
  boxRight: number,
  inset: number,
  parentFrom: number | null,
): PlacedHandle {
  const rect = dom.getBoundingClientRect();
  return {
    ...extent,
    dom,
    top: rect.top - frame.top,
    left: boxLeft,
    width: Math.max(HANDLE_SIZE, boxRight - boxLeft),
    height: rect.height,
    inset,
    parentFrom,
  };
}

function isChecklistTitle(node: { type: { name: string }; attrs: { level?: number } }) {
  return node.type.name === 'heading' && node.attrs.level === 3;
}

function includeChecklistTitle(view: EditorView, extent: Extent): Extent {
  const node = view.state.doc.nodeAt(extent.from);
  if (node?.type.name !== 'taskList') {
    return extent;
  }
  const before = view.state.doc.resolve(extent.from).nodeBefore;
  if (!before || !isChecklistTitle(before)) {
    return extent;
  }
  return { from: extent.from - before.nodeSize, to: extent.to };
}

function stretchOverTitle(handle: PlacedHandle, checklist: HTMLElement, frame: DOMRect): PlacedHandle {
  const title = checklistTitleElement(checklist);
  if (!title) {
    return handle;
  }
  const titleRect = title.getBoundingClientRect();
  const blockRect = checklist.getBoundingClientRect();
  const top = titleRect.top - frame.top;
  return { ...handle, top, height: blockRect.bottom - titleRect.top };
}

function rowSlots(view: EditorView, parentFrom: number | null): RowSlot[] {
  const parent = parentFrom == null ? view.state.doc : view.state.doc.nodeAt(parentFrom);
  if (!parent) {
    return [];
  }
  const base = parentFrom == null ? 0 : parentFrom + 1;
  const entries: { child: typeof parent; start: number }[] = [];
  parent.forEach((child, offset) => {
    entries.push({ child, start: base + offset });
  });
  const slots: RowSlot[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) {
      continue;
    }
    const dom = rowDom(view, entry.start);
    if (!dom) {
      continue;
    }
    const next = entries[index + 1];
    if (
      parentFrom == null
      && isChecklistTitle(entry.child)
      && next?.child.type.name === 'taskList'
    ) {
      const listDom = rowDom(view, next.start);
      if (listDom) {
        const titleRect = dom.getBoundingClientRect();
        const listRect = listDom.getBoundingClientRect();
        slots.push({
          start: entry.start,
          end: next.start + next.child.nodeSize,
          top: titleRect.top,
          bottom: listRect.bottom,
        });
        index += 1;
        continue;
      }
    }
    const rect = dom.getBoundingClientRect();
    slots.push({
      start: entry.start,
      end: entry.start + entry.child.nodeSize,
      top: rect.top,
      bottom: rect.bottom,
    });
  }
  return slots;
}

const MERGE_EDGE = 12;

function taskListPos(view: EditorView, start: number): number | null {
  const node = view.state.doc.nodeAt(start);
  if (node?.type.name === 'taskList') {
    return start;
  }
  if (!node || !isChecklistTitle(node)) {
    return null;
  }
  const list = view.state.doc.nodeAt(start + node.nodeSize);
  if (list?.type.name !== 'taskList') {
    return null;
  }
  return start + node.nodeSize;
}

function rangeIsChecklist(view: EditorView, from: number, end: number): boolean {
  let pos = from;
  while (pos < end) {
    const node = view.state.doc.nodeAt(pos);
    if (!node) {
      return false;
    }
    if (node.type.name === 'taskList') {
      return true;
    }
    pos += node.nodeSize;
  }
  return false;
}

function checklistMergeTarget(
  view: EditorView,
  slots: RowSlot[],
  clientY: number,
  dragStart: number,
  dragEnd: number,
): { listFrom: number; top: number; bottom: number } | null {
  if (!rangeIsChecklist(view, dragStart, dragEnd)) {
    return null;
  }
  for (const slot of slots) {
    const overlaps = slot.start < dragEnd && slot.end > dragStart;
    if (overlaps || clientY <= slot.top + MERGE_EDGE || clientY >= slot.bottom - MERGE_EDGE) {
      continue;
    }
    const listFrom = taskListPos(view, slot.start);
    if (listFrom == null) {
      continue;
    }
    return { listFrom, top: slot.top, bottom: slot.bottom };
  }
  return null;
}

function mergeChecklist(view: EditorView, from: number, end: number, listFrom: number) {
  let items = null as EditorView['state']['doc']['content'] | null;
  let pos = from;
  while (pos < end) {
    const node = view.state.doc.nodeAt(pos);
    if (!node) {
      return;
    }
    if (node.type.name === 'taskList') {
      items = node.content;
      break;
    }
    pos += node.nodeSize;
  }
  const target = view.state.doc.nodeAt(listFrom);
  if (!items || target?.type.name !== 'taskList') {
    return;
  }
  const tr = view.state.tr;
  tr.insert(listFrom + 1 + target.content.size, items);
  tr.delete(tr.mapping.map(from), tr.mapping.map(end));
  view.dispatch(tr);
}

function dropInsertAt(
  slots: RowSlot[],
  clientY: number,
  dragStart: number,
  dragEnd: number,
): { insertAt: number; line: number } | null {
  const last = slots[slots.length - 1];
  if (!last) {
    return null;
  }
  let insertAt = last.end;
  let line = last.bottom;
  for (const slot of slots) {
    const mid = (slot.top + slot.bottom) / 2;
    if (clientY < mid) {
      insertAt = slot.start;
      line = slot.top;
      break;
    }
  }
  if (insertAt >= dragStart && insertAt <= dragEnd) {
    return null;
  }
  return { insertAt, line };
}

function rowDom(view: EditorView, from: number): HTMLElement | null {
  try {
    const raw = view.nodeDOM(from);
    const dom = raw instanceof HTMLElement ? raw : raw instanceof Node ? raw.parentElement : null;
    return dom instanceof HTMLElement ? dom : null;
  } catch {
    return null;
  }
}

function styleClone(source: HTMLElement, preview: HTMLElement, paper: string) {
  const style = getComputedStyle(source);
  const background = style.backgroundColor;
  const transparent = background === 'transparent' || background === 'rgba(0, 0, 0, 0)';
  preview.contentEditable = 'false';
  preview.style.boxSizing = 'border-box';
  preview.style.margin = '0';
  preview.style.padding = style.padding;
  preview.style.display = style.display;
  preview.style.listStyle = style.listStyle;
  preview.style.backgroundColor = transparent ? paper : background;
  preview.style.font = style.font;
  preview.style.color = style.color;
  preview.style.lineHeight = style.lineHeight;
  preview.style.letterSpacing = style.letterSpacing;
}

function paintPreview(sources: HTMLElement[], frame: HTMLElement, paper: string): HTMLElement | null {
  const first = sources[0];
  if (!first) {
    return null;
  }
  const frameRect = frame.getBoundingClientRect();
  const firstRect = first.getBoundingClientRect();
  if (sources.length === 1) {
    const preview = first.cloneNode(true);
    if (!(preview instanceof HTMLElement)) {
      return null;
    }
    preview.setAttribute('data-page-drag-preview', '');
    preview.style.position = 'absolute';
    preview.style.left = `${firstRect.left - frameRect.left}px`;
    preview.style.top = `${firstRect.top - frameRect.top}px`;
    preview.style.width = `${firstRect.width}px`;
    preview.style.height = `${firstRect.height}px`;
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = '6';
    preview.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
    styleClone(first, preview, paper);
    frame.appendChild(preview);
    first.style.opacity = '0.35';
    return preview;
  }
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-page-drag-preview', '');
  wrapper.style.position = 'absolute';
  wrapper.style.left = `${firstRect.left - frameRect.left}px`;
  wrapper.style.top = `${firstRect.top - frameRect.top}px`;
  wrapper.style.pointerEvents = 'none';
  wrapper.style.zIndex = '6';
  const last = sources[sources.length - 1];
  if (last) {
    wrapper.style.height = `${last.getBoundingClientRect().bottom - firstRect.top}px`;
  }
  for (const source of sources) {
    const preview = source.cloneNode(true);
    if (!(preview instanceof HTMLElement)) {
      continue;
    }
    const rect = source.getBoundingClientRect();
    preview.style.position = 'absolute';
    preview.style.left = '0';
    preview.style.top = `${rect.top - firstRect.top}px`;
    preview.style.width = `${rect.width}px`;
    preview.style.height = `${rect.height}px`;
    styleClone(source, preview, paper);
    wrapper.appendChild(preview);
    source.style.opacity = '0.35';
  }
  wrapper.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
  frame.appendChild(wrapper);
  return wrapper;
}

function clearPreview(sources: HTMLElement[], preview: HTMLElement | null) {
  preview?.remove();
  for (const source of sources) {
    source.style.opacity = '';
  }
}

function previewSources(view: EditorView, handle: PlacedHandle): HTMLElement[] {
  const node = view.state.doc.nodeAt(handle.from);
  if (node && handle.to === handle.from + node.nodeSize) {
    const hovered = handle.dom.isConnected ? handle.dom : rowDom(view, handle.from);
    return hovered ? [hovered] : [];
  }
  const sources: HTMLElement[] = [];
  let pos = handle.from;
  while (pos < handle.to) {
    const child = view.state.doc.nodeAt(pos);
    if (!child) {
      break;
    }
    const dom = rowDom(view, pos);
    if (dom) {
      sources.push(dom);
    }
    pos += child.nodeSize;
  }
  return sources;
}

function moveRange(view: EditorView, from: number, to: number, insertAt: number) {
  const slice = view.state.doc.slice(from, to);
  const tr = view.state.tr.delete(from, to);
  tr.insert(tr.mapping.map(insertAt), slice.content);
  view.dispatch(tr);
}

function sameHandle(current: PlacedHandle | null, next: PlacedHandle | null) {
  if (current == null || next == null) {
    return current === next;
  }
  return current.from === next.from
    && current.parentFrom === next.parentFrom
    && current.dom === next.dom
    && Math.abs(current.top - next.top) < 0.5
    && Math.abs(current.left - next.left) < 0.5
    && Math.abs(current.width - next.width) < 0.5
    && Math.abs(current.height - next.height) < 0.5;
}

type PageRowDragLayerProps = {
  editor: Editor | null;
  enabled: boolean;
  frameRef: RefObject<HTMLDivElement | null>;
  hoverPaused: boolean;
  hoverPausedRef: RefObject<boolean>;
  label: string;
  onHoverResume: () => void;
};

export function PageRowDragLayer({
  editor,
  enabled,
  frameRef,
  hoverPaused,
  hoverPausedRef,
  label,
  onHoverResume,
}: PageRowDragLayerProps) {
  const [handles, setHandles] = useState<HoverHandles>({ item: null, block: null });
  const [dropTop, setDropTop] = useState<number | null>(null);
  const [mergeBox, setMergeBox] = useState<{ top: number; height: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const theme = useTheme();
  const paper = theme.palette.background.paper;
  const dragRef = useRef<{
    from: number;
    end: number;
    parentFrom: number | null;
    insertAt: number | null;
    mergeListFrom: number | null;
    sources: HTMLElement[];
    preview: HTMLElement | null;
    originY: number;
  } | null>(null);
  const onHoverResumeRef = useRef(onHoverResume);
  onHoverResumeRef.current = onHoverResume;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !editor || !enabled) {
      return;
    }
    const prose = frame.querySelector('.ProseMirror');
    if (!(prose instanceof HTMLElement)) {
      return;
    }

    const currentView = (): EditorView | null => {
      if (editor.isDestroyed) {
        return null;
      }
      try {
        return editor.view;
      } catch {
        return null;
      }
    };

    const onMove = (event: MouseEvent) => {
      if (hoverPausedRef.current) {
        onHoverResumeRef.current();
      }
      if (dragRef.current) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element) || target.closest('[data-page-drag-handle]')) {
        return;
      }
      if (!prose.contains(target)) {
        setHandles(current => (
          current.item == null && current.block == null ? current : { item: null, block: null }
        ));
        return;
      }
      const view = currentView();
      if (!view) {
        return;
      }
      const found = hoverTargets(target, prose);
      const frameRect = frame.getBoundingClientRect();
      let item: PlacedHandle | null = null;
      let block: PlacedHandle | null = null;
      if (found.block) {
        const extent = blockExtent(view, found.block);
        if (extent) {
          const edge = found.block.getBoundingClientRect().left - frameRect.left;
          const itemLeft = edge - HANDLE_SIZE;
          if (found.item) {
            const itemExtentValue = itemExtent(view, found.item);
            if (itemExtentValue) {
              item = placeHandle(
                found.item,
                frameRect,
                itemExtentValue,
                itemLeft,
                edge + ROW_OVERLAP,
                ROW_OVERLAP,
                itemExtentValue.parentFrom,
              );
            }
          }
          if (!item) {
            const grouped = includeChecklistTitle(view, extent);
            block = stretchOverTitle(
              placeHandle(
                found.block,
                frameRect,
                grouped,
                itemLeft - EXTRA_REACH,
                edge + ROW_OVERLAP,
                ROW_OVERLAP,
                null,
              ),
              found.block,
              frameRect,
            );
          }
        }
      }
      setHandles((current) => {
        if (sameHandle(current.item, item) && sameHandle(current.block, block)) {
          return current;
        }
        return { item, block };
      });
    };

    const onLeave = (event: MouseEvent) => {
      if (dragRef.current) {
        return;
      }
      const next = event.relatedTarget;
      if (next instanceof Node && frame.contains(next)) {
        return;
      }
      setHandles({ item: null, block: null });
    };

    frame.addEventListener('mousemove', onMove);
    frame.addEventListener('mouseleave', onLeave);
    return () => {
      clearPreview(dragRef.current?.sources ?? [], dragRef.current?.preview ?? null);
      dragRef.current = null;
      frame.removeEventListener('mousemove', onMove);
      frame.removeEventListener('mouseleave', onLeave);
    };
  }, [editor, enabled, frameRef, hoverPausedRef]);

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>, handle: PlacedHandle) => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const frame = frameRef.current;
    let sources: HTMLElement[] = [];
    try {
      sources = previewSources(editor.view, handle);
    } catch {
      sources = handle.dom.isConnected ? [handle.dom] : [];
    }
    let preview: HTMLElement | null = null;
    if (sources.length > 0 && frame) {
      preview = paintPreview(sources, frame, paper);
    }
    dragRef.current = {
      from: handle.from,
      end: handle.to,
      parentFrom: handle.parentFrom,
      insertAt: null,
      mergeListFrom: null,
      sources,
      preview,
      originY: event.clientY,
    };
    setDragging(true);
    setDropTop(null);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const frame = frameRef.current;
    if (!drag || !editor || editor.isDestroyed || !frame) {
      return;
    }
    if (drag.preview) {
      drag.preview.style.transform = `translateY(${event.clientY - drag.originY}px)`;
    }
    const slots = rowSlots(editor.view, drag.parentFrom);
    const frameTop = frame.getBoundingClientRect().top;
    const merge = drag.parentFrom == null
      ? checklistMergeTarget(editor.view, slots, event.clientY, drag.from, drag.end)
      : null;
    if (merge) {
      drag.mergeListFrom = merge.listFrom;
      drag.insertAt = null;
      setDropTop(current => (current == null ? current : null));
      const top = merge.top - frameTop;
      const height = merge.bottom - merge.top;
      setMergeBox(current => (
        current != null && Math.abs(current.top - top) < 0.5 && Math.abs(current.height - height) < 0.5
          ? current
          : { top, height }
      ));
      return;
    }
    drag.mergeListFrom = null;
    setMergeBox(current => (current == null ? current : null));
    const drop = dropInsertAt(slots, event.clientY, drag.from, drag.end);
    drag.insertAt = drop?.insertAt ?? null;
    if (!drop) {
      setDropTop(current => (current == null ? current : null));
      return;
    }
    const next = drop.line - frameTop;
    setDropTop(current => (current != null && Math.abs(current - next) < 0.5 ? current : next));
  };

  const finishDrag = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    clearPreview(drag?.sources ?? [], drag?.preview ?? null);
    setDragging(false);
    setDropTop(null);
    setMergeBox(null);
    if (!drag || !editor || editor.isDestroyed) {
      return;
    }
    try {
      if (drag.mergeListFrom != null) {
        mergeChecklist(editor.view, drag.from, drag.end, drag.mergeListFrom);
        return;
      }
      if (drag.insertAt == null) {
        return;
      }
      moveRange(editor.view, drag.from, drag.end, drag.insertAt);
    } catch {
      // The view can unmount while the pointer is down.
    }
  };

  if (!enabled) {
    return null;
  }

  const visible = hoverPaused
    ? []
    : [handles.block, handles.item].filter((handle): handle is PlacedHandle => handle != null);

  return (
    <>
      {mergeBox != null && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: mergeBox.top,
            height: mergeBox.height,
            borderRadius: 1,
            outline: '2px solid',
            outlineColor: 'primary.main',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}
      {dropTop != null && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: dropTop,
            height: 2,
            bgcolor: 'primary.main',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}
      {visible.map(handle => (
        <Box
          key={`${handle.parentFrom ?? 'block'}-${handle.from}`}
          component="button"
          type="button"
          data-page-drag-handle=""
          aria-label={label}
          onPointerDown={event => onPointerDown(event, handle)}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          sx={{
            'position': 'absolute',
            'top': handle.top,
            'left': handle.left,
            'zIndex': 4,
            'display': 'flex',
            'alignItems': 'flex-start',
            'opacity': dragging ? 0 : 1,
            'justifyContent': 'flex-end',
            'width': handle.width,
            'height': handle.height,
            'p': 0,
            'pr': `${handle.inset}px`,
            'border': 0,
            'bgcolor': 'transparent',
            'color': 'text.disabled',
            'cursor': dragging ? 'grabbing' : 'grab',
            '&:hover': { color: 'text.secondary' },
          }}
        >
          <DragIndicator sx={{ fontSize: 18, flexShrink: 0 }} />
        </Box>
      ))}
    </>
  );
}
