/**
 * Mise en forme de l'e-mail envoyé après l'achat (HTML + texte brut).
 * Textes : src/content/emails.yaml et src/content/fichiers.yaml
 */
import { site } from '../config/site';
import { emailApresAchat } from './contenu';
import { fr, frHtml } from './format';

/**
 * Les messageries ignorent les variables CSS : valeurs reprises de global.css.
 * Polices de secours, Gloock et Figtree n'étant pas disponibles dans les messageries.
 */
const C = {
  bordeaux: '#571534',
  texteDoux: '#7b5566',
  creme: '#fff2ac',
  cremePale: '#fff8d6',
  bleuVoile: '#f5f9fd',
  trait: '#e6d8de',
  titre: "Georgia, 'Times New Roman', serif",
  texte: 'Arial, Helvetica, sans-serif',
};

export interface Email {
  objet: string;
  html: string;
  texte: string;
}

const attribut = (valeur: string) => valeur.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const sansGras = (texte: string) => fr(texte).replace(/\*\*(.+?)\*\*/g, '$1');

interface Options {
  prenom?: string;
  /** Couleur choisie sur la page de paiement, pour les fichiers déclinés en `couleurs`. */
  couleur?: string;
  /** Aperçu : pas d'erreur, liens manquants remplacés par « # », première couleur par défaut. */
  apercu?: boolean;
}

/**
 * Compose l'e-mail d'une offre. Lève une erreur si l'e-mail n'existe pas, si un lien manque
 * ou si la couleur choisie n'a pas de lien (sauf en `apercu`).
 */
export async function composerEmail(offreId: string, { prenom, couleur, apercu = false }: Options = {}): Promise<Email> {
  const e = await emailApresAchat(offreId);
  if (!e) throw new Error(`Aucun e-mail pour l'offre « ${offreId} » dans src/content/emails.yaml`);

  const erreurs: string[] = [];
  const fichiers = e.fichiers.map((f) => {
    let url = f.url;
    if (f.couleurs) {
      const noms = Object.keys(f.couleurs);
      const choix = noms.find((n) => n.toLowerCase() === couleur?.trim().toLowerCase());
      if (!choix && !apercu) erreurs.push(`${f.id} : couleur « ${couleur ?? 'non choisie'} » absente (${noms.join(', ')})`);
      url = f.couleurs[choix ?? noms[0]];
    }
    if (!url && !apercu) erreurs.push(`${f.id} : lien manquant`);
    return { ...f, url: url || '#' };
  });
  if (erreurs.length) throw new Error(`fichiers.yaml : ${erreurs.join(' ; ')}`);

  const salutation = prenom ? e.salutation.replace('{prenom}', prenom) : e.salutation.replace(/\s*\{prenom\}/, '');
  const paragraphe = (t: string) => `<p style="margin:0 0 16px">${frHtml(t)}</p>`;

  const blocsFichiers = fichiers
    .map(
      (f) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;background:${C.cremePale};border:1px solid ${C.trait};border-radius:12px">
        <tr><td style="padding:18px 20px">
          <p style="margin:0 0 4px;font-weight:bold">${frHtml(f.titre)}</p>
          <p style="margin:0 0 14px;font-size:14px;color:${C.texteDoux}">${frHtml(f.description)}</p>
          <a href="${attribut(f.url)}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:${C.bordeaux};color:${C.creme};font-weight:bold;text-decoration:none">${frHtml(f.bouton)}</a>
        </td></tr>
      </table>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${frHtml(e.objet)}</title></head>
<body style="margin:0;padding:0;background:${C.bleuVoile}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bleuVoile}">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="height:8px;background:${C.bordeaux}"></td></tr>
        <tr><td style="padding:32px 28px;font-family:${C.texte};font-size:16px;line-height:1.6;color:${C.bordeaux}">
          <p style="margin:0 0 20px;font-family:${C.titre};font-size:28px;line-height:1.2">${frHtml(e.titre)}</p>
          ${paragraphe(salutation)}
          ${e.intro.map(paragraphe).join('')}
          <div style="margin:24px 0">${blocsFichiers}</div>
          ${e.fin.map(paragraphe).join('')}
          <p style="margin:24px 0 0">${fr(site.autrice)}<br><span style="font-size:14px;color:${C.texteDoux}">${fr(site.marque)} · ${fr(site.nom)}</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const texte = [
    sansGras(salutation),
    ...e.intro.map(sansGras),
    ...fichiers.map((f) => `${sansGras(f.titre)}\n${sansGras(f.description)}\n${f.url}`),
    ...e.fin.map(sansGras),
    `${site.autrice}\n${site.marque} · ${site.nom}`,
  ].join('\n\n');

  return { objet: fr(e.objet), html, texte };
}
