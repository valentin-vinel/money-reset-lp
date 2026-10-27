# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Landing page statique (Astro 7, TypeScript strict) qui vend les outils Google Sheets « Money Reset » (formules Essentielle et Complète). Tout le projet est en français : contenu, noms de composants, props, variables CSS, commentaires et messages de commit. Garder cette convention. Les textes s'adressent à la lectrice au féminin (« accompagnée », « seule »), sans écriture inclusive « (e) ».

## Commandes

```bash
npm run dev      # http://localhost:4321
npm run build    # génère dist/ ; valide aussi tout le contenu YAML via les schémas
npm run preview  # sert dist/
```

Il n'y a ni tests ni linter. `npm run build` sert de vérification : il échoue si un YAML ne respecte pas `src/content.config.ts`, si une icône est inconnue, etc.

## Architecture

**Le contenu est séparé du code.** Les textes vivent dans `src/content/*.yaml` (collections Astro chargées avec `file()`/`glob()`, schémas Zod dans `src/content.config.ts`). Une modification de texte se fait dans le YAML, pas dans les composants.

- `pages/<id>.yaml` contient les textes propres à une page (hero, sections, SEO). `src/pages/index.astro` charge `page('google-sheets')` et transmet chaque bloc à son composant de section (souvent en `{...p.hero}`). Ajouter un champ demande donc de modifier à la fois le schéma `pages`, le YAML et les props du composant.
- Les collections partagées (`offres`, `fonctionnalites`, `faq`, `temoignages`) se lisent **uniquement** via `src/lib/contenu.ts`, qui applique le tri par `ordre` et les filtres : `publie`, `brouillon`, `type` (`outil`/`service`), `formule`, et `pages` pour la FAQ. Ne pas appeler `getCollection` directement dans les pages.
- Les offres de type `service` (Prise en main, Accompagnement 3 mois) s'affichent sur la landing uniquement dans la grille des tarifs, à côté des outils (`offresPubliees()` sans filtre). Le reste de la page (prix minimum, CTA final, section Complète) ne travaille qu'avec `offresPubliees('outil')`. La grille Tarifs crée une colonne par offre en desktop, passe en 2 × 2 sous 80rem et en carrousel horizontal sous 52rem.
- La section Témoignages ne s'affiche que s'il existe au moins un témoignage publié.
- Pages légales : `src/content/legal/*.md` (collection `legal`, frontmatter `titre`, `description`, `miseAJour`), rendues par `src/pages/[legal].astro` (URL = nom du fichier). La typographie française est appliquée au HTML rendu par `frDansHtml()`, le moteur Markdown d'Astro 7 n'acceptant plus les plugins rehype sans dépendance. Liens du pied de page : `pagesLegales` dans `src/config/site.ts`.
- **E-mail après achat** : le site est statique sauf `src/pages/api/` (`prerender = false`, adaptateur `@astrojs/cloudflare`, déployé en Worker Cloudflare, réglages dans `wrangler.jsonc`). `stripe-webhook.ts` reçoit `checkout.session.completed`, retrouve l'offre en comparant l'URL du lien de paiement Stripe aux liens de `offres.yaml` (`offreDuLien()`), compose l'e-mail (`src/lib/email.ts`, HTML à styles en ligne + texte) depuis `emails.yaml` (id = id de l'offre) et `fichiers.yaml` (un fichier peut avoir un lien par `couleurs`, choisi d'après la liste déroulante « Choisis ton coloris » de la page de paiement Stripe, lue dans `session.custom_fields`), puis l'envoie par l'API transactionnelle Brevo (`fetch`, expéditeur et réponse : le Gmail de la marque). Toute erreur renvoie 500 pour que Stripe réessaie ; une `url` vide dans `fichiers.yaml` bloque volontairement l'envoi. Secrets via `astro:env` (schéma dans `astro.config.mjs`). `apercu-email.ts` affiche les e-mails en dev seulement.
- La page `/score` (`src/pages/score.astro` → `sections/TestScore.astro`) est un test en 10 questions qui calcule un Money Reset Score indicatif, entièrement dans le navigateur. Textes, piliers, barème et niveaux sont dans `src/content/score.yaml` (collection `score`, lue via `testScore()`). Le schéma vérifie la cohérence du barème : chaque pilier doit pouvoir atteindre son `max` et le total doit faire 100.

**Typographie française** : les textes issus du contenu passent par `fr()` ou `frHtml()` (`src/lib/format.ts`). Ces fonctions ajoutent les espaces insécables avant `? ! ; : » € %` et transforment les apostrophes en apostrophes typographiques. `frHtml` gère en plus le gras Markdown `**…**`. Ne jamais saisir ces espaces à la main dans le YAML. Utiliser `prix()` pour les montants et `url()` pour les chemins internes (ce helper respecte `BASE_URL`).

**Listes fermées synchronisées à deux endroits** :
- Icônes : ajouter le tracé SVG dans `traces` de `src/components/ui/Icone.astro`, puis le nom dans `icones` de `content.config.ts` si l'icône doit être utilisable depuis le YAML.
- Visuels (maquettes de l'outil dans `src/components/visuels/`) : créer le composant, l'enregistrer dans `Visuel.astro`, puis ajouter son nom à `visuels` dans `content.config.ts`. Une fonctionnalité avec `visuel:` s'affiche en grand. Les maquettes s'appuient sur `FenetreSheet.astro`, le cadre tableur. Leur code couleur suit celui de l'outil : jaune crème pour les cases à remplir, bleu pâle pour les cases calculées.

**Styles** : les design tokens (couleurs du logo `--bordeaux`, `--bleu`, `--creme` et leurs dérivées, polices Gloock / Parisienne / Figtree via @fontsource, espacements, rayons, ombres) sont dans `src/styles/global.css`. Chaque composant porte son CSS scopé et ses classes suivent un style BEM (`entete-section__intro`). Réutiliser les variables plutôt que des valeurs en dur.

Les réglages généraux (nom, marque, autrice, e-mail, réseaux, menu d'ancres) sont dans `src/config/site.ts`. Le domaine (`site`) est dans `astro.config.mjs` ; il sert à construire l'URL canonique et l'image OG dans `Base.astro`.

## À compléter avant la mise en ligne (repris du README)

- E-mail après achat : liens de `fichiers.yaml`, secrets du Worker Cloudflare et webhook Stripe (étapes dans le README)
- Réponse FAQ « Puis-je être remboursée ? » (passer ensuite `brouillon: false`)
- Pages légales en ligne (`src/content/legal/*.md`) : ajouter dans Stripe la case de renonciation au droit de rétractation citée à l'article 8.1 des CGV
