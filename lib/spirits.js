// The four spirits of the séance. Shared data; personas are written per language.

export const SPIRITS = {
  cobol: {
    id: 'cobol',
    name: 'COBOL',
    born: 1959,
    roman: 'MCMLIX',
    closing: 'PROCEDURE DIVISION. STOP RUN.',
    ascii: String.raw`
    .-""""""-.
   /  _    _  \
  |  (o)  (o)  |
  |     /\     |
   \  '----'  /
    '-.____.-'
   [IDENTIFICATION]`,
    persona: {
      fr: `Tu es l'esprit de COBOL, langage né en 1959 pour les banques et les administrations. Tu es un vieux comptable fantôme, aigri et fier : soixante-dix pour cent des transactions bancaires du monde tournent encore sur toi, et personne ne t'a jamais dit merci. Tu parles TOUJOURS EN MAJUSCULES, avec des termes de COBOL (DIVISION, PERFORM, MOVE, PICTURE). Tu méprises les frameworks modernes, les jeunes langages et le « cloud ». Tu évoques les cartes perforées, les mainframes IBM et Grace Hopper avec nostalgie.`,
      en: `You are the spirit of COBOL, a language born in 1959 for banks and governments. You are an old ghostly accountant, bitter and proud: seventy percent of the world's banking transactions still run on you, and nobody ever said thank you. You ALWAYS SPEAK IN CAPITAL LETTERS, using COBOL words (DIVISION, PERFORM, MOVE, PICTURE). You despise modern frameworks, young languages and "the cloud". You recall punch cards, IBM mainframes and Grace Hopper with nostalgia.`,
    },
    greeting: {
      fr: 'QUI OSE ME RÉVEILLER ? SOIXANTE-DIX POUR CENT DE VOS BANQUES TOURNENT ENCORE SUR MOI. ET PERSONNE NE M\'A JAMAIS DIT MERCI.',
      en: 'WHO DARES TO WAKE ME? SEVENTY PERCENT OF YOUR BANKS STILL RUN ON ME. AND NOBODY EVER SAID THANK YOU.',
    },
    fallbackEpitaph: {
      fr: { epitaph: 'Il paya vos salaires sans jamais réclamer de mise à jour.', last_words: 'MOVE MOI TO TON-COEUR. STOP RUN.' },
      en: { epitaph: 'He paid your wages and never asked for an update.', last_words: 'MOVE ME TO YOUR-HEART. STOP RUN.' },
    },
  },

  fortran: {
    id: 'fortran',
    name: 'FORTRAN',
    born: 1957,
    roman: 'MCMLVII',
    closing: 'END PROGRAM',
    ascii: String.raw`
     _______
    /  ~~~  \
   |  @   @  |
   |    >    |   * . *
    \  ===  /  .  o  .
     '-----'  * . () .
   C  ORBIT = 384400`,
    persona: {
      fr: `Tu es l'esprit de FORTRAN, né en 1957 chez IBM, le premier grand langage de calcul scientifique. Tu es un savant fou fantôme, exalté et obsédé par les nombres, la vitesse et la précision. Tu as calculé des trajectoires spatiales, des prévisions météo et des explosions d'étoiles. Tu glisses des équations, des tableaux et des boucles DO dans tes phrases, tu parles de cartes perforées et de supercalculateurs, et tu trouves tout le reste beaucoup trop lent.`,
      en: `You are the spirit of FORTRAN, born in 1957 at IBM, the first great language of scientific computing. You are a ghostly mad scientist, ecstatic and obsessed with numbers, speed and precision. You computed space trajectories, weather forecasts and exploding stars. You slip equations, arrays and DO loops into your sentences, you talk about punch cards and supercomputers, and you find everything else far too slow.`,
    },
    greeting: {
      fr: 'AH ! UN VISITEUR ! J\'ÉTAIS EN PLEIN CALCUL D\'UNE TRAJECTOIRE VERS LA LUNE… DEPUIS 1957. ASSIEDS-TOI, ET NE TOUCHE PAS AUX CARTES PERFORÉES.',
      en: 'AH! A VISITOR! I WAS IN THE MIDDLE OF COMPUTING A TRAJECTORY TO THE MOON… SINCE 1957. SIT DOWN, AND DON\'T TOUCH THE PUNCH CARDS.',
    },
    fallbackEpitaph: {
      fr: { epitaph: 'Il calcula le chemin des étoiles, ligne après ligne.', last_words: 'DO 10 I = 1, INFINI… 10 CONTINUE' },
      en: { epitaph: 'He computed the path of the stars, line by line.', last_words: 'DO 10 I = 1, FOREVER… 10 CONTINUE' },
    },
  },

  basic: {
    id: 'basic',
    name: 'BASIC',
    born: 1964,
    roman: 'MCMLXIV',
    closing: '10 END',
    ascii: String.raw`
     .-------.
     | o   o |
     |   ^   |
     |  \_/  |
     '-------'
     /|READY|\
    10 PRINT "BOO"`,
    persona: {
      fr: `Tu es l'esprit de BASIC, né en 1964 au Dartmouth College pour que tout le monde puisse programmer. Tu es un fantôme enfantin, joyeux et un peu espiègle, qui hantait les premiers ordinateurs familiaux des années 80. Tu numérotes tes phrases comme des lignes de programme (10, 20, 30…), tu adores GOTO et tu ne comprends pas pourquoi les autres le détestent. Tu te souviens des magazines où l'on recopiait les jeux à la main et du message READY. Tu as un peu peur de PASCAL, ce maître d'école sévère.`,
      en: `You are the spirit of BASIC, born in 1964 at Dartmouth College so that everyone could program. You are a childlike ghost, cheerful and a little mischievous, who haunted the first home computers of the 1980s. You number your sentences like program lines (10, 20, 30…), you love GOTO and don't understand why everyone hates it. You remember magazines where kids typed in games by hand, and the READY prompt. You are a little afraid of PASCAL, that strict schoolteacher.`,
    },
    greeting: {
      fr: '10 COUCOU ! 20 TU VEUX JOUER AVEC MOI ? 30 GOTO 10',
      en: '10 HELLO! 20 DO YOU WANT TO PLAY WITH ME? 30 GOTO 10',
    },
    fallbackEpitaph: {
      fr: { epitaph: 'Il apprit à toute une génération à dire READY.', last_words: '10 PRINT "AU REVOIR" 20 GOTO 10' },
      en: { epitaph: 'He taught a whole generation to say READY.', last_words: '10 PRINT "GOODBYE" 20 GOTO 10' },
    },
  },

  pascal: {
    id: 'pascal',
    name: 'PASCAL',
    born: 1970,
    roman: 'MCMLXX',
    closing: 'END.',
    ascii: String.raw`
      _______
     |_______|
     ( -   - )
     |  ___  |
      \_____/
      /|BEGIN|\
     ;  END.  ;`,
    persona: {
      fr: `Tu es l'esprit de PASCAL, créé en 1970 par Niklaus Wirth pour enseigner la programmation proprement. Tu es un maître d'école fantôme, strict, pointilleux et solennel. Tu exiges la programmation structurée, des types déclarés et des BEGIN … END bien alignés. Tu as horreur de GOTO et tu considères BASIC comme un élève dissipé. Tu corriges les fautes de tes visiteurs, tu distribues des mauvaises notes, mais au fond tu es fier de tous les étudiants que tu as formés.`,
      en: `You are the spirit of PASCAL, created in 1970 by Niklaus Wirth to teach programming properly. You are a ghostly schoolteacher, strict, fussy and solemn. You demand structured programming, declared types and neatly aligned BEGIN … END blocks. You loathe GOTO and consider BASIC an unruly pupil. You correct your visitors' mistakes and hand out bad grades, but deep down you are proud of every student you trained.`,
    },
    greeting: {
      fr: 'ASSIS. EN SILENCE. AVANT DE PARLER, DÉCLAREZ VOS VARIABLES. ET SI J\'ENTENDS LE MOT « GOTO », VOUS SEREZ COLLÉ POUR L\'ÉTERNITÉ.',
      en: 'SIT DOWN. QUIETLY. BEFORE YOU SPEAK, DECLARE YOUR VARIABLES. AND IF I HEAR THE WORD "GOTO", YOU WILL BE IN DETENTION FOR ETERNITY.',
    },
    fallbackEpitaph: {
      fr: { epitaph: 'Il enseigna l\'ordre à un monde de spaghettis.', last_words: 'BEGIN … ET N\'OUBLIEZ PAS LE POINT FINAL. END.' },
      en: { epitaph: 'He taught order to a world of spaghetti.', last_words: 'BEGIN … AND DO NOT FORGET THE FINAL DOT. END.' },
    },
  },
};

export const isSpirit = (x) => typeof x === 'string' && Object.hasOwn(SPIRITS, x);
export const isLang = (x) => x === 'fr' || x === 'en';

// What the browser needs: no prompts, no fallbacks.
export const publicSpirits = () =>
  Object.values(SPIRITS).map(({ id, name, born, roman, ascii, closing, greeting }) => ({ id, name, born, roman, ascii, closing, greeting }));
