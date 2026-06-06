import DOMPurify from 'isomorphic-dompurify';

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'h2', 'h3', 'a'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
};

export function sanitizeRichTextHtml(html: string): string {
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG);
}

export function isRichTextEmpty(html: string): boolean {
  const sanitized = sanitizeRichTextHtml(html);
  const text = sanitized.replace(/<[^>]*>/g, '').trim();
  return text.length === 0;
}

export function normalizeRichTextForSave(html: string): string {
  const sanitized = sanitizeRichTextHtml(html);
  if (isRichTextEmpty(sanitized)) {
    return '';
  }
  return sanitized;
}

export function toRichTextEditorContent(value: string | null): string {
  if (!value) {
    return '';
  }
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return sanitizeRichTextHtml(value);
  }
  const paragraphs = value.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) {
    return '';
  }
  return paragraphs
    .map(p => `<p>${DOMPurify.sanitize(p, { ALLOWED_TAGS: [] })}</p>`)
    .join('');
}
