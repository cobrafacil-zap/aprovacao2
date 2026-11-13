/**
 * Canal de origem de um acesso ou lead — "de onde veio" em linguagem humana.
 *
 * Recebe o objeto `origem` do formulário (utm_source/utm_medium/utm_campaign/
 * referrer/pagina) e devolve um canal amigável:
 *   LinkedIn Ads · Meta Ads · Google Ads · TikTok Ads · E-mail · WhatsApp ·
 *   LinkedIn (orgânico) · Meta (orgânico) · Busca (orgânica) · Outro site ·
 *   Tráfego direto
 *
 * Nunca devolve links ou domínios: navegação interna (LP → formulário) conta
 * como Tráfego direto e referrer externo desconhecido conta como Outro site.
 */

/* domínios do próprio projeto (nunca são "origem") */
const PROPRIO = ['leads.cassarottifoods.com.br', 'aprovacao2.vercel.app', 'localhost', '127.0.0.1'];

function hostDe(url) {
  if (!String(url || '').trim()) return '';
  try {
    const host = new URL(url, 'https://x').hostname.replace(/^www\./, '').toLowerCase();
    return host === 'x' ? '' : host;
  } catch { return ''; }
}

export function canalDeOrigem(origem) {
  const o = origem || {};
  const fonte = String(o.utm_source || '').toLowerCase();
  const midia = String(o.utm_medium || '').toLowerCase();
  const campanha = String(o.utm_campaign || '').toLowerCase();
  const ref = String(o.referrer || '').toLowerCase();
  const rastreio = `${fonte} ${midia} ${campanha}`;

  /* 1) mídia paga rastreada (UTM/click id) */
  if (/linkedin/.test(rastreio)) return 'LinkedIn Ads';
  if (/facebook|instagram|\bmeta\b|fb_?clid/.test(rastreio)) return 'Meta Ads';
  if (/google|gclid|doubleclick|\baw[-_]?\d/.test(rastreio)) return 'Google Ads';
  if (/tiktok|ttclid/.test(rastreio)) return 'TikTok Ads';

  /* 2) outros canais por mídia declarada */
  if (/email|e-mail|mailing/.test(midia)) return 'E-mail';
  if (/whatsapp|zap/.test(`${fonte} ${midia}`)) return 'WhatsApp';
  if (/cpc|cpm|ppc|paid|display|ads/.test(midia)) {
    return fonte ? `${fonte.replace(/[_-]+/g, ' ')} Ads` : 'Anúncios';
  }

  /* 3) orgânico pelo site de origem — ignorando navegação interna */
  const hostRef = hostDe(o.referrer);
  const interno = hostRef && (hostRef === hostDe(o.pagina) || PROPRIO.includes(hostRef));
  if (hostRef && !interno) {
    if (/linkedin\.com/.test(ref)) return 'LinkedIn (orgânico)';
    if (/facebook\.com|instagram\.com/.test(ref)) return 'Meta (orgânico)';
    if (/whatsapp\.com|wa\.me/.test(ref)) return 'WhatsApp';
    if (/google\.|bing\.|duckduckgo|yahoo\./.test(ref)) return 'Busca (orgânica)';
    return 'Outro site';
  }

  /* 4) sem rastro nenhum */
  return 'Tráfego direto';
}

/** Campanha (utm) do lead — '' quando não existe. */
export function campanhaDaOrigem(origem) {
  return String(origem?.utm_campaign || '').trim();
}
