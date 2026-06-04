import { describe, expect, it } from 'vitest';
import {
  createColorStopItems,
  shouldIgnoreIncomingStops,
} from '@/hooks/useStableColorStopItems';

describe('shouldIgnoreIncomingStops', () => {
  it('returns true when stops match the last emitted value', () => {
    expect(shouldIgnoreIncomingStops(['#222222', '#111111'], ['#222222', '#111111'])).toBe(true);
  });

  it('returns false for external stop changes', () => {
    expect(shouldIgnoreIncomingStops(['#aaaaaa'], ['#111111'])).toBe(false);
    expect(shouldIgnoreIncomingStops(['#111111'], null)).toBe(false);
  });
});

describe('createColorStopItems', () => {
  it('creates one item per stop with unique ids', () => {
    const items = createColorStopItems(['#111111', '#222222']);

    expect(items).toHaveLength(2);
    expect(items[0]?.hex).toBe('#111111');
    expect(items[1]?.hex).toBe('#222222');
    expect(items[0]?.id).not.toBe(items[1]?.id);
  });
});
