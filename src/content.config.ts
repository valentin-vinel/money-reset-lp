/**
 * Schémas du contenu du site.
 * Les textes se modifient dans src/content/*.yaml ; si un champ manque ou est mal
 * rempli, `npm run build` s'arrête avec un message clair indiquant lequel.
 */
import { defineCollection, reference, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

/** Noms des icônes disponibles (voir src/components/ui/Icone.astro). */
export const icones = [
  'fusee',
  'ticket',
  'porte-monnaie',
  'telephone',
  'carte',
  'tirelire',
  'cible',
  'graphique',
  'trophee',
  'calendrier',
  'reglages',
  'loupe',
  'tendance',
  'banque',
  'livre',
] as const;

/** Visuels illustrés disponibles (voir src/components/visuels/). */
export const visuels = [
  'categories',
  'score',
  'objectifs',
  'abonnements',
  'audit',
  'projection',
  'soldes',
  'guide',
] as const;

const offres = defineCollection({
  loader: file('src/content/offres.yaml'),
  schema: z.object({
    ordre: z.number(),
    nom: z.string(),
    /** `false` = l'offre existe mais n'apparaît pas encore sur le site. */
    publie: z.boolean().default(true),
    /** `outil` = Google Sheets à télécharger, `service` = accompagnement. */
    type: z.enum(['outil', 'service']),
    prix: z.number(),
    prixDetail: z.string().optional(),
    modalite: z.string(),
    etiquette: z.string().optional(),
    titre: z.string(),
    resume: z.string(),
    pourQui: z.array(z.string()),
    /** Mention de base (« Tout ce que contient l'Essentielle ») avant la liste. */
    inclusIntro: z.string().optional(),
    inclus: z.array(z.string()),
    /** 3-4 puces courtes : cartes de la landing et hero de la page dédiée. */
    inclusCourt: z.array(z.string()).optional(),
    change: z.string(),
    bouton: z.string(),
    /** Lien de paiement (Stripe, Gumroad, Lemon Squeezy…). */
    lien: z.string(),
    /** Slug de la page dédiée (/accompagnement/<slugPage>/), même nom que le fichier de src/content/accompagnements/. */
    slugPage: z.string().optional(),
    /** Lien « Voir le détail » ; calculé à partir de `slugPage` si absent. */
    lienDetail: z.string().optional(),
  }),
});

/** Contenu long des pages dédiées aux offres d'accompagnement (un fichier par offre). */
const accompagnements = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/accompagnements' }),
  schema: z.object({
    /** Id de l'offre dans offres.yaml : prix, bouton, lien, `inclus` et `pourQui` viennent de là. */
    offre: reference('offres'),
    seo: z.object({ titre: z.string(), description: z.string() }),
    hero: z.object({ etiquette: z.string(), titre: z.string(), texte: z.string() }),
    pourquoi: z.object({ titre: z.string(), texte: z.string() }),
    deroule: z.object({
      titre: z.string(),
      etapes: z.array(z.object({ titre: z.string(), duree: z.string().optional(), texte: z.string() })),
      /** Blocs affichés après les étapes (« Après chaque appel », « Entre les appels »). */
      blocs: z.array(z.object({ titre: z.string(), texte: z.string() })).optional(),
    }),
    /** La liste vient de `inclus` dans offres.yaml. */
    resultats: z.object({ titre: z.string() }),
    ctaFinal: z.object({ titre: z.string(), texte: z.string() }),
  }),
});

const fonctionnalites = defineCollection({
  loader: file('src/content/fonctionnalites.yaml'),
  schema: z.object({
    ordre: z.number(),
    /** Formule minimale qui contient la fonctionnalité. */
    formule: z.enum(['essentielle', 'complete']),
    icone: z.enum(icones),
    titre: z.string(),
    texte: z.string(),
    /** Si renseigné, la fonctionnalité est présentée en grand avec ce visuel. */
    visuel: z.enum(visuels).optional(),
    /** Points clés affichés sous le texte des fonctionnalités en grand. */
    points: z.array(z.string()).optional(),
  }),
});

const faq = defineCollection({
  loader: file('src/content/faq.yaml'),
  schema: z.object({
    ordre: z.number(),
    question: z.string(),
    /** Accepte le gras en Markdown simple : **texte**. */
    reponse: z.string(),
    /** Pages sur lesquelles la question apparaît. */
    pages: z.array(z.string()),
    /** `true` = réponse pas encore prête, question masquée. */
    brouillon: z.boolean().default(false),
  }),
});

const temoignages = defineCollection({
  loader: file('src/content/temoignages.yaml'),
  schema: z.object({
    ordre: z.number(),
    publie: z.boolean().default(true),
    prenom: z.string(),
    contexte: z.string().optional(),
    citation: z.string(),
    formule: z.enum(['essentielle', 'complete']).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/pages' }),
  schema: z.object({
    seo: z.object({ titre: z.string(), description: z.string() }),
    hero: z.object({
      badge: z.string(),
      titre: z.string(),
      sousTitre: z.string(),
      boutonPrincipal: z.string(),
      boutonSecondaire: z.string(),
      rassurance: z.array(z.string()),
    }),
    chiffres: z.array(z.object({ valeur: z.string(), libelle: z.string() })),
    probleme: z.object({ titre: z.string(), texte: z.string() }),
    essentiels: z.object({ titre: z.string(), intro: z.string(), bouton: z.string() }),
    complete: z.object({ etiquette: z.string(), titre: z.string(), intro: z.string() }),
    etapes: z.object({
      titre: z.string(),
      liste: z.array(z.object({ titre: z.string(), texte: z.string() })),
    }),
    tarifs: z.object({
      titre: z.string(),
      intro: z.string(),
      conseil: z.string(),
    }),
    temoignages: z.object({ titre: z.string() }),
    apropos: z.object({ signature: z.string(), texte: z.string() }),
    accompagnement: z.object({ etiquette: z.string(), titre: z.string(), intro: z.string(), mention: z.string() }),
    faq: z.object({ titre: z.string() }),
    ctaFinal: z.object({ titre: z.string(), texte: z.string(), bouton: z.string() }),
  }),
});

export const collections = { offres, accompagnements, fonctionnalites, faq, temoignages, pages };
