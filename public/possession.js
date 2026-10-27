// Splits a possession answer into the rewritten code (first ``` block) and the haunted comment around it.
export function splitPossession(text) {
  const s = String(text ?? '');
  const open = s.indexOf('```');
  if (open < 0) return { code: null, comment: s.trim() };
  const bodyStart = s.indexOf('\n', open);
  if (bodyStart < 0) return { code: null, comment: s.trim() };
  const close = s.indexOf('```', bodyStart);
  const code = (close < 0 ? s.slice(bodyStart + 1) : s.slice(bodyStart + 1, close)).replace(/\s+$/, '');
  const comment = (s.slice(0, open) + ' ' + (close < 0 ? '' : s.slice(close + 3))).trim().replace(/\s+\n/g, '\n');
  return { code, comment };
}
