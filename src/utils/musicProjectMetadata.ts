export type MusicProjectMetadata = {
  heroImageUrl?: string;
  titleFontFamily?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseMusicProjectMetadata(raw: unknown): MusicProjectMetadata {
  if (!isRecord(raw)) {
    return {};
  }

  const metadata: MusicProjectMetadata = {};

  if (typeof raw.heroImageUrl === 'string' && raw.heroImageUrl.length > 0) {
    metadata.heroImageUrl = raw.heroImageUrl;
  }

  if (typeof raw.titleFontFamily === 'string' && raw.titleFontFamily.length > 0) {
    metadata.titleFontFamily = raw.titleFontFamily;
  }

  return metadata;
}

export function mergeMusicProjectMetadata(
  existing: unknown,
  patch: Partial<MusicProjectMetadata>,
): MusicProjectMetadata {
  return {
    ...parseMusicProjectMetadata(existing),
    ...patch,
  };
}
