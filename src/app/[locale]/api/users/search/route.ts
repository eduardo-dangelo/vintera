import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { getMemberUserIdsByProjectId } from '@/services/musicPeopleService';
import { UserService } from '@/services/userService';

function parseProjectId(value: string | null) {
  if (!value) {
    return null;
  }
  const projectId = Number.parseInt(value, 10);
  if (Number.isNaN(projectId)) {
    return null;
  }
  return projectId;
}

export const GET = async (request: Request) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') ?? '';
    const projectId = parseProjectId(searchParams.get('projectId'));
    const excludeParam = searchParams.get('exclude') ?? '';

    const excludeUserIds = new Set<string>([user.id]);
    for (const id of excludeParam.split(',')) {
      const trimmed = id.trim();
      if (trimmed) {
        excludeUserIds.add(trimmed);
      }
    }

    if (projectId) {
      const memberUserIds = await getMemberUserIdsByProjectId(projectId);
      for (const memberUserId of memberUserIds) {
        excludeUserIds.add(memberUserId);
      }
    }

    const users = await UserService.searchUsers(query, [...excludeUserIds]);

    return NextResponse.json({ users });
  } catch (error) {
    logger.error(`Error searching users: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
};
