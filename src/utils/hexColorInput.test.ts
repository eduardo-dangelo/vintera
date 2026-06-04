import { describe, expect, it } from 'vitest';
import {
  normalizeHexColor,
  parsePreviewHex,
  randomHexColor,
  sanitizeHexDraft,
  shouldBlockHexHashDeletion,
} from '@/utils/hexColorInput';

describe('sanitizeHexDraft', () => {
  it('keeps hash and hex digits only', () => {
    expect(sanitizeHexDraft('f59e0b')).toBe('#F59E0B');
    expect(sanitizeHexDraft('#ggF59!0b')).toBe('#F590B');
  });
});

describe('normalizeHexColor', () => {
  it('accepts six-digit hex values', () => {
    expect(normalizeHexColor('#E8ECF1')).toBe('#e8ecf1');
  });
});

describe('parsePreviewHex', () => {
  it('expands three-digit shorthand', () => {
    expect(parsePreviewHex('#F59')).toBe('#ff5599');
  });
});

describe('randomHexColor', () => {
  it('returns a six-digit hex color', () => {
    const color = randomHexColor();

    expect(color).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('shouldBlockHexHashDeletion', () => {
  it('blocks backspace at hash position', () => {
    expect(shouldBlockHexHashDeletion('Backspace', 1, 1)).toBe(true);
    expect(shouldBlockHexHashDeletion('Backspace', 2, 2)).toBe(false);
  });
});
