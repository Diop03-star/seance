import test from 'node:test';
import assert from 'node:assert/strict';
import { STRINGS, t } from '../public/i18n.js';
import { readNdjson } from '../public/stream.js';

test('toutes les clés FR existent en EN et inversement', () => {
  assert.deepEqual(Object.keys(STRINGS.fr).sort(), Object.keys(STRINGS.en).sort());
  assert.equal(t('invoke', 'en'), STRINGS.en.invoke);
});

test('readNdjson concatène les fragments, même coupés en pleine ligne', async () => {
  const parts = ['{"t":"BON', '"}\n{"t":"JO', 'UR"}\n{"done":true,"ms":42}\n'];
  const body = new ReadableStream({
    start(c) { for (const p of parts) c.enqueue(new TextEncoder().encode(p)); c.close(); },
  });
  let text = '';
  const result = await readNdjson(new Response(body), (frag) => (text += frag));
  assert.equal(text, 'BONJOUR');
  assert.deepEqual(result, { ms: 42 });
});

test('readNdjson signale une erreur en cours de flux', async () => {
  const res = new Response('{"t":"A"}\n{"error":"ollama_down"}\n');
  await assert.rejects(readNdjson(res, () => {}), /ollama_down/);
});

import { EXAMPLES } from '../public/examples.js';
import { splitPossession } from '../public/possession.js';
import { checkCode } from '../lib/limits.js';

test('splitPossession sépare le bloc de code et le commentaire', () => {
  const r = splitPossession('```cobol\nDISPLAY "HI".\n```\nMWAHAHA. TON CODE EST À MOI.');
  assert.equal(r.code, 'DISPLAY "HI".');
  assert.equal(r.comment, 'MWAHAHA. TON CODE EST À MOI.');
});

test('splitPossession sans bloc → code null', () => {
  assert.deepEqual(splitPossession('Je refuse.'), { code: null, comment: 'Je refuse.' });
});

test('splitPossession accepte un bloc non fermé (réponse coupée)', () => {
  assert.equal(splitPossession('```fortran\nPRINT *, 1').code, 'PRINT *, 1');
});

test('3 exemples valides', () => {
  assert.equal(EXAMPLES.length, 3);
  for (const ex of EXAMPLES) {
    assert.deepEqual(checkCode(ex.code), { ok: true });
    assert.ok(ex.code.split('\n').length <= 15);
  }
});

import { wrapLines } from '../public/tombstone.js';

test('wrapLines coupe en lignes courtes sans perdre de mots', () => {
  const lines = wrapLines('Il paya vos salaires sans jamais réclamer de mise à jour', 22);
  assert.equal(lines.length, 3);
  assert.ok(lines.every((l) => l.length <= 22));
  assert.equal(lines.join(' '), 'Il paya vos salaires sans jamais réclamer de mise à jour');
});

test('wrapLines coupe un mot trop long', () => {
  assert.ok(wrapLines('x'.repeat(50), 20).every((l) => l.length <= 20));
});
