'use client';

import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { Box, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { moveBlockBeside } from '@/components/MusicProjects/mainPage/columnLayout';
import { COLUMN_LAYOUT_NODE, COLUMN_NODE, TOGGLE_HEADING_NODE } from '@/utils/projectMainPage';

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
  while (
    desc?.parent?.node
    && desc.parent.node.type.name !== 'doc'
    && desc.parent.node.type.name !== COLUMN_NODE
    && desc.parent.node.type.name !== TOGGLE_HEADING_NODE
  ) {
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

function columnBlockExtent(dom: HTMLElement): (Extent & { parentFrom: null }) | null {
  let desc = pageViewDesc(dom);
  while (
    desc?.parent?.node
    && desc.parent.node.type.name !== COLUMN_NODE
    && desc.parent.node.type.name !== TOGGLE_HEADING_NODE
  ) {
    if (desc.parent.node.type.name === 'doc') {
      return null;
    }
    desc = desc.parent;
  }
  const parentName = desc?.parent?.node?.type.name;
  if (!desc || (parentName !== COLUMN_NODE && parentName !== TOGGLE_HEADING_NODE)) {
    return null;
  }
  const range = blockRange(desc);
  if (!range) {
    return null;
  }
  return { ...range, parentFrom: null };
}

function parentChild(target: Element, parent: HTMLElement): HTMLElement | null {
  let node: Element | null = target;
  while (node && node.parentElement !== parent) {
    node = node.parentElement;
  }
  return node instanceof HTMLElement ? node : null;
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

function toggleBlocksRoot(toggle: HTMLElement): HTMLElement | null {
  const content = toggle.querySelector('[data-node-view-content]');
  if (!(content instanceof HTMLElement) || content.closest('[data-toggle-heading]') !== toggle) {
    return null;
  }
  const reactContent = content.firstElementChild;
  if (
    reactContent instanceof HTMLElement
    && reactContent.hasAttribute('data-node-view-content-react')
  ) {
    return reactContent;
  }
  return content;
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
  const toggle = target.closest('[data-toggle-heading]');
  if (toggle instanceof HTMLElement && prose.contains(toggle)) {
    const toggleContent = toggleBlocksRoot(toggle);
    const inner = toggleContent ? parentChild(target, toggleContent) : null;
    if (inner?.matches('[data-column-layout]')) {
      const column = target.closest('[data-column]');
      if (column instanceof HTMLElement && inner.contains(column)) {
        const columnBlock = parentChild(target, column);
        if (columnBlock) {
          const grouped = checklistAfterHeading(columnBlock);
          if (grouped) {
            return { item: null, block: grouped };
          }
          return { item: columnBlock, block: inner };
        }
      }
      return { item: null, block: inner };
    }
    const heading = toggleContent?.firstElementChild;
    if (inner && heading && inner !== heading) {
      const grouped = checklistAfterHeading(inner);
      if (grouped) {
        return { item: null, block: grouped };
      }
      return { item: inner, block: toggle };
    }
    return { item: null, block: toggle };
  }
  const layout = target.closest('[data-column-layout]');
  if (layout instanceof HTMLElement && prose.contains(layout)) {
    const column = target.closest('[data-column]');
    if (column instanceof HTMLElement && layout.contains(column)) {
      const inner = parentChild(target, column);
      if (inner) {
        const grouped = checklistAfterHeading(inner);
        if (grouped) {
          return { item: null, block: grouped };
        }
        return { item: inner, block: layout };
      }
    }
    return { item: null, block: layout };
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
  slots: Array<RowSlot & { left?: number; right?: number }>,
  clientX: number,
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
    if (slot.left != null && slot.right != null && (clientX < slot.left || clientX > slot.right)) {
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

type ColumnSlot = RowSlot & {
  left: number;
  right: number;
  depth: number;
  columnFrom: number | null;
  kind: 'layout' | 'block' | 'toggle';
  toggleFrom: number | null;
  toggleEnd: number | null;
  bodyFrom: number | null;
  collapsed: boolean;
};

type DropLine = { top: number; left: number; width: number };
type SplitBox = { top: number; left: number; width: number; height: number };

function measureSlot(view: EditorView, start: number, end: number) {
  const first = rowDom(view, start);
  if (!first) {
    return null;
  }
  const rect = first.getBoundingClientRect();
  let top = rect.top;
  let bottom = rect.bottom;
  let left = rect.left;
  let right = rect.right;
  const node = view.state.doc.nodeAt(start);
  if (node && start + node.nodeSize < end) {
    const rest = rowDom(view, start + node.nodeSize);
    if (rest) {
      const next = rest.getBoundingClientRect();
      top = Math.min(top, next.top);
      bottom = Math.max(bottom, next.bottom);
      left = Math.min(left, next.left);
      right = Math.max(right, next.right);
    }
  }
  return { top, bottom, left, right };
}

function pushMeasured(
  view: EditorView,
  slots: ColumnSlot[],
  start: number,
  end: number,
  depth: number,
  columnFrom: number | null,
  kind: ColumnSlot['kind'],
  toggle?: Pick<ColumnSlot, 'toggleFrom' | 'toggleEnd' | 'bodyFrom' | 'collapsed'>,
) {
  const box = measureSlot(view, start, end);
  if (!box) {
    return;
  }
  slots.push({
    start,
    end,
    depth,
    columnFrom,
    kind,
    toggleFrom: toggle?.toggleFrom ?? null,
    toggleEnd: toggle?.toggleEnd ?? null,
    bodyFrom: toggle?.bodyFrom ?? null,
    collapsed: toggle?.collapsed ?? false,
    ...box,
  });
}

function appendColumnSlots(
  view: EditorView,
  parent: ProseMirrorNode,
  base: number,
  depth: number,
  columnFrom: number | null,
  slots: ColumnSlot[],
  skipFirst = false,
) {
  const entries: { child: ProseMirrorNode; start: number }[] = [];
  parent.forEach((child, offset) => {
    entries.push({ child, start: base + offset });
  });
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry || (skipFirst && index === 0)) {
      continue;
    }
    if (entry.child.type.name === COLUMN_LAYOUT_NODE) {
      pushMeasured(view, slots, entry.start, entry.start + entry.child.nodeSize, depth, null, 'layout');
      entry.child.forEach((column, columnOffset) => {
        const columnPos = entry.start + 1 + columnOffset;
        appendColumnSlots(view, column, columnPos + 1, depth + 1, columnPos, slots);
      });
      continue;
    }
    if (entry.child.type.name === TOGGLE_HEADING_NODE) {
      const heading = entry.child.firstChild;
      const headingStart = entry.start + 1;
      if (heading) {
        pushMeasured(
          view,
          slots,
          headingStart,
          headingStart + heading.nodeSize,
          depth,
          columnFrom,
          'toggle',
          {
            toggleFrom: entry.start,
            toggleEnd: entry.start + entry.child.nodeSize,
            bodyFrom: headingStart + heading.nodeSize,
            collapsed: entry.child.attrs.collapsed === true,
          },
        );
      }
      if (entry.child.attrs.collapsed !== true) {
        appendColumnSlots(view, entry.child, entry.start + 1, depth + 1, columnFrom, slots, true);
      }
      continue;
    }
    const next = entries[index + 1];
    if (isChecklistTitle(entry.child) && next?.child.type.name === 'taskList') {
      pushMeasured(view, slots, entry.start, next.start + next.child.nodeSize, depth, columnFrom, 'block');
      index += 1;
      continue;
    }
    pushMeasured(view, slots, entry.start, entry.start + entry.child.nodeSize, depth, columnFrom, 'block');
  }
}

function columnSlots(view: EditorView): ColumnSlot[] {
  const slots: ColumnSlot[] = [];
  appendColumnSlots(view, view.state.doc, 0, 0, null, slots);
  return slots;
}

function isColumnLayoutDrag(view: EditorView, from: number, end: number) {
  const node = view.state.doc.nodeAt(from);
  return node?.type.name === COLUMN_LAYOUT_NODE && from + node.nodeSize === end;
}

const SPLIT_BAND = 0.28;

function slotAction(slot: ColumnSlot, clientX: number, clientY: number): 'before' | 'after' | 'left' | 'right' {
  const height = Math.max(slot.bottom - slot.top, 1);
  const edge = Math.max(8, height * SPLIT_BAND);
  if (clientY <= slot.top + edge) {
    return 'before';
  }
  if (clientY >= slot.bottom - edge) {
    return 'after';
  }
  return clientX < (slot.left + slot.right) / 2 ? 'left' : 'right';
}

function pickColumnSlot(
  slots: ColumnSlot[],
  clientX: number,
  clientY: number,
  dragStart: number,
  dragEnd: number,
) {
  const hits = slots.filter(slot => (
    clientX >= slot.left
    && clientX <= slot.right
    && clientY >= slot.top
    && clientY <= slot.bottom
    && !(slot.start < dragEnd && slot.end > dragStart)
  ));
  hits.sort((a, b) => b.depth - a.depth);
  return hits[0] ?? null;
}

function sameDropLine(current: DropLine | null, next: DropLine | null) {
  if (current == null || next == null) {
    return current === next;
  }
  return Math.abs(current.top - next.top) < 0.5
    && Math.abs(current.left - next.left) < 0.5
    && Math.abs(current.width - next.width) < 0.5;
}

function sameSplitBox(current: SplitBox | null, next: SplitBox | null) {
  if (current == null || next == null) {
    return current === next;
  }
  return Math.abs(current.top - next.top) < 0.5
    && Math.abs(current.left - next.left) < 0.5
    && Math.abs(current.width - next.width) < 0.5
    && Math.abs(current.height - next.height) < 0.5;
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
    const matches = pageViewDesc(handle.dom)?.node === node;
    const hovered = matches && handle.dom.isConnected ? handle.dom : rowDom(view, handle.from);
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

function appendInsideToggle(view: EditorView, from: number, end: number, toggleFrom: number) {
  const toggle = view.state.doc.nodeAt(toggleFrom);
  if (!toggle || toggle.type.name !== TOGGLE_HEADING_NODE) {
    return;
  }
  if (from <= toggleFrom && end >= toggleFrom + toggle.nodeSize) {
    return;
  }
  const slice = view.state.doc.slice(from, end);
  const at = toggleFrom + toggle.nodeSize - 1;
  const tr = view.state.tr;
  if (end <= at) {
    tr.delete(from, end);
    tr.insert(tr.mapping.map(at), slice.content);
  } else {
    tr.insert(at, slice.content);
    tr.delete(tr.mapping.map(from), tr.mapping.map(end));
  }
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
  const [dropLine, setDropLine] = useState<DropLine | null>(null);
  const [splitBox, setSplitBox] = useState<SplitBox | null>(null);
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
    nestFrom: number | null;
    split: { side: 'left' | 'right'; kind: 'layout' | 'block'; start: number; columnFrom: number | null } | null;
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
            const listExtent = itemExtent(view, found.item);
            const columnExtent = listExtent ? null : columnBlockExtent(found.item);
            const itemExtentValue = listExtent ?? columnExtent;
            if (itemExtentValue) {
              const anchorEdge = (columnExtent ? found.item : found.block).getBoundingClientRect().left - frameRect.left;
              item = placeHandle(
                found.item,
                frameRect,
                itemExtentValue,
                anchorEdge - HANDLE_SIZE,
                anchorEdge + ROW_OVERLAP,
                ROW_OVERLAP,
                itemExtentValue.parentFrom,
              );
            }
          }
          if (!item) {
            const heading = found.block.matches('[data-toggle-heading]')
              ? toggleBlocksRoot(found.block)?.firstElementChild
              : null;
            const handleDom = heading instanceof HTMLElement ? heading : found.block;
            const grouped = includeChecklistTitle(view, extent);
            block = stretchOverTitle(
              placeHandle(
                handleDom,
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
      nestFrom: null,
      split: null,
      sources,
      preview,
      originY: event.clientY,
    };
    setDragging(true);
    setDropLine(null);
    setSplitBox(null);
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
    const frameRect = frame.getBoundingClientRect();
    const clearSplit = () => {
      drag.split = null;
      drag.nestFrom = null;
      setSplitBox(current => (current == null ? current : null));
    };
    const showLine = (line: DropLine | null) => {
      setDropLine(current => (sameDropLine(current, line) ? current : line));
    };
    if (drag.parentFrom != null) {
      clearSplit();
      drag.mergeListFrom = null;
      setMergeBox(current => (current == null ? current : null));
      const drop = dropInsertAt(rowSlots(editor.view, drag.parentFrom), event.clientY, drag.from, drag.end);
      drag.insertAt = drop?.insertAt ?? null;
      showLine(drop
        ? { top: drop.line - frameRect.top, left: 0, width: frameRect.width }
        : null);
      return;
    }
    const draggingLayout = isColumnLayoutDrag(editor.view, drag.from, drag.end);
    const slots = columnSlots(editor.view);
    if (!draggingLayout) {
      const merge = checklistMergeTarget(
        editor.view,
        slots,
        event.clientX,
        event.clientY,
        drag.from,
        drag.end,
      );
      if (merge) {
        clearSplit();
        drag.mergeListFrom = merge.listFrom;
        drag.insertAt = null;
        showLine(null);
        const top = merge.top - frameRect.top;
        const height = merge.bottom - merge.top;
        setMergeBox(current => (
          current != null && Math.abs(current.top - top) < 0.5 && Math.abs(current.height - height) < 0.5
            ? current
            : { top, height }
        ));
        return;
      }
      const hit = pickColumnSlot(slots, event.clientX, event.clientY, drag.from, drag.end);
      if (hit?.kind === 'toggle' && hit.toggleFrom != null && hit.toggleEnd != null && hit.bodyFrom != null) {
        const action = slotAction(hit, event.clientX, event.clientY);
        clearSplit();
        drag.mergeListFrom = null;
        setMergeBox(current => (current == null ? current : null));
        if (hit.collapsed && (action === 'left' || action === 'right')) {
          drag.nestFrom = hit.toggleFrom;
          drag.insertAt = null;
          showLine(null);
          const next = {
            top: hit.top - frameRect.top,
            left: hit.left - frameRect.left,
            width: Math.max(hit.right - hit.left, 0),
            height: Math.max(hit.bottom - hit.top, 0),
          };
          setSplitBox(current => (sameSplitBox(current, next) ? current : next));
          return;
        }
        const before = action === 'before';
        const insertAt = before ? hit.toggleFrom : hit.collapsed ? hit.toggleEnd : hit.bodyFrom;
        if (insertAt >= drag.from && insertAt <= drag.end) {
          drag.insertAt = null;
          showLine(null);
          return;
        }
        drag.insertAt = insertAt;
        showLine({
          top: (before ? hit.top : hit.bottom) - frameRect.top,
          left: hit.left - frameRect.left,
          width: Math.max(hit.right - hit.left, 0),
        });
        return;
      }
      if (hit && hit.kind !== 'toggle') {
        const action = slotAction(hit, event.clientX, event.clientY);
        if (action === 'left' || action === 'right') {
          drag.nestFrom = null;
          drag.split = {
            side: action,
            kind: hit.kind,
            start: hit.start,
            columnFrom: hit.columnFrom,
          };
          drag.insertAt = null;
          drag.mergeListFrom = null;
          showLine(null);
          setMergeBox(current => (current == null ? current : null));
          const half = (hit.right - hit.left) / 2;
          const next = {
            top: hit.top - frameRect.top,
            left: (action === 'left' ? hit.left : hit.left + half) - frameRect.left,
            width: half,
            height: hit.bottom - hit.top,
          };
          setSplitBox(current => (sameSplitBox(current, next) ? current : next));
          return;
        }
        clearSplit();
        drag.mergeListFrom = null;
        drag.insertAt = action === 'before' ? hit.start : hit.end;
        setMergeBox(current => (current == null ? current : null));
        showLine({
          top: (action === 'before' ? hit.top : hit.bottom) - frameRect.top,
          left: hit.left - frameRect.left,
          width: hit.right - hit.left,
        });
        return;
      }
    }
    clearSplit();
    drag.mergeListFrom = null;
    setMergeBox(current => (current == null ? current : null));
    const drop = dropInsertAt(
      slots.filter(slot => slot.depth === 0 && slot.kind !== 'toggle'),
      event.clientY,
      drag.from,
      drag.end,
    );
    drag.insertAt = drop?.insertAt ?? null;
    showLine(drop
      ? { top: drop.line - frameRect.top, left: 0, width: frameRect.width }
      : null);
  };

  const finishDrag = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    clearPreview(drag?.sources ?? [], drag?.preview ?? null);
    setDragging(false);
    setDropLine(null);
    setSplitBox(null);
    setMergeBox(null);
    if (!drag || !editor || editor.isDestroyed) {
      return;
    }
    try {
      if (drag.mergeListFrom != null) {
        mergeChecklist(editor.view, drag.from, drag.end, drag.mergeListFrom);
        return;
      }
      if (drag.nestFrom != null) {
        appendInsideToggle(editor.view, drag.from, drag.end, drag.nestFrom);
        return;
      }
      if (drag.split) {
        moveBlockBeside(editor.view, drag.from, drag.end, drag.split, drag.split.side);
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
      {splitBox != null && (
        <Box
          sx={{
            position: 'absolute',
            top: splitBox.top,
            left: splitBox.left,
            width: splitBox.width,
            height: splitBox.height,
            borderRadius: 1,
            outline: '2px solid',
            outlineColor: 'primary.main',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      )}
      {dropLine != null && (
        <Box
          sx={{
            position: 'absolute',
            left: dropLine.left,
            width: dropLine.width,
            top: dropLine.top,
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
