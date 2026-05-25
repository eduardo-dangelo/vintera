import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { SongService } from '@/services/songService';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const songs = await SongService.getSongsByUserId(user.id);
    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}
