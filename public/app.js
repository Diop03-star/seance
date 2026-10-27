import { t } from './i18n.js';
import { readNdjson } from './stream.js';

const $ = (sel) => document.querySelector(sel);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const state = { lang: loadLang(), spirits: [], spiritId: null, history: [], busy: false };

function loadLang() {
  try { return localStorage.getItem('seance-lang') === 'en' ? 'en' : 'fr'; } catch { return 'fr'; }
}
function saveLang() {
  try { localStorage.setItem('seance-lang', state.lang); } catch { /* private mode */ }
}

export const spirit = () => state.spirits.find((s) => s.id === state.spiritId);

// ---------- language ----------

function applyLang() {
  document.documentElement.lang = state.lang;
  $('#lang').textContent = state.lang === 'fr' ? 'EN' : 'FR';
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n, state.lang);
  for (const el of document.querySelectorAll('[data-i18n-ph]')) el.placeholder = t(el.dataset.i18nPh, state.lang);
  $('#talk').placeholder = t('placeholder', state.lang);
  updateFormulaHint();
  checkHealth();
  document.dispatchEvent(new CustomEvent('langchange'));
}

function updateFormulaHint() {
  const s = spirit() ?? state.spirits[0];
  if (s) $('#formula').placeholder = t('formulaHint', state.lang, { name: s.name });
}

// ---------- status ----------

async function checkHealth() {
  const el = $('#status');
  try {
    const h = await (await fetch('/api/health')).json();
    const key = !h.ollama ? 'statusDown' : !h.model ? 'statusNoModel' : 'statusOk';
    el.textContent = `● gemma4:e2b · ${t(key, state.lang)}`;
    el.classList.toggle('bad', key !== 'statusOk');
  } catch {
    el.textContent = '';
  }
}

// ---------- log ----------

export function logLine(cls, text = '', who = '') {
  const p = document.createElement('p');
  p.className = `line ${cls}`;
  if (who) {
    const w = document.createElement('span');
    w.className = 'who';
    w.textContent = `${who}>`;
    p.append(w);
  }
  const body = document.createElement('span');
  body.textContent = text;
  p.append(body);
  $('#log').append(p);
  scrollLog();
  return { p, body };
}

export function scrollLog() {
  const log = $('#log');
  log.scrollTop = log.scrollHeight;
}

export function logError(code) {
  const key = { ollama_down: 'errOllama', empty: 'errEmpty', too_long: 'errTooLong' }[code] ?? 'errGeneric';
  logLine('err', t(key, state.lang));
}

// Types streamed fragments one character at a time into `el`.
export function typewriter(el) {
  let queue = '';
  let running = null;
  const speed = reducedMotion ? 0 : 22;
  const run = async () => {
    while (queue.length) {
      const n = queue.length > 120 ? 4 : 1; // catch up when the model outruns the typing
      el.textContent += queue.slice(0, n);
      queue = queue.slice(n);
      scrollLog();
      if (speed) await sleep(speed);
    }
    running = null;
  };
  return {
    push(text) { queue += text; running ??= run(); },
    async flush() { while (running) await running; },
  };
}

function formatMs(ms) {
  return `⧗ ${(ms / 1000).toLocaleString(state.lang, { maximumFractionDigits: 1 })} s`;
}

export function addTiming(p, ms) {
  if (ms == null) return;
  const s = document.createElement('span');
  s.className = 'ms';
  s.textContent = formatMs(ms);
  p.append(s);
}

function glitch(el) {
  if (reducedMotion || Math.random() > 0.2) return;
  el.classList.add('glitch');
  setTimeout(() => el.classList.remove('glitch'), 500);
}

// ---------- talking ----------

export function setBusy(busy) {
  state.busy = busy;
  for (const b of document.querySelectorAll('#screen-seance button, #talk')) b.disabled = busy;
}

