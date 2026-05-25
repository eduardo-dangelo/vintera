import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { AlbumService } from '@/services/albumService';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const albums = await AlbumService.getAlbumsByUserId(user.id);
    return NextResponse.json({ albums });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
  }
}
