'use client';

import {
  Delete as DeleteIcon,
  MoreVert,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteMusicProject } from '@/queries/hooks/music-projects/useDeleteMusicProject';
import { ProjectDetailCalendarSection } from './ProjectDetailCalendarSection';

type ProjectDetailSidebarProps = {
  locale: string;
  projectId: number;
  genre: string | null;
  description: string | null;
  accent: string;
};

export function ProjectDetailSidebar({
  locale,
  projectId,
  genre,
  description,
  accent,
}: ProjectDetailSidebarProps) {
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const deleteProject = useDeleteMusicProject(locale);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton size="small" onClick={e => setMenuAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                setDeleteDialogOpen(true);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {t('delete')}
            </MenuItem>
          </Menu>
        </Box>
        {genre && (
          <Chip label={genre} size="small" sx={{ mb: 2, bgcolor: `${accent}33`, color: accent }} />
        )}
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {description}
          </Typography>
        )}

        <ProjectDetailCalendarSection locale={locale} projectId={projectId} />
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
