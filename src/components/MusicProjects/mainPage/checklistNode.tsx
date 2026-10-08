'use client';

import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { ReactNodeViewProps } from '@tiptap/react';
import { VisibilityOffOutlined as HideIcon, MoreHoriz, VisibilityOutlined as ShowIcon } from '@mui/icons-material';
import { Box, Collapse, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { TaskList } from '@tiptap/extension-list/task-list';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useTranslations } from 'next-intl';
import { useState, useSyncExternalStore } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { useMainPageEditorContext } from '@/components/MusicProjects/mainPage/mainPageContext';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';

const CHECKLIST_COLLAPSE_MS = 250;

function listHidesCompleted(editor: Editor, getPos: ReactNodeViewProps['getPos']) {
  if (typeof getPos !== 'function') {
    return false;
  }
  const pos = getPos();
  if (typeof pos !== 'number') {
    return false;
  }
  const $pos = editor.state.doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const parent = $pos.node(depth);
    if (parent.type.name === 'taskList') {
      return parent.attrs.hideCompleted === true;
    }
  }
  return false;
}

function countTasks(node: ProseMirrorNode) {
  let total = 0;
  let checked = 0;
  node.descendants((child) => {
    if (child.type.name !== 'taskItem') {
      return;
    }
    total += 1;
    if (child.attrs.checked) {
      checked += 1;
    }
  });
  return { total, checked };
}

function setHideCompleted(editor: Editor, getPos: ReactNodeViewProps['getPos'], hideCompleted: boolean) {
  if (typeof getPos !== 'function') {
    return;
  }
  const pos = getPos();
  if (typeof pos !== 'number') {
    return;
  }
  editor.chain().command(({ tr }) => {
    const current = tr.doc.nodeAt(pos);
    if (!current) {
      return false;
    }
    tr.setNodeMarkup(pos, undefined, { ...current.attrs, hideCompleted });
    return true;
  }).run();
}

export function ChecklistItemView({ node, editor, getPos }: ReactNodeViewProps) {
  const checked = node.attrs.checked === true;
  const hideCompleted = useSyncExternalStore(
    (onStoreChange) => {
      editor.on('transaction', onStoreChange);
      return () => {
        editor.off('transaction', onStoreChange);
      };
    },
    () => listHidesCompleted(editor, getPos),
    () => false,
  );
  const collapsed = hideCompleted && checked;

  const toggleChecked = () => {
    if (!editor.isEditable || typeof getPos !== 'function') {
      return;
    }
    const pos = getPos();
    if (typeof pos !== 'number') {
      return;
    }
    editor.chain().command(({ tr }) => {
      const current = tr.doc.nodeAt(pos);
      if (!current) {
        return false;
      }
      tr.setNodeMarkup(pos, undefined, { ...current.attrs, checked: !current.attrs.checked });
      return true;
    }).run();
  };

  return (
    <NodeViewWrapper as="li" data-checked={checked ? 'true' : 'false'}>
      <TransitionGroup component={null}>
        {!collapsed && (
          <Collapse key="item" timeout={CHECKLIST_COLLAPSE_MS}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, pb: 0.25 }}>
              <Box
                component="label"
                contentEditable={false}
                sx={{ flex: '0 0 auto', mt: '0.2rem', userSelect: 'none' }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onMouseDown={event => event.preventDefault()}
                  onChange={toggleChecked}
                />
              </Box>
              <NodeViewContent style={{ flex: 1, minWidth: 0 }} />
            </Box>
          </Collapse>
        )}
      </TransitionGroup>
    </NodeViewWrapper>
  );
}

function ChecklistView({ node, editor, getPos }: ReactNodeViewProps) {
  const t = useTranslations('MusicProjects');
  const { accent, canEdit } = useMainPageEditorContext();
  const { total, checked } = countTasks(node);
  const percent = total === 0 ? 0 : Math.round((checked / total) * 100);
  const hideCompleted = node.attrs.hideCompleted === true;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const showActions = canEdit && (hovered || Boolean(menuAnchor));

  return (
    <NodeViewWrapper
      data-project-checklist=""
      data-hide-completed={hideCompleted ? 'true' : 'false'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!menuAnchor) {
          setHovered(false);
        }
      }}
    >
      <Box contentEditable={false} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: 'max-content',
            maxWidth: '100%',
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', lineHeight: 1.4, whiteSpace: 'nowrap' }}
          >
            {t('main_page_checklist_progress', { percent })}
          </Typography>
          <Box
            aria-hidden
            sx={{
              width: 0,
              minWidth: '100%',
              height: 3,
              mt: 0.5,
              overflow: 'hidden',
              borderRadius: 99,
              bgcolor: alpha(accent, 0.16),
            }}
          >
            <Box
              sx={{
                width: `${percent}%`,
                height: '100%',
                borderRadius: 99,
                bgcolor: alpha(accent, 0.5),
                transition: 'width 400ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />
          </Box>
        </Box>
        {canEdit && (
          <IconButton
            size="small"
            aria-label={t('context_menu_actions')}
            onClick={event => setMenuAnchor(event.currentTarget)}
            sx={{
              width: 24,
              height: 24,
              mt: -0.25,
              borderRadius: 1,
              opacity: showActions ? 1 : 0,
            }}
          >
            <MoreHoriz sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
      <NodeViewContent as={'ul' as 'div'} data-type="taskList" />
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
          disabled={!hideCompleted && checked === 0}
          sx={glassMenuItemSx}
          onClick={() => {
            setMenuAnchor(null);
            setHideCompleted(editor, getPos, !hideCompleted);
          }}
        >
          {hideCompleted
            ? <ShowIcon sx={{ fontSize: 16 }} />
            : <HideIcon sx={{ fontSize: 16 }} />}
          {hideCompleted ? t('main_page_show_completed') : t('main_page_hide_completed')}
        </MenuItem>
      </Menu>
    </NodeViewWrapper>
  );
}

export const ProjectTaskList = TaskList.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      hideCompleted: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-hide-completed') === 'true',
        renderHTML: (attributes: { hideCompleted?: boolean }) => (
          attributes.hideCompleted ? { 'data-hide-completed': 'true' } : {}
        ),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ChecklistView);
  },
});
