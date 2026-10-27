import { renderTombstone } from './tombstone.js';

// Apart from the scripted greeting, every spirit line below is an unedited Gemma 4 E2B output from the test run (docs/timings.md).
const REPLAY = {
  en: [
    ['sys', '> invoke --spirit=basic'],
    ['spirit', '10 HELLO! 20 DO YOU WANT TO PLAY WITH ME? 30 GOTO 10'],
    ['user', 'Who are you, and why do you still haunt our computers?'],
    ['spirit', "10 Hello there, I am BASIC, a happy little ghost from '64!\n20 I just love to pop up on old machines and make funny little glitches.\n30 GOTO is the best way to jump around, and nobody ever understands that!"],
    ['user', 'async function getGhosts() { … fetch(…) … }'],
    ['code', '10 REM THIS IS BASIC\'S GHOSTY REWRITE!\n20 GOSUB 1000\n30 PRINT "GETTING GHOSTS NOW!"\n40 LET GHOSTS = ""\n50 FOR i = 1 TO LEN(GHOSTS)\n60   GHOSTS = GHOSTS + MID$(GHOSTS, i, 1)\n70 NEXT i\n80 PRINT GHOSTS\n1000 GOTO 10'],
    ['spirit', 'Why do you need all that fancy "async" and "await"? It\'s so slow! I like simple loops and GOTO jumps!'],
    ['sys', '> release --spirit=basic'],
  ],
  fr: [
    ['sys', '> invoke --spirit=basic'],
    ['spirit', '10 COUCOU ! 20 TU VEUX JOUER AVEC MOI ? 30 GOTO 10'],
    ['user', 'Qui es-tu, et pourquoi hantes-tu encore nos ordinateurs ?'],
    ['spirit', "10 Moi, c'est BASIC, né en soixante-quatre, et je suis l'esprit qui glisse dans les circuits !\n20 Je hante les machines parce que GOTO est le meilleur chemin pour s'amuser !\n30 Le PASCAL me fait peur, il est trop ordonné et ça me rend nerveux."],
    ['user', 'async function getGhosts() { … fetch(…) … }'],
    ['code', '10 DIM G(10) AS STRING\n20 G(1) = "Nom1"\n30 G(2) = "Nom2"\n40 G(3) = "Nom3"\n50 N = 3\n60 FOR I = 1 TO N\n70   PRINT G(I)\n80 NEXT I\n90 GOTO 10'],
    ['spirit', 'Oh là là, c\'est du tout compliqué avec ces "async" et "fetch" ! C\'est comme essayer de faire un saut dans un tunnel sans savoir où se trouve la sortie !'],
    ['sys', '> release --spirit=basic'],
  ],
};
const TOMB = {
  en: { epitaph: "BASIC's spirit haunts the old machine's core.", last_words: 'GOTO forever! Have a fun run, little mortal! Poof!', hereLies: 'HERE LIES', date: 'Séance of 27/10/2026' },
  fr: { epitaph: "BASIC l'esprit joyeux, qui aime les GOTO et fuit le PASCAL.", last_words: 'GOTO... GOTO... et BOOM ! Fin de la séance ! Adieu !', hereLies: 'ICI REPOSE', date: 'Séance du 27/10/2026' },
};

