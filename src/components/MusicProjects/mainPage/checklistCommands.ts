import type { Editor } from '@tiptap/core';
import type { NodeType, Node as ProseMirrorNode } from '@tiptap/pm/model';
import { InputRule } from '@tiptap/core';
import { inputRegex, TaskItem } from '@tiptap/extension-list/task-item';
import { canJoin, findWrapping } from '@tiptap/pm/transform';

function isLevel3Heading(node: ProseMirrorNode | null | undefined) {
  return node?.type.name === 'heading' && node.attrs.level === 3;
}

function checklistInputRule(taskItemType: NodeType, title: string) {
  return new InputRule({
    find: inputRegex,
    handler: ({ state, range, match }) => {
      const checked = match[match.length - 1] === 'x';
      const tr = state.tr.delete(range.from, range.to);
      const $start = tr.doc.resolve(range.from);
      const blockRange = $start.blockRange();
      const wrapping = blockRange && findWrapping(blockRange, taskItemType, { checked });
      if (!wrapping || !blockRange) {
        return null;
      }
      const listStart = blockRange.start;
      tr.wrap(blockRange, wrapping);
      const before = tr.doc.resolve(range.from - 1).nodeBefore;
      if (before && before.type === taskItemType && canJoin(tr.doc, range.from - 1)) {
        tr.join(range.from - 1);
        return undefined;
      }
      const headingPos = tr.mapping.map(listStart, -1);
      if (isLevel3Heading(tr.doc.resolve(headingPos).nodeBefore)) {
        return undefined;
      }
      const heading = state.schema.nodes.heading?.create(
        { level: 3 },
        state.schema.text(title),
      );
      if (!heading) {
        return undefined;
      }
      tr.insert(headingPos, heading);
      return undefined;
    },
  });
}

export function createProjectTaskItem(title: string) {
  return TaskItem.extend({
    addInputRules() {
      return [checklistInputRule(this.type, title)];
    },
  }).configure({ nested: true });
}

export function toggleChecklist(editor: Editor, title: string) {
  if (editor.isActive('taskList')) {
    editor.chain().focus().toggleTaskList().run();
    return;
  }
  editor.chain().focus().command(({ state, tr }) => {
    const { $from } = state.selection;
    if ($from.depth < 1) {
      return false;
    }
    let depth = $from.depth;
    while (depth > 1) {
      depth -= 1;
    }
    const pos = $from.before(depth);
    if (isLevel3Heading(state.doc.resolve(pos).nodeBefore)) {
      return true;
    }
    const heading = state.schema.nodes.heading?.create(
      { level: 3 },
      state.schema.text(title),
    );
    if (!heading) {
      return true;
    }
    tr.insert(pos, heading);
    return true;
  }).toggleTaskList().run();
}
