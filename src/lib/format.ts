/**
 * Petits utilitaires de mise en forme partagés par tous les composants.
 */

const NBSP = ' ';
const NNBSP = ' '; // espace fine insécable

/**
 * Typographie française : espaces insécables avant ? ! ; : » € % et après «,
 * pour éviter qu'un signe se retrouve seul en début de ligne,
 * et apostrophes typographiques (' → ’).
 */
export function fr(texte: string): string {
  return texte
    .replace(/'/g, '\u2019')
    .replace(/\s+([?!;])/g, `${NNBSP}$1`)
    .replace(/\s+([:»€%])/g, `${NBSP}$1`)
    .replace(/«\s+/g, `«${NBSP}`)
    .replace(/(\d)\s+(×)\s+(\d)/g, `$1${NBSP}$2${NBSP}$3`)
    .replace(/(\d)\s+(étapes|jours|mois|critères|onglets)/g, `$1${NBSP}$2`);
}

/** Échappe le HTML puis applique le gras Markdown simple (**texte**). */
export function frHtml(texte: string): string {
  const echappe = texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return fr(echappe).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** 19 → « 19 € ». */
export function prix(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(montant)}${NBSP}€`;
}

/** Préfixe un chemin interne avec la base du site (utile si le site est dans un sous-dossier). */
export function url(chemin = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  return base + chemin.replace(/^\//, '');
}
