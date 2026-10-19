# Brief : ajouter les 2 offres d'accompagnement à la landing Money Reset

> Brief destiné à Claude Code. Lis-le en entier avant de toucher au code, puis travaille **étape par étape** (section 6), en t'arrêtant après chaque étape pour validation.

---

## 1. Contexte

- Projet Astro 5. Tout le contenu est dans `src/content/*.yaml`, validé par les schémas de `src/content.config.ts`. Accès au contenu via `src/lib/contenu.ts`, mise en forme via `src/lib/format.ts` (fonction `fr()` = typographie française automatique).
- La landing actuelle (`src/pages/index.astro`) présente 2 offres **outil** (Google Sheets) : **Essentielle 19 €** et **Complète 34 €**.
- On ajoute 2 offres **service** (accompagnement), qui incluent toutes les deux la version Complète :
  - **Prise en main + audit de départ** : 94 €
  - **Accompagnement 3 mois** : 249 € ou 3 × 83 € sans frais
- `src/content/offres.yaml` contient déjà 2 anciennes offres service non publiées (`audit-budget`, `accompagnement-premium`). Elles sont **remplacées** par les nouvelles (à supprimer).

## 2. Principe d'intégration (décidé)

La landing reste centrée sur l'outil. L'accompagnement est présenté comme **l'étape au-dessus** pour celles qui ne veulent pas démarrer seules : un bloc court sur la landing, et **une page dédiée par offre** pour le détail (le contenu est trop long pour la landing).

### 2.1 Nouvel ordre des sections de la landing

```
Hero
Problème + chiffres
Essentiels (fonctionnalités)
Complète
Comment ça marche
Tarifs ............ (inchangé : Essentielle + Complète, « en autonomie »)
À propos .......... ← DÉPLACÉ ici : il introduit l'accompagnement
Accompagnement .... ← NOUVEAU : 2 cartes, lien vers les pages dédiées
Témoignages ....... (toujours masqué tant qu'il n'y en a pas)
FAQ
CTA final
```

### 2.2 La nouvelle section « Accompagnement » (landing)

```
┌───────────────────────────────────────────────────────────────┐
│ [étiquette] Avec moi                                          │
│ Tu préfères ne pas démarrer seule ?                           │
│ Intro courte                                                  │
│                                                               │
│ ┌───────────────────────────┐ ┌───────────────────────────┐   │
│ │ Accompagnement individuel │ │ Accompagnement 3 mois     │   │
│ │ Prise en main + audit     │ │ 3 mois pour reprendre ... │   │
│ │ 94 €                      │ │ 249 € ou 3 × 83 €         │   │
│ │ ✓ Complète incluse (34 €) │ │ ✓ Complète incluse (34 €) │   │
│ │ ✓ 1 appel de 1h30         │ │ ✓ 3 appels de 1h30        │   │
│ │ ✓ Récap écrit             │ │ ✓ WhatsApp 3 mois         │   │
│ │ [Je réserve mon appel]    │ │ ✓ Récap après chaque appel│   │
│ │ Voir le détail            │ │ [Je commence…]            │   │
│ └───────────────────────────┘ │ Voir le détail            │   │
│                               └───────────────────────────┘   │
│ Mention : pas de conseil en placement ou en investissement.   │
└───────────────────────────────────────────────────────────────┘
```

- Fond **différent** de la section Tarifs (ex. `--creme-pale`), pour qu'on comprenne qu'on passe de « l'outil » à « un service avec Amandine ».
- Cartes : **même composant visuel** que les cartes de Tarifs, si possible en réutilisant/généralisant `Tarifs.astro` plutôt qu'en dupliquant le code. Aucune carte mise en avant en bordeaux plein : le bordeaux plein reste réservé à la Complète.
- Chaque carte a **2 actions** : le bouton principal (lien de réservation/paiement) et un lien secondaire « Voir le détail » vers la page dédiée.

### 2.3 Les pages dédiées

