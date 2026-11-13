/**
 * Canal de origem de um acesso ou lead — "de onde veio" em linguagem humana.
 *
 * Recebe o objeto `origem` do formulário (utm_source/utm_medium/utm_campaign/
 * referrer/pagina) e devolve um canal amigável:
 *   LinkedIn Ads · Meta Ads · Google Ads · TikTok Ads · E-mail · WhatsApp ·
 *   LinkedIn (orgânico) · Meta (orgânico) · Busca (orgânica) · Tráfego direto
 */
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

  /* 3) orgânico pelo site de origem (referrer) */
  if (ref) {
    if (/linkedin\.com/.test(ref)) return 'LinkedIn (orgânico)';
    if (/facebook\.com|instagram\.com/.test(ref)) return 'Meta (orgânico)';
    if (/whatsapp\.com|wa\.me/.test(ref)) return 'WhatsApp';
    if (/google\.|bing\.|duckduckgo|yahoo\./.test(ref)) return 'Busca (orgânica)';
    try {
      const host = new URL(o.referrer, 'https://x').hostname.replace(/^www\./, '');
      if (host && host !== 'x') return host;
    } catch { /* ignora referrer inválido */ }
  }

  /* 4) sem rastro nenhum */
  return 'Tráfego direto';
}

/** Campanha (utm) do lead — '' quando não existe. */
export function campanhaDaOrigem(origem) {
  return String(origem?.utm_campaign || '').trim();
}
