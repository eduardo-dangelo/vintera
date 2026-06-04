import { useCallback, useEffect, useRef, useState } from 'react';

export type ColorStopItem = {
  id: string;
  hex: string;
};

function stopsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((hex, index) => hex === b[index]);
}

export function createColorStopItems(stops: string[]): ColorStopItem[] {
  return stops.map(hex => ({ id: crypto.randomUUID(), hex }));
}

export function shouldIgnoreIncomingStops(
  stops: string[],
  lastEmittedStops: string[] | null,
): boolean {
  return lastEmittedStops !== null && stopsEqual(stops, lastEmittedStops);
}

export function useStableColorStopItems(stops: string[]) {
  const [items, setItems] = useState<ColorStopItem[]>(() => createColorStopItems(stops));
  const lastEmittedStopsRef = useRef<string[] | null>(null);

  useEffect(() => {
    if (shouldIgnoreIncomingStops(stops, lastEmittedStopsRef.current)) {
      lastEmittedStopsRef.current = null;
      return;
    }
    setItems(createColorStopItems(stops));
    lastEmittedStopsRef.current = null;
  }, [stops]);

  const replaceItems = useCallback((nextItems: ColorStopItem[], emittedStops: string[]) => {
    setItems(nextItems);
    lastEmittedStopsRef.current = emittedStops;
  }, []);

  return { items, replaceItems };
}
