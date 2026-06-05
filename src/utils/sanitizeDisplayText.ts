const INVISIBLE_CHARS_RE = /[\u200B-\u200D\uFEFF\u00AD\u2060]/g;

/** Strip invisible/format characters that some display fonts render as glyphs. */
export function stripInvisibleFormatChars(value: string): string {
  return value.replace(INVISIBLE_CHARS_RE, '');
}

/** Trim and strip invisible/format characters for display and persistence. */
export function sanitizeDisplayText(value: string): string {
  return stripInvisibleFormatChars(value).trim();
}
