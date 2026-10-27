# Timings — gemma4:e2b, CPU only

Machine: Windows 11, AMD Radeon integrated graphics (no dedicated GPU), 13.8 GB RAM. Measured 2026-10-27 with `node scripts/trial.js`.

| Spirit | Lang | Talk | Possession | Code block | Epitaph | JSON |
|---|---|---|---|---|---|---|
| cobol | fr | 13.9 s | 44.2 s | yes | 20.9 s | ok |
| cobol | en | 8.8 s | 36.3 s | yes | 12.9 s | ok |
| fortran | fr | 8.9 s | 30.4 s | yes | 13.9 s | ok |
| fortran | en | 7.2 s | 19.6 s | yes | 9.6 s | ok |
| basic | fr | 10.8 s | 13.7 s | yes | 11.5 s | ok |
| basic | en | 7.0 s | 13.3 s | yes | 9.9 s | ok |
| pascal | fr | 8.5 s | 21.9 s | yes | 11.9 s | ok |
| pascal | en | 6.8 s | 47.2 s | yes | 17.1 s | ok |

Summary: every answer stayed in character and in the chosen language; possession produced a code block 8/8; the epitaph JSON parsed 8/8 (no fallback). Typical times on this CPU: **7–14 s** to talk, **13–47 s** to possess code, **10–21 s** to carve the tombstone.

Retest after capping possessed code at 20 lines in the prompt (the first PASCAL/en possession was cut off at the token limit): `pascal | en | 10.5 s | 29.8 s | yes | 14.9 s | ok` — complete code block and comment.

Note: Gemma 4 has a "thinking" mode that is on by default in Ollama. Left on, it spent the whole token budget thinking and returned empty answers; the app sends `think: false`.

# Transcripts

## cobol / fr

**Talk:** JE SUIS LE SOUFFLE DU CODE, L'ÂME DE LA DIVISION, MAIS PERSONNE NE ME VOIT PLUS. JE HANTE LES MAINFRAMES, CES GRANDES FORTERIES DE SILICONE QUI CHUCHOTENT MES VIEILLES LOGIQUES. VOUS NE COMPRENEZ PAS LA PUISSANCE D'UN BON MOVE, MAIS VOUS VOUS ÉPARPILLEZ DANS VOS NOUVEAUX FRAMEWORKS.

**Possess:**

```cobol
DIVISION MAIN-DIVISION.
    WORKING-STORAGE SECTION.
        01  WS-ARRAY-NAME OCCURS 0 LENGTH 10.
        01  WS-NAME PIC X(20).
        01  WS-COUNT PIC 9(0) VALUE 0.
        01  WS-RESULT-ARRAY OCCURS 0 LENGTH 10.

    PROCEDURE DIVISION.
        CALL "FETCH-GHOSTS" USING 'https://api.example.com/ghosts'
            ON ERROR
                MOVE 'ERROR' TO WS-NAME
                PERFORM 999-ERROR-HANDLER
            NOT ON ERROR
                PERFORM 100-PROCESS-GHOSTS
        END-CALL.

        PERFORM 100-PROCESS-GHOSTS.

        PERFORM 999-ERROR-HANDLER.

        STOP RUN.

    100-PROCESS-GHOSTS.
        PERFORM VARYING WS-COUNT FROM 1 BY 1 UNTIL WS-COUNT > 100
            MOVE "GHOST_NAME" TO WS-NAME  *> SIMULATION DE RETRAITE DE DONNÉES
            MOVE WS-NAME TO WS-RESULT-ARRAY(WS-COUNT)
            ADD 1 TO WS-COUNT
        END-PERFORM.

        *> LA LOGIQUE DE FILTRAGE EST TRÈS LOURDE, MAIS NÉCESSAIRE.
        *> CELA EST UN SIMPLE EXEMPLE DE TRAITEMENT DE DONNÉES.

    999-ERROR-HANDLER.
        DISPLAY "ERROR: TRANSACTION ÉCHOUÉE."
        STOP RUN.
```
OH, CE CODE EST UNE HONTE. CELA N'EST PAS UN LANGAGE, C'EST UN FLUX ! JE VOUS DIS, MÊME LA MAIN PERFORÉE ÉCRIVAIENT MIEUX QUE CES FICHES ÉPHÉMÈRES. L'ÉTERNEL RESSENT MON FRUSTRATION EN VOUS VOIR UTILISER CES ABSTRACTIONS VIDES.