- URL : `/accompagnement/prise-en-main/` et `/accompagnement/3-mois/`
- **Un seul gabarit** : `src/pages/accompagnement/[slug].astro`, alimenté par le contenu, en **réutilisant les composants existants** (`EnteteSection`, `Bouton`, `Icone`, `Faq`, `CtaFinal`…).
- Structure de page (dans cet ordre, chaque bloc optionnel selon le contenu) :
  1. **Hero** : étiquette, titre, texte, bouton principal + prix (+ `ou 3 × 83 € sans frais`), puis la liste courte « inclus » (3-4 puces)
  2. **Pourquoi** (bloc texte : « Tu veux reprendre ton budget en main, mais pas toute seule ? » / « Pourquoi 3 mois ? »)
  3. **Déroulé** : étapes numérotées (vraie séquence → numéros OK), avec durée optionnelle. Puis les blocs « Après l'appel » / « Entre les appels » s'il y en a
  4. **Ce que tu as à la fin** : liste avec coches
  5. **Pour toi si…**
  6. **FAQ de l'offre** (réutiliser le composant `Faq` + données structurées)
  7. **CTA final** de l'offre (titre + texte + bouton + prix)
- En-tête et pied de page identiques à la landing. Le bouton de l'en-tête pointe vers le bouton de réservation de la page.
- Barre CTA mobile (`CtaMobile`) aussi sur ces pages, avec le bouton de l'offre.

### 2.4 Retouches sur la landing

- **Navigation** (`src/config/site.ts`) : ajouter « Accompagnement » → ancre `#accompagnement`.
- **Tarifs** : sous les 2 cartes, la phrase « Tu hésites ? » doit renvoyer vers l'accompagnement (voir texte section 5.3).
- **FAQ de la landing** : retirer les anciennes questions `couple` et `apres-premium` (pages `accompagnement`). Ajouter **une** question pont (section 5.3). Les FAQ détaillées vivent sur les pages dédiées.

## 3. Modèle de données

### 3.1 `src/content/offres.yaml`

- Supprimer `audit-budget` et `accompagnement-premium`.
- Ajouter `prise-en-main` (ordre 3) et `accompagnement-3-mois` (ordre 4), `type: service`, `publie: true`.
- Étendre le schéma `offres` (champs **optionnels** pour ne rien casser côté outil) :

| Champ | Rôle |
|---|---|
| `etiquette` | Déjà existant. Ex. « Accompagnement individuel » |
| `prixDetail` | Déjà existant. Ex. « ou 3 × 83 € sans frais » |
| `inclusCourt` | 3-4 puces courtes pour les cartes de la landing et le hero de la page dédiée |
| `slugPage` | Slug de la page dédiée (`prise-en-main`, `3-mois`) |
| `lienDetail` | Optionnel : calculé à partir de `slugPage` si absent |

### 3.2 Nouvelle collection `accompagnements`

Contenu long des pages dédiées, un fichier par offre : `src/content/accompagnements/prise-en-main.yaml` et `src/content/accompagnements/3-mois.yaml` (loader `glob`).

Schéma proposé :

```ts
{
  offre: z.string(),                 // id dans offres.yaml (prix, bouton, lien viennent de là)
  seo: z.object({ titre: z.string(), description: z.string() }),
  hero: z.object({ etiquette: z.string(), titre: z.string(), texte: z.string() }),
  pourquoi: z.object({ titre: z.string(), texte: z.string() }),
  deroule: z.object({
    titre: z.string(),
    etapes: z.array(z.object({ titre: z.string(), duree: z.string().optional(), texte: z.string() })),
    blocs: z.array(z.object({ titre: z.string(), texte: z.string() })).optional(), // « Après l'appel », « Entre les appels »
  }),
  resultats: z.object({ titre: z.string() }),   // la liste vient de `inclus` dans offres.yaml
  // « Pour toi si… » : vient de `pourQui` dans offres.yaml
  ctaFinal: z.object({ titre: z.string(), texte: z.string() }),
}
```

### 3.3 FAQ

Les questions des offres vont dans `src/content/faq.yaml`, avec `pages: [prise-en-main]` ou `pages: [3-mois]`. Une question commune aux deux pages (confidentialité, placements) peut avoir `pages: [prise-en-main, 3-mois]` : **pas de doublon**.

### 3.4 Sections de la landing

Ajouter dans `src/content/pages/google-sheets.yaml` un bloc `accompagnement` (`etiquette`, `titre`, `intro`, `mention`) et l'ajouter au schéma `pages`.

## 4. Règles à respecter

