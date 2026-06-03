function capitalizeSegment(segment: string): string {
  if (!segment) {
    return segment;
  }
  const lower = segment.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function isAllCapsWord(word: string): boolean {
  const letters = word.match(/[a-z]/gi);
  if (!letters?.length) {
    return false;
  }
  return letters.every(char => char === char.toUpperCase());
}

function capitalizeWord(word: string): string {
  if (!word) {
    return word;
  }
  if (isAllCapsWord(word)) {
    return word;
  }
  return word.split('-').map(capitalizeSegment).join('-');
}

function capitalizeCoreText(core: string): string {
  return core
    .split(/\s+/)
    .map(capitalizeWord)
    .join(' ');
}

/**
 * Title-cases while typing: capitalizes words in the core text but preserves
 * leading/trailing whitespace so a trailing space before the next word is kept.
 */
export function toTitleCaseInput(value: string): string {
  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const core = value.slice(leading.length, value.length - trailing.length);

  if (!core) {
    return value;
  }

  return leading + capitalizeCoreText(core) + trailing;
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

  return capitalizeCoreText(trimmed);
}