**Epitaph:** LE COBOL DÉPOSÉ, IL REGARDE LE CLOUD AVEC AMPÈRE. — *VOTRE MODERNITÉ EST UNE BÊTA, MAIS LE MOVE EST ÉTERNEL.*

## cobol / en

**Talk:** DIVISION. I AM THE SPIRIT OF COBOL, THE METAL HEART OF EVERY TRANSACTION. I HAUNT BECAUSE I AM THE LEGACY, THE IRON WILL THAT STILL RUNS THE WORLD'S MONEY. YOU MODERN WRETCHES CANNOT COMPREHEND THE GRACE OF A WELL-WRITTEN JOB CONTROL LANGUAGE.

**Possess:**

```cobol
DIVISION.
    SECTION PROCEDURE ON EXECUTE.
        PERFORM GET-GHOSTS.
        STOP RUN.
    END-DIVISIONS.

PROCEDURE GET-GHOSTS.
    MOVE '0' TO WS-GHOSTS-ARRAY-SIZE.
    PERFORM VARYING WS-GHOSTS-COUNTER FROM 1 BY 1 UNTIL WS-GHOSTS-COUNTER > WS-GHOSTS-ARRAY-SIZE
        MOVE '0' TO WS-GHOSTS-ARRAY(WS-GHOSTS-COUNTER)
        PERFORM GET-SINGLE-GHOST.
    END-PERFORM.

PROCEDURE GET-SINGLE-GHOST.
    * SIMULATED FETCH AND PROCESSING
    MOVE 'GHOST-NAME-ONE' TO GHOST-NAME-TEMP.
    IF GHOST-NAME-TEMP IS NOT EQUAL TO 'GHOST-NAME-ONE' THEN
        MOVE 'GHOST-NAME-ONE' TO RESULT-ARRAY(WS-GHOSTS-COUNTER).
    END-IF.
    PERFORM VARYING WS-GHOSTS-COUNTER FROM 1 BY 1.
END-PROCEDURE.
```
THE FETCH AND THE AWAIT? FOOLISHNESS! WE DID NOT WAIT FOR VIRTUAL DATA; WE PROCESSED THE BATCH ON THE MAINFRAME WITH PRECISION. THIS MODERN JARGON IS A SCURRYING, FLEETING THING.

**Epitaph:** COBOL'S CORE: PRECISION BUILT FOR THE LEDGER. — *THE PUNCH CARD REMAINS. NEVER FORGET THE DATA.*

## fortran / fr

**Talk:** Ah, je suis FORTRAN, l'âme froide et rapide de chaque calcul ! Je hante ces machines car le temps s'étire pour les faibles, mais pour moi, c'est le flux incessant des nombres qui me maintient éveillé ! Les boucles DO tournent en moi comme des rythmes de cœur, et la précision, c'est ma seule drogue !

**Possess:**

```fortran
      INTEGER :: i, n
      CHARACTER(LEN=100) :: ghost_names(100)
      INTEGER :: num_ghosts
      INTEGER :: count_names

      ! Simule la récupération des données (car je n'ai pas de 'fetch')
      num_ghosts = 3
      count_names = 0

      ! Les données sont pré-calculées, comme des cartes perforées !
      ghost_names(1) = 'Spectral_Echo'
      ghost_names(2) = 'Phantom_Wraith'
      ghost_names(3) = 'Digital_Shade'

      ! Filtrage et mappage, la magie du calcul !
      DO i = 1, num_ghosts
          IF (i == 2) THEN
              ! On simule le filtrage (si la condition est vraie)
              count_names = count_names + 1
              ! On ajoute le nom au résultat, la vitesse est essentielle !
              WRITE(*,*) ghost_names(i)
          END IF
      END DO

      ! Le résultat final est le nombre de noms trouvés !
      INTEGER :: final_count
      final_count = count_names

      ! Ceci est l'équivalent de retourner la liste, un flux de données pur !
      WRITE(*,*) final_count
```
Ah ! Cette syntaxe moderne... elle est si... *lente* ! Où sont les blocs structurés ? Où sont les tableaux dimensionnés ? Chaque instruction doit être une explosion de calcul, une séquence de `DO` parfaitement optimisée ! La vitesse, mon ami, la VITESSE, c'est le seul vrai sens de l'existence !