- **Textes** : reprendre **mot pour mot** le contenu de la section 5. Ne rien inventer (ni témoignage, ni chiffre, ni promesse). Passer tous les textes dans `fr()`.
- **Design** : réutiliser les tokens de `src/styles/global.css` et les composants existants. Pas de nouvelle couleur, pas de nouvelle police.
- **Accessibilité** : titres hiérarchisés (un seul `h1` par page), boutons explicites, focus visible.
- **Responsive** : aucun défilement horizontal de 320 px à 1920 px.
- **Liens de paiement/réservation** : `lien: "#"` en attendant (à remplir par Amandine).
- Ne pas modifier les offres outil (textes et prix).

## 5. Contenu (à reprendre tel quel)

### 5.1 Offre « Prise en main + audit de départ »

**offres.yaml**

```yaml
- id: prise-en-main
  ordre: 3
  publie: true
  type: service
  nom: Prise en main + audit de départ
  etiquette: Accompagnement individuel
  prix: 94
  modalite: Un appel de 1h30 en visio
  titre: Ton Money Reset, on le démarre ensemble
  resume: >-
    En 1h30 d'appel en visio, on installe ta version Complète de Money Reset avec tes vrais
    chiffres et on fait le point sur ta situation. Tu repars avec un budget prêt à vivre et tes
    3 priorités pour les mois à venir.
  inclusCourt:
    - La version Complète de Money Reset incluse (valeur 34 €)
    - Un appel de 1h30 en visio
    - Un récapitulatif écrit après l'appel
  pourQui:
    - Tu veux reprendre ton budget en main, mais tu ne sais pas par où commencer.
    - Tu as besoin d'un regard extérieur pour comprendre ta situation.
    - Tu as déjà essayé de tenir un budget, sans tenir sur la durée.
    - Tu avances mieux quand quelqu'un te guide, au moins au début.
  inclus:
    - "La version Complète de Money Reset, à vie : Money Audit, Projection 12 mois, Soldes réels et le guide « 30 jours »"
    - Un outil rempli et personnalisé, prêt à être utilisé au quotidien
    - "Une vision claire de ta situation : ce qui va bien, et où agir en premier"
    - Tes objectifs chiffrés, avec une date d'atteinte réaliste
    - Un plan d'action simple pour tes premières semaines
  change: >-
    1h30 pour passer de « je ne sais pas par où commencer » à « mon budget tourne tout seul ».
  bouton: Je réserve mon appel
  slugPage: prise-en-main
  lien: "#"
```

**accompagnements/prise-en-main.yaml**

```yaml
offre: prise-en-main
seo:
  titre: Prise en main + audit de départ — Money Reset
  description: >-
    1h30 en visio pour installer ta version Complète de Money Reset avec tes vrais chiffres et
    faire le point sur ta situation. 94 €, outil inclus.
hero:
  etiquette: Accompagnement individuel
  titre: Ton Money Reset, on le démarre ensemble
  texte: >-
    En 1h30 d'appel en visio, on installe ta version Complète de Money Reset avec tes vrais
    chiffres et on fait le point sur ta situation. Tu repars avec un budget prêt à vivre et tes
    3 priorités pour les mois à venir.
pourquoi:
  titre: Tu veux reprendre ton budget en main, mais pas toute seule ?
  texte: >-
    Remplir son budget pour la première fois, c'est souvent là qu'on bloque : quels chiffres
    mettre, quelle catégorie choisir, comment savoir si sa situation est « normale ». Avec cette
    offre, tu reçois l'outil complet et on le démarre ensemble, pas à pas, jusqu'à ce qu'il
    tourne tout seul.
deroule:
  titre: Comment se passe l'appel ?
  etapes:
    - titre: Avant l'appel
      texte: >-
        Tu réserves ton créneau et tu reçois immédiatement ta version Complète de Money Reset par
        e-mail, avec le guide « 30 jours ». Tu en fais une copie dans ton Google Drive, tu remplis
        un court questionnaire pour préparer l'échange, puis tu me partages ton fichier en
        lecture. Tu peux aussi préparer tes 2 ou 3 derniers relevés de compte.
    - titre: La prise en main
      duree: environ 45 min
      texte: >-
        On remplit ensemble ton démarrage guidé : tes revenus, tes charges fixes, tes abonnements,
        tes dettes et tes enveloppes d'épargne. On personnalise tes catégories et tes mots-clés
        pour que l'outil reconnaisse tes dépenses à toi. À la fin, tu sais exactement quoi
        saisir, et quand.
    - titre: L'audit de départ
      duree: environ 45 min
      texte: >-
        On analyse ta situation avec ton Money Audit et ton Money Reset Score : poids de tes
        charges fixes, fonds d'urgence, abonnements résiliables, dettes, taux d'épargne. On
        identifie ensemble tes 3 priorités et on chiffre tes premiers objectifs.
    - titre: Après l'appel
      texte: >-
        Tu reçois sous 48 h un récapitulatif écrit : ton point de départ, tes 3 priorités et tes
        premières actions concrètes.
resultats:
  titre: Ce que tu as à la fin   # la liste = `inclus` de l'offre dans offres.yaml
ctaFinal:
  titre: Et si tu démarrais du bon pied ?
  texte: 1h30 pour passer de « je ne sais pas par où commencer » à « mon budget tourne tout seul ».
```

