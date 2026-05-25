'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useGetUserPreferences, useUpdateUserPreferences } from '@/queries/hooks/users';

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

  const hoverSoundEnabled = preferences?.hoverSoundEnabled !== 'false';

  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(\/|$)/, '/');
  const isLandingPage = pathnameWithoutLocale === '/' || pathnameWithoutLocale === '';

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof AudioContext !== 'undefined') {
      audioContextRef.current = new AudioContext();
    }
    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const playHoverSound = () => {
    if (!hoverSoundEnabled || isLandingPage || isLoading) {
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
      noiseGain.gain.linearRampToValueAtTime(0.04, currentTime + 0.001);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.025);

      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(3500, currentTime);

      const oscGain = audioContext.createGain();
      oscGain.gain.setValueAtTime(0, currentTime);
      oscGain.gain.linearRampToValueAtTime(0.03, currentTime + 0.001);
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
  };

  const updatePreference = async (enabled: boolean) => {
    await updateUserPreferences.mutateAsync({
      hoverSoundEnabled: enabled ? 'true' : 'false',
    });
  };

  return {
    playHoverSound,
    hoverSoundEnabled,
    updatePreference,
    isLoading,
  };
}
