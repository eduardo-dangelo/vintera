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
import { useUpdateMusicProjectMember } from '@/queries/hooks/music-projects/useUpdateMusicProjectMember';
import { glassPaperSx } from '@/utils/glassPaperStyles';

const POPOVER_WIDTH = 300;

type ProjectMemberDetailPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  member: MusicProjectMember | null;
  locale: string;
  projectId: number;
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
  readOnly = false,
  onClose,
}: ProjectMemberDetailPopoverProps) {
  const t = useTranslations('MusicProjects');
  const updateMember = useUpdateMusicProjectMember(locale);

  const [isEditing, setIsEditing] = useState(false);
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

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
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
              onClick={() => {
                setIsEditing(false);
                onClose();
              }}
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
                    onChange={e => setDraftPermission(e.target.value as MemberPermission)}
                  >
                    <MenuItem value="read">{t('permission_read')}</MenuItem>
                    <MenuItem value="edit">{t('permission_edit')}</MenuItem>
                    <MenuItem value="admin">{t('permission_admin')}</MenuItem>
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
              </Box>
            )}
      </Box>
    </Popover>
  );
}
