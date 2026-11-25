export const ORGROOM_TIME_ZONE = 'Asia/Manila';

// API timestamps are explicit UTC ISO strings. Legacy DATETIME strings without
// an offset are interpreted as UTC, matching the existing database convention.
export function parseApiTimestamp(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value : null;
  let text = String(value).trim();
  if (!text) return null;
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(text)) text = `${text.replace(' ', 'T')}Z`;
  const parsed = new Date(text);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function formatManilaTime(value, options = {}) {
  const date = parseApiTimestamp(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-PH', { timeZone: ORGROOM_TIME_ZONE, hour: 'numeric', minute: '2-digit', ...options }).format(date);
}

export function formatManilaDate(value, options = {}) {
  const date = parseApiTimestamp(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-PH', { timeZone: ORGROOM_TIME_ZONE, year: 'numeric', month: 'short', day: 'numeric', ...options }).format(date);
}

export function formatManilaDateTime(value, options = {}) {
  const date = parseApiTimestamp(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('en-PH', { timeZone: ORGROOM_TIME_ZONE, year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', ...options }).format(date);
}

export function manilaDateParts(value = new Date()) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ORGROOM_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'long', hourCycle: 'h23'
  }).formatToParts(value).map(part => [part.type, part.value]));
}

export function manilaTodayISO(value = new Date()) {
  const parts = manilaDateParts(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function manilaCurrentMinutes(value = new Date()) {
  const parts = manilaDateParts(value);
  return Number(parts.hour) * 60 + Number(parts.minute);
}
