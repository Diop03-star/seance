import { SPIRITS } from './spirits.js';
import { MAX_EPITAPH, MAX_LAST_WORDS, truncate } from './limits.js';

// Small models often wrap JSON in prose or code fences: take the first {...} span.
function extractJson(raw) {
  const s = String(raw ?? '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(s.slice(start, end + 1)); } catch { return null; }
}

export function parseEpitaph(raw, spiritId, lang) {
  const data = extractJson(raw);
  const epitaph = typeof data?.epitaph === 'string' ? data.epitaph.trim() : '';
  const lastWords = typeof data?.last_words === 'string' ? data.last_words.trim() : '';
  if (!epitaph || !lastWords) return { ...SPIRITS[spiritId].fallbackEpitaph[lang], fallback: true };
  return { epitaph: truncate(epitaph, MAX_EPITAPH), last_words: truncate(lastWords, MAX_LAST_WORDS), fallback: false };
}
