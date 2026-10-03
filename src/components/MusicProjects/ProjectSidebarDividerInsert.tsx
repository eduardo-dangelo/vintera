'use client';

import type { SidebarSectionKind } from '@/utils/projectSidebarSections';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Link as LinkIcon,
  Notes as TextIcon,
  People as PeopleIcon,
  SmartDisplay as VideoIcon,
} from '@mui/icons-material';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import { canAddSidebarSectionKind } from '@/utils/projectSidebarSections';
import type { ProjectSidebarSection } from '@/utils/projectSidebarSections';

const ADDABLE_KINDS: SidebarSectionKind[] = ['members', 'calendar', 'video', 'link', 'text'];

type ProjectSidebarDividerInsertProps = {
  sections: ProjectSidebarSection[];
  readOnly?: boolean;
  onAddKind: (kind: SidebarSectionKind, anchorEl: HTMLElement) => void;
};

export function ProjectSidebarDividerInsert({
  sections,
  readOnly = false,
  onAddKind,
}: ProjectSidebarDividerInsertProps) {
  const t = useTranslations('MusicProjects');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  if (readOnly) {
    return <Box sx={{ my: 1.5, borderBottom: '1px solid', borderColor: 'divider' }} />;
  }

  const kindIcon = (kind: SidebarSectionKind) => {
    switch (kind) {
      case 'members':
        return <PeopleIcon sx={{ fontSize: 16 }} />;
      case 'calendar':
        return <CalendarIcon sx={{ fontSize: 16 }} />;
      case 'video':
        return <VideoIcon sx={{ fontSize: 16 }} />;
      case 'link':
        return <LinkIcon sx={{ fontSize: 16 }} />;
      case 'text':
        return <TextIcon sx={{ fontSize: 16 }} />;
    }
  };

  const kindLabel = (kind: SidebarSectionKind) => {
    switch (kind) {
      case 'members':
        return t('members');
      case 'calendar':
        return t('calendar');
      case 'video':
        return t('sidebar_section_video');
      case 'link':
        return t('sidebar_section_link');
      case 'text':
        return t('sidebar_section_text');
    }
  };

  return (
    <Box
      sx={{
        'position': 'relative',
        'my': 0.5,
        'py': 0.75,
        'display': 'flex',
        'alignItems': 'center',
        'justifyContent': 'center',
        '&:hover .sidebar-divider-line': {
          borderColor: 'primary.main',
          opacity: 0.5,
        },
        '&:hover .sidebar-divider-add, & .sidebar-divider-add[data-open="true"]': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
    >
      <Box
        className="sidebar-divider-line"
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          borderBottom: '1px solid',
          borderColor: 'divider',
          opacity: 1,
          transition: 'border-color 0.15s ease, opacity 0.15s ease',
        }}
      />
      <IconButton
        className="sidebar-divider-add"
        data-open={menuAnchor ? 'true' : undefined}
        size="small"
        aria-label={t('sidebar_section_add')}
        onClick={e => setMenuAnchor(e.currentTarget)}
        sx={{
          'position': 'relative',
          'zIndex': 1,
          'opacity': 0,
          'pointerEvents': 'none',
          'width': 24,
          'height': 24,
          'borderRadius': 1,
          'bgcolor': 'background.paper',
          'border': '1px solid',
          'borderColor': 'divider',
          'transition': 'opacity 0.15s ease',
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'primary.main',
            color: 'primary.main',
          },
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={getGlassMenuSlotProps()}
      >
        {ADDABLE_KINDS.map((kind) => {
          const disabled = !canAddSidebarSectionKind(sections, kind);
          return (
            <MenuItem
              key={kind}
              disabled={disabled}
              sx={glassMenuItemSx}
              onClick={() => {
                if (!menuAnchor) {
                  return;
                }
                const anchor = menuAnchor;
                setMenuAnchor(null);
                onAddKind(kind, anchor);
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {kindIcon(kind)}
              </ListItemIcon>
              <ListItemText primary={kindLabel(kind)} />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
