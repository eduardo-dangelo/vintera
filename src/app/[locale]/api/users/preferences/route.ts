import type { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await UserService.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      theme: user.theme || 'light',
      hoverSoundEnabled: user.hoverSoundEnabled || 'true',
      hoverSoundVolume: user.hoverSoundVolume || '100',
      currency: user.currency || 'GBP',
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme, hoverSoundEnabled, hoverSoundVolume, currency } = body;

    const validThemes = ['light', 'dark', 'system'];
    const validHoverSoundEnabled = ['true', 'false'];
    const validCurrencies = ['GBP', 'EUR', 'USD'];

    const isValidHoverSoundVolume = (value: string) => {
      const parsed = Number.parseInt(value, 10);
      return !Number.isNaN(parsed) && parsed >= 0 && parsed <= 100;
    };

    if (theme && !validThemes.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    if (hoverSoundEnabled && !validHoverSoundEnabled.includes(hoverSoundEnabled)) {
      return NextResponse.json({ error: 'Invalid hover sound enabled value' }, { status: 400 });
    }
    if (hoverSoundVolume != null && !isValidHoverSoundVolume(String(hoverSoundVolume))) {
      return NextResponse.json({ error: 'Invalid hover sound volume value' }, { status: 400 });
    }
    if (currency && !validCurrencies.includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (theme) {
      updateData.theme = theme;
    }
    if (hoverSoundEnabled) {
      updateData.hoverSoundEnabled = hoverSoundEnabled;
    }
    if (hoverSoundVolume != null) {
      updateData.hoverSoundVolume = String(hoverSoundVolume);
    }
    if (currency) {
      updateData.currency = currency;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid preferences to update' }, { status: 400 });
    }

    const updatedUser = await UserService.updateUser(userId, updateData);

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        theme: updatedUser.theme,
        hoverSoundEnabled: updatedUser.hoverSoundEnabled,
        hoverSoundVolume: updatedUser.hoverSoundVolume,
        currency: updatedUser.currency,
      },
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
