/**
 * Réglages généraux du site (nom, navigation, liens).
 * Les textes des pages sont dans src/content/.
 */
export const site = {
  nom: 'Money Reset',
  marque: 'Sheep ton orga',
  autrice: 'Amandine',
  /** Adresse de contact affichée dans le pied de page (laisser vide pour masquer). */
  email: '',
  /** Liens réseaux sociaux (laisser vide pour masquer). */
  instagram: '',
} as const;

/** Liens du pied de page vers les pages légales (textes : src/content/legal/). */
export const pagesLegales = [
  { libelle: 'Mentions légales', chemin: 'mentions-legales' },
  { libelle: 'CGV', chemin: 'cgv' },
  { libelle: 'Confidentialité', chemin: 'confidentialite' },
] as const;

/** Liens du menu (ancres de la page d'accueil). */
export const navigation = [
  { libelle: 'Fonctionnalités', ancre: 'fonctionnalites' },
  { libelle: 'Comment ça marche', ancre: 'comment-ca-marche' },
  { libelle: 'Formules', ancre: 'formules' },
  { libelle: 'FAQ', ancre: 'faq' },
] as const;
