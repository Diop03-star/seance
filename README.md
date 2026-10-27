# SÉANCE.EXE 🕯️

**Summon the ghosts of dead programming languages — on your own machine, with the lights (and the Wi-Fi) off.**

Séance is a haunted terminal where you call back the spirit of **COBOL**, **FORTRAN**, **BASIC** or **PASCAL**. The spirit talks to you in character, *possesses* the modern code you hand it (rewriting it in its own ancient tongue), and when you release it, it leaves behind a tombstone — epitaph and last words written by the model from your séance — that you can download as an image.

Everything runs locally on an open-weight model: **Gemma 4 (`gemma4:e2b`) through [Ollama](https://ollama.com)**. No API key, no account, no cloud, no data leaving your computer. Built for the DEV *Hacktoberfest Open-Source AI Challenge — Week 4: Ghost in the Machine* (Halloween & Día de los Muertos).

## The four moments

1. **Invocation** — pick a spirit, type your summoning words, the screen tears, an ASCII portrait rises.
2. **Séance** — talk to it. Answers stream in letter by letter, with the occasional glitch.
3. **Possession** — paste up to 40 lines of modern code (or use one of the three examples). The spirit rewrites it in COBOL / FORTRAN / BASIC / PASCAL and comments on it.
4. **Farewell** — release the spirit. It carves its own tombstone: weathered granite, moss, candles flickering, marigolds (cempasúchil). Download it as a PNG.

| Spirit | Born | Personality |
|---|---|---|
| COBOL | 1959 | A bitter old bank accountant. Runs most of your banks. Never got a thank-you. SPEAKS IN CAPITALS. |
| FORTRAN | 1957 | A mad scientist who computed trajectories to the Moon and finds everything else too slow. |
| BASIC | 1964 | A cheerful kid from the 80s home computers. Numbers its sentences. Loves `GOTO`. |
| PASCAL | 1970 | A strict schoolteacher in the spirit of Niklaus Wirth. Hates `GOTO`. Thinks BASIC is an unruly pupil. |

The interface and the spirits speak **French or English** (toggle in the top-right corner).

**Original Halloween soundtrack, synthesized live** with the Web Audio API — no audio files, so it works offline too: a slow A-minor crypt organ over a drone, a wandering theremin, gusts of wind, phosphor clicks while the spirit types, a tearing veil and a boom at the invocation, a dissonant organ stab for possessions, and a distant church bell for the farewell. Toggle with **♪ ON / OFF** (`public/audio.js`).

## Run it

Requirements: [Node.js](https://nodejs.org) 22+ and [Ollama](https://ollama.com).

```bash
ollama pull gemma4:e2b
node server.js
```

Then open <http://localhost:3666>. On Windows you can also double-click `seance.bat`.

Options: `PORT` (default `3666`) and `OLLAMA_URL` (default `http://localhost:11434`). No `npm install` needed — there are zero dependencies.

Tests: `npm test`.

## Why open and local

- **It works offline.** Once the model is downloaded, the whole séance runs with the network unplugged. A ghost that lives in your machine, not on someone else's server.
- **It runs on an ordinary laptop.** Developed and tested on a Windows PC with integrated AMD graphics and 14 GB of RAM — CPU-only inference. Slow answers become part of the atmosphere: the spirit *takes its time*.
- **Nothing is locked in.** Swap the model by editing one line in `lib/ollama.js`, rewrite a spirit's personality in `lib/spirits.js`, or add a new ghost.
- **It costs nothing to run.** No tokens, no subscription.

## How it works

```
browser (vanilla HTML/CSS/JS)  ──►  server.js (Node, no deps)  ──►  Ollama /api/chat  ──►  gemma4:e2b
       ▲   NDJSON stream             builds the spirit's prompt         local inference
       └────────────────────────────────────────────────────────────────────────────────┘
```

- `lib/spirits.js` — the four spirits (personas, greetings, fallback epitaphs, in FR and EN).
- `lib/prompts.js` — builds the system prompt per spirit, language and mode (`talk`, `possess`, `epitaph`).
- `lib/epitaph.js` — parses the model's JSON epitaph (Ollama JSON mode), with one retry and a handwritten fallback.
- `server.js` — serves `public/`, streams answers as NDJSON, measures each response time.
- `public/tombstone.js` — the farewell scene (CSS) and its PNG version (Canvas 2D redraw).

## Response times

Measured on the development PC (Windows 11, integrated AMD graphics, 13.8 GB RAM, CPU only), all four spirits in French and English — full transcripts in [`docs/timings.md`](docs/timings.md):

| Moment | Time |
|---|---|
| Talk (2–4 sentences) | 7–14 s |
| Possession (≈20 lines of code + comment) | 13–47 s |
| Tombstone (JSON epitaph) | 10–21 s |

Every answer stayed in character and in the chosen language; possession returned a code block 8/8 and the epitaph JSON parsed 8/8.

> Gemma 4 has a "thinking" mode, on by default in Ollama. Left on, it burned the whole token budget thinking and answered nothing — the app sends `think: false`.

## License

MIT

---

### En français

**SÉANCE.EXE** : invoque l'esprit de COBOL, FORTRAN, BASIC ou PASCAL. Il te parle dans son personnage, « possède » ton code moderne en le réécrivant dans sa langue, puis laisse une pierre tombale téléchargeable. Tout tourne en local avec Gemma 4 (`gemma4:e2b`) via Ollama, sans internet ni compte.

Lancer : `ollama pull gemma4:e2b`, puis `node server.js` (ou double-clic sur `seance.bat`), puis ouvrir <http://localhost:3666>.
