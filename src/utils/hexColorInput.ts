export function randomHexColor(): string {
  const value = Math.floor(Math.random() * 0x1000000);
  return `#${value.toString(16).padStart(6, '0')}`;
}

export const HEX_IDLE_SAVE_MS = 2500;

export function sanitizeHexDraft(raw: string): string {
  const upper = raw.toUpperCase();
  const withoutHash = upper.replace(/#/g, '');
  const hexPart = withoutHash.replace(/[^0-9A-F]/g, '').slice(0, 6);
  return `#${hexPart}`;
}

export function normalizeHexColor(input: string): string | null {
  const sanitized = sanitizeHexDraft(input);
  if (/^#[0-9A-F]{6}$/.test(sanitized)) {
    return sanitized.toLowerCase();
  }
  return null;
}

export function parsePreviewHex(draft: string): string | null {
  const sanitized = sanitizeHexDraft(draft);
  const body = sanitized.slice(1);

  if (body.length === 6) {
    return sanitized.toLowerCase();
  }

  if (body.length === 3) {
    const expanded = body.split('').map(char => char + char).join('');
    return `#${expanded}`.toLowerCase();
  }

  return null;
}

export function shouldBlockHexHashDeletion(
  key: string,
  selectionStart: number | null,
  selectionEnd: number | null,
): boolean {
  if (key !== 'Backspace' && key !== 'Delete') {
    return false;
  }

  const start = selectionStart ?? 0;
  const end = selectionEnd ?? 0;

  if (key === 'Backspace' && start <= 1 && end <= 1) {
    return true;
  }

  if (key === 'Delete' && start === 0) {
    return true;
  }

  return start < 1 && end > 0;
}
