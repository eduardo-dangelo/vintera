'use client';

import type { MusicProjectMember } from '@/types/musicPeople';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  readOnly = false,
  canDelete = false,
}: ProjectDetailSidebarProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const deleteProject = useDeleteMusicProject(locale);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteProject = async () => {
    await deleteProject.mutateAsync(projectId);
    setDeleteDialogOpen(false);
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
          onDeleteRequest={() => setDeleteDialogOpen(true)}
        />

        <ProjectDetailMembersSection
          locale={locale}
          projectId={projectId}
          members={members}
          readOnly={readOnly}
        />

        <ProjectDetailExternalLinksSection
          locale={locale}
          projectId={projectId}
          metadata={metadata}
          accent={accent}
          readOnly={readOnly}
        />

        <ProjectDetailCalendarSection locale={locale} projectId={projectId} readOnly={readOnly} />
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('delete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('delete_confirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void handleDeleteProject()}
            disabled={deleteProject.isPending}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
