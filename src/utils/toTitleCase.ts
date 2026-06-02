function capitalizeSegment(segment: string): string {
  if (!segment) {
    return segment;
  }
  const lower = segment.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function capitalizeWord(word: string): string {
  if (!word) {
    return word;
  }
  return word.split('-').map(capitalizeSegment).join('-');
}

/**
 * Formats song titles, project names, and album names with every word capitalized.
 * Preserves internal spacing; trims leading/trailing whitespace.
 */
export function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed
    .split(/\s+/)
    .map(capitalizeWord)
    .join(' ');
}
