'use client';

import type { SelectChangeEvent } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  LinkOff,
  Title as TitleIcon,
} from '@mui/icons-material';
import {
  Box,
  Divider,
  IconButton,
  MenuItem,
  Popover,
  Select,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';
import { richTextContentSx } from '@/components/RichTextEditor/richTextContentSx';
import { toRichTextEditorContent } from '@/utils/sanitizeRichTextHtml';

type BlockType = 'paragraph' | 'heading2' | 'heading3';

const DEFAULT_LINK_LABELS = {
  addLink: 'Add link',
  linkUrl: 'URL',
} as const;

type RichTextEditorProps = {
  value: string | null;
  onChange: (html: string) => void;
  placeholder?: string;
  accent?: string;
  disabled?: boolean;
  linkLabels?: {
    addLink: string;
    linkUrl: string;
  };
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  accent = '#7c3aed',
  disabled = false,
  linkLabels = DEFAULT_LINK_LABELS,
}: RichTextEditorProps) {
  const linkAnchorRef = useRef<HTMLButtonElement>(null);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: toRichTextEditorContent(value),
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    onSelectionUpdate: () => {
      setSelectionTick(t => t + 1);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const nextContent = toRichTextEditorContent(value);
    const currentContent = editor.getHTML();
    if (nextContent !== currentContent) {
      editor.commands.setContent(nextContent, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return null;
  }

  const activeBlockType: BlockType = editor.isActive('heading', { level: 2 })
    ? 'heading2'
    : editor.isActive('heading', { level: 3 })
      ? 'heading3'
      : 'paragraph';

  const handleBlockTypeChange = (event: SelectChangeEvent<BlockType>) => {
    const type = event.target.value as BlockType;
    if (type === 'paragraph') {
      editor.chain().focus().setParagraph().run();
      return;
    }
    if (type === 'heading2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }
    editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  const openLinkPopover = () => {
    const existing = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(existing ?? 'https://');
    setLinkPopoverOpen(true);
  };

  const applyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed || trimmed === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
    }
    setLinkPopoverOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkPopoverOpen(false);
  };

  return (
    <Box
      sx={{
        'border': '1px solid',
        'borderColor': 'divider',
        'borderRadius': 2,
        'bgcolor': 'background.paper',
        'overflow': 'hidden',
        '@media (prefers-reduced-motion: no-preference)': {
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
        '&:focus-within': {
          borderColor: accent,
          boxShadow: `0 0 0 1px ${accent}55`,
        },
        '& .ProseMirror': {
          ...richTextContentSx(accent),
          'outline': 'none',
          'minHeight': 120,
          'p': 1.5,
          '& p.is-editor-empty:first-of-type::before': {
            color: 'text.disabled',
            content: 'attr(data-placeholder)',
            float: 'left',
            height: 0,
            pointerEvents: 'none',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.25,
          px: 0.5,
          py: 0.25,
          bgcolor: 'action.hover',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Select
          size="small"
          value={activeBlockType}
          onChange={handleBlockTypeChange}
          disabled={disabled}
          variant="standard"
          disableUnderline
          sx={{
            'minWidth': 36,
            'mr': 0.5,
            '& .MuiSelect-select': { p: 0.5, pr: '24px !important', display: 'flex', alignItems: 'center' },
            '& .MuiSelect-icon': { fontSize: 18, right: 2 },
          }}
          renderValue={() => (
            <TitleIcon sx={{ fontSize: 18 }} />
          )}
        >
          <MenuItem value="paragraph">Paragraph</MenuItem>
          <MenuItem value="heading2">Heading 2</MenuItem>
          <MenuItem value="heading3">Heading 3</MenuItem>
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        <Tooltip title="Bold">
          <ToggleButton
            size="small"
            value="bold"
            selected={editor.isActive('bold')}
            onChange={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            sx={{ border: 'none', p: 0.75 }}
          >
            <FormatBold sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Italic">
          <ToggleButton
            size="small"
            value="italic"
            selected={editor.isActive('italic')}
            onChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            sx={{ border: 'none', p: 0.75 }}
          >
            <FormatItalic sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        <Tooltip title="Bullet list">
          <ToggleButton
            size="small"
            value="bulletList"
            selected={editor.isActive('bulletList')}
            onChange={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            sx={{ border: 'none', p: 0.75 }}
          >
            <FormatListBulleted sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Numbered list">
          <ToggleButton
            size="small"
            value="orderedList"
            selected={editor.isActive('orderedList')}
            onChange={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            sx={{ border: 'none', p: 0.75 }}
          >
            <FormatListNumbered sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        <Tooltip title={linkLabels.addLink}>
          <IconButton
            ref={linkAnchorRef}
            size="small"
            onClick={openLinkPopover}
            disabled={disabled}
            color={editor.isActive('link') ? 'primary' : 'default'}
            sx={{ p: 0.75 }}
          >
            <LinkIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <EditorContent editor={editor} />

      <Popover
        open={linkPopoverOpen}
        anchorEl={linkAnchorRef.current}
        onClose={() => setLinkPopoverOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { p: 2, width: 280 } } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {linkLabels.addLink}
        </Typography>
        <TextField
          size="small"
          fullWidth
          label={linkLabels.linkUrl}
          value={linkUrl}
          onChange={e => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyLink();
            }
          }}
          sx={{ mb: 1.5 }}
        />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {editor.isActive('link') && (
            <IconButton size="small" onClick={removeLink} aria-label="Remove link">
              <LinkOff fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" color="primary" onClick={applyLink} aria-label="Apply link">
            <LinkIcon fontSize="small" />
          </IconButton>
        </Box>
      </Popover>
    </Box>
  );
}
