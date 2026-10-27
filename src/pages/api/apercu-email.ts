/**
 * Aperçu des e-mails après achat, uniquement pendant `npm run dev` :
 * http://localhost:4321/api/apercu-email?offre=complete&prenom=Julie
 */
import type { APIRoute } from 'astro';
import { composerEmail } from '../../lib/email';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });
  const offre = url.searchParams.get('offre') ?? 'essentielle';
  try {
    const { html } = await composerEmail(offre, url.searchParams.get('prenom') ?? 'Julie', true);
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (erreur) {
    return new Response(erreur instanceof Error ? erreur.message : String(erreur), { status: 500 });
  }
};
