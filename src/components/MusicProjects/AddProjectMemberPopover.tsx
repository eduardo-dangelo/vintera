'use client';

import type { MemberPermission, PlatformUserSearchResult } from '@/types/musicPeople';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Popover } from '@/components/common/Popover';
import {
  CREATE_POPOVER_CLICK_ANCHOR_ORIGIN,
  CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN,
  createPopoverCreateButtonSx,
} from '@/components/MusicProjects/createMusicPopoverStyles';
import { GradientIcon } from '@/components/MusicProjects/GradientIcon';
import { useCreateMusicProjectMember } from '@/queries/hooks/music-projects/useCreateMusicProjectMember';
import { useSearchUsers } from '@/queries/hooks/users/useSearchUsers';
import {
  getGlassAutocompleteSlotProps,
  getGlassSelectMenuProps,
  glassMenuItemSx,
  glassPaperSx,
} from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 320;

type AddProjectMemberPopoverProps = {
  open: boolean;
  anchorEl?: HTMLElement | null;
  anchorPosition?: { top: number; left: number } | null;
  locale: string;
  projectId: number;
  onClose: () => void;
  onAdded?: () => void;
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
  anchorEl = null,
  anchorPosition = null,
  locale,
  projectId,
  onClose,
  onAdded,
}: AddProjectMemberPopoverProps) {
  const t = useTranslations('MusicProjects');
  const createMember = useCreateMusicProjectMember(locale);

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PlatformUserSearchResult | null>(null);
  const [draftPermission, setDraftPermission] = useState<MemberPermission>('edit');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isFetching } = useSearchUsers(locale, searchQuery, {
    projectId,
    enabled: open && activeTab === 0,
  });

  const searchResults = data?.users ?? [];
  const usePositionAnchor = anchorPosition != null;

  const resetState = useCallback(() => {
    setActiveTab(0);
    setSearchQuery('');
    setSelectedUser(null);
    setDraftPermission('edit');
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleAdded = () => {
    resetState();
    onAdded?.();
    onClose();
  };

  const handleAdd = () => {
    if (!selectedUser || createMember.isPending) {
      return;
    }

    const userId = selectedUser.id;
    const permission = draftPermission;

    // Close before the mutation so the anchor (+ button) doesn't shift when
    // the optimistic member avatar is inserted into the row.
    handleAdded();

    createMember.mutate({ projectId, userId, permission });
  };

  return (
    <Popover
      open={open}
      anchorEl={usePositionAnchor ? null : anchorEl}
      anchorPosition={usePositionAnchor ? anchorPosition : null}
      anchorOrigin={usePositionAnchor ? CREATE_POPOVER_CLICK_ANCHOR_ORIGIN : undefined}
      transformOrigin={usePositionAnchor ? CREATE_POPOVER_CLICK_TRANSFORM_ORIGIN : undefined}
      showArrow={!usePositionAnchor}
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
                  slotProps={getGlassAutocompleteSlotProps()}
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
                            <Typography variant="body2" noWrap sx={{ fontSize: '0.75rem' }}>
                              {name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.6875rem' }}>
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

                {selectedUser && (
                  <FormControl size="small" fullWidth>
                    <InputLabel id="add-member-permission-label">{t('permission')}</InputLabel>
                    <Select
                      labelId="add-member-permission-label"
                      label={t('permission')}
                      value={draftPermission}
                      MenuProps={getGlassSelectMenuProps()}
                      onChange={e => setDraftPermission(e.target.value as MemberPermission)}
                    >
                      <MenuItem sx={glassMenuItemSx} value="read">{t('permission_read')}</MenuItem>
                      <MenuItem sx={glassMenuItemSx} value="edit">{t('permission_edit')}</MenuItem>
                      <MenuItem sx={glassMenuItemSx} value="admin">{t('permission_admin')}</MenuItem>
                    </Select>
                  </FormControl>
                )}

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
