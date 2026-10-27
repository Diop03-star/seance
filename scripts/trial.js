// Real séance against the running server: one message, one possession and one farewell per spirit and language.
// Usage: node server.js  (in another terminal), then  node scripts/trial.js [spiritId] [lang]
import { writeFile } from 'node:fs/promises';
import { EXAMPLES } from '../public/examples.js';
import { splitPossession } from '../public/possession.js';

const BASE = process.env.SEANCE_URL || 'http://localhost:3666';
const [onlySpirit, onlyLang] = process.argv.slice(2);
const spirits = onlySpirit ? [onlySpirit] : ['cobol', 'fortran', 'basic', 'pascal'];
const langs = onlyLang ? [onlyLang] : ['fr', 'en'];
const QUESTION = { fr: 'Qui es-tu, et pourquoi hantes-tu encore nos ordinateurs ?', en: 'Who are you, and why do you still haunt our computers?' };

async function chat(body) {
  const res = await fetch(`${BASE}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
  let text = '', ms = null;
  for (const line of (await res.text()).trim().split('\n')) {
    const d = JSON.parse(line);
    if (d.t) text += d.t;
    if (d.done) ms = d.ms;
    if (d.error) throw new Error(d.error);
  }
  return { text, ms };
}

const rows = [];
const log = [];
for (const spiritId of spirits) for (const lang of langs) {
  const history = [];
  const talk = await chat({ spiritId, lang, mode: 'talk', history, input: QUESTION[lang] });
  history.push({ role: 'user', content: QUESTION[lang] }, { role: 'assistant', content: talk.text });
  const code = EXAMPLES[0].code;
  const possess = await chat({ spiritId, lang, mode: 'possess', history, input: code });
  history.push({ role: 'user', content: code }, { role: 'assistant', content: possess.text });
  const ep = await (await fetch(`${BASE}/api/epitaph`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spiritId, lang, history }) })).json();

  const hasBlock = splitPossession(possess.text).code != null;
  rows.push(`| ${spiritId} | ${lang} | ${(talk.ms / 1000).toFixed(1)} s | ${(possess.ms / 1000).toFixed(1)} s | ${hasBlock ? 'yes' : 'NO'} | ${(ep.ms / 1000).toFixed(1)} s | ${ep.fallback ? 'FALLBACK' : 'ok'} |`);
  log.push(`## ${spiritId} / ${lang}\n\n**Talk:** ${talk.text}\n\n**Possess:**\n\n${possess.text}\n\n**Epitaph:** ${ep.epitaph} — *${ep.last_words}*\n`);
  console.log(rows.at(-1));
}

const out = `# Timings — gemma4:e2b, CPU only\n\nMachine: Windows 11, AMD Radeon integrated graphics (no dedicated GPU), 13.8 GB RAM. Measured ${new Date().toISOString().slice(0, 10)} with \`node scripts/trial.js\`.\n\n| Spirit | Lang | Talk | Possession | Code block | Epitaph | JSON |\n|---|---|---|---|---|---|---|\n${rows.join('\n')}\n\n# Transcripts\n\n${log.join('\n')}`;
await writeFile(new URL('../docs/timings.md', import.meta.url), out);
console.log('→ docs/timings.md');
