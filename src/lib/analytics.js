/**
 * Métricas de LEADS — adaptação do analytics do projeto oferta-fit
 * (que mede vendas) para o funil de qualificação da Cassarotti Foods.
 *
 * Métricas medem coisas DIFERENTES e nunca são tratadas como equivalentes:
 *   - lp_view      → acesso à página inicial (contagem de eventos)
 *   - pageview     → acesso à página do formulário (visitantes únicos)
 *   - form_start   → formulário iniciado (visitantes únicos)
 *   - lead_criado  → formulário enviado com sucesso (contagem de leads)
 */
import { read, eventoLista } from './db.js';

/* estimativa de pessoas por faixa — usada para somar o potencial diário */
const MEIO_DAS_FAIXAS = {
  'Até 100': 60,
  '101 a 500': 300,
  '501 a 2.000': 1250,
  '2.001 a 5.000': 3500,
  'Acima de 5.000': 6000,
};

const dia = (ts) => (ts ? String(ts).slice(0, 10) : '');
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const soma = (lista, fn) => lista.reduce((s, x) => s + (fn(x) || 0), 0);
const estimar = (faixa) => MEIO_DAS_FAIXAS[faixa] || 0;

/* contagem por visitante único; eventos sem identificador contam individualmente
   (evita duplicidade de uma mesma sessão sem descartar eventos anônimos) */
const distintos = (lista) => {
  const ids = new Set(lista.map((e) => e.sessao).filter(Boolean));
  return ids.size + lista.filter((e) => !e.sessao).length;
};

/* variação percentual entre dois períodos (null quando não há base) */
const variacao = (atual, anterior) =>
  anterior ? Math.round(((atual - anterior) / anterior) * 1000) / 10 : null;

/* desloca uma data 'YYYY-MM-DD' em N dias */
function paraDia(ymd, desloc) {
  const t = Date.parse(`${ymd}T00:00:00Z`) + desloc * 864e5;
  return new Date(t).toISOString().slice(0, 10);
}

const diasEntre = (ini, fim) =>
  Math.round((Date.parse(`${fim}T00:00:00Z`) - Date.parse(`${ini}T00:00:00Z`)) / 864e5);

function contarPor(lista, campo) {
  const mapa = {};
  lista.forEach((item) => {
    const chave = item[campo] || 'não informado';
    mapa[chave] = (mapa[chave] || 0) + 1;
  });
  return Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, total]) => ({ nome, total }));
}

function noPeriodo(ts, de, ate) {
  const d = dia(ts);
  if (de && d < de) return false;
  if (ate && d > ate) return false;
  return true;
}

/* agrega eventos + leads de UM período (usado no atual e no anterior) */
function agregar(eventos, leads) {
  const pageviews = eventos.filter((e) => e.tipo === 'pageview');
  const lpViews = eventos.filter((e) => e.tipo === 'lp_view');
  const formStarts = eventos.filter((e) => e.tipo === 'form_start');

  const lpEntradas = distintos(lpViews);       // acessos à página inicial
  const formEntradas = distintos(pageviews);   // acessos ao formulário (visitantes únicos)
  const inicios = distintos(formStarts);       // formulários iniciados (visitantes únicos)

  const pontuacoes = leads.map((l) => Number(l.pontuacao_prioridade) || 0);
  const alimentacoesDia = soma(leads, (l) => estimar(l.porte_diario));
  const funcionarios = soma(leads, (l) => estimar(l.funcionarios));
  const empresas = new Set(
    leads.map((l) => String(l.empresa || '').trim().toLowerCase()).filter(Boolean)
  ).size;

  return {
    lp_entradas: lpEntradas,
    form_entradas: formEntradas,
    lp_cliques: eventos.filter((e) => e.tipo === 'lp_cta_click').length,
    form_iniciados: inicios,
    leads: leads.length,
    leads_novos: leads.filter((l) => (l.status || 'novo') === 'novo').length,
    leads_em_contato: leads.filter((l) => l.status === 'em_contato').length,
    leads_convertidos: leads.filter((l) => l.status === 'convertido').length,
    leads_alta_prioridade: leads.filter((l) => l.classificacao_prioridade === 'alta').length,
    empresas_interessadas: empresas,
    pontuacao_media: leads.length
      ? Math.round((soma(pontuacoes, (p) => p) / leads.length) * 10) / 10
      : 0,
    alimentacoes_dia: alimentacoesDia,
    funcionarios,
    alimentacoes_por_lead: leads.length ? Math.round(alimentacoesDia / leads.length) : 0,
    conversao: pct(leads.length, lpEntradas || (lpEntradas + formEntradas)),
    conversao_form: pct(leads.length, formEntradas),
    entrada_form_pct: pct(formEntradas, lpEntradas),
    inicio_pct: pct(inicios, formEntradas),
  };
}

