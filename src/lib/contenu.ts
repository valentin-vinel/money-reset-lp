/**
 * Accès au contenu : toutes les pages passent par ces fonctions,
 * pour que le tri et les filtres (publié, brouillon…) soient appliqués partout pareil.
 */
import { getCollection, getEntries, getEntry } from 'astro:content';

const parOrdre = <T extends { data: { ordre: number } }>(a: T, b: T) => a.data.ordre - b.data.ordre;

/** Offres publiées, éventuellement filtrées par type (`outil` ou `service`). */
export async function offresPubliees(type?: 'outil' | 'service') {
  const toutes = await getCollection('offres', ({ data }) => data.publie && (!type || data.type === type));
  return toutes.sort(parOrdre);
}

/** Offre vendue par ce lien de paiement. */
export async function offreDuLien(lien: string) {
  const toutes = await getCollection('offres');
  return toutes.find(({ data }) => data.lien === lien);
}

/** E-mail envoyé après l'achat d'une offre, avec ses fichiers dans l'ordre. */
export async function emailApresAchat(offreId: string) {
  const entree = await getEntry('emails', offreId);
  if (!entree) return undefined;
  const fichiers = await getEntries(entree.data.fichiers);
  return { ...entree.data, fichiers: fichiers.map((f) => ({ id: f.id, ...f.data })) };
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

/** Pages légales (src/content/legal/*.md). */
export async function pagesLegales() {
  return getCollection('legal');
}

export async function page(id: string) {
  const entree = await getEntry('pages', id);
  if (!entree) throw new Error(`Page « ${id} » introuvable dans src/content/pages/`);
  return entree.data;
}

/** Textes des pages de remerciement (/merci/<offre>). */
export async function pagesMerci() {
  const entree = await getEntry('merci', 'merci');
  if (!entree) throw new Error('Entrée « merci » introuvable dans src/content/merci.yaml');
  return entree.data;
}

/** Contenu du test « Money Reset Score » (page /score). */
export async function testScore() {
  const entree = await getEntry('score', 'money-reset-score');
  if (!entree) throw new Error('Entrée « money-reset-score » introuvable dans src/content/score.yaml');
  return entree.data;
}