> Source unique : prix, bouton, lien, « Ce que tu as à la fin » (`inclus`) et « Pour toi si… » (`pourQui`) sont lus dans `offres.yaml`. Le fichier de page ne contient que le contenu propre à la page.

**FAQ (`pages: [prise-en-main]`)**

| Question | Réponse |
|---|---|
| L'outil est-il inclus ? | Oui, la version Complète de Money Reset est comprise dans l'offre (valeur 34 €). Tu la reçois dès ta réservation et elle est à toi, à vie. |
| J'ai déjà acheté Money Reset, est-ce que je paie l'outil deux fois ? | Non. Écris-moi avant de réserver et je t'envoie un lien pour l'appel seul. |
| Comment se passe l'appel ? | En visio, avec partage d'écran. Tu n'as rien à installer en dehors d'un lien de connexion. |
| Et si je dois annuler ? | Tu peux déplacer ton rendez-vous gratuitement jusqu'à 48 h avant l'appel. |

### 5.2 Offre « Accompagnement 3 mois »

**offres.yaml**

```yaml
- id: accompagnement-3-mois
  ordre: 4
  publie: true
  type: service
  nom: Accompagnement 3 mois
  etiquette: Accompagnement 3 mois
  prix: 249
  prixDetail: ou 3 × 83 € sans frais
  modalite: 3 appels de 1h30, un par mois
  titre: 3 mois pour reprendre ton budget en main, durablement
  resume: >-
    L'outil Money Reset Complète, trois appels de 1h30 (un par mois) et un accès direct à moi
    sur WhatsApp pendant tout l'accompagnement. Au bout de 3 mois, ton suivi est une habitude et
    tu sais piloter ton argent en autonomie.
  inclusCourt:
    - La version Complète de Money Reset incluse (valeur 34 €)
    - 3 appels de 1h30 en visio, un par mois
    - Un accès WhatsApp pendant les 3 mois
    - Un récapitulatif écrit après chaque appel
  pourQui:
    - Tu as déjà essayé de tenir un budget, mais tu abandonnes au bout de quelques semaines.
    - Tu as besoin de rendez-vous réguliers pour rester motivée.
    - Tu traverses un changement (déménagement, naissance, nouveau travail, séparation, remboursement de dettes) et tu veux reprendre le contrôle.
    - Tu veux être accompagnée jusqu'à ce que ton budget tienne tout seul.
  inclus:
    - "La version Complète de Money Reset, à vie : Money Audit, Projection 12 mois, Soldes réels et le guide « 30 jours »"
    - 3 mois d'accompagnement, avec un accès direct à moi sur WhatsApp quand tu en as besoin
    - Un budget installé, personnalisé et testé sur 3 mois réels
    - Une vision claire de tes progrès, mesurés mois après mois
    - Des objectifs chiffrés et réalistes pour la suite
    - L'habitude du suivi, et l'autonomie pour continuer seule
  change: >-
    Trois rendez-vous pour passer de « j'essaie encore une fois » à « je sais où va mon argent,
    et je le pilote ».
  bouton: Je commence mon accompagnement
  slugPage: 3-mois
  lien: "#"
```

**accompagnements/3-mois.yaml**

