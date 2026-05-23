'use client';

import { MusicNote } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CreateProjectDialog } from '@/components/MusicProjects/CreateProjectDialog';
import { ProjectCard } from '@/components/MusicProjects/ProjectCard';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';

type ProjectsClientProps = {
  locale: string;
};

export function ProjectsClient({ locale }: ProjectsClientProps) {
  const t = useTranslations('MusicProjects');
  const { data: projects, isLoading, error } = useMusicProjects(locale);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Failed to load projects
      </Typography>
    );
  }

  const isEmpty = !projects?.length;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            {t('page_title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('page_description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {t('new_project')}
        </Button>
      </Box>

      {isEmpty
        ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 10,
                px: 3,
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <MusicNote sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.6 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('empty_title')}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                {t('empty_description')}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                  textTransform: 'none',
                }}
              >
                {t('create_project')}
              </Button>
            </Box>
          )
        : (
            <Grid container spacing={3}>
              {projects.map(project => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={project.id}>
                  <ProjectCard project={project} locale={locale} />
                </Grid>
              ))}
            </Grid>
          )}

      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        locale={locale}
      />
    </Box>
  );
}
