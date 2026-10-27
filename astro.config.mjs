// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Adresse du site (URL canonique, image de partage). À changer si un nom de domaine est acheté.
  site: 'https://money-reset.valentinvnl84.workers.dev',
  // Site statique ; seules les routes avec `prerender = false` (webhook Stripe) tournent dans un
  // Worker Cloudflare. Réglages du Worker : wrangler.jsonc
  adapter: cloudflare(),
  // Pas de sessions : évite que l'adaptateur crée un espace de stockage KV inutile.
  session: false,
  env: {
    schema: {
      // À renseigner dans Cloudflare (Worker → Paramètres → Variables et secrets) et dans .env en local.
      STRIPE_SECRET_KEY: envField.string({ context: 'server', access: 'secret' }),
      STRIPE_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret' }),
      BREVO_CLE_API: envField.string({ context: 'server', access: 'secret' }),
      /** Expéditeur validé dans Brevo ; reçoit aussi les réponses des clientes. */
      EMAIL_EXPEDITEUR: envField.string({ context: 'server', access: 'secret', default: 'sheeptonorga@gmail.com' }),
    },
  },
});
