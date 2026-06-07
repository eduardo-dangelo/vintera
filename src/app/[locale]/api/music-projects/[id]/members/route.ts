import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { createProjectMember } from '@/services/musicPeopleService';
import { CreateMusicProjectMemberValidation } from '@/validations/MusicProjectMemberValidation';

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export const POST = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = CreateMusicProjectMemberValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const result = await createProjectMember(projectId, user.id, parse.data);

    if ('error' in result) {
      if (result.error === 'project_not_found') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      if (result.error === 'user_not_found') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'User is already a member' }, { status: 409 });
    }

    return NextResponse.json({ member: result.member });
  } catch (error) {
    logger.error(`Error creating music project member: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
};
