/**
 * Schémas du contenu du site.
 * Les textes se modifient dans src/content/*.yaml ; si un champ manque ou est mal
 * rempli, `npm run build` s'arrête avec un message clair indiquant lequel.
 */
import { defineCollection, z } from 'astro:content';
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
    change: z.string(),
    bouton: z.string(),
    /** Lien de paiement (Stripe, Gumroad, Lemon Squeezy…). */
    lien: z.string(),
    /**
     * Plusieurs façons de payer : le bouton ouvre une fenêtre de choix au lieu de suivre `lien`
     * (qui reste le lien utilisé si JavaScript est désactivé).
     */
    paiements: z
      .object({
        titre: z.string(),
        texte: z.string().optional(),
        options: z
          .array(z.object({ libelle: z.string(), montant: z.string(), detail: z.string().optional(), lien: z.string() }))
          .min(2),
        mention: z.string().optional(),
      })
      .optional(),
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

/** Test « Money Reset Score » (page /score) : une seule entrée, `money-reset-score`. */
const score = defineCollection({
  loader: file('src/content/score.yaml'),
  schema: z
    .object({
      seo: z.object({ titre: z.string(), description: z.string() }),
      intro: z.object({
        titre: z.string(),
        /** Fin du titre, surlignée. */
        titreSouligne: z.string(),
        texte: z.string(),
        faits: z.array(z.string()),
        bouton: z.string(),
        legende: z.string(),
      }),
      quiz: z.object({
        precedente: z.string(),
        /** `{n}` et `{total}` sont remplacés par le numéro de la question et leur nombre. */
        compteur: z.string(),
      }),
      piliers: z
        .array(
          z.object({
            id: z.string(),
            nom: z.string(),
            max: z.number().int().positive(),
            conseil: z.object({ titre: z.string(), texte: z.string() }),
          }),
        )
        .min(2),
      questions: z
        .array(
          z.object({
            pilier: z.string(),
            question: z.string(),
            reponses: z.array(z.object({ texte: z.string(), points: z.number().int().min(0) })).min(2),
          }),
        )
        .min(1),
      /** Du plus haut au plus bas ; le dernier doit commencer à 0. */
      niveaux: z.array(z.object({ min: z.number(), nom: z.string(), texte: z.string() })).min(1),
      resultat: z.object({
        titre: z.string(),
        sousTitre: z.string(),
        ticket: z.object({
          marque: z.string(),
          titre: z.string(),
          /** `{date}` est remplacé par la date du jour. */
          date: z.string(),
          total: z.string(),
          merci: z.string(),
        }),
        priorites: z.object({ titre: z.string(), texte: z.string() }),
        cta: z.object({ titre: z.string(), texte: z.string(), bouton: z.string() }),
        /** Retour à la dernière question, réponses conservées. */
        modifier: z.string(),
        recommencer: z.string(),
        avertissement: z.string(),
      }),
    })
    .superRefine((d, ctx) => {
      const erreur = (message: string) => ctx.addIssue({ code: 'custom', message });
      const maxAtteignable: Record<string, number> = {};
      for (const q of d.questions) {
        if (!d.piliers.some((p) => p.id === q.pilier)) erreur(`Question « ${q.question} » : pilier « ${q.pilier} » inconnu.`);
        maxAtteignable[q.pilier] = (maxAtteignable[q.pilier] ?? 0) + Math.max(...q.reponses.map((r) => r.points));
      }
      for (const p of d.piliers) {
        const atteignable = maxAtteignable[p.id] ?? 0;
        if (atteignable !== p.max) erreur(`Pilier « ${p.id} » : max ${p.max}, mais les meilleures réponses donnent ${atteignable}.`);
      }
      const total = d.piliers.reduce((t, p) => t + p.max, 0);
      if (total !== 100) erreur(`Les max des piliers totalisent ${total} au lieu de 100.`);
      if (d.niveaux.at(-1)?.min !== 0) erreur('Le dernier niveau doit avoir `min: 0`.');
      if (d.niveaux.some((n, i) => i > 0 && n.min >= d.niveaux[i - 1].min)) erreur('Les niveaux doivent aller du plus haut au plus bas.');
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
    faq: z.object({ titre: z.string() }),
    ctaFinal: z.object({ titre: z.string(), texte: z.string(), bouton: z.string() }),
  }),
});

export const collections = { offres, fonctionnalites, faq, temoignages, score, pages };