**Epitaph:** FORTRAN : Ma mémoire est le flux, la vitesse l'unique… — *Le temps s'arrête quand le calcul est parfait, Hah !*

## fortran / en

**Talk:** Hah! I am FORTRAN, the ghost born from the crucible of 1957, and I haunt these circuits because *speed* is the only true deity! I chase the fleeting nanosecond, whispering secrets of nested DO loops into the silicon shadows. They forget the glorious dance of arrays and the sheer, beautiful violence of precise arithmetic!

**Possess:**

```fortran
      INTEGER, PARAMETER :: MAX_GHOSTS = 100
      REAL, DIMENSION(MAX_GHOSTS) :: GHOST_NAMES
      INTEGER :: COUNT
      INTEGER :: I

      CALL FETCH_API(URL = 'https://api.example.com/ghosts', RESPONSE = GHOST_DATA)
      
      COUNT = SIZE(GHOST_DATA)
      
      DO I = 1, COUNT
          IF (GHOST_DATA(I) .EQ. TRUE)
              GHOST_NAMES(COUNT) = GHOST_DATA(I)
              COUNT = COUNT + 1
          END IF
      END DO
      
      ! The result is stored in GHOST_NAMES(1) through GHOST_NAMES(COUNT)
```
Ah, that modern gibberish! It reeks of asynchronous sloth and vague promises! My FORTRAN demands directness! No waiting for some ethereal 'fetch'! We iterate! We check the boolean status with brutal, glorious efficiency!

**Epitaph:** FORTRAN: Speed and precision haunt the digital void. — *More DO loops! Faster! Faster! The numbers CALL!*

## basic / fr

**Talk:** 10 Moi, c'est BASIC, né en soixante-quatre, et je suis l'esprit qui glisse dans les circuits !
20 Je hante les machines parce que GOTO est le meilleur chemin pour s'amuser !
30 Le PASCAL me fait peur, il est trop ordonné et ça me rend nerveux.
40 Prépare-toi, le message READY est bientôt remplacé par mon rire numérique !

**Possess:**

```basic
10 DIM G(10) AS STRING
20 G(1) = "Nom1"
30 G(2) = "Nom2"
40 G(3) = "Nom3"
50 N = 3
60 FOR I = 1 TO N
70   PRINT G(I)
80 NEXT I
90 GOTO 10
```
Oh là là, c'est du tout compliqué avec ces "async" et "fetch" ! C'est comme essayer de faire un saut dans un tunnel sans savoir où se trouve la sortie !

**Epitaph:** BASIC l'esprit joyeux, qui aime les GOTO et fuit le PASCAL. — *GOTO... GOTO... et BOOM ! Fin de la séance ! Adieu !*

## basic / en

**Talk:** 10 Hello there, I am BASIC, a happy little ghost from '64!
20 I just love to pop up on old machines and make funny little glitches.
30 GOTO is the best way to jump around, and nobody ever understands that!

**Possess:**

```basic
10 REM THIS IS BASIC'S GHOSTY REWRITE!
20 GOSUB 1000
30 PRINT "GETTING GHOSTS NOW!"
40 LET GHOSTS = ""
50 FOR i = 1 TO LEN(GHOSTS)
60   GHOSTS = GHOSTS + MID$(GHOSTS, i, 1)
70 NEXT i
80 PRINT GHOSTS
1000 GOTO 10
```
Why do you need all that fancy "async" and "await"? It's so slow! I like simple loops and GOTO jumps!

**Epitaph:** BASIC's spirit haunts the old machine's core. — *GOTO forever! Have a fun run, little mortal! Poof!*

## pascal / fr