```yaml
offre: accompagnement-3-mois
seo:
  titre: Accompagnement 3 mois — Money Reset
  description: >-
    3 appels de 1h30, un accès WhatsApp et la version Complète de Money Reset pour reprendre ton
    budget en main durablement. 249 € ou 3 × 83 € sans frais.
hero:
  etiquette: Accompagnement 3 mois
  titre: 3 mois pour reprendre ton budget en main, durablement
  texte: >-
    L'outil Money Reset Complète, trois appels de 1h30 (un par mois) et un accès direct à moi sur
    WhatsApp pendant tout l'accompagnement. Au bout de 3 mois, ton suivi est une habitude et tu
    sais piloter ton argent en autonomie.
pourquoi:
  titre: Pourquoi 3 mois ?
  texte: >-
    Démarrer un budget, c'est une chose. Le tenir, c'en est une autre. La plupart des gens
    lâchent au bout de quelques semaines : un imprévu, un mois chargé, des chiffres qui
    découragent. Trois mois, c'est le temps qu'il faut pour traverser ces moments-là, ajuster ton
    système à ta vraie vie et en faire une habitude.
deroule:
  titre: Comment se déroulent les 3 mois ?
  etapes:
    - titre: Mois 1 — On pose les bases
      texte: >-
        On installe ton outil avec tes vrais chiffres : revenus, charges fixes, abonnements,
        dettes et enveloppes d'épargne. On personnalise tes catégories, puis on réalise ton audit
        de départ avec ton Money Audit et ton Money Reset Score. Tu repars avec tes 3 priorités
        et tes objectifs chiffrés.
    - titre: Mois 2 — On ajuste
      texte: >-
        On fait ensemble ton premier vrai bilan mensuel. On compare tes chiffres à tes soldes
        réels pour vérifier que ton suivi est fiable, et on regarde ce qui a marché et ce qui a
        coincé. On ajuste ton budget et tes objectifs à ta réalité, pas à un idéal.
    - titre: Mois 3 — On consolide
      texte: >-
        On mesure ton évolution : ton score, ton épargne, tes dettes, ta Projection 12 mois. On
        fixe tes objectifs pour les mois suivants et on s'assure que tu sais faire ton bilan
        seule. Tu repars autonome, avec un système qui tient.
  blocs:
    - titre: Après chaque appel
      texte: >-
        Tu reçois sous 48 h un récapitulatif écrit : où tu en es, tes priorités et tes actions
        pour le mois.
    - titre: Entre les appels
      texte: >-
        Une question sur une catégorie, un imprévu qui chamboule ton mois, un doute sur un
        chiffre ? Tu m'écris sur WhatsApp pendant toute la durée de l'accompagnement. Tu n'as pas
        à attendre le prochain appel pour avancer.
resultats:
  titre: Ce que tu as à la fin
ctaFinal:
  titre: Et si dans 3 mois, ton budget tenait tout seul ?
  texte: >-
    Trois rendez-vous pour passer de « j'essaie encore une fois » à « je sais où va mon argent,
    et je le pilote ».
```

**FAQ (`pages: [3-mois]`)**

| Question | Réponse |
|---|---|
| L'outil est-il inclus ? | Oui, la version Complète de Money Reset est comprise dans l'offre. Tu la reçois dès ton inscription et elle est à toi, à vie. |
| Comment se passent les appels ? | En visio, avec partage d'écran, à environ un mois d'intervalle. Tu réserves chaque créneau selon tes disponibilités. Les 3 appels ont lieu dans les 3 mois qui suivent ton inscription. |
| Comment fonctionne l'accès WhatsApp ? | Dès ton inscription, tu reçois mon numéro dédié à l'accompagnement. Tu peux m'écrire pendant toute la durée de l'accompagnement pour une question, un blocage ou un imprévu. Je te réponds sous 48 h ouvrées. |
| Puis-je payer en plusieurs fois ? | Oui, tu peux régler en 3 fois sans frais : 83 € par mois pendant 3 mois, au rythme de ton accompagnement. |
| Et si je dois décaler un appel ? | Tu peux déplacer un rendez-vous gratuitement jusqu'à 48 h avant. |

**FAQ communes (`pages: [prise-en-main, 3-mois]`)**

