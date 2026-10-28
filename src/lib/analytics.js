/**
 * Métricas de LEADS — adaptação do analytics do projeto oferta-fit
 * (que mede vendas) para o funil de qualificação da Cassarotti Foods.
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

export async function resumo({ de, ate, dias = 14 } = {}) {
  const [todosEventos, todosLeads] = await Promise.all([
    eventoLista(5000),
    read('leads', []),
  ]);

  const eventos = todosEventos.filter((e) => noPeriodo(e.ts, de, ate));
  const leads = todosLeads.filter((l) => noPeriodo(l.criadoEm, de, ate));

  const pageviews = eventos.filter((e) => e.tipo === 'pageview');
  const sessoes = (lista) =>
    new Set(lista.map((e) => e.sessao).filter(Boolean)).size || lista.length;

  const visitas = sessoes(pageviews);
  const inicios = eventos.filter((e) => e.tipo === 'form_start').length || 0;

  /* ---- números dos leads ---- */
  const pontuacoes = leads.map((l) => Number(l.pontuacao_prioridade) || 0);
  const alimentacoesDia = soma(leads, (l) => estimar(l.porte_diario));
  const funcionarios = soma(leads, (l) => estimar(l.funcionarios));

  /* ---- série diária ---- */
  const hoje = new Date();
  const serie = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(hoje.getTime() - i * 864e5).toISOString().slice(0, 10);
    serie.push({
      data: d,
      visitas: eventos.filter((e) => e.tipo === 'pageview' && dia(e.ts) === d).length,
      leads: leads.filter((l) => dia(l.criadoEm) === d).length,
    });
  }

  /* ---- origem do tráfego ---- */
  const origens = {};
  pageviews.forEach((e) => {
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
    periodo: { de: de || serie[0].data, ate: ate || serie[serie.length - 1].data },
    visitas,
    form_iniciados: inicios,
    leads: leads.length,
    leads_novos: leads.filter((l) => (l.status || 'novo') === 'novo').length,
    leads_alta_prioridade: leads.filter((l) => l.classificacao_prioridade === 'alta').length,
    conversao: pct(leads.length, visitas),
    pontuacao_media: leads.length ? Math.round(soma(pontuacoes, (p) => p) / leads.length * 10) / 10 : 0,
    alimentacoes_dia: alimentacoesDia,
    funcionarios: funcionarios,
    alimentacoes_por_lead: leads.length ? Math.round(alimentacoesDia / leads.length) : 0,
    serie,
    funil: [
      { etapa: 'Visitas', total: visitas },
      { etapa: 'Formulário iniciado', total: inicios },
      { etapa: 'Lead enviado', total: leads.length },
    ],
    origens: Object.entries(origens).sort((a, b) => b[1] - a[1]).map(([nome, total]) => ({ nome, total })),
    segmentos: contarPor(leads, 'segmento'),
    estados: contarPor(leads, 'estado').slice(0, 10),
    prazos: contarPor(leads, 'prazo_para_comecar'),
    situacoes: contarPor(leads, 'situacao_atual'),
  };
}
