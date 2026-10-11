import type { PageImage } from '@/utils/projectMainPage';

export const PAGE_IMAGE_ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp';

const PAGE_IMAGE_TYPES = new Set(PAGE_IMAGE_ACCEPT.split(','));

export function acceptedPageImageFiles(files: FileList | File[]): File[] {
  return Array.from(files).filter(file => PAGE_IMAGE_TYPES.has(file.type));
}

export async function uploadPageImage(
  locale: string,
  projectId: number,
  file: File,
): Promise<PageImage | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'page');
  const res = await fetch(`/${locale}/api/music-projects/${projectId}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    return null;
  }
  const data = await res.json() as { id?: unknown; url?: unknown };
  const id = typeof data.id === 'string' ? data.id : '';
  const url = typeof data.url === 'string' ? data.url : '';
  if (!id || !url) {
    return null;
  }
  return { id, url, name: file.name };
}