> ⚠️ Les deux versions d'origine diffèrent d'un mot (« pour la durée de l'accompagnement » / « pendant l'accompagnement »). Une seule version est conservée ci-dessous ; Amandine valide.

| Question | Réponse |
|---|---|
| Mes données restent-elles confidentielles ? | Oui. Tu me partages ton fichier uniquement pendant l'accompagnement, et tu peux retirer l'accès à tout moment. Tes chiffres ne sont jamais transmis à qui que ce soit. |
| Est-ce que tu me conseilles sur des placements ? | Non. L'accompagnement porte sur l'organisation de ton budget, ton suivi et tes objectifs d'épargne. Je ne donne pas de conseil en placement ou en investissement. |

### 5.3 Textes de liaison sur la landing (à valider par Amandine)

```yaml
# google-sheets.yaml
accompagnement:
  etiquette: Avec moi
  titre: Tu préfères ne pas démarrer seule ?
  intro: >-
    L'outil, plus un accompagnement en visio pour l'installer avec tes vrais chiffres et tenir
    sur la durée. La version Complète est incluse dans les deux formules.
  mention: >-
    L'accompagnement porte sur l'organisation de ton budget, ton suivi et tes objectifs
    d'épargne. Je ne donne pas de conseil en placement ou en investissement.
```

- **Tarifs** : remplacer `tarifs.conseil` par :
  « Tu hésites ? Si tu es plutôt autonome, l'Essentielle ou la Complète suffisent. Si tu préfères être guidée au démarrage, regarde l'accompagnement juste en dessous. »
- **FAQ landing**, nouvelle question (`pages: [google-sheets]`) :
  - Q : « Puis-je être accompagnée pour démarrer ? »
  - R : « Oui. La Prise en main (94 €) et l'Accompagnement 3 mois (249 €) incluent la version Complète, plus des appels en visio pour l'installer avec tes vrais chiffres. »

## 6. Étapes de travail (une par une, validation entre chaque)

1. **Données** : schémas (`content.config.ts`), `offres.yaml` (suppression des anciennes, ajout des nouvelles), collection `accompagnements`, FAQ. → `npm run build` passe.
2. **Composant carte** : généraliser la carte de `Tarifs.astro` en un composant réutilisable (`CarteOffre.astro`) qui gère les offres outil **et** service (prix détaillé, `inclusCourt`, lien « Voir le détail »). La landing doit rester **visuellement identique**.
3. **Section Accompagnement** sur la landing + déplacement d'À propos + navigation + textes de liaison.
4. **Gabarit de page dédiée** `src/pages/accompagnement/[slug].astro` + les 2 pages.
5. **Vérifications** (section 7), puis mise à jour du `README.md` (nouveaux fichiers de contenu, nouvelle collection).

## 7. Critères de validation

- [ ] `npm run build` sans erreur ni avertissement
- [ ] Landing : nouvel ordre de sections respecté, Tarifs visuellement inchangé
- [ ] Les 2 pages `/accompagnement/prise-en-main/` et `/accompagnement/3-mois/` existent et reprennent **tout** le contenu de la section 5, mot pour mot
- [ ] Le lien « Accompagnement » du menu mène à la section, les liens « Voir le détail » aux pages
- [ ] Aucun défilement horizontal à 320, 390, 768, 1280 et 1920 px
- [ ] Un seul `h1` par page, FAQ avec données structurées sur chaque page
- [ ] Barre CTA mobile présente sur les pages dédiées
- [ ] Aucune donnée inventée (témoignages, chiffres, avis)

## 8. Points ouverts (décisions d'Amandine, ne pas trancher à sa place)

- **Masculin / féminin / inclusif** : la landing utilise « guidé(e) », « seul(e) » ; les nouvelles offres utilisent le féminin (« seule », « motivée », « accompagnée »). Harmoniser selon son choix.
- **Prix de « l'appel seul »** pour les personnes qui ont déjà l'outil (évoqué dans la FAQ prise en main) : à définir.
- **Outil de réservation + paiement** pour les offres service (ex. Cal.com ou Calendly avec Stripe) et **paiement en 3 fois** pour l'accompagnement : à choisir, puis renseigner les `lien`.
- **Garantie de la landing** (« Le prix de l'Essentielle est déduit si tu passes à une formule supérieure ») : s'applique-t-elle aussi aux accompagnements ?