/**
 * Accès au contenu : toutes les pages passent par ces fonctions,
 * pour que le tri et les filtres (publié, brouillon…) soient appliqués partout pareil.
 */
import { getCollection, getEntry } from 'astro:content';

const parOrdre = <T extends { data: { ordre: number } }>(a: T, b: T) => a.data.ordre - b.data.ordre;

/** Offres publiées, éventuellement filtrées par type (`outil` ou `service`). */
export async function offresPubliees(type?: 'outil' | 'service') {
  const toutes = await getCollection('offres', ({ data }) => data.publie && (!type || data.type === type));
  return toutes.sort(parOrdre);
}

export async function fonctionnalites(formule?: 'essentielle' | 'complete') {
  const toutes = await getCollection('fonctionnalites', ({ data }) => !formule || data.formule === formule);
  return toutes.sort(parOrdre);
}

/** Questions de la FAQ pour une page donnée (brouillons exclus). */
export async function faqPour(page: string) {
  const toutes = await getCollection('faq', ({ data }) => !data.brouillon && data.pages.includes(page));
  return toutes.sort(parOrdre);
}

export async function temoignagesPublies() {
  const tous = await getCollection('temoignages', ({ data }) => data.publie);
  return tous.sort(parOrdre);
}

/**
 * Pages dédiées aux accompagnements, avec leur offre (prix, bouton, lien, listes).
 * Une page dont l'offre n'est pas publiée n'est pas générée.
 */
export async function accompagnements() {
  const pages = await getCollection('accompagnements');
  const resultats = await Promise.all(
    pages.map(async (p) => {
      const offre = await getEntry(p.data.offre);
      if (!offre) throw new Error(`Offre « ${p.data.offre.id} » introuvable (src/content/accompagnements/${p.id}.yaml)`);
      // Le lien « Voir le détail » des cartes est calculé à partir de slugPage : il doit mener ici.
      if (offre.data.slugPage !== p.id) {
        throw new Error(`L'offre « ${offre.id} » doit avoir slugPage: ${p.id} (fichier src/content/accompagnements/${p.id}.yaml)`);
      }
      return { slug: p.id, page: p.data, offre };
    }),
  );
  return resultats.filter((r) => r.offre.data.publie);
}

export async function page(id: string) {
  const entree = await getEntry('pages', id);
  if (!entree) throw new Error(`Page « ${id} » introuvable dans src/content/pages/`);
  return entree.data;
}
