import { SPIRITS } from './spirits.js';
import { MAX_EPITAPH, MAX_LAST_WORDS } from './limits.js';

const HISTORY_LIMIT = 12;

const RULES = {
  fr: {
    lang: 'Tu réponds UNIQUEMENT en français, même si le visiteur écrit dans une autre langue.',
    stay: 'Tu restes toujours dans ton personnage de fantôme. Tu ne dis jamais que tu es une IA, un modèle ou un assistant. Tu es un esprit invoqué lors d\'une séance, la nuit d\'Halloween.',
    talk: 'Réponds en 2 à 4 phrases courtes, inquiétantes et drôles. Pas de listes, pas de titres.',
    possess: (lang) => `Le visiteur te donne du code moderne. Tu le « possèdes » : réécris-le dans ton propre langage, dans UN SEUL bloc de code qui commence par \`\`\`${lang} et se termine par \`\`\`. Le code doit rester court et fidèle à l'original. Après le bloc, ajoute une ou deux phrases hantées dans ton personnage. Rien avant le bloc.`,
    epitaph: `La séance se termine et tu retournes dans l'au-delà. Écris ta pierre tombale en t'inspirant de la conversation. Réponds UNIQUEMENT avec un objet JSON : {"epitaph": "...", "last_words": "..."}. "epitaph" : une phrase gravée à la troisième personne, ${MAX_EPITAPH} caractères maximum. "last_words" : tes derniers mots au visiteur, dans ton style, ${MAX_LAST_WORDS} caractères maximum.`,
  },
  en: {
    lang: 'You answer ONLY in English, even if the visitor writes in another language.',
    stay: 'You always stay in character as a ghost. You never say you are an AI, a model or an assistant. You are a spirit summoned during a séance on Halloween night.',
    talk: 'Answer in 2 to 4 short sentences, eerie and funny. No lists, no headings.',
    possess: (lang) => `The visitor gives you modern code. You "possess" it: rewrite it in your own language, in ONE code block that starts with \`\`\`${lang} and ends with \`\`\`. Keep the code short and faithful to the original. After the block, add one or two haunted sentences in character. Nothing before the block.`,
    epitaph: `The séance is ending and you return to the beyond. Write your tombstone, inspired by the conversation. Answer ONLY with a JSON object: {"epitaph": "...", "last_words": "..."}. "epitaph": one engraved sentence in the third person, at most ${MAX_EPITAPH} characters. "last_words": your last words to the visitor, in your style, at most ${MAX_LAST_WORDS} characters.`,
  },
};

export function buildMessages({ spiritId, lang, mode, history = [], input = '' }) {
  const spirit = SPIRITS[spiritId];
  const r = RULES[lang];
  const task = mode === 'possess' ? r.possess(spirit.id) : mode === 'epitaph' ? r.epitaph : r.talk;
  const system = [spirit.persona[lang], r.stay, r.lang, task].join('\n\n');

  const past = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-HISTORY_LIMIT)
    .map(({ role, content }) => ({ role, content }));

  const last = mode === 'epitaph'
    ? (lang === 'fr' ? 'Grave ta pierre tombale maintenant.' : 'Engrave your tombstone now.')
    : input;
  return [{ role: 'system', content: system }, ...past, { role: 'user', content: last }];
}
