'use client';

import type { ProjectRolePreset } from '@/components/MusicProjects/projectMemberRoles';
import type { MemberPermission, MusicProjectMember } from '@/types/musicPeople';
import { Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  createFilterOptions,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ConfirmPopover } from '@/components/common/ConfirmPopover';
import { Popover } from '@/components/common/Popover';
import {
  buildAddRoleOption,
  formatRoleLabel,
  formatRolesDisplay,
  getAddRoleValue,
  isAddRoleOption,
  normalizeRoles,

  ROLE_AUTOCOMPLETE_OPTIONS,
  roleMatchesInput,
} from '@/components/MusicProjects/projectMemberRoles';
import { useDeleteMusicProjectMember } from '@/queries/hooks/music-projects/useDeleteMusicProjectMember';
import { useUpdateMusicProjectMember } from '@/queries/hooks/music-projects/useUpdateMusicProjectMember';
import {
  getGlassAutocompleteSlotProps,
  getGlassSelectMenuProps,
  glassMenuItemSx,
  glassPaperSx,
} from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 300;

type ProjectMemberDetailPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  member: MusicProjectMember | null;
  locale: string;
  projectId: number;
  viewerPermission: 'owner' | MemberPermission;
  readOnly?: boolean;
  onClose: () => void;
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

export function ProjectMemberDetailPopover({
  open,
  anchorEl,
  member,
  locale,
  projectId,
  viewerPermission,
  readOnly = false,
  onClose,
}: ProjectMemberDetailPopoverProps) {
  const t = useTranslations('MusicProjects');
  const updateMember = useUpdateMusicProjectMember(locale);
  const deleteMember = useDeleteMusicProjectMember(locale);

  const [isEditing, setIsEditing] = useState(false);
  const [removeConfirmAnchor, setRemoveConfirmAnchor] = useState<HTMLElement | null>(null);
  const [draftPermission, setDraftPermission] = useState<MemberPermission>('admin');
  const [draftRoles, setDraftRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!member || isEditing) {
      return;
    }
    setDraftPermission(member.permission);
    setDraftRoles(member.projectRoles);
  }, [member, isEditing]);

  if (!member) {
    return null;
  }

  const presetRoleLabel = (preset: Exclude<ProjectRolePreset, 'other'>) =>
    t(`role_${preset}`);

  const roleFilter = createFilterOptions<string>({
    stringify: option => formatRoleLabel(option, presetRoleLabel),
  });

  const permissionLabel = (permission: MemberPermission) => {
    if (permission === 'read') {
      return t('permission_read');
    }
    if (permission === 'edit') {
      return t('permission_edit');
    }
    return t('permission_admin');
  };

  const handleCancelEdit = () => {
    setDraftPermission(member.permission);
    setDraftRoles(member.projectRoles);
    setIsEditing(false);
  };

  const handleSave = async () => {
    await updateMember.mutateAsync({
      projectId,
      memberId: member.id,
      data: {
        permission: draftPermission,
        projectRoles: normalizeRoles(draftRoles),
      },
    });
    setIsEditing(false);
  };

  const canRemoveMember = (viewerPermission === 'owner' || viewerPermission === 'admin')
    && !(viewerPermission === 'admin' && member.permission === 'admin');

  const handleRemove = async () => {
    await deleteMember.mutateAsync({ projectId, memberId: member.id });
    setRemoveConfirmAnchor(null);
    setIsEditing(false);
    onClose();
  };

  const handleClose = () => {
    setIsEditing(false);
    setRemoveConfirmAnchor(null);
    onClose();
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        minWidth={POPOVER_WIDTH}
        maxWidth={POPOVER_WIDTH}
        paperSx={glassPaperSx}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
              <Avatar
                src={member.imageUrl ?? undefined}
                alt={member.name}
                sx={{ width: 40, height: 40 }}
              >
                {getInitials(member.name)}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }} noWrap>
                {member.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {!isEditing && !readOnly && (
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(true)}
                  aria-label={t('edit')}
                  sx={{ mt: -0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={handleClose}
                aria-label={t('cancel')}
                sx={{ mt: -0.5, mr: -0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {isEditing
            ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="member-permission-label">{t('permission')}</InputLabel>
                    <Select
                      labelId="member-permission-label"
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

                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    size="small"
                    options={[...ROLE_AUTOCOMPLETE_OPTIONS]}
                    value={draftRoles}
                    onChange={(_event, value) => {
                      setDraftRoles(
                        value.map(role => isAddRoleOption(role) ? getAddRoleValue(role) : role),
                      );
                    }}
                    filterOptions={(options, params) => {
                      const filtered = roleFilter(options, params);
                      const trimmed = params.inputValue.trim();
                      if (!trimmed) {
                        return filtered;
                      }

                      const matchesPreset = options.some(option =>
                        roleMatchesInput(option, trimmed, presetRoleLabel),
                      );
                      const alreadySelected = draftRoles.some(role =>
                        roleMatchesInput(role, trimmed, presetRoleLabel),
                      );

                      if (!matchesPreset && !alreadySelected) {
                        filtered.push(buildAddRoleOption(trimmed));
                      }

                      return filtered;
                    }}
                    getOptionLabel={(option) => {
                      if (isAddRoleOption(option)) {
                        return t('project_role_add_custom', { role: getAddRoleValue(option) });
                      }
                      return formatRoleLabel(option, presetRoleLabel);
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (isAddRoleOption(option)) {
                        return getAddRoleValue(option).toLowerCase() === value.toLowerCase();
                      }
                      return option === value;
                    }}
                    slotProps={getGlassAutocompleteSlotProps()}
                    renderOption={(props, option) => (
                      <li {...props} key={option}>
                        {isAddRoleOption(option)
                          ? t('project_role_add_custom', { role: getAddRoleValue(option) })
                          : formatRoleLabel(option, presetRoleLabel)}
                      </li>
                    )}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={t('project_role')}
                        placeholder={draftRoles.length > 0 ? '' : t('project_role_empty')}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((role, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            {...tagProps}
                            label={formatRoleLabel(role, presetRoleLabel)}
                            size="small"
                          />
                        );
                      })}
                  />

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={handleCancelEdit} disabled={updateMember.isPending}>
                      {t('cancel')}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => void handleSave()}
                      disabled={updateMember.isPending}
                    >
                      {t('save')}
                    </Button>
                  </Box>
                </Box>
              )
            : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('permission')}
                    </Typography>
                    <Typography variant="body2">
                      {permissionLabel(member.permission)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('project_role')}
                    </Typography>
                    <Typography variant="body2">
                      {formatRolesDisplay(member.projectRoles, presetRoleLabel, t('project_role_empty'))}
                    </Typography>
                  </Box>
                  {canRemoveMember && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                      <Button
                        size="small"
                        color="error"
                        onClick={e => setRemoveConfirmAnchor(e.currentTarget)}
                        disabled={deleteMember.isPending}
                      >
                        {t('remove_member')}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
        </Box>
      </Popover>

      <ConfirmPopover
        open={Boolean(removeConfirmAnchor)}
        anchorEl={removeConfirmAnchor}
        onClose={() => setRemoveConfirmAnchor(null)}
        onConfirm={() => void handleRemove()}
        message={t('remove_member_confirm', { name: member.name })}
        confirmLabel={t('remove_member')}
        cancelLabel={t('cancel')}
        confirmColor="error"
        loading={deleteMember.isPending}
      />
    </>
  );
}
