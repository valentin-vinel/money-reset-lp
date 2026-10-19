# Money Reset — landing page Google Sheets (Astro)

Landing page de conversion pour les deux outils Google Sheets (Essentielle et Complète).
Les offres d'accompagnement (Prise en main, Accompagnement 3 mois) s'affichent dans la grille des tarifs, à côté des outils.

## Lancer le site

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # site statique dans dist/ (à déposer sur Netlify, Vercel, o2switch…)
```

## Modifier les textes : tout est dans `src/content/`

| Fichier | Contenu |
|---|---|
| `pages/google-sheets.yaml` | Textes propres à la landing : hero, chiffres clés, titres de sections, étapes, CTA final, SEO |
| `offres.yaml` | Les 4 offres : prix, liste « inclus », « pour qui », bouton, **lien de paiement**, `publie` |
| `fonctionnalites.yaml` | Ce que fait l'outil. `formule: essentielle` ou `complete`, `visuel:` pour l'afficher en grand |
| `faq.yaml` | Questions/réponses, avec les pages où elles apparaissent ; `brouillon: true` pour masquer |
| `temoignages.yaml` | Vrais retours clients. La section n'apparaît qu'avec au moins un témoignage publié |

Pas besoin de gérer les espaces insécables (avant `? ! : €`…) ni les apostrophes : c'est automatique.
Si un champ est manquant ou mal écrit, `npm run build` s'arrête et indique lequel (schémas dans `src/content.config.ts`).

## Architecture

```
src/
├── content/              ← les textes (YAML)
├── content.config.ts     ← schémas de validation du contenu
├── config/site.ts        ← nom, menu, e-mail, réseaux
├── lib/
│   ├── contenu.ts        ← lecture du contenu (tri, filtres publié/brouillon)
│   └── format.ts         ← typographie française, prix, liens
├── styles/global.css     ← couleurs, polices, espacements (variables CSS)
├── layouts/Base.astro    ← <head>, SEO, polices
├── components/
│   ├── ui/               ← Bouton, Icone, EnteteSection
│   ├── sections/         ← une section de page = un composant
│   └── visuels/          ← maquettes illustrées de l'outil (données d'exemple)
└── pages/index.astro     ← assemble la landing
```

Pour créer une future page (ex. accompagnement) : un nouveau `src/content/pages/accompagnement.yaml`,
une page `src/pages/accompagnement.astro` qui réutilise les sections, et `offresPubliees('service')`.

## Couleurs (reprises du logo)

| Variable | Couleur | Usage |
|---|---|---|
| `--bordeaux` | `#571534` | Texte, boutons, panneaux forts |
| `--bleu` | `#74A4D0` | Accents, graphiques |
| `--creme` | `#FFF2AC` | Badges, mises en avant |
| `--jaune` | `#F5CF3D` | Bordures des bulles du hero |
| `--bleu-pale`, `--bleu-voile`, `--creme-pale` | dérivées | Fonds de sections |

Dans les maquettes, le jaune crème = cases à remplir et le bleu pâle = cases calculées, comme dans l'outil.

## À compléter avant la mise en ligne

- [ ] Liens de paiement : champ `lien` de chaque offre dans `offres.yaml` (actuellement `#`)
- [ ] Adresse du site : `site` dans `astro.config.mjs`
- [ ] Réponse « Puis-je être remboursée ? » dans `faq.yaml` (puis `brouillon: false`)
- [ ] Optionnel : remplacer les maquettes par de vraies captures de l'outil (`src/components/visuels/`)
- [ ] Optionnel : ajouter de vrais témoignages dans `temoignages.yaml`
- [ ] Mentions légales / CGV (obligatoires pour vendre en ligne)
