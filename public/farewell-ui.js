import { t } from './i18n.js';
import { renderTombstone, drawTombstonePng } from './tombstone.js';
import { state, spirit, logLine, setBusy, typewriter, addTiming, backToChoose, scrollLog } from './app.js';

const $ = (sel) => document.querySelector(sel);
let stone = null; // what the last farewell engraved, for the PNG and language changes

function dateLabel() {
  const date = new Date().toLocaleDateString(state.lang === 'fr' ? 'fr-FR' : 'en-GB');
  return t('seanceOf', state.lang, { date });
}

async function fetchEpitaph(s) {
  try {
    const res = await fetch('/api/epitaph', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spiritId: s.id, lang: state.lang, history: state.history }),
    });
    if (res.ok) return await res.json();
  } catch { /* fall through to the server-less fallback below */ }
  return null;
}

async function release() {
  if (state.busy) return;
  const s = spirit();
  setBusy(true);
  $('#possess-form').hidden = true;
  $('#possess-btn').hidden = false;
  logLine('sys', `> release --spirit=${s.id}`);
  const engraving = logLine('sys', t('engraving', state.lang));
  engraving.body.classList.add('cursor');

  const data = await fetchEpitaph(s);
  engraving.body.classList.remove('cursor');
  if (!data) {
    engraving.body.textContent = t('errOllama', state.lang);
    setBusy(false);
    return;
  }
  logLine('sys', t('departed', state.lang));
  scrollLog();

  stone = { spiritId: s.id, name: s.name, roman: s.roman, closing: s.closing, epitaph: data.epitaph, last_words: data.last_words, ms: data.ms, fallback: data.fallback };
  await new Promise((r) => setTimeout(r, 900));
  showFarewell();
  setBusy(false);
}

async function showFarewell() {
  $('#screen-seance').hidden = true;
  $('#screen-farewell').hidden = false;
  const section = $('#screen-farewell');
  section.classList.remove('farewell');
  void section.offsetWidth; // restart the fade-in
  section.classList.add('farewell');

  renderTombstone($('#tomb'), { ...stone, dateLabel: dateLabel(), hereLies: t('hereLies', state.lang) });
  const p = $('#last-words');
  p.replaceChildren();
  const who = document.createElement('span');
  who.className = 'who';
  who.textContent = `${stone.name}>`;
  const body = document.createElement('span');
  p.append(who, ' ', body);
  const w = typewriter(body);
  w.push(stone.last_words);
  await w.flush();
  addTiming(p, stone.ms);
  $('#fallback-note').hidden = !stone.fallback;
}

async function download() {
  if (!stone) return;
  const blob = await drawTombstonePng({ ...stone, dateLabel: dateLabel(), hereLies: t('hereLies', state.lang) });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `seance-${stone.spiritId}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

document.addEventListener('seance:ready', () => {
  $('#release-btn').addEventListener('click', release);
  $('#download-btn').addEventListener('click', download);
  $('#new-btn').addEventListener('click', () => {
    $('#screen-farewell').hidden = true;
    stone = null;
    backToChoose();
  });
  // The engraving's fixed words follow the language toggle; the spirit's own words stay as spoken.
  document.addEventListener('langchange', () => {
    if (stone && !$('#screen-farewell').hidden) {
      renderTombstone($('#tomb'), { ...stone, dateLabel: dateLabel(), hereLies: t('hereLies', state.lang) });
    }
  });
});