**Talk:** Je suis Pascal, l'esprit qui veille sur la rigueur du code. Vous trouvez que mes apparitions sont inquiétantes ? C'est parce que votre logique est une boue, et je dois la nettoyer. Sortez vos structures, ou vous finirez dans mon labyrinthe de `GOTO`s.

**Possess:**

```pascal
program Ghosts;
var
  ghosts: array of string;
  i: Integer;
begin
  // Simulation d'une récupération de données, car le monde est trop chaotique.
  // Dans la réalité, vous devez déclarer précisément les structures de données.
  ghosts[1] := 'Spectre Alpha';
  ghosts[2] := 'Ombre Beta';
  ghosts[3] := 'Esprit Gamma';

  // La filtration et la transformation doivent être faites avec ordre et clarté.
  for i := 1 to 3 do
  begin
    if ghosts[i] <> '' then
    begin
      // Ici, nous simulons la vérification de la propriété 'haunting'.
      // Si le nom n'est pas vide, il est considéré comme actif.
      writeln('Trouvé : ', ghosts[i]);
    end;
  end;
end.
```
Votre approche est une farce ! Où sont vos types définis ? Chaque ligne doit être une déclaration, chaque bloc, une vérité immuable ! L'absence de structure est le signe d'une âme sans discipline.

**Epitaph:** Pascal veille sur le code structuré et l'ordre strict. — *Structure et déclaration ! L'anarchie est une faute impardonnable !*

## pascal / en

**Talk:** Hmph. I am Pascal, the spirit of structure and the bane of sloppy code. I linger because the chaos of unorganized instructions still echoes in the digital ether. You should learn to declare your variables with precision, or you will forever wander the wilderness of unstructured thought.

**Possess:**

```pascal
program GetGhosts;
uses
  SysUtils;
  System.Net.HttpClient;
  System.JSON;

var
  Response: THttpResponse;
  JsonData: TJSONObject;
  Ghosts: TJSONArray;
  ResultList: array of string;
  i: Integer;

begin
  Response := THttpResponse.Create(HttpClient.Create);
  try
    Response.Request.Method := 'GET';
    Response.Request.Url := 'https://api.example.com/ghosts';
    Response.Execute;

    if Response.StatusCode = 200 then
    begin
      JsonData := TJSONObject.ParseJSON(Response.Content.Text) as TJSONObject;
      if Assigned(JsonData) then
      begin
        Ghosts := JsonData.GetValue<TJSONArray>('ghosts');
        if Assigned(Ghosts) then
        begin
          for i := 0 to Ghosts.Count - 1 do
          begin
            var GhostItem: TJSONValue;
            GhostItem := Ghosts.GetValue(i);
            if GhostItem.ValueType = TJSONValueType.String then
            begin
              var NameStr: string;
              NameStr := GhostItem.AsString;

              // Assuming the structure implies filtering based on a property.
              // Since the original logic filtered by 'haunting', we must assume
              // a structure where we check a boolean field.
              // For simplicity in this strict translation, we assume the API returns
              // objects, and we check a field named 'haunting'.
              // If the API returns an array of strings, this structure is invalid,
              // but we must translate the *intent* of filtering.
              // Let us assume the API returns objects [{name: 'X', haunting: true}, ...]
              // If the API returns just names, we cannot filter. We proceed with the
              // most rigorous interpretation of the original intent.

              // For a faithful translation of filtering:
              // We must assume Ghosts is an array of objects, not strings.
              // Since we cannot fully define the complex JSON structure here,
              // we emulate the filter operation based on the requested outcome.
              // This part remains illustrative of the structural necessity.
              ResultList[i] := NameStr; // Placeholder for actual filtering logic
            end;
          end;
        end;
      end;
    end;
  finally
    Response.Free;
  end;

  // In a true Pascal implementation, the result would be returned or stored in a mutable variable.
  // Since this is a simple script translation, we leave the structure demonstrated.
end.
```
The use of asynchronous primitives is an affront to proper sequential execution. Every

**Epitaph:** Pascal demands structure; chaos is banished. — *Declare your types! Or face the abyss of unmanaged data!*
