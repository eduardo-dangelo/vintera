import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { MusicProjectService } from '@/services/musicProjectService';
import { UserService } from '@/services/userService';
import { MusicProjectValidation } from '@/validations/MusicProjectValidation';

export const GET = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await MusicProjectService.getProjectsByUserId(user.id);
    return NextResponse.json({ projects });
  } catch (error) {
    logger.error(`Error fetching music projects: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch music projects' }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await UserService.upsertUser({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    });

    const json = await request.json();
    const parse = MusicProjectValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const project = await MusicProjectService.createProject(parse.data, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logger.error(`Error creating music project: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to create music project' }, { status: 500 });
  }
};
