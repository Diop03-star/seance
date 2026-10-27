import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { isLang, isSpirit, publicSpirits } from './lib/spirits.js';
import { buildMessages } from './lib/prompts.js';
import { parseEpitaph } from './lib/epitaph.js';
import { checkCode } from './lib/limits.js';
import { streamChat, chatJson, health, warmUp, OllamaDown } from './lib/ollama.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const MAX_BODY = 64 * 1024;
const NUM_PREDICT = { talk: 220, possess: 600 };
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('too_big')); req.destroy(); } else chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new Error('bad_json')); }
    });
    req.on('error', reject);
  });
}

// Only public/ and the one shared module are reachable.
function resolveStatic(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath); } catch { return null; }
  if (decoded === '/lib/limits.js') return path.join(ROOT, 'lib', 'limits.js');
  const file = path.normalize(path.join(PUBLIC, decoded === '/' ? 'index.html' : decoded));
  return file.startsWith(PUBLIC + path.sep) ? file : null;
}

async function serveStatic(req, res) {
  const file = resolveStatic(new URL(req.url, 'http://x').pathname);
  if (!file) return json(res, 404, { error: 'not_found' });
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    json(res, 404, { error: 'not_found' });
  }
}

async function handleChat(req, res, ollamaUrl) {
  const { spiritId, lang, mode, history, input } = await readBody(req);
  if (!isSpirit(spiritId) || !isLang(lang) || !(mode === 'talk' || mode === 'possess') || typeof input !== 'string') {
    return json(res, 400, { error: 'bad_request' });
  }
  if (mode === 'possess') {
    const check = checkCode(input);
    if (!check.ok) return json(res, 400, { error: check.reason });
  } else if (!input.trim()) {
    return json(res, 400, { error: 'empty' });
  }

  const messages = buildMessages({ spiritId, lang, mode, history: Array.isArray(history) ? history : [], input });
  const abort = new AbortController();
  res.on('close', () => abort.abort());
  const started = Date.now();
  const stream = streamChat({ url: ollamaUrl, messages, numPredict: NUM_PREDICT[mode], signal: abort.signal });

  try {
    // Pull the first fragment before committing to 200, so "Ollama is off" can still be a 503.
    const first = await stream.next();
    res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' });
    if (!first.done) res.write(JSON.stringify({ t: first.value }) + '\n');
    for await (const t of stream) res.write(JSON.stringify({ t }) + '\n');
    res.end(JSON.stringify({ done: true, ms: Date.now() - started }) + '\n');
  } catch (err) {
    if (err.name === 'AbortError') return;
    if (!res.headersSent) return json(res, 503, { error: 'ollama_down' });
    res.end(JSON.stringify({ error: 'ollama_down' }) + '\n');
  }
}

async function handleEpitaph(req, res, ollamaUrl) {
  const { spiritId, lang, history } = await readBody(req);
  if (!isSpirit(spiritId) || !isLang(lang)) return json(res, 400, { error: 'bad_request' });
  const messages = buildMessages({ spiritId, lang, mode: 'epitaph', history: Array.isArray(history) ? history : [] });
  const started = Date.now();
  let result = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      result = parseEpitaph(await chatJson({ url: ollamaUrl, messages }), spiritId, lang);
    } catch (err) {
      if (!(err instanceof OllamaDown)) throw err;
      break; // Ollama is off: a retry would fail the same way.
    }
    if (!result.fallback) break;
  }
  result ??= parseEpitaph('', spiritId, lang);
  json(res, 200, { ...result, ms: Date.now() - started });
}

export function createServer({ ollamaUrl = 'http://localhost:11434' } = {}) {
  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    try {
      if (req.method === 'GET' && pathname === '/api/spirits') return json(res, 200, publicSpirits());
      if (req.method === 'GET' && pathname === '/api/health') return json(res, 200, await health(ollamaUrl));
      if (req.method === 'POST' && pathname === '/api/chat') return await handleChat(req, res, ollamaUrl);
      if (req.method === 'POST' && pathname === '/api/epitaph') return await handleEpitaph(req, res, ollamaUrl);
      if (req.method === 'GET' && !pathname.startsWith('/api/')) return await serveStatic(req, res);
      json(res, 404, { error: 'not_found' });
    } catch (err) {
      if (res.headersSent) return res.end();
      const known = err.message === 'bad_json' || err.message === 'too_big';
      json(res, known ? 400 : 500, { error: known ? 'bad_request' : 'server_error' });
    }
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const port = Number(process.env.PORT) || 3666;
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  createServer({ ollamaUrl }).listen(port, '127.0.0.1', () => {
    console.log(`🕯️  Séance ouverte sur http://localhost:${port}`);
    warmUp(ollamaUrl);
  });
}
