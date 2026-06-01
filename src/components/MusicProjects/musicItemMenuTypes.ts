export type MusicItemKind = 'project' | 'song' | 'album';

export type MusicItemMenuTarget = {
  kind: MusicItemKind;
  id: number;
  href: string;
};
