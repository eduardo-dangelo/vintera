'use client';

import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Avatar, Box, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AddProjectMemberPopover } from '@/components/MusicProjects/AddProjectMemberPopover';
import { ProjectMemberDetailPopover } from '@/components/MusicProjects/ProjectMemberDetailPopover';

type ProjectDetailMembersSectionProps = {
  locale: string;
  projectId: number;
  members: MusicProjectMember[];
  viewerPermission: 'owner' | MemberPermission;
  readOnly?: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function ProjectDetailMembersSection({
  locale,
  projectId,
  members,
  viewerPermission,
  readOnly = false,
}: ProjectDetailMembersSectionProps) {
  const t = useTranslations('MusicProjects');
  const [detailAnchorEl, setDetailAnchorEl] = useState<HTMLElement | null>(null);
  const [addAnchorEl, setAddAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const activeMember = selectedMemberId != null
    ? members.find(member => member.id === selectedMemberId) ?? null
    : null;

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>, member: MusicProjectMember) => {
    setAddAnchorEl(null);
    setDetailAnchorEl(event.currentTarget);
    setSelectedMemberId(member.id);
  };

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setDetailAnchorEl(null);
    setSelectedMemberId(null);
    setAddAnchorEl(event.currentTarget);
  };

  const handleDetailClose = () => {
    setDetailAnchorEl(null);
    setSelectedMemberId(null);
  };

  const handleAddClose = () => {
    setAddAnchorEl(null);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('members')}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {members.map(member => (
          <Tooltip key={member.id} title={member.name} placement="top" arrow>
            <Avatar
              src={member.imageUrl ?? undefined}
              alt={member.name}
              onClick={e => handleAvatarClick(e, member)}
              sx={{
                'width': 36,
                'height': 36,
                'fontSize': 14,
                'cursor': 'pointer',
                'border': '2px solid',
                'borderColor': 'background.paper',
                'transition': 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.08)',
                  boxShadow: 2,
                },
              }}
            >
              {getInitials(member.name)}
            </Avatar>
          </Tooltip>
        ))}

        {!readOnly && (
          <Tooltip title={t('add_member')} placement="top" arrow>
            <IconButton
              onClick={handleAddClick}
              aria-label={t('add_member')}
              sx={{
                'width': 36,
                'height': 36,
                'border': '2px dashed',
                'borderColor': 'divider',
                'borderRadius': '50%',
                'color': 'text.secondary',
                'transition': 'transform 0.15s ease, border-color 0.15s ease',
                '&:hover': {
                  transform: 'scale(1.08)',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              <PersonAddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {members.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('members_empty')}
        </Typography>
      )}

      <ProjectMemberDetailPopover
        open={detailAnchorEl != null && activeMember != null}
        anchorEl={detailAnchorEl}
        member={activeMember}
        locale={locale}
        projectId={projectId}
        viewerPermission={viewerPermission}
        readOnly={readOnly}
        onClose={handleDetailClose}
      />

      <AddProjectMemberPopover
        open={addAnchorEl != null}
        anchorEl={addAnchorEl}
        locale={locale}
        projectId={projectId}
        onClose={handleAddClose}
        onAdded={handleAddClose}
      />
    </Box>
  );
}
