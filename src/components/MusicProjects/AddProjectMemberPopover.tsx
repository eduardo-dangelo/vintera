'use client';

import type { PlatformUserSearchResult } from '@/types/musicPeople';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import { createPopoverCreateButtonSx } from '@/components/MusicProjects/createMusicPopoverStyles';
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import { useCreateMusicProjectMember } from '@/queries/hooks/music-projects/useCreateMusicProjectMember';
import { useSearchUsers } from '@/queries/hooks/users/useSearchUsers';
import { glassPaperSx } from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 320;

type AddProjectMemberPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  locale: string;
  projectId: number;
  onClose: () => void;
};

function platformUserDisplayName(user: PlatformUserSearchResult) {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' ');
  }
  return user.email;
}

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

export function AddProjectMemberPopover({
  open,
  anchorEl,
  locale,
  projectId,
  onClose,
}: AddProjectMemberPopoverProps) {
  const t = useTranslations('MusicProjects');
  const createMember = useCreateMusicProjectMember(locale);

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PlatformUserSearchResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isFetching } = useSearchUsers(locale, searchQuery, {
    projectId,
    enabled: open && activeTab === 0,
  });

  const searchResults = data?.users ?? [];

  useEffect(() => {
    if (!open) {
      setActiveTab(0);
      setSearchQuery('');
      setSelectedUser(null);
      setErrorMessage(null);
    }
  }, [open]);

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const handleAdd = async () => {
    if (!selectedUser) {
      return;
    }

    setErrorMessage(null);

    try {
      await createMember.mutateAsync({
        projectId,
        userId: selectedUser.id,
      });
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t('add_member_error');
      if (message.toLowerCase().includes('already')) {
        setErrorMessage(t('add_member_already_member'));
      } else {
        setErrorMessage(message);
      }
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      minWidth={POPOVER_WIDTH}
      maxWidth={POPOVER_WIDTH}
      paperSx={glassPaperSx}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <GradientIcon kind="member" fontSize={18} aria-hidden />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('add_member')}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label={t('cancel')}
            sx={{ mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_event, value: number) => setActiveTab(value)}
          variant="fullWidth"
          sx={{ 'mb': 2, 'minHeight': 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 13 } }}
        >
          <Tab label={t('add_member_tab_search')} />
          <Tab label={t('add_member_tab_email')} />
        </Tabs>

        {activeTab === 0
          ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  options={searchResults}
                  value={selectedUser}
                  onChange={(_event, value) => {
                    setSelectedUser(value);
                    setErrorMessage(null);
                  }}
                  inputValue={searchQuery}
                  onInputChange={(_event, value) => setSearchQuery(value)}
                  loading={isFetching}
                  filterOptions={options => options}
                  getOptionLabel={platformUserDisplayName}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText={
                    searchQuery.trim().length < 2
                      ? t('add_member_search_placeholder')
                      : t('add_member_search_empty')
                  }
                  renderOption={(props, option) => {
                    const name = platformUserDisplayName(option);
                    return (
                      <li {...props} key={option.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.25 }}>
                          <Avatar
                            src={option.imageUrl ?? undefined}
                            alt={name}
                            sx={{ width: 28, height: 28, fontSize: 12 }}
                          >
                            {getInitials(name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {option.email}
                            </Typography>
                          </Box>
                        </Box>
                      </li>
                    );
                  }}
                  renderInput={params => (
                    <TextField
                      {...params}
                      size="small"
                      label={t('add_member_tab_search')}
                      placeholder={t('add_member_search_placeholder')}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />

                {errorMessage && (
                  <Alert severity="error" sx={{ py: 0 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={createPopoverCreateButtonSx}
                    onClick={() => void handleAdd()}
                    disabled={!selectedUser || createMember.isPending}
                  >
                    {t('add_member_submit')}
                  </Button>
                </Box>
              </Box>
            )
          : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  {t('add_member_email_coming_soon')}
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  {t('add_member_email_coming_soon_description')}
                </Typography>
                <TextField
                  size="small"
                  label={t('add_member_tab_email')}
                  placeholder="name@example.com"
                  disabled
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>
            )}
      </Box>
    </Popover>
  );
}
