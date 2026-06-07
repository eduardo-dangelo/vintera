export const PROJECT_ROLE_PRESETS = [
  'vocalist',
  'guitarist',
  'bassist',
  'drummer',
  'producer',
  'engineer',
  'songwriter',
  'manager',
  'other',
] as const;

export type ProjectRolePreset = (typeof PROJECT_ROLE_PRESETS)[number];

export const ROLE_AUTOCOMPLETE_OPTIONS = PROJECT_ROLE_PRESETS.filter(
  preset => preset !== 'other',
) as Exclude<ProjectRolePreset, 'other'>[];

const ADD_ROLE_PREFIX = '\0add:';

export function isAddRoleOption(option: string): boolean {
  return option.startsWith(ADD_ROLE_PREFIX);
}

export function buildAddRoleOption(value: string): string {
  return `${ADD_ROLE_PREFIX}${value}`;
}

export function getAddRoleValue(option: string): string {
  return option.slice(ADD_ROLE_PREFIX.length);
}

export function roleMatchesInput(
  role: string,
  input: string,
  getPresetLabel: (preset: Exclude<ProjectRolePreset, 'other'>) => string,
): boolean {
  const inputLower = input.toLowerCase();
  if (role.toLowerCase() === inputLower) {
    return true;
  }
  if (isProjectRolePreset(role) && role !== 'other') {
    return getPresetLabel(role).toLowerCase() === inputLower;
  }
  return false;
}

export function isProjectRolePreset(value: string): value is ProjectRolePreset {
  return (PROJECT_ROLE_PRESETS as readonly string[]).includes(value);
}

export function normalizeRoles(roles: string[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const role of roles) {
    const trimmed = role.trim();
    if (!trimmed) {
      continue;
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

export function formatRoleLabel(
  role: string,
  getPresetLabel: (preset: Exclude<ProjectRolePreset, 'other'>) => string,
): string {
  if (isProjectRolePreset(role) && role !== 'other') {
    return getPresetLabel(role);
  }
  return role;
}

export function formatRolesDisplay(
  roles: string[],
  getPresetLabel: (preset: Exclude<ProjectRolePreset, 'other'>) => string,
  emptyLabel: string,
): string {
  if (roles.length === 0) {
    return emptyLabel;
  }
  return roles.map(role => formatRoleLabel(role, getPresetLabel)).join(', ');
}
