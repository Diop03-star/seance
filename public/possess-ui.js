import { t } from './i18n.js';
import { checkCode } from '../lib/limits.js';
import { EXAMPLES } from './examples.js';
import { splitPossession } from './possession.js';
import * as sound from './audio.js';
// app.js finishes booting (it awaits /api/spirits) after this module has registered its listener.
import { state, spirit, ask, logLine, logError, setBusy, scrollLog } from './app.js';

const $ = (sel) => document.querySelector(sel);

function openPanel(open) {
  $('#possess-form').hidden = !open;
  $('#possess-btn').hidden = open;
  if (open) { $('#code').focus(); scrollLog(); }
}

function renderExamples() {
  const box = $('#examples');
  box.replaceChildren();
  for (const ex of EXAMPLES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = ex.label;
    b.addEventListener('click', () => { $('#code').value = ex.code; $('#code').focus(); });
    box.append(b);
  }
}

function codeBlock(title, code, cls) {
  const box = document.createElement('div');
  box.className = `codebox ${cls}`;
  const head = document.createElement('div');
  head.className = 'codebox-head';
  head.textContent = title;
  const pre = document.createElement('pre');
  pre.textContent = code;
  box.append(head, pre);
  return box;
}

async function possess(e) {
  e.preventDefault();
  if (state.busy) return;
  const code = $('#code').value;
  const check = checkCode(code);
  if (!check.ok) return logError(check.reason);

  const s = spirit();
  openPanel(false);
  $('#code').value = '';
  const userLine = logLine('user', '', t('you', state.lang));
  userLine.body.append(codeBlock('</>', code.trimEnd(), 'modern'));
  sound.possess();
  setBusy(true);

  let raw;
  const answer = await ask(code, 'possess', {
    render: () => (raw = logLine('spirit-line', '', s.name)),
  });
  if (answer != null) {
    // Replace the raw streamed text with the code panel + haunted comment.
    const { code: possessed, comment } = splitPossession(answer);
    const timing = raw.p.querySelector('.ms');
    raw.body.textContent = '';
    if (possessed) raw.body.append(codeBlock(t('possessedBy', state.lang, { name: s.name }), possessed, 'possessed'));
    if (comment) {
      const c = document.createElement('div');
      c.className = 'possess-comment';
      c.textContent = comment;
      raw.body.append(c);
    }
    if (timing) raw.p.append(timing);
    scrollLog();
  }
  setBusy(false);
}

document.addEventListener('seance:ready', () => {
  renderExamples();
  $('#possess-btn').addEventListener('click', () => openPanel(true));
  $('#possess-cancel').addEventListener('click', () => openPanel(false));
  $('#possess-form').addEventListener('submit', possess);
});