const T = {
  en: {
    navDemo: 'Séance', navRun: 'Run it',
    heroTitle: 'Summon the ghosts of dead programming languages.',
    heroQuote: 'WHO DARES TO WAKE ME? SEVENTY PERCENT OF YOUR BANKS STILL RUN ON ME. AND NOBODY EVER SAID THANK YOU.',
    heroLede: 'SÉANCE.EXE is a haunted terminal. Call back COBOL, FORTRAN, BASIC or PASCAL, talk to them, let them possess your modern code, then release them and keep the tombstone they carve. It all runs on an open-weight model on your own machine, with no cloud, no GPU and no internet.',
    badgeOffline: 'works offline', badgeCpu: 'CPU only', badgeDeps: '0 dependencies',
    ctaRun: 'Hold a séance', ctaArticle: 'Read the story on DEV',
    replayTitle: 'A real séance', replayNote: 'A replay of an actual run: apart from the scripted greeting, every answer from the spirit is unedited output from Gemma 4 E2B on a laptop CPU. Responses took 7–14 s, sped up here.',
    replayAgain: 'Summon again', who: 'YOU', possessed: 'POSSESSED BY BASIC',
    momentsTitle: 'Four moments',
    m1t: 'Invocation:', m1: 'pick a spirit and type your summoning words. The screen tears and an ASCII portrait rises.',
    m2t: 'Séance:', m2: 'talk to it. It answers in character, letter by letter, glitching now and then.',
    m3t: 'Possession:', m3: 'paste modern code. The spirit rewrites it in its own ancient language, then judges you.',
    m4t: 'Farewell:', m4: 'release it. It carves its own tombstone, with epitaph and last words written from your séance. Download it as an image.',
    spiritsTitle: 'The spirits',
    sCobol: 'A bitter old bank accountant. Runs most of your banks. Never got a thank-you. SPEAKS IN CAPITALS.',
    sFortran: 'A mad scientist who computed trajectories to the Moon and finds everything else too slow.',
    sBasic: 'A cheerful kid from 1980s home computers. Numbers its sentences. Loves GOTO.',
    sPascal: 'A strict schoolteacher in the spirit of Niklaus Wirth. Hates GOTO. Thinks BASIC is an unruly pupil.',
    videoTitle: 'Demo', videoSoon: 'Video coming soon',
    runTitle: 'Run it', runReq: 'You need Node.js 22+ and Ollama. No npm install, no account, no API key.',
    runWin: 'On Windows you can also double-click seance.bat.',
    whyTitle: 'Why open and local',
    w1t: 'It works with the internet off.', w1: 'Once the model is downloaded, unplug the Wi-Fi: the séance goes on.',
    w2t: 'It runs on an ordinary laptop.', w2: 'It was developed on a Windows PC with integrated graphics and 14 GB of RAM, CPU only.',
    w3t: 'It costs nothing.', w3: 'No tokens, no subscription.',
    w4t: 'Nothing is locked in.', w4: 'Swap the model in one line, rewrite a spirit in a paragraph, summon a fifth one.',
    tMoment: 'Moment', tTime: 'Time on a laptop CPU', tTalk: 'Talking', tPossess: 'Possessing ~20 lines of code', tTomb: 'Carving the tombstone',
    tNote: 'Measured on all four spirits in English and French.',
    footer: 'Built for the DEV Hacktoberfest Open-Source AI Challenge, Week 4: Ghost in the Machine. MIT license.',
  },
  fr: {
    navDemo: 'Séance', navRun: 'Lancer',
    heroTitle: 'Invoque les fantômes des langages disparus.',
    heroQuote: 'QUI OSE ME RÉVEILLER ? SOIXANTE-DIX POUR CENT DE VOS BANQUES TOURNENT ENCORE SUR MOI. ET PERSONNE NE M\'A JAMAIS DIT MERCI.',
    heroLede: 'SÉANCE.EXE est un terminal hanté. Rappelle COBOL, FORTRAN, BASIC ou PASCAL, parle-leur, laisse-les posséder ton code moderne, puis libère-les et garde la pierre tombale qu\'ils gravent. Tout tourne avec un modèle ouvert sur ta propre machine, sans cloud, sans carte graphique et sans internet.',
    badgeOffline: 'marche hors ligne', badgeCpu: 'processeur seul', badgeDeps: '0 dépendance',
    ctaRun: 'Organiser une séance', ctaArticle: 'Lire l\'histoire sur DEV',
    replayTitle: 'Une vraie séance', replayNote: 'Rejeu d\'un essai réel : à part la formule d\'accueil, écrite à l\'avance, chaque réponse de l\'esprit est une sortie brute de Gemma 4 E2B sur le processeur d\'un portable. Les réponses ont pris 7 à 14 s, accélérées ici.',
    replayAgain: 'Invoquer à nouveau', who: 'TOI', possessed: 'POSSÉDÉ PAR BASIC',
    momentsTitle: 'Quatre moments',
    m1t: 'Invocation :', m1: 'choisis un esprit et tape ta formule. L\'écran se déchire et un portrait ASCII apparaît.',
    m2t: 'Séance :', m2: 'parle-lui. Il répond dans son personnage, lettre par lettre, avec quelques glitchs.',
    m3t: 'Possession :', m3: 'colle du code moderne. L\'esprit le réécrit dans sa langue ancienne, puis te juge.',
    m4t: 'Adieu :', m4: 'libère-le. Il grave sa propre pierre tombale, avec une épitaphe et des derniers mots tirés de ta séance. Télécharge-la en image.',
    spiritsTitle: 'Les esprits',
    sCobol: 'Un vieux comptable de banque aigri. Fait tourner la plupart de tes banques. Jamais remercié. PARLE EN MAJUSCULES.',
    sFortran: 'Un savant fou qui a calculé des trajectoires vers la Lune et trouve tout le reste trop lent.',
    sBasic: 'Un enfant joyeux des ordinateurs familiaux des années 80. Numérote ses phrases. Adore GOTO.',
    sPascal: 'Un maître d\'école strict, dans l\'esprit de Niklaus Wirth. Déteste GOTO. Trouve BASIC dissipé.',
    videoTitle: 'Démo', videoSoon: 'Vidéo bientôt disponible',
    runTitle: 'Lancer', runReq: 'Il faut Node.js 22+ et Ollama. Pas de npm install, pas de compte, pas de clé d\'API.',
    runWin: 'Sous Windows, tu peux aussi double-cliquer sur seance.bat.',
    whyTitle: 'Pourquoi ouvert et local',
    w1t: 'Ça marche sans internet.', w1: 'Une fois le modèle téléchargé, coupe le Wi-Fi : la séance continue.',
    w2t: 'Ça tourne sur un portable ordinaire.', w2: 'Développé sur un PC Windows à carte graphique intégrée et 14 Go de mémoire vive, processeur seul.',
    w3t: 'Ça ne coûte rien.', w3: 'Pas de tokens, pas d\'abonnement.',
    w4t: 'Rien n\'est verrouillé.', w4: 'On change de modèle en une ligne, on réécrit un esprit en un paragraphe, on en invoque un cinquième.',
    tMoment: 'Moment', tTime: 'Temps sur le processeur d\'un portable', tTalk: 'Parler', tPossess: 'Posséder une vingtaine de lignes', tTomb: 'Graver la pierre tombale',
    tNote: 'Mesuré sur les quatre esprits, en anglais et en français.',
    footer: 'Construit pour le DEV Hacktoberfest Open-Source AI Challenge, Week 4 : Ghost in the Machine. Licence MIT.',
  },
};

