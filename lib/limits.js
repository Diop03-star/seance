// Shared by server and browser (served at /lib/limits.js).

export const MAX_CODE_LINES = 40;
export const MAX_CODE_CHARS = 4000;
export const MAX_EPITAPH = 60;
export const MAX_LAST_WORDS = 80;

export function checkCode(code) {
  const text = String(code ?? '');
  if (!text.trim()) return { ok: false, reason: 'empty' };
  if (text.length > MAX_CODE_CHARS || text.trimEnd().split('\n').length > MAX_CODE_LINES) return { ok: false, reason: 'too_long' };
  return { ok: true };
}

// Cut at the last space before the limit and add an ellipsis.
export function truncate(text, max) {
  const s = String(text).trim().replace(/\s+/g, ' ');
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > max / 2 ? cut.slice(0, space) : cut).trimEnd() + '…';
}
