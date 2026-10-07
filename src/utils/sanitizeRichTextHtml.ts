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

/** Plain text for ICS / non-HTML consumers. */
export function richTextToPlainText(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const sanitized = /<[a-z][\s\S]*>/i.test(value)
    ? sanitizeRichTextHtml(value)
    : value;
  return sanitized
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
