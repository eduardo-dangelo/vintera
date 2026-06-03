const loadedFamilies = new Set<string>();

export function parseGoogleFontInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes('fonts.googleapis.com')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (!url.hostname.endsWith('fonts.googleapis.com')) {
        return null;
      }
      const familyParam = url.searchParams.get('family');
      if (!familyParam) {
        return null;
      }
      const familyName = familyParam.split(':')[0]?.replace(/\+/g, ' ');
      return familyName?.trim() || null;
    } catch {
      return null;
    }
  }

  const stripped = trimmed.replace(/^['"]|['"]$/g, '').split(',')[0]?.trim();
  return stripped || null;
}

export function loadGoogleFont(family: string): void {
  const normalized = family.trim();
  if (!normalized) {
    return;
  }

  const key = normalized.toLowerCase();
  if (loadedFamilies.has(key)) {
    return;
  }
  loadedFamilies.add(key);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(normalized)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export function buildFontFamilyCss(family: string): string {
  const clean = family.replace(/'/g, '').trim();
  return `'${clean}', sans-serif`;
}
