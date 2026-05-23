import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import z from 'zod';
import { logger } from '@/libs/Logger';
import { MusicProjectService } from '@/services/musicProjectService';
import { UpdateMusicProjectValidation } from '@/validations/MusicProjectValidation';

function parseProjectId(id: string) {
  const projectId = Number.parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return null;
  }
  return projectId;
}

export const GET = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const data = await MusicProjectService.getProjectWithRelations(projectId, user.id);
    if (!data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error(`Error fetching music project: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch music project' }, { status: 500 });
  }
};

export const PATCH = async (
  request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const json = await request.json();
    const parse = UpdateMusicProjectValidation.safeParse(json);

    if (!parse.success) {
      return NextResponse.json(z.treeifyError(parse.error), { status: 422 });
    }

    const project = await MusicProjectService.updateProject(projectId, parse.data, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    logger.error(`Error updating music project: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to update music project' }, { status: 500 });
  }
};

export const DELETE = async (
  _request: Request,
  props: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const existing = await MusicProjectService.getProjectById(projectId, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await MusicProjectService.deleteProject(projectId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Error deleting music project: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to delete music project' }, { status: 500 });
  }
};
