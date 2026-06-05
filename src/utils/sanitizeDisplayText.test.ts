import { describe, expect, it } from 'vitest';
import { sanitizeDisplayText, stripInvisibleFormatChars } from './sanitizeDisplayText';

describe('sanitizeDisplayText', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeDisplayText('  Hello  ')).toBe('Hello');
  });

  it('removes zero-width and format characters', () => {
    expect(sanitizeDisplayText('Hello\u200B\uFEFF')).toBe('Hello');
    expect(sanitizeDisplayText('Hi\u00AD\u2060there')).toBe('Hithere');
  });

  it('stripInvisibleFormatChars preserves intentional spacing while typing', () => {
    expect(stripInvisibleFormatChars('Hello \u200B')).toBe('Hello ');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeDisplayText('   ')).toBe('');
  });
});
