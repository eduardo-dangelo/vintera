'use client';

import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { useDeleteMusicProject } from '@/queries/hooks/music-projects/useDeleteMusicProject';
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
  canDelete?: boolean;
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
  canDelete = false,
}: ProjectDetailSidebarProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const deleteProject = useDeleteMusicProject(locale);

  const [deleteConfirmAnchor, setDeleteConfirmAnchor] = useState<HTMLElement | null>(null);

  const handleDeleteProject = async () => {
    await deleteProject.mutateAsync(projectId);
    setDeleteConfirmAnchor(null);
    router.push(`/${locale}/projects`);
  };

  return (
    <>
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
          canDelete={canDelete}
          onDeleteRequest={anchorEl => setDeleteConfirmAnchor(anchorEl)}
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

      <ConfirmPopover
        open={Boolean(deleteConfirmAnchor)}
        anchorEl={deleteConfirmAnchor}
        onClose={() => setDeleteConfirmAnchor(null)}
        onConfirm={() => void handleDeleteProject()}
        message={t('delete_confirm')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        confirmColor="error"
        loading={deleteProject.isPending}
      />
    </>
  );
}
