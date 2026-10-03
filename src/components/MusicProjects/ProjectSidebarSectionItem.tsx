'use client';

import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import type { ProjectSidebarSection } from '@/utils/projectSidebarSections';
import {
  ArrowDownward as MoveDownIcon,
  ArrowUpward as MoveUpIcon,
  DeleteOutline as DeleteIcon,
  DriveFileRenameOutline as EditIcon,
  MoreHoriz,
  VisibilityOffOutlined as HideIcon,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ExternalLinkEmbed } from '@/components/MusicProjects/ExternalLinkEmbed';
import { ProjectDetailCalendarSection } from '@/components/MusicProjects/ProjectDetailCalendarSection';
import { ProjectDetailMembersSection } from '@/components/MusicProjects/ProjectDetailMembersSection';
import { RichTextContent } from '@/components/RichTextEditor/RichTextContent';
import { getGlassMenuSlotProps, glassMenuItemSx } from '@/utils/glassPaperStyles';
import { toExternalLinkFromSection } from '@/utils/projectSidebarSections';

type ProjectSidebarSectionItemProps = {
  section: ProjectSidebarSection;
  locale: string;
  projectId: number;
  accent: string;
  members: MusicProjectMember[];
  viewerPermission: 'owner' | MemberPermission;
  readOnly?: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: (section: ProjectSidebarSection, anchorEl: HTMLElement) => void;
  /** Soft-hide for members/calendar (no confirm). */
  onHide: (sectionId: string) => void;
  /** Hard-delete for video/link/text (confirm in parent). */
  onRemove: (sectionId: string, anchorEl: HTMLElement) => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
};

function sectionTitle(kind: ProjectSidebarSection['kind'], t: (key: 'members' | 'calendar' | 'sidebar_section_video' | 'sidebar_section_link' | 'sidebar_section_text') => string): string {
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
}

export function ProjectSidebarSectionItem({
  section,
  locale,
  projectId,
  accent,
  members,
  viewerPermission,
  readOnly = false,
  canMoveUp,
  canMoveDown,
  onEdit,
  onHide,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ProjectSidebarSectionItemProps) {
  const t = useTranslations('MusicProjects');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const showActions = !readOnly && (hovered || Boolean(menuAnchor));
  const isHideOnly = section.kind === 'members' || section.kind === 'calendar';
  const canEditContent = section.kind === 'video' || section.kind === 'link' || section.kind === 'text';
  const displayTitle = (section.kind === 'video' || section.kind === 'link' || section.kind === 'text')
    && section.title
    ? section.title
    : sectionTitle(section.kind, t);

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        if (!menuAnchor) {
          setHovered(false);
        }
      }}
      sx={{ position: 'relative' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          mb: 1,
          minHeight: 28,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1, minWidth: 0, fontSize: '1.05rem' }}>
          {displayTitle}
        </Typography>
        {!readOnly && (
          <IconButton
            size="small"
            aria-label={t('context_menu_actions')}
            onClick={e => setMenuAnchor(e.currentTarget)}
            sx={{
              'width': 24,
              'height': 24,
              'borderRadius': 1,
              'opacity': showActions ? 1 : 0,
              'transition': 'opacity 0.15s ease',
            }}
          >
            <MoreHoriz sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {section.kind === 'members' && (
        <ProjectDetailMembersSection
          locale={locale}
          projectId={projectId}
          members={members}
          viewerPermission={viewerPermission}
          readOnly={readOnly}
          hideChrome
        />
      )}
      {section.kind === 'calendar' && (
        <ProjectDetailCalendarSection
          locale={locale}
          projectId={projectId}
          readOnly={readOnly}
          hideChrome
        />
      )}
      {(section.kind === 'video' || section.kind === 'link') && (
        <ExternalLinkEmbed
          link={toExternalLinkFromSection(section)}
          accent={accent}
        />
      )}
      {section.kind === 'text' && (
        <RichTextContent
          value={section.body}
          accent={accent}
          emptyLabel={t('sidebar_section_text_empty')}
          viewMoreLabel={t('view_more')}
          viewLessLabel={t('view_less')}
        />
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setHovered(false);
        }}
        slotProps={getGlassMenuSlotProps()}
      >
        {canEditContent && (
          <MenuItem
            sx={glassMenuItemSx}
            onClick={() => {
              if (!menuAnchor) {
                return;
              }
              const anchor = menuAnchor;
              setMenuAnchor(null);
              onEdit(section, anchor);
            }}
          >
            <EditIcon sx={{ fontSize: 16, mr: 0.75 }} />
            {t('edit')}
          </MenuItem>
        )}
        <MenuItem
          disabled={!canMoveUp}
          sx={glassMenuItemSx}
          onClick={() => {
            setMenuAnchor(null);
            onMoveUp(section.id);
          }}
        >
          <MoveUpIcon sx={{ fontSize: 16, mr: 0.75 }} />
          {t('sidebar_section_move_up')}
        </MenuItem>
        <MenuItem
          disabled={!canMoveDown}
          sx={glassMenuItemSx}
          onClick={() => {
            setMenuAnchor(null);
            onMoveDown(section.id);
          }}
        >
          <MoveDownIcon sx={{ fontSize: 16, mr: 0.75 }} />
          {t('sidebar_section_move_down')}
        </MenuItem>
        {isHideOnly
          ? (
              <MenuItem
                sx={glassMenuItemSx}
                onClick={() => {
                  setMenuAnchor(null);
                  onHide(section.id);
                }}
              >
                <HideIcon sx={{ fontSize: 16, mr: 0.75 }} />
                {t('sidebar_section_hide')}
              </MenuItem>
            )
          : (
              <MenuItem
                sx={{ ...glassMenuItemSx, color: 'error.main' }}
                onClick={() => {
                  if (!menuAnchor) {
                    return;
                  }
                  const anchor = menuAnchor;
                  setMenuAnchor(null);
                  onRemove(section.id, anchor);
                }}
              >
                <DeleteIcon sx={{ fontSize: 16, mr: 0.75 }} />
                {t('delete')}
              </MenuItem>
            )}
      </Menu>
    </Box>
  );
}
