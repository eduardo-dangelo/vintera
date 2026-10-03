import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';
import { ShareService } from '@/services/shareService';
import { parseShareKind } from '@/utils/shareUrls';

function parseId(idStr: string) {
  const id = Number.parseInt(idStr, 10);
  if (Number.isNaN(id) || id < 1) {
    return null;
  }
  return id;
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ kind: string; id: string }> },
) {
  try {
    const { kind: kindStr, id: idStr } = await props.params;
    const kind = parseShareKind(kindStr);
    const id = parseId(idStr);

    if (!kind || !id) {
      return NextResponse.json({ error: 'Invalid share target' }, { status: 400 });
    }

    const teaser = await ShareService.getTeaser(kind, id);
    if (!teaser) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(teaser);
  } catch (error) {
    logger.error(`Error fetching share teaser: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Failed to fetch share teaser' }, { status: 500 });
  }
}
