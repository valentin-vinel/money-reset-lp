# Money Reset — landing page Google Sheets (Astro)

Landing page de conversion pour les deux outils Google Sheets (Essentielle et Complète).
Les offres d'accompagnement (Prise en main, Accompagnement 3 mois) s'affichent dans la grille des tarifs, à côté des outils.

## Lancer le site

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ : pages statiques + Worker Cloudflare (déployé automatiquement à chaque push)
```

## Modifier les textes : tout est dans `src/content/`

| Fichier | Contenu |
|---|---|
| `pages/google-sheets.yaml` | Textes propres à la landing : hero, chiffres clés, titres de sections, étapes, CTA final, SEO |
| `offres.yaml` | Les 4 offres : prix, liste « inclus », « pour qui », bouton, **lien de paiement**, `publie` |
| `fonctionnalites.yaml` | Ce que fait l'outil. `formule: essentielle` ou `complete`, `visuel:` pour l'afficher en grand |
| `faq.yaml` | Questions/réponses, avec les pages où elles apparaissent ; `brouillon: true` pour masquer |
| `temoignages.yaml` | Vrais retours clients. La section n'apparaît qu'avec au moins un témoignage publié |
| `emails.yaml` | L'e-mail envoyé après chaque achat, un par offre (objet, textes, fichiers inclus) |
| `fichiers.yaml` | Les fichiers envoyés dans ces e-mails : outil à copier, guides PDF, exemple, avec leur lien |
| `merci.yaml` | Les pages de remerciement après l'achat (`/merci/<offre>`), une par offre |

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

## Hébergement : Cloudflare

Le site est déployé sur Cloudflare (Workers & Pages), relié au dépôt GitHub : chaque push sur `main`
le met en ligne. Le nom du projet Cloudflare doit être celui de `wrangler.jsonc` (`money-reset`).
Réglages de build : commande `npm run build`, commande de déploiement `npx wrangler deploy`.
Node 22.12 minimum.

## E-mail automatique après l'achat

À chaque paiement, Stripe prévient le site (webhook `src/pages/api/stripe-webhook.ts`, seule partie
qui tourne sur un serveur, dans un Worker Cloudflare). Le site retrouve l'offre grâce au lien de paiement utilisé et envoie
l'e-mail correspondant via Brevo, au nom de `sheeptonorga@gmail.com` (les réponses y arrivent).

Aperçu des e-mails pendant `npm run dev` : http://localhost:4321/api/apercu-email?offre=complete

Mise en route (une seule fois) :

1. **Brevo** :
   - Expéditeurs, domaines et IP dédiées → Expéditeurs → ajouter `sheeptonorga@gmail.com` et le valider
     avec le code reçu par e-mail.
   - SMTP et API → Clés API → créer une **clé API** (`xkeysib-…`).
2. **Stripe** (mode production) :
   - Développeurs → Clés API → créer une **clé restreinte** avec seulement « Payment Links : lecture ».
   - Développeurs → Webhooks → ajouter un endpoint `https://<adresse-du-site>/api/stripe-webhook`
     avec les événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`,
     puis copier son **secret de signature** (`whsec_…`).
3. **Cloudflare** → Workers & Pages → projet `money-reset` → Paramètres → Variables et secrets :
   ajouter en type **Secret** `STRIPE_SECRET_KEY` (la clé restreinte), `STRIPE_WEBHOOK_SECRET`
   (le `whsec_…`) et `BREVO_CLE_API` (la clé `xkeysib-…`), puis redéployer. En local, les mêmes
   variables vont dans un fichier `.dev.vars` (jamais commité).
4. Remplir les liens de `fichiers.yaml`. Tant qu'un lien manque, l'e-mail n'est pas envoyé et Stripe
   réessaie pendant 3 jours : rien n'est perdu, il suffit de compléter et redéployer.
5. **Page de remerciement** : dans Stripe, pour chaque lien de paiement → Modifier → Après le paiement →
   « Ne pas afficher de page de confirmation » → rediriger vers `https://<adresse-du-site>/merci/<id>`
   (`essentielle`, `complete`, `prise-en-main`, `accompagnement-3-mois`).
6. Tester avec un vrai achat de l'Essentielle, puis le rembourser depuis Stripe.

En cas de souci, Stripe → Webhooks affiche chaque envoi et le message d'erreur renvoyé par le site ;
Brevo → Transactionnel → Logs montre chaque e-mail parti (délivré, ouvert, en spam…).

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

- [x] Liens de paiement Stripe de toutes les offres (paiement en plusieurs fois via Klarna, activé dans Stripe)
- [ ] E-mail après achat : liens de `fichiers.yaml` et mise en route ci-dessus (Brevo, Stripe, Cloudflare)
- [ ] Redirection de chaque lien de paiement Stripe vers sa page `/merci/<id>` (étape 5 ci-dessus)
- [x] Adresse du site : `site` dans `astro.config.mjs` (money-reset.valentinvnl84.workers.dev, à changer si un nom de domaine est acheté)
- [ ] Optionnel : remplacer les maquettes par de vraies captures de l'outil (`src/components/visuels/`)
- [ ] Optionnel : ajouter de vrais témoignages dans `temoignages.yaml`
- [x] Mentions légales, CGV et confidentialité : `src/content/legal/` (pages /mentions-legales, /cgv, /confidentialite)
