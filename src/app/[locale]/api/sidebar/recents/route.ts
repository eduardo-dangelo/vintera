import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { SidebarService } from '@/services/sidebarService';

function parseLimit(raw: string | null): number | null {
  if (raw == null || raw === '') {
    return 5;
  }
  if (raw === 'all') {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return 5;
  }
  return parsed;
}

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));
    const recents = await SidebarService.getRecents(user.id, limit);
    return NextResponse.json(recents);
  } catch (error) {
    console.error('Error fetching sidebar recents:', error);
    return NextResponse.json({ error: 'Failed to fetch sidebar recents' }, { status: 500 });
  }
}
