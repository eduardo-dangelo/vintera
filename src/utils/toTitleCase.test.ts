import { describe, expect, it } from 'vitest';
import { toTitleCase, toTitleCaseInput } from './toTitleCase';

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

  it('preserves all-caps words', () => {
    expect(toTitleCase('NASA')).toBe('NASA');
    expect(toTitleCase('HELLO WORLD')).toBe('HELLO WORLD');
    expect(toTitleCase('love in NYC')).toBe('Love In NYC');
    expect(toTitleCase('HALF-LIGHT')).toBe('HALF-LIGHT');
  });

  it('returns empty string for empty input', () => {
    expect(toTitleCase('')).toBe('');
    expect(toTitleCase('   ')).toBe('');
  });
});

describe('toTitleCaseInput', () => {
  it('capitalizes each word', () => {
    expect(toTitleCaseInput('hello')).toBe('Hello');
    expect(toTitleCaseInput('hello world')).toBe('Hello World');
  });

  it('preserves trailing space before the next word', () => {
    expect(toTitleCaseInput('hello ')).toBe('Hello ');
  });

  it('preserves leading and trailing edge whitespace', () => {
    expect(toTitleCaseInput('  my song  ')).toBe('  My Song  ');
  });

  it('returns whitespace-only input unchanged', () => {
    expect(toTitleCaseInput('   ')).toBe('   ');
  });

  it('handles hyphenated words', () => {
    expect(toTitleCaseInput('half-light')).toBe('Half-Light');
  });

  it('preserves all-caps words while typing', () => {
    expect(toTitleCaseInput('NASA')).toBe('NASA');
    expect(toTitleCaseInput('HELLO ')).toBe('HELLO ');
    expect(toTitleCaseInput('love in NYC')).toBe('Love In NYC');
  });
});