export async function resumo({ de, ate, dias = 14 } = {}) {
  const [todosEventos, todosLeads] = await Promise.all([
    eventoLista(5000),
    read('leads', []),
  ]);

  /* ---- período atual: de/ate vencem; senão, últimos N dias até hoje ---- */
  const hoje = new Date().toISOString().slice(0, 10);
  const nDias = Math.max(1, Number(dias) || 14);
  let ini = de || paraDia(hoje, -(nDias - 1));
  let fim = ate || hoje;
  if (fim < ini) [ini, fim] = [fim, ini];

  const eventos = todosEventos.filter((e) => noPeriodo(e.ts, ini, fim));
  const leads = todosLeads.filter((l) => noPeriodo(l.criadoEm, ini, fim));
  const atual = agregar(eventos, leads);

  /* ---- período anterior equivalente (mesma quantidade de dias) ---- */
  const totalDias = Math.min(diasEntre(ini, fim) + 1, 182);
  const fimAnterior = paraDia(ini, -1);
  const iniAnterior = paraDia(ini, -totalDias);
  const eventosAnteriores = todosEventos.filter((e) => noPeriodo(e.ts, iniAnterior, fimAnterior));
  const leadsAnteriores = todosLeads.filter((l) => noPeriodo(l.criadoEm, iniAnterior, fimAnterior));
  const anterior = agregar(eventosAnteriores, leadsAnteriores);

  /* ---- série diária (respeita o período selecionado) ---- */
  const serie = [];
  for (let i = totalDias - 1; i >= 0; i--) {
    const d = paraDia(fim, -i);
    const doDia = eventos.filter((e) => dia(e.ts) === d);
    serie.push({
      data: d,
      lp: doDia.filter((e) => e.tipo === 'lp_view').length,
      form: doDia.filter((e) => e.tipo === 'pageview').length,
      iniciados: doDia.filter((e) => e.tipo === 'form_start').length,
      visitas: doDia.filter((e) => e.tipo === 'pageview' || e.tipo === 'lp_view').length,
      leads: leads.filter((l) => dia(l.criadoEm) === d).length,
    });
  }

  /* ---- origem do tráfego ---- */
  const origens = {};
  eventos.filter((e) => e.tipo === 'pageview').forEach((e) => {
    let o = 'direto';
    const utm = e.utm || {};
    const fonte = utm.utm_source || utm.source;
    if (fonte) o = String(fonte).toLowerCase();
    else if (e.referrer) {
      try { o = new URL(e.referrer, 'https://x').hostname.replace('www.', '').toLowerCase(); } catch { /* ignora */ }
    }
    origens[o] = (origens[o] || 0) + 1;
  });

  return {
    periodo: { de: ini, ate: fim, dias: diasEntre(ini, fim) + 1 },
    visitas: atual.lp_entradas + atual.form_entradas,
    ...atual,
    /* comparativo com o período imediatamente anterior, de tamanho equivalente */
    comparativo: {
      disponivel: eventosAnteriores.length + leadsAnteriores.length > 0,
      periodo: { de: iniAnterior, ate: fimAnterior },
      lp_entradas: anterior.lp_entradas,
      form_entradas: anterior.form_entradas,
      form_iniciados: anterior.form_iniciados,
      leads: anterior.leads,
      conversao_form: anterior.conversao_form,
      lp_delta: variacao(atual.lp_entradas, anterior.lp_entradas),
      form_delta: variacao(atual.form_entradas, anterior.form_entradas),
      iniciados_delta: variacao(atual.form_iniciados, anterior.form_iniciados),
      leads_delta: variacao(atual.leads, anterior.leads),
      conversao_delta:
        anterior.form_entradas && atual.form_entradas
          ? Math.round((atual.conversao_form - anterior.conversao_form) * 10) / 10
          : null,
    },
    serie,
    funil: [
      { etapa: 'Acessos ao formulário', total: atual.form_entradas },
      { etapa: 'Formulários iniciados', total: atual.form_iniciados },
      { etapa: 'Formulários enviados', total: atual.leads },
      { etapa: 'Leads qualificados', total: atual.leads_alta_prioridade },
    ],
    origens: Object.entries(origens).sort((a, b) => b[1] - a[1]).map(([nome, total]) => ({ nome, total })),
    segmentos: contarPor(leads, 'segmento'),
    estados: contarPor(leads, 'estado').slice(0, 10),
    prazos: contarPor(leads, 'prazo_para_comecar'),
    situacoes: contarPor(leads, 'situacao_atual'),
  };
}
