# TODO

## 1. Choix du coloris dans les cartes tarifs

Chaque fichier existe en 3 coloris : bleu, rose, neutre. Ajouter un select dans chaque carte de `Tarifs.astro` pour choisir la couleur avant le paiement.

- [ ] Déclarer les coloris dans le contenu (schéma `offres` et `offres.yaml`)
- [ ] Ajouter le select dans la carte tarif (accessible, avec un libellé)
- [ ] Faire pointer le bouton vers le lien de paiement du coloris choisi

Questions ouvertes :
- Un coloris par défaut, ou un choix obligatoire ?
- Un aperçu visuel du coloris (pastille, capture) à côté du select ?
- Quels coloris pour quelles offres : les 3 pour l'Essentielle comme pour la Complète ?

## 2. Paiement Stripe

- [ ] Créer les produits et les prix dans Stripe
- [ ] Brancher les boutons des cartes tarifs (champ `lien` dans `offres.yaml`)
- [ ] Configurer la redirection après paiement vers une page de confirmation

Questions ouvertes :
- Payment Links (sans serveur, reste compatible avec un site statique) ou Checkout avec une fonction serverless ?
- Comment transmettre le coloris : un Payment Link par couple formule × coloris (6 liens), ou un champ personnalisé dans le Checkout ?

## 3. Envoi automatique de l'e-mail après paiement

Après le paiement, l'acheteur reçoit automatiquement un e-mail avec le lien du dossier Google Drive de sa formule et de son coloris. Le dossier contient le fichier à copier, des fichiers d'exemple et le guide d'utilisation.

- [ ] Préparer un dossier Drive par couple formule × coloris (6 dossiers), en partage « lecture seule »
- [ ] Rédiger le modèle d'e-mail (objet, texte, lien du dossier, contact en cas de souci)
- [ ] Écrire la fonction serverless qui reçoit le webhook Stripe `checkout.session.completed`, vérifie sa signature, retrouve le produit acheté et envoie l'e-mail
- [ ] Stocker les secrets en variables d'environnement (clé Stripe, secret du webhook, clé du service d'e-mail), jamais dans le code
- [ ] Vérifier le domaine auprès du service d'e-mail (enregistrements DNS SPF / DKIM)
- [ ] Créer la page de confirmation sur le site (« Regarde ta boîte mail », que faire si rien n'arrive)
- [ ] Tester tout le parcours en mode test Stripe

Choix retenu : webhook Stripe + fonction serverless, sans outil no-code. Pile gratuite envisagée :
- Hébergement et fonction : Cloudflare Pages (site statique + Pages Functions, usage commercial autorisé en gratuit)
- Envoi des e-mails : Resend (offre gratuite, environ 3 000 e-mails par mois et 100 par jour)

Prérequis :
- [ ] Migrer de Vercel vers Cloudflare Pages avant d'activer les paiements : l'offre gratuite de Vercel (Hobby) interdit l'usage commercial
- [ ] Acheter le domaine (money-reset.fr non encore acheté), puis créer l'adresse d'expédition (par exemple bonjour@money-reset.fr)
- Le dossier Drive reste accessible à toute personne qui a le lien : est-ce acceptable, ou faut-il partager le dossier avec l'e-mail de l'acheteur ?

## 4. Page Score

Nouvelle page inspirée du fichier HTML que tu vas déposer à la racine du projet.

- [ ] Analyser le fichier HTML de référence
- [ ] Créer `src/content/pages/score.yaml` et `src/pages/score.astro` en réutilisant les sections existantes
- [ ] Ajouter la page au menu ou aux liens si nécessaire

Questions ouvertes :
- Quel rôle pour la page : un quiz interactif (calcul du score dans le navigateur) ou une présentation du Money Reset Score ?
- Faut-il collecter un e-mail en échange du résultat ?

## Avant la mise en ligne (repris du README)

- [ ] Liens de paiement (voir point 2)
- [ ] Domaine final : `site` dans `astro.config.mjs`
- [ ] Réponse FAQ « Puis-je être remboursé(e) ? », puis `brouillon: false`
- [ ] Prix Premium : 247 € ou 249 €
- [ ] Mentions légales / CGV
