export type MusicPersonPreview = {
  id: number;
  name: string;
  imageUrl: string | null;
};

export type MemberPermission = 'read' | 'edit' | 'admin';

export type MusicProjectMember = MusicPersonPreview & {
  permission: MemberPermission;
  projectRoles: string[];
};

export type PlatformUserSearchResult = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
};
