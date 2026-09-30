import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { MusicProjectService } from '@/services/musicProjectService';

function parseProjectId(id: string) {
  const projectId = Number.parseInt(id, 10);
  if (Number.isNaN(projectId)) {
    return null;
  }
  return projectId;
}

export async function POST(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
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

    const project = await MusicProjectService.duplicateProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logger.error(`Error duplicating music project: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to duplicate music project' }, { status: 500 });
  }
}
