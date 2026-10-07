import { richTextToPlainText } from '@/utils/sanitizeRichTextHtml';

export type IcsFeedEvent = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  start: Date;
  end: Date;
  updatedAt: Date;
};

export type BuildIcsCalendarInput = {
  calendarName: string;
  events: IcsFeedEvent[];
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format Date as UTC ICS DATE-TIME: YYYYMMDDTHHMMSSZ */
export function formatIcsUtcDateTime(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad2(date.getUTCMonth() + 1),
    pad2(date.getUTCDate()),
    'T',
    pad2(date.getUTCHours()),
    pad2(date.getUTCMinutes()),
    pad2(date.getUTCSeconds()),
    'Z',
  ].join('');
}

/** Format Date as ICS DATE (local calendar day): YYYYMMDD */
export function formatIcsDate(date: Date): string {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
  ].join('');
}

export function isIcsAllDayEvent(start: Date, end: Date): boolean {
  return (
    start.getHours() === 0
    && start.getMinutes() === 0
    && ((end.getHours() === 23 && end.getMinutes() === 59)
      || (end.getHours() === 0 && end.getMinutes() === 0))
  );
}

/** Escape TEXT values per RFC 5545. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function foldLine(line: string): string {
  if (line.length <= 75) {
    return line;
  }
  const parts: string[] = [];
  let remaining = line;
  parts.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    parts.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return parts.join('\r\n');
}

function allDayEndExclusive(end: Date): Date {
  // ICS all-day DTEND is exclusive. Our stored end is often 23:59 same day or midnight next day.
  if (end.getHours() === 0 && end.getMinutes() === 0) {
    return end;
  }
  const next = new Date(end);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + 1);
  return next;
}

export function buildIcsCalendar({ calendarName, events }: BuildIcsCalendarInput): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vintera//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];

  for (const event of events) {
    const allDay = isIcsAllDayEvent(event.start, event.end);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:vintera-event-${event.id}@vintera.app`);
    lines.push(`DTSTAMP:${formatIcsUtcDateTime(event.updatedAt)}`);
    if (allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDate(event.start)}`);
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(allDayEndExclusive(event.end))}`);
    } else {
      lines.push(`DTSTART:${formatIcsUtcDateTime(event.start)}`);
      lines.push(`DTEND:${formatIcsUtcDateTime(event.end)}`);
    }
    lines.push(`SUMMARY:${escapeIcsText(event.name)}`);
    const descriptionPlain = richTextToPlainText(event.description);
    if (descriptionPlain) {
      lines.push(`DESCRIPTION:${escapeIcsText(descriptionPlain)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}

export function getCalendarFeedPath(token: string): string {
  return `/api/calendar-feeds/${encodeURIComponent(token)}`;
}

export function getCalendarFeedUrl(origin: string, token: string): string {
  const base = origin.replace(/\/$/, '');
  return `${base}${getCalendarFeedPath(token)}`;
}

export function icsFilenameFromCalendarName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `${slug || 'calendar'}.ics`;
}
