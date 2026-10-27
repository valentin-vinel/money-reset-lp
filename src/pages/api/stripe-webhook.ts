/**
 * Webhook Stripe : à chaque paiement réussi, envoie à la cliente l'e-mail de son offre
 * via Brevo (les réponses arrivent sur l'adresse Gmail de la marque).
 * Seule route du site exécutée à la demande (Worker Cloudflare) ; tout le reste est statique.
 *
 * Événements à cocher dans Stripe : checkout.session.completed et
 * checkout.session.async_payment_succeeded (paiements différés, comme le prélèvement SEPA).
 */
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BREVO_CLE_API, EMAIL_EXPEDITEUR } from 'astro:env/server';
import { site } from '../../config/site';
import { offreDuLien } from '../../lib/contenu';
import { composerEmail, type Email } from '../../lib/email';

export const prerender = false;

const stripe = new Stripe(STRIPE_SECRET_KEY);

/** Envoi par l'API transactionnelle de Brevo. */
async function envoyer(destinataire: string, email: Email) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_CLE_API, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: `${site.autrice} · ${site.nom}`, email: EMAIL_EXPEDITEUR },
      replyTo: { email: EMAIL_EXPEDITEUR },
      to: [{ email: destinataire }],
      subject: email.objet,
      htmlContent: email.html,
      textContent: email.texte,
    }),
  });
  if (!res.ok) throw new Error(`Brevo a refusé l'envoi (${res.status}) : ${await res.text()}`);
}

const reponse = (status: number, message: string) => new Response(message, { status });

export const POST: APIRoute = async ({ request }) => {
  let evenement: Stripe.Event;
  try {
    evenement = await stripe.webhooks.constructEventAsync(
      await request.text(),
      request.headers.get('stripe-signature') ?? '',
      STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return reponse(400, 'Signature Stripe invalide');
  }

  if (evenement.type !== 'checkout.session.completed' && evenement.type !== 'checkout.session.async_payment_succeeded') {
    return reponse(200, 'Événement ignoré');
  }
  const session = evenement.data.object;
  // Paiement différé pas encore encaissé : l'e-mail partira avec async_payment_succeeded.
  if (session.payment_status === 'unpaid') return reponse(200, 'Paiement en attente');

  const destinataire = session.customer_details?.email;
  if (!session.payment_link || !destinataire) {
    return reponse(200, 'Paiement sans lien de paiement ou sans e-mail : rien à envoyer');
  }

  // Une erreur ici renvoie 500 : Stripe réessaie pendant 3 jours, le temps de corriger.
  try {
    const idLien = typeof session.payment_link === 'string' ? session.payment_link : session.payment_link.id;
    const { url } = await stripe.paymentLinks.retrieve(idLien);
    const offre = await offreDuLien(url);
    if (!offre) throw new Error(`Aucune offre de offres.yaml n'utilise le lien ${url}`);

    const prenom = session.customer_details?.name?.trim().split(/\s+/)[0];
    await envoyer(destinataire, await composerEmail(offre.id, prenom));
    return reponse(200, `E-mail « ${offre.id} » envoyé`);
  } catch (erreur) {
    console.error(`Session ${session.id} :`, erreur);
    return reponse(500, erreur instanceof Error ? erreur.message : 'Erreur inconnue');
  }
};