// Streams one answer from the spirit into the log. Returns the full text, or null on error.
export async function ask(input, mode, { render } = {}) {
  const s = spirit();
  const { p, body } = render ? render() : logLine('spirit-line', '', s.name);
  body.classList.add('cursor');
  const thinking = logLine('sys', t('thinking', state.lang));
  const writer = typewriter(body);
  let full = '';
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spiritId: s.id, lang: state.lang, mode, history: state.history, input }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      throw new Error(error ?? 'server_error');
    }
    let first = true;
    const { ms } = await readNdjson(res, (frag) => {
      if (first) { thinking.p.remove(); first = false; }
      full += frag;
      writer.push(frag);
    });
    thinking.p.remove();
    await writer.flush();
    addTiming(p, ms);
    glitch(p);
    state.history.push({ role: 'user', content: input }, { role: 'assistant', content: full });
    return full;
  } catch (err) {
    thinking.p.remove();
    await writer.flush();
    if (!full) p.remove();
    logError(err.message);
    return null;
  } finally {
    body.classList.remove('cursor');
  }
}

async function talk(e) {
  e.preventDefault();
  const input = $('#talk');
  const text = input.value.trim();
  if (state.busy) return;
  if (!text) return logError('empty');
  input.value = '';
  logLine('user', text, t('you', state.lang));
  setBusy(true);
  await ask(text, 'talk');
  setBusy(false);
  input.focus();
}

// ---------- invocation ----------

function renderSpirits() {
  const box = $('#spirits');
  box.replaceChildren();
  for (const s of state.spirits) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spirit';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(s.id === state.spiritId));
    const pre = document.createElement('pre');
    pre.textContent = s.ascii.replace(/^\n/, '');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = s.name;
    const year = document.createElement('div');
    year.className = 'year';
    year.textContent = `${s.born} · ${s.roman}`;
    b.append(pre, name, year);
    b.addEventListener('click', () => { state.spiritId = s.id; renderSpirits(); updateFormulaHint(); });
    box.append(b);
  }
}

export async function invoke(spiritId) {
  state.spiritId = spiritId;
  state.history = [];
  const s = spirit();
  $('#screen-choose').hidden = true;
  $('#screen-seance').hidden = false;
  $('#log').replaceChildren();
  setBusy(true);

  const crt = document.querySelector('.crt');
  logLine('sys', `> invoke --spirit=${s.id}`);
  logLine('sys', t('summoning', state.lang));
  crt.classList.add('summoning');
  await sleep(reducedMotion ? 0 : 1200);
  crt.classList.remove('summoning');

  const pre = document.createElement('pre');
  pre.className = 'portrait';
  $('#log').append(pre);
  for (const line of s.ascii.replace(/^\n/, '').split('\n')) {
    pre.textContent += line + '\n';
    scrollLog();
    await sleep(reducedMotion ? 0 : 90);
  }

  const { body } = logLine('spirit-line', '', s.name);
  body.classList.add('cursor');
  const w = typewriter(body);
  w.push(s.greeting[state.lang]);
  await w.flush();
  body.classList.remove('cursor');
  state.history.push({ role: 'assistant', content: s.greeting[state.lang] });
  setBusy(false);
  $('#talk').focus();
}

export function backToChoose() {
  $('#screen-seance').hidden = true;
  $('#screen-choose').hidden = false;
  $('#formula').value = '';
  state.history = [];
  renderSpirits();
}

// ---------- boot ----------

async function boot() {
  state.spirits = await (await fetch('/api/spirits')).json();
  state.spiritId = state.spirits[0].id;
  renderSpirits();
  applyLang();

  $('#lang').addEventListener('click', () => {
    state.lang = state.lang === 'fr' ? 'en' : 'fr';
    saveLang();
    applyLang();
  });
  $('#invoke-form').addEventListener('submit', (e) => { e.preventDefault(); invoke(state.spiritId); });
  $('#talk-form').addEventListener('submit', talk);
  document.dispatchEvent(new CustomEvent('seance:ready'));
}

boot();
