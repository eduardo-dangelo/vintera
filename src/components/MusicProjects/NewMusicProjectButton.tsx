'use client';

import type { SxProps, Theme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateProjectDialog } from './CreateProjectDialog';

type NewMusicProjectButtonProps = {
  locale: string;
  iconButtonSx?: SxProps<Theme>;
  onProjectCreated?: (projectId: number) => void;
};

export function NewMusicProjectButton({
  locale,
  iconButtonSx,
  onProjectCreated,
}: NewMusicProjectButtonProps) {
  const theme = useTheme();
  const t = useTranslations('MusicProjects');
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const defaultSx: SxProps<Theme> = {
    height: 30,
    width: 30,
    border: 'none',
    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderRadius: '6px',
    ...iconButtonSx,
  };

  return (
    <>
      <Tooltip title={t('new_project')}>
        <IconButton size="small" onClick={() => setDialogOpen(true)} sx={defaultSx}>
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <CreateProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        locale={locale}
        onCreated={(id) => {
          onProjectCreated?.(id);
          router.push(`/${locale}/projects/${id}`);
          router.refresh();
        }}
      />
    </>
  );
}
