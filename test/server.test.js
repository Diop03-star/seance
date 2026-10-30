import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from '../server.js';

let fakeOllama, ollamaUrl;
const received = [];

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${server.address().port}`)));
}

before(async () => {
  fakeOllama = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      if (req.url === '/api/tags') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ models: [{ name: 'gemma4:e2b' }] }));
      }
      if (req.url === '/api/chat') {
        received.push(JSON.parse(body));
        const { stream } = JSON.parse(body);
        if (stream === false) {
          return res.end(JSON.stringify({ message: { content: '{"epitaph":"Ci-gît un test","last_words":"Adieu"}' }, done: true }));
        }
        res.write('{"message":{"content":"BON"}}\n');
        res.write('{"message":{"content":"JOUR"}}\n');
        return res.end('{"done":true}\n');
      }
      res.statusCode = 404;
      res.end();
    });
  });
  ollamaUrl = await listen(fakeOllama);
});

after(() => fakeOllama.close());

async function withApp(url, fn) {
  const app = createServer({ ollamaUrl: url });
  const base = await listen(app);
  try { await fn(base); } finally { app.close(); }
}

const post = (base, path, body) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('chat stream les fragments', () => withApp(ollamaUrl, async (base) => {
  const res = await post(base, '/api/chat', { spiritId: 'cobol', lang: 'fr', mode: 'talk', history: [], input: 'Salut' });
  assert.equal(res.status, 200);
  const lines = (await res.text()).trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(lines.filter((l) => l.t).map((l) => l.t).join(''), 'BONJOUR');
  assert.equal(lines.at(-1).done, true);
  assert.equal(typeof lines.at(-1).ms, 'number');
}));

test('chat renvoie 503 si Ollama injoignable', () => withApp('http://127.0.0.1:1', async (base) => {
  const res = await post(base, '/api/chat', { spiritId: 'cobol', lang: 'fr', mode: 'talk', history: [], input: 'Salut' });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: 'ollama_down' });
}));

test('chat renvoie 503 model_missing si le modèle est absent', async () => {
  // Ollama is up but gemma4:e2b was never pulled: /api/chat answers 404.
  const noModel = http.createServer((req, res) => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: "model 'gemma4:e2b' not found" }));
  });
  const url = await listen(noModel);
  try {
    await withApp(url, async (base) => {
      const res = await post(base, '/api/chat', { spiritId: 'cobol', lang: 'fr', mode: 'talk', history: [], input: 'Salut' });
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), { error: 'model_missing' });
    });
  } finally {
    noModel.close();
  }
});

test('chat 400 too_long en possession', () => withApp(ollamaUrl, async (base) => {
  const res = await post(base, '/api/chat', { spiritId: 'cobol', lang: 'fr', mode: 'possess', history: [], input: 'x\n'.repeat(50) });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'too_long' });
}));

test('chat 400 bad_request pour un esprit inconnu', () => withApp(ollamaUrl, async (base) => {
  const res = await post(base, '/api/chat', { spiritId: 'java', lang: 'fr', mode: 'talk', input: 'x' });
  assert.equal(res.status, 400);
}));

test('epitaph via Ollama', () => withApp(ollamaUrl, async (base) => {
  const data = await (await post(base, '/api/epitaph', { spiritId: 'cobol', lang: 'fr', history: [] })).json();
  assert.equal(data.epitaph, 'Ci-gît un test');
  assert.equal(data.fallback, false);
}));

test('epitaph repli si Ollama injoignable', () => withApp('http://127.0.0.1:1', async (base) => {
  const res = await post(base, '/api/epitaph', { spiritId: 'cobol', lang: 'fr', history: [] });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.fallback, true);
  assert.equal(data.epitaph, 'Il paya vos salaires sans jamais réclamer de mise à jour.');
}));

test('health', () => withApp(ollamaUrl, async (base) => {
  assert.deepEqual(await (await fetch(base + '/api/health')).json(), { ollama: true, model: true });
}));

test('spirits publics sans prompts', () => withApp(ollamaUrl, async (base) => {
  const list = await (await fetch(base + '/api/spirits')).json();
  assert.equal(list.length, 4);
  assert.equal(list[0].persona, undefined);
}));

test('fichiers statiques et pas de sortie de public/', () => withApp(ollamaUrl, async (base) => {
  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.match(home.headers.get('content-type'), /text\/html/);
  assert.equal((await fetch(base + '/lib/limits.js')).status, 200);
  assert.equal((await fetch(base + '/lib/prompts.js')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e/server.js')).status, 404);
}));

test('les appels à Ollama désactivent le mode réflexion de Gemma 4', () => withApp(ollamaUrl, async (base) => {
  received.length = 0;
  await (await post(base, '/api/chat', { spiritId: 'basic', lang: 'en', mode: 'talk', history: [], input: 'hi' })).text();
  await (await post(base, '/api/epitaph', { spiritId: 'basic', lang: 'en', history: [] })).json();
  assert.equal(received.length, 2);
  assert.ok(received.every((b) => b.think === false));
}));
