import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { updateProjectMember } from '@/services/musicPeopleService';
import { UpdateMusicProjectMemberValidation } from '@/validations/MusicProjectMemberValidation';

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export const PATCH = async (
  request: Request,
  props: { params: Promise<{ id: string; memberId: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, memberId: memberIdParam } = await props.params;
    const projectId = parseId(id);
    const memberId = parseId(memberIdParam);

    if (!projectId || !memberId) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateMusicProjectMemberValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const member = await updateProjectMember(projectId, memberId, user.id, parse.data);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    logger.error(`Error updating music project member: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
};
