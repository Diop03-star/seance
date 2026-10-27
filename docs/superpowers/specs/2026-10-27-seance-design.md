# Séance — design

*Projet pour le DEV Hacktoberfest Open-Source AI Challenge, Week 4 « Ghost in the Machine ». Date limite de publication : 31/10/2026 23:59 PDT.*

## Intention

Une page web de séance où l'on invoque l'esprit d'un vieux langage de programmation, qui parle dans son personnage, « possède » le code moderne qu'on lui donne, puis laisse une pierre tombale en partant. Tout tourne en local avec un modèle open-weight (Gemma 4 via Ollama), sans internet.

Pourquoi : coller au thème (Halloween + Día de los Muertos — honorer ce qui nous a précédés) et démontrer l'argument open source central de l'article : *le fantôme vit dans ta machine, pas sur le serveur de quelqu'un d'autre*. La démo se fait Wi-Fi coupé, sur un PC ordinaire sans GPU dédié.

Le critère le plus pondéré du jury est la qualité de l'article : le projet doit produire des moments forts à capturer (captures, GIF, vidéo) et une histoire à raconter.

## Expérience (les quatre moments, tous voulus)

1. **Invocation** — on choisit un esprit, on tape une formule, l'écran grésille, un portrait en ASCII apparaît, l'esprit parle en premier.
2. **Séance** — conversation libre ; l'esprit reste dans son personnage, ses réponses s'affichent en streaming lettre par lettre avec de légers glitchs.
3. **Possession** — on colle du code moderne ; l'esprit le réécrit dans sa propre langue, avec un commentaire hanté. C'est le moment « waouh » de la démo.
4. **Adieu** (moment préféré de l'utilisateur) — on libère l'esprit ; il laisse une pierre tombale réaliste avec une épitaphe et une dernière phrase **générées par Gemma à partir de la séance**. Téléchargeable en image PNG.

## Esprits (4)

| Esprit | Année | Personnage (proposition, à affiner) |
|---|---|---|
| COBOL | 1959 | Vieux comptable de banque aigri : « 70 % de vos banques tournent encore sur moi, personne ne m'a dit merci. » Parle en MAJUSCULES. |
| FORTRAN | 1957 | Savant fou qui a calculé des trajectoires lunaires, obsédé par les nombres et la vitesse. |
| BASIC | 1964 | Esprit enfantin des premiers ordinateurs familiaux, numérote ses phrases, adore `GOTO`. |
| PASCAL | 1970 | (ajouté par l'utilisateur) Maître d'école strict à la Niklaus Wirth, exige la programmation structurée, méprise `GOTO` — rivalité avec BASIC. |

Chaque esprit a : nom, années (épitaphe en chiffres romains style « MCMLIX – ∞ »), portrait ASCII, consignes de personnage, réplique d'accueil, et une ligne de clôture dans sa langue sur la tombe (ex. COBOL : `PROCEDURE DIVISION. STOP RUN.`).

## Visuel (décidé à partir des maquettes)

- **Écran de séance : style A « terminal hanté »** — fond noir, texte vert phosphore avec halo, lignes de balayage CRT, glitchs, police monospace.
- **Pierre tombale réaliste** (maquette `pierre-tombale-v3.html` validée) : granit vieilli texturé, lettres gravées (effet creusé), mousse, fissure, herbe, brume, clair de lune, fleurs de cempasúchil, et **de vraies bougies animées** (cire avec coulures, mèche, flammes qui vacillent à des rythmes différents, lueur orange qui danse sur la pierre). Pas d'icônes emoji pour les bougies.

Référence : `.superpowers/brainstorm/665-1793090834/content/` (`style-visuel.html`, `pierre-tombale-v3.html`).

## Langue

Bilingue **FR / EN avec un bouton pour changer** : interface et réponses de l'esprit dans la langue choisie. L'article DEV sera rédigé en anglais (jury anglophone), avec une version française pour relecture.

## Contraintes

- Matériel cible : PC de l'utilisateur — Windows 11, 13,8 Go de RAM, GPU AMD Radeon intégré (2 Go partagés) → **inférence CPU**. Ollama 0.40.6 installé.
- Modèle : **`gemma4:e2b`** (choisi par l'utilisateur, le plus léger). Réponses lentes acceptées — elles servent l'ambiance.
- 100 % hors ligne à l'exécution : aucune ressource chargée depuis un CDN (polices, scripts).
- Livrable avant le 31/10 : app fonctionnelle + article DEV avec tags `#devchallenge #hf26challenge`. La publication est faite par l'utilisateur.

## Objectifs / non-objectifs / anti-objectifs

- **Objectifs** : les 4 moments marchent de bout en bout avec les 4 esprits ; démo convaincante hors ligne ; matière visuelle pour l'article.
- **Non-objectifs** : comptes utilisateurs, sauvegarde en ligne, déploiement public obligatoire, fine-tuning, mobile parfait.
- **Anti-objectifs** (échec même si ça « marche ») : un esprit qui sonne comme un assistant générique poli ; une appli qui exige internet ou un service fermé ; une pierre tombale qui fait « clipart ».

## Choix de construction (mes choix, modifiables)

- Page web en HTML/CSS/JavaScript simple, sans framework ni étape de build.
- Petit serveur local (Node.js ou Python, selon ce qui est installé) qui sert la page et relaie les requêtes vers l'API locale d'Ollama (`localhost:11434`) en streaming.
- Personnage via un prompt système par esprit et par langue.
- Pierre tombale dessinée en HTML/CSS et exportée en PNG via un rendu canvas embarqué localement.

## Précisions (mes choix après relecture, modifiables)

- **Serveur** : Node.js 22 (installé), zéro dépendance npm, lancé en une commande (`node server.js`) ; un petit script `.bat` pour double-cliquer. Préchargement du modèle au démarrage (`keep_alive`) pour éviter l'attente du premier message.
- **Possession** : accepte n'importe quel langage source (JS, Python… en pratique). Sortie = un bloc de code dans la langue de l'esprit + un court commentaire hanté, affichés séparément. Trois extraits prêts à coller (JS, Python, et un troisième) sont fournis dans l'interface pour la démo. Taille de code limitée (~40 lignes) pour garder des temps raisonnables sur CPU.
- **Épitaphe** : demandée à Gemma en JSON (`epitaph`, `last_words`) via le mode JSON d'Ollama ; en cas d'échec, une nouvelle tentative puis une épitaphe par défaut écrite à la main par esprit. Longueurs max : épitaphe ~60 caractères (3 lignes), dernière phrase ~80.
- **PNG** : image statique (flammes figées à un instant), redessinée directement en canvas (pas de capture DOM). Le GIF animé n'est pas prévu ; la vidéo de démo montre l'animation.
- **Bilingue** : noms d'esprits et portraits ASCII identiques dans les deux langues ; prompts, répliques d'accueil, épitaphes par défaut et interface traduits. La formule d'invocation est libre (n'importe quel texte déclenche l'invocation), avec une suggestion affichée.
- **Démo** (décidé par l'utilisateur) : vidéo montée avec des coupes acceptée ; l'article indique honnêtement les temps de réponse mesurés sur son PC. Pas besoin de réponses pré-générées ni de modèle de repli. L'appli affiche un état d'attente « l'esprit réfléchit… » qui fait partie de l'ambiance, et mesure les temps (pour l'article).
- **Réglages modèle** : réponses courtes en séance (quelques phrases) pour la vitesse CPU.

## Laissé au constructeur

Structure des fichiers, formulation exacte des prompts, réglages du modèle (température, longueur), détails des effets de glitch, mise en page précise de l'écran de séance.
