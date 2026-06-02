import { describe, expect, it } from 'vitest';
import { toTitleCase } from './toTitleCase';

describe('toTitleCase', () => {
  it('capitalizes each word', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('trims whitespace', () => {
    expect(toTitleCase('  my song  ')).toBe('My Song');
  });

  it('capitalizes every word including articles and prepositions', () => {
    expect(toTitleCase('love in the time of cholera')).toBe('Love In The Time Of Cholera');
    expect(toTitleCase('the end')).toBe('The End');
    expect(toTitleCase('of mice and men')).toBe('Of Mice And Men');
  });

  it('handles hyphenated words', () => {
    expect(toTitleCase('half-light')).toBe('Half-Light');
  });

  it('returns empty string for empty input', () => {
    expect(toTitleCase('')).toBe('');
    expect(toTitleCase('   ')).toBe('');
  });
});
