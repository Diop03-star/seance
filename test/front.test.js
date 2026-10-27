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
