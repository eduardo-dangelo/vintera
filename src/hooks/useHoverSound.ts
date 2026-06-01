'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useGetUserPreferences, useUpdateUserPreferences } from '@/queries/hooks/users';

const VOLUME_DEBOUNCE_MS = 300;

function parseHoverSoundVolume(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '100', 10);
  if (Number.isNaN(parsed)) {
    return 100;
  }
  return Math.min(100, Math.max(0, parsed));
}

/**
 * Hook to manage hover sound functionality
 * Returns a function to play the hover sound when appropriate
 */
export function useHoverSound() {
  const pathname = usePathname();
  const locale = useLocale();
  const { data: preferences, isLoading } = useGetUserPreferences(locale);
  const updateUserPreferences = useUpdateUserPreferences(locale);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTimeRef = useRef<number>(0);
  const volumeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hoverSoundMuted = preferences?.hoverSoundEnabled === 'false';
  const hoverSoundVolume = parseHoverSoundVolume(preferences?.hoverSoundVolume);

  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  const isLandingPage = pathnameWithoutLocale === '/' || pathnameWithoutLocale === '';

  const isAudible = !hoverSoundMuted && hoverSoundVolume > 0 && !isLandingPage && !isLoading;

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof AudioContext !== 'undefined') {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      if (volumeDebounceRef.current) {
        clearTimeout(volumeDebounceRef.current);
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const playHoverSoundAtVolume = useCallback((effectiveVolume: number) => {
    const canPlay = !hoverSoundMuted && effectiveVolume > 0 && !isLandingPage && !isLoading;

    if (!canPlay) {
      return;
    }

    const now = Date.now();
    if (now - lastPlayTimeRef.current < 50) {
      return;
    }

    if (!audioContextRef.current) {
      return;
    }

    try {
      const audioContext = audioContextRef.current;
      const currentTime = audioContext.currentTime;
      const volumeScale = effectiveVolume / 100;

      if (audioContext.state === 'suspended') {
        void audioContext.resume();
      }

      const bufferSize = audioContext.sampleRate * 0.03;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const noiseOutput = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseOutput[i] = Math.random() * 2 - 1;
      }

      const noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = audioContext.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 3000;
      noiseFilter.Q.value = 1;

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(0, currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.04 * volumeScale, currentTime + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.025);

      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(3500, currentTime);

      const oscGain = audioContext.createGain();
      oscGain.gain.setValueAtTime(0, currentTime);
      oscGain.gain.linearRampToValueAtTime(0.03 * volumeScale, currentTime + 0.001);
      oscGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.02);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioContext.destination);

      oscillator.connect(oscGain);
      oscGain.connect(audioContext.destination);

      noiseSource.start(currentTime);
      noiseSource.stop(currentTime + 0.03);
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.02);

      lastPlayTimeRef.current = now;
    } catch {
      // Silently fail if audio context is not available
    }
  }, [hoverSoundMuted, isLandingPage, isLoading]);

  const playHoverSound = useCallback(() => {
    playHoverSoundAtVolume(hoverSoundVolume);
  }, [playHoverSoundAtVolume, hoverSoundVolume]);

  const updateMute = useCallback(async (muted: boolean) => {
    await updateUserPreferences.mutateAsync({
      hoverSoundEnabled: muted ? 'false' : 'true',
    });
  }, [updateUserPreferences]);

  const persistVolume = useCallback(async (volume: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(volume)));
    await updateUserPreferences.mutateAsync({
      hoverSoundVolume: String(clamped),
    });
  }, [updateUserPreferences]);

  const updateVolume = useCallback((volume: number, options?: { debounce?: boolean; preview?: boolean }) => {
    const clamped = Math.min(100, Math.max(0, Math.round(volume)));

    if (options?.preview && !hoverSoundMuted && clamped > 0) {
      playHoverSoundAtVolume(clamped);
    }

    if (volumeDebounceRef.current) {
      clearTimeout(volumeDebounceRef.current);
    }

    if (options?.debounce === false) {
      void persistVolume(clamped);
      return;
    }

    volumeDebounceRef.current = setTimeout(() => {
      void persistVolume(clamped);
    }, VOLUME_DEBOUNCE_MS);
  }, [hoverSoundMuted, persistVolume, playHoverSoundAtVolume]);

  return {
    playHoverSound,
    hoverSoundEnabled: !hoverSoundMuted,
    hoverSoundMuted,
    hoverSoundVolume,
    isAudible,
    updateMute,
    updateVolume,
    isLoading,
  };
}
