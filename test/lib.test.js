import test from 'node:test';
import assert from 'node:assert/strict';
import { SPIRITS, isSpirit, isLang } from '../lib/spirits.js';
import { buildMessages } from '../lib/prompts.js';
import { parseEpitaph } from '../lib/epitaph.js';
import { checkCode } from '../lib/limits.js';

test('4 esprits avec données bilingues', () => {
  assert.deepEqual(Object.keys(SPIRITS).sort(), ['basic', 'cobol', 'fortran', 'pascal']);
  for (const s of Object.values(SPIRITS)) for (const l of ['fr', 'en']) {
    assert.ok(s.persona[l] && s.greeting[l] && s.fallbackEpitaph[l].epitaph);
    assert.ok(s.fallbackEpitaph[l].epitaph.length <= 60 && s.fallbackEpitaph[l].last_words.length <= 80);
  }
  assert.equal(SPIRITS.cobol.roman, 'MCMLIX');
  assert.equal(SPIRITS.pascal.roman, 'MCMLXX');
});

test('isSpirit / isLang', () => {
  assert.ok(isSpirit('cobol') && !isSpirit('toString') && !isSpirit('java'));
  assert.ok(isLang('fr') && isLang('en') && !isLang('de'));
});

test('le prompt système impose la langue', () => {
  const m = buildMessages({ spiritId: 'cobol', lang: 'fr', mode: 'talk', history: [], input: 'Bonjour' });
  assert.equal(m[0].role, 'system');
  assert.match(m[0].content, /français/i);
  assert.deepEqual(m.at(-1), { role: 'user', content: 'Bonjour' });
  assert.match(buildMessages({ spiritId: 'cobol', lang: 'en', mode: 'talk', history: [], input: 'hi' })[0].content, /English/);
});

test('historique tronqué à 12 messages', () => {
  const history = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: String(i) }));
  assert.equal(buildMessages({ spiritId: 'basic', lang: 'en', mode: 'talk', history, input: 'x' }).length, 1 + 12 + 1);
});

test("mode possess demande un bloc de code dans la langue de l'esprit", () => {
  assert.match(buildMessages({ spiritId: 'pascal', lang: 'fr', mode: 'possess', history: [], input: 'console.log(1)' })[0].content, /```pascal/i);
});

test('parseEpitaph : JSON valide, invalide, trop long', () => {
  assert.deepEqual(parseEpitaph('{"epitaph":"Ci-gît","last_words":"Adieu"}', 'cobol', 'fr'), { epitaph: 'Ci-gît', last_words: 'Adieu', fallback: false });
  assert.equal(parseEpitaph('pas du json', 'cobol', 'fr').fallback, true);
  assert.equal(parseEpitaph('{"epitaph":""}', 'cobol', 'fr').fallback, true);
  const long = parseEpitaph(JSON.stringify({ epitaph: 'mot '.repeat(50), last_words: 'y'.repeat(200) }), 'cobol', 'en');
  assert.ok(long.epitaph.length <= 60 && long.last_words.length <= 80);
});

test('checkCode', () => {
  assert.deepEqual(checkCode('  '), { ok: false, reason: 'empty' });
  assert.deepEqual(checkCode('a\n'.repeat(41)), { ok: false, reason: 'too_long' });
  assert.deepEqual(checkCode('x'.repeat(4001)), { ok: false, reason: 'too_long' });
  assert.deepEqual(checkCode('print(1)'), { ok: true });
});