const $ = (sel) => document.querySelector(sel);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
let lang = (navigator.language || 'en').startsWith('fr') ? 'fr' : 'en';
let run = 0;

function applyLang() {
  document.documentElement.lang = lang;
  $('#lang').textContent = lang === 'fr' ? 'EN' : 'FR';
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = T[lang][el.dataset.t];
}

async function type(el, text, id) {
  el.classList.add('cursor');
  for (let i = 0; i < text.length; i++) {
    if (id !== run) return false;
    el.textContent += text[i];
    await sleep(text.length > 120 ? 8 : 18);
  }
  el.classList.remove('cursor');
  return true;
}

async function replay() {
  const id = ++run;
  const log = $('#replay');
  log.replaceChildren();
  $('#tomb').hidden = true;
  for (const [kind, text] of REPLAY[lang]) {
    if (id !== run) return;
    if (kind === 'code') {
      const pre = document.createElement('pre');
      pre.textContent = text;
      log.append(pre);
      await sleep(700);
      continue;
    }
    const p = document.createElement('p');
    p.className = kind;
    if (kind !== 'sys') {
      const who = document.createElement('span');
      who.className = 'who';
      who.textContent = kind === 'user' ? `${T[lang].who}> ` : 'BASIC> ';
      p.append(who);
    }
    const body = document.createElement('span');
    p.append(body);
    log.append(p);
    if (kind === 'spirit') await sleep(900); // the spirit thinks…
    if (!(await type(body, text, id))) return;
    await sleep(500);
  }
  const tomb = TOMB[lang];
  const lw = document.createElement('p');
  lw.className = 'spirit last-words';
  lw.textContent = `BASIC> ${tomb.last_words}`;
  log.append(lw);
  renderTombstone($('#tomb'), { name: 'BASIC', roman: 'MCMLXIV', closing: '10 END', epitaph: tomb.epitaph, dateLabel: tomb.date, hereLies: tomb.hereLies });
  $('#tomb').hidden = false;
}

// Start the replay when the terminal scrolls into view.
const observer = new IntersectionObserver((entries) => {
  if (entries.some((e) => e.isIntersecting)) { observer.disconnect(); replay(); }
}, { threshold: 0.3 });

applyLang();
observer.observe($('#replay'));
$('#replay-btn').addEventListener('click', replay);
$('#lang').addEventListener('click', () => {
  lang = lang === 'fr' ? 'en' : 'fr';
  applyLang();
  if (run) replay();
});
