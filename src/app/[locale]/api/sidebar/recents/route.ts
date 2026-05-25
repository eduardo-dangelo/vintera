import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { SidebarService } from '@/services/sidebarService';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recents = await SidebarService.getRecents(user.id);
    return NextResponse.json(recents);
  } catch (error) {
    console.error('Error fetching sidebar recents:', error);
    return NextResponse.json({ error: 'Failed to fetch sidebar recents' }, { status: 500 });
  }
}
