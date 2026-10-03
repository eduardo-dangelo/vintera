'use client';

import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import { Box } from '@mui/material';
import { ProjectDetailCalendarSection } from './ProjectDetailCalendarSection';
import { ProjectDetailExternalLinksSection } from './ProjectDetailExternalLinksSection';
import { ProjectDetailGeneralInfoSection } from './ProjectDetailGeneralInfoSection';
import { ProjectDetailMembersSection } from './ProjectDetailMembersSection';

type ProjectDetailSidebarProps = {
  locale: string;
  projectId: number;
  genre: string | null;
  description: string | null;
  accent: string;
  members: MusicProjectMember[];
  metadata: unknown;
  viewerPermission: 'owner' | MemberPermission;
  readOnly?: boolean;
};

export function ProjectDetailSidebar({
  locale,
  projectId,
  genre,
  description,
  accent,
  members,
  metadata,
  viewerPermission,
  readOnly = false,
}: ProjectDetailSidebarProps) {
  return (
    <Box
      sx={{
        position: { md: 'sticky' },
        top: 24,
        p: 3,
        borderRadius: 4,
        background: `linear-gradient(160deg, ${accent}33 0%, transparent 60%)`,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <ProjectDetailGeneralInfoSection
        locale={locale}
        projectId={projectId}
        genre={genre}
        description={description}
        accent={accent}
        readOnly={readOnly}
      />

      <ProjectDetailMembersSection
        locale={locale}
        projectId={projectId}
        members={members}
        viewerPermission={viewerPermission}
        readOnly={readOnly}
      />

      <ProjectDetailCalendarSection locale={locale} projectId={projectId} readOnly={readOnly} />

      <ProjectDetailExternalLinksSection
        locale={locale}
        projectId={projectId}
        metadata={metadata}
        accent={accent}
        readOnly={readOnly}
      />
    </Box>
  );
}
