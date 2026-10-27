// Halloween soundtrack, synthesized live with the Web Audio API: no audio files, works offline.
// Original composition: a slow A-minor organ progression over a drone, a theremin that wanders, wind,
// plus sound effects for each moment of the séance.

const NOTES = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };

export function noteFreq(note) {
  const [, name, octave] = note.match(/^([A-G]#?)(\d)$/);
  return 440 * 2 ** ((NOTES[name] + (Number(octave) - 4) * 12) / 12);
}

// i – VI – iv – V (harmonic minor), voiced low and close for an organ in a crypt.
export const PROGRESSION = [
  ['A2', 'C3', 'E3'],
  ['F2', 'A2', 'C3'],
  ['D2', 'F2', 'A2'],
  ['E2', 'G#2', 'B2'],
];
const THEREMIN = ['A4', 'B4', 'C5', 'E5', 'F5', 'G#4', 'E4', 'D5'];
const CHORD_SECONDS = 6;

let ctx = null;
let master = null;
let reverb = null;
let enabled = loadEnabled();
let ambientTimer = null;
let mood = 'seance';
let lastTick = 0;

function loadEnabled() {
  try { return localStorage.getItem('seance-sound') !== 'off'; } catch { return true; }
}

export const isEnabled = () => enabled;

export function setEnabled(on) {
  enabled = on;
  try { localStorage.setItem('seance-sound', on ? 'on' : 'off'); } catch { /* private mode */ }
  if (!ctx) return;
  master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.3);
  if (on) startAmbient(); else stopAmbient();
}

// Must be called from a user gesture (browsers block audio before one).
export function unlock() {
  if (typeof AudioContext === 'undefined') return false;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = enabled ? 0.5 : 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    reverb = makeReverb(3.5);
    reverb.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

function makeReverb(seconds) {
  const conv = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.5;
  }
  conv.buffer = buf;
  return conv;
}

function noiseBuffer(seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

// One voice with an envelope, sent dry and to the reverb.
function voice({ type = 'sine', freq, start, dur, gain = 0.1, attack = 0.02, release = 0.3, wet = 0.5, detune = 0, filter }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.detune.value = detune;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(gain, start + attack);
  env.gain.setValueAtTime(gain, start + Math.max(attack, dur - release));
  env.gain.linearRampToValueAtTime(0, start + dur);
  let node = osc.connect(env);
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filter;
    node = node.connect(f);
  }
  const dry = ctx.createGain();
  dry.gain.value = 1 - wet;
  const send = ctx.createGain();
  send.gain.value = wet;
  node.connect(dry).connect(master);
  node.connect(send).connect(reverb);
  osc.start(start);
  osc.stop(start + dur + 0.05);
  return osc;
}

// ---------- ambient music ----------

function organChord(chord, start) {
  const dur = CHORD_SECONDS + 1.5;
  const soft = mood === 'farewell' ? 0.6 : 1;
  for (const n of chord) {
    const f = noteFreq(n);
    voice({ type: 'triangle', freq: f, start, dur, gain: 0.05 * soft, attack: 1.8, release: 2.2, wet: 0.7, filter: 1400 });
    voice({ type: 'sawtooth', freq: f, start, dur, gain: 0.012 * soft, attack: 2, release: 2, wet: 0.8, detune: 7, filter: 900 });
  }
  // the drone: the root, two octaves down, never quite still
  voice({ type: 'sine', freq: noteFreq(chord[0]) / 2, start, dur, gain: 0.08 * soft, attack: 2, release: 2, wet: 0.4 });
}

function theremin(start) {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  const vib = ctx.createOscillator();
  vib.frequency.value = 5.5;
  const vibDepth = ctx.createGain();
  vibDepth.gain.value = 7;
  vib.connect(vibDepth).connect(osc.frequency);
  const env = ctx.createGain();
  const dur = 4.5;
  const notes = [0, 1, 2].map(() => noteFreq(THEREMIN[Math.floor(Math.random() * THEREMIN.length)]));
  osc.frequency.setValueAtTime(notes[0], start);
  osc.frequency.exponentialRampToValueAtTime(notes[1], start + 1.6); // the glide is the ghost
  osc.frequency.exponentialRampToValueAtTime(notes[2], start + 3.2);
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(0.035, start + 0.8);
  env.gain.linearRampToValueAtTime(0, start + dur);
  const send = ctx.createGain();
  send.gain.value = 0.8;
  osc.connect(env);
  env.connect(master);
  env.connect(send).connect(reverb);
  osc.start(start); vib.start(start);
  osc.stop(start + dur); vib.stop(start + dur);
}

function wind(start) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(7);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(300, start);
  bp.frequency.linearRampToValueAtTime(700 + Math.random() * 500, start + 3);
  bp.frequency.linearRampToValueAtTime(250, start + 7);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(0.06, start + 3);
  env.gain.linearRampToValueAtTime(0, start + 7);
  src.connect(bp).connect(env).connect(master);
  src.start(start);
}

