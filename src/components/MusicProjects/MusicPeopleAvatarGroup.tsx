'use client';

import type { MusicPersonPreview } from '@/types/musicPeople';
import { Avatar, AvatarGroup } from '@mui/material';

type MusicPeopleAvatarGroupProps = {
  people: MusicPersonPreview[];
  max?: number;
  size?: number;
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

export function MusicPeopleAvatarGroup({
  people,
  max = 4,
  size = 24,
}: MusicPeopleAvatarGroupProps) {
  if (people.length === 0) {
    return null;
  }

  return (
    <AvatarGroup
      max={max}
      sx={{
        '& .MuiAvatar-root': {
          width: size,
          height: size,
          fontSize: size * 0.38,
          border: '2px solid',
          borderColor: 'background.paper',
        },
      }}
    >
      {people.map(person => (
        <Avatar
          key={person.id}
          src={person.imageUrl ?? undefined}
          alt={person.name}
          title={person.name}
        >
          {getInitials(person.name)}
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
