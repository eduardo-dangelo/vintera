'use client';

import type { PopoverOrigin } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { MusicProjectListItem } from '@/queries/hooks/music-projects/useMusicProjects';
import { FilterList as FilterListIcon } from '@mui/icons-material';
import {
  Autocomplete,
  Badge,
  Box,
  Chip,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import { useMusicProjects } from '@/queries/hooks/music-projects/useMusicProjects';
import { glassPaperSx } from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 280;

const FILTER_ANCHOR_ORIGIN: PopoverOrigin = { vertical: 'bottom', horizontal: 'right' };
const FILTER_TRANSFORM_ORIGIN: PopoverOrigin = { vertical: 'top', horizontal: 'right' };

const projectFilterInputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: (theme: Theme) => alpha(theme.palette.background.paper, 0.92),
    color: 'text.primary',
  },
  '& .MuiOutlinedInput-input::placeholder': {
    color: 'text.secondary',
    opacity: 1,
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
  },
} as const;

const filterBadgeSx = {
  'cursor': 'pointer',
  '& .MuiBadge-badge': {
    bgcolor: 'primary.main',
    color: 'white',
    fontSize: '0.625rem',
    fontWeight: 600,
    width: 14,
    height: 14,
    minWidth: 16,
    cursor: 'pointer',
  },
} as const;

type MusicListProjectFilterProps = {
  locale: string;
  selectedProjectIds: number[];
  onSelectedProjectIdsChange: (ids: number[]) => void;
  iconButtonSx?: object;
};

export function MusicListProjectFilter({
  locale,
  selectedProjectIds,
  onSelectedProjectIdsChange,
  iconButtonSx,
}: MusicListProjectFilterProps) {
  const t = useTranslations('MusicProjects');
  const { data: projects } = useMusicProjects(locale);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const popoverOpen = Boolean(anchorEl);
  const projectOptions = projects ?? [];

  const selectedProjects = useMemo(
    () => projectOptions.filter(project => selectedProjectIds.includes(project.id)),
    [projectOptions, selectedProjectIds],
  );

  const showBadge = selectedProjectIds.length > 0 && !popoverOpen;

  const handleOpen = () => {
    setAnchorEl(buttonRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (_event: React.SyntheticEvent, value: MusicProjectListItem[]) => {
    onSelectedProjectIdsChange(value.map(project => project.id));
  };

  return (
    <>
      <Tooltip title={t('filter_by_project')}>
        <Badge
          badgeContent={selectedProjectIds.length}
          invisible={!showBadge}
          overlap="circular"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          onClick={handleOpen}
          sx={filterBadgeSx}
        >
          <IconButton
            ref={buttonRef}
            size="small"
            onClick={handleOpen}
            aria-label={t('filter_by_project')}
            aria-expanded={popoverOpen}
            sx={iconButtonSx}
          >
            <FilterListIcon sx={{ color: 'grey.700', fontSize: 18 }} />
          </IconButton>
        </Badge>
      </Tooltip>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        minWidth={POPOVER_WIDTH}
        maxWidth={POPOVER_WIDTH}
        showArrow={false}
        paperSx={glassPaperSx}
        anchorOrigin={FILTER_ANCHOR_ORIGIN}
        transformOrigin={FILTER_TRANSFORM_ORIGIN}
      >
        <Box
          sx={{ p: 1.25 }}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          <Autocomplete
            multiple
            disableCloseOnSelect
            size="small"
            options={projectOptions}
            value={selectedProjects}
            onChange={handleChange}
            getOptionLabel={project => project.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText={t('empty_title')}
            renderInput={params => (
              <TextField
                {...params}
                label={t('breadcrumb_projects')}
                placeholder={
                  selectedProjects.length > 0 ? '' : t('filter_projects_placeholder')
                }
                sx={projectFilterInputSx}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((project, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                  <Chip
                    key={key}
                    {...tagProps}
                    label={project.name}
                    size="small"
                  />
                );
              })}
            slotProps={{
              popper: {
                sx: { zIndex: theme => theme.zIndex.modal + 1 },
              },
            }}
          />
        </Box>
      </Popover>
    </>
  );
}