let bar = 0;
function scheduleBar() {
  const start = ctx.currentTime + 0.1;
  organChord(PROGRESSION[bar % PROGRESSION.length], start);
  if (bar % 2 === 1 && Math.random() < 0.8) theremin(start + 1 + Math.random() * 1.5);
  if (Math.random() < 0.35) wind(start + Math.random() * 2);
  bar++;
}

export function startAmbient() {
  if (!ctx || !enabled || ambientTimer) return;
  scheduleBar();
  ambientTimer = setInterval(scheduleBar, CHORD_SECONDS * 1000);
}

export function stopAmbient() {
  clearInterval(ambientTimer);
  ambientTimer = null;
}

export function setMood(m) { mood = m; }

// ---------- sound effects ----------

const ready = () => ctx && enabled;

// Typing: a faint phosphor click, at most one every 35 ms.
export function tick() {
  if (!ready()) return;
  const now = ctx.currentTime;
  if (now - lastTick < 0.035) return;
  lastTick = now;
  voice({ type: 'square', freq: 1800 + Math.random() * 600, start: now, dur: 0.018, gain: 0.012, attack: 0.001, release: 0.012, wet: 0.1 });
}

// Invocation: the veil tears (rising noise), then a low boom.
export function summon() {
  if (!ready()) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(1.4);
  const hp = ctx.createBiquadFilter();
  hp.type = 'bandpass';
  hp.frequency.setValueAtTime(200, now);
  hp.frequency.exponentialRampToValueAtTime(4000, now + 1.1);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, now);
  env.gain.linearRampToValueAtTime(0.25, now + 1);
  env.gain.linearRampToValueAtTime(0, now + 1.3);
  src.connect(hp).connect(env).connect(reverb);
  src.start(now);
  const boom = voice({ type: 'sine', freq: 90, start: now + 1.15, dur: 2.2, gain: 0.45, attack: 0.01, release: 2, wet: 0.5 });
  boom.frequency.exponentialRampToValueAtTime(32, now + 3.2);
  for (const n of ['A3', 'D#4', 'A4']) voice({ type: 'sawtooth', freq: noteFreq(n), start: now + 1.15, dur: 2.5, gain: 0.03, attack: 0.02, release: 2.2, wet: 0.9, filter: 1800 });
}

// Glitch: a short burst of crushed static.
export function glitch() {
  if (!ready()) return;
  const now = ctx.currentTime;
  for (let i = 0; i < 3; i++) {
    voice({ type: 'square', freq: 80 + Math.random() * 1200, start: now + i * 0.05, dur: 0.04, gain: 0.04, attack: 0.001, release: 0.02, wet: 0.2 });
  }
}

// Possession: a dissonant organ stab (tritone + minor second).
export function possess() {
  if (!ready()) return;
  const now = ctx.currentTime;
  for (const n of ['A2', 'D#3', 'E3', 'A#3']) {
    voice({ type: 'sawtooth', freq: noteFreq(n), start: now, dur: 3, gain: 0.05, attack: 0.01, release: 2.6, wet: 0.8, filter: 2200 });
  }
}

// Farewell: a distant church bell, three tolls (inharmonic partials).
export function bell() {
  if (!ready()) return;
  const partials = [[0.5, 0.5], [1, 1], [1.183, 0.6], [1.506, 0.4], [2, 0.35], [2.514, 0.2], [2.662, 0.15]];
  for (let k = 0; k < 3; k++) {
    const start = ctx.currentTime + 0.2 + k * 2.6;
    for (const [ratio, g] of partials) {
      voice({ type: 'sine', freq: 196 * ratio, start, dur: 5, gain: 0.07 * g, attack: 0.005, release: 4.8, wet: 0.6 });
    }
  }
}
