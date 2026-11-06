/* ============================================================
   PAINEL /ADMIN — Cassarotti Foods (leads)
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

async function api(rota, opcoes = {}) {
  const res = await fetch(rota, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...opcoes,
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `erro ${res.status}`);
  return json;
}

const fmtNum = (n) => Number(n || 0).toLocaleString('pt-BR');
const fmtData = (iso) => (iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/* ================= LOGIN ================= */
(async () => {
  try {
    const s = await api('/api/admin/sessao');
    if (s.admin) mostrarPainel();
  } catch { /* mostra o login */ }
})();

$('#form-admin').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('/api/admin/login', { method: 'POST', body: { senha: $('#senha-admin').value } });
    mostrarPainel();
  } catch (err) {
    const b = $('#erro-admin');
    b.textContent = err.message || 'Senha incorreta';
    b.classList.add('visivel');
  }
});

$('#btn-sair-admin').addEventListener('click', async () => {
  await api('/api/admin/sair', { method: 'POST' });
  location.reload();
});

function mostrarPainel() {
  $('#login-admin').classList.add('oculto');
  $('#painel').classList.remove('oculto');
  carregarMetricas();
  carregarLeads();
  carregarConfig();
}

/* ================= ABAS ================= */
$('#abas-admin').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-aba]');
  if (!btn) return;
  $$('#abas-admin button').forEach((b) => b.classList.toggle('ativo', b === btn));
  ['metricas', 'leads', 'config'].forEach((aba) => {
    $('#aba-' + aba).classList.toggle('oculto', btn.dataset.aba !== aba);
  });
});

/* ================= MÉTRICAS ================= */
/* explicações exibidas no (?) de cada indicador */
const AJUDAS = {
  visitas: `<strong>O que é:</strong> acessos à página inicial do site.<br>
    <strong>Como é calculada:</strong> cada carregamento da página inicial registrado no período conta um acesso.<br>
    <strong>Por que importa:</strong> mostra o quanto de tráfego entra no topo do funil comercial.`,
  form: `<strong>O que é:</strong> visitantes únicos que abriram a página do formulário de cadastro.<br>
    <strong>Como é calculada:</strong> contagem de visitantes únicos (identificador anônimo do navegador) que acessaram a página de cadastro no período.<br>
    <strong>Por que importa:</strong> é o público que demonstrou interesse em receber uma proposta.`,
  iniciados: `<strong>O que é:</strong> visitantes que começaram a responder o formulário.<br>
    <strong>Como é calculada:</strong> contagem de visitantes únicos que iniciaram o preenchimento no período.<br>
    <strong>Por que importa:</strong> separa quem apenas olhou de quem realmente se interessou.`,
  leads: `<strong>O que é:</strong> formulários enviados com sucesso.<br>
    <strong>Como é calculada:</strong> contagem de leads criados no período.<br>
    <strong>Por que importa:</strong> é a base de oportunidades comerciais da equipe.`,
  conversao: `<strong>O que é:</strong> percentual de acessos ao formulário que resultaram em um lead enviado com sucesso.<br>
    <strong>Como é calculada:</strong> (leads recebidos ÷ acessos ao formulário) × 100, no período selecionado. Sem acessos ao formulário, exibe “Sem dados”.<br>
    <strong>Por que importa:</strong> mede a efetividade do formulário em transformar interesse em contato.`,
  prioridade: `<strong>O que é:</strong> contatos classificados como de alto potencial comercial.<br>
    <strong>Como é calculada:</strong> leads com pontuação ≥ 40, somando porte, prazo, papel na decisão, segmento, funcionários e situação atual.<br>
    <strong>Por que importa:</strong> indica as oportunidades mais quentes para priorizar o contato.`,
  empresas: `<strong>O que é:</strong> empresas únicas que enviaram formulário.<br>
    <strong>Como é calculada:</strong> contagem de nomes de empresa distintos entre os leads do período.<br>
    <strong>Por que importa:</strong> mostra o alcance real da captação, sem contar a mesma empresa duas vezes.`,
  funcionarios: `<strong>O que é:</strong> estimativa do total de funcionários das empresas interessadas.<br>
    <strong>Como é calculada:</strong> soma do ponto médio da faixa informada por cada lead (ex.: “101 a 500” conta como 300).<br>
    <strong>Por que importa:</strong> dá a dimensão do tamanho das operações em negociação.`,
  refeicoes: `<strong>O que é:</strong> potencial estimado de refeições por dia.<br>
    <strong>Como é calculada:</strong> soma do ponto médio da faixa de refeições por dia informada por cada lead.<br>
    <strong>Por que importa:</strong> aproxima o volume de operação que a Cassarotti pode vir a atender.`,
  aguardando: `<strong>O que é:</strong> leads ainda não contatados.<br>
    <strong>Como é calculada:</strong> leads do período com status “novo”.<br>
    <strong>Por que importa:</strong> cada lead sem contato é uma oportunidade esfriando.`,
  propostas: `<strong>Situação:</strong> esta métrica ainda não é coletada — nenhum número é exibido até existir dado real.<br>
    <strong>O que seria:</strong> contagem de leads com status “proposta enviada”.<br>
    <strong>Para ativar:</strong> inclua o status “proposta enviada” no funil de atendimento dos leads (aba Leads).`,
  convertidos: `<strong>O que é:</strong> clientes efetivamente convertidos.<br>
    <strong>Como é calculada:</strong> leads do período com status “convertido”, definido manualmente pela equipe.<br>
    <strong>Por que importa:</strong> é o resultado final do funil comercial.`,
};

const SERIES = [
  { chave: 'lp', nome: 'Visitas ao site', cor: '#9BB8AA' },
  { chave: 'form', nome: 'Acessos ao formulário', cor: '#4E8C6E' },
  { chave: 'iniciados', nome: 'Formulários iniciados', cor: '#A87A28' },
  { chave: 'leads', nome: 'Leads recebidos', cor: '#1B5E43' },
];
const seriesAtivas = { lp: true, form: true, iniciados: true, leads: true };
let metricasAtuais = null;

const fmtDia = (ymd) => (ymd ? String(ymd).split('-').reverse().join('/') : '—');
const pctDe = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

$('#periodo-metricas').addEventListener('change', () => {
  const personalizado = $('#periodo-metricas').value === 'custom';
  $('#periodo-personalizado').classList.toggle('oculto', !personalizado);
  if (!personalizado) carregarMetricas();
});
$('#btn-aplicar-periodo').addEventListener('click', carregarMetricas);

function parametrosPeriodo() {
  const v = $('#periodo-metricas').value;
  if (v === 'custom') {
    const de = $('#periodo-de').value;
    const ate = $('#periodo-ate').value;
    if (!de || !ate) return null;
    return `de=${de}&ate=${ate}`;
  }
  return `dias=${v}`;
}

async function carregarMetricas() {
  const q = parametrosPeriodo();
  if (!q) {
    const av = $('#aviso-periodo');
    av.textContent = 'Escolha a data inicial e a data final para aplicar o período personalizado.';
    av.classList.remove('oculto');
    return;
  }
  $('#aviso-periodo').classList.add('oculto');
  const m = await api(`/api/admin/metricas?${q}`);
  metricasAtuais = m;

  renderizarCards(m);
  renderizarComparativo(m);
  renderizarFunil(m);
  renderizarInsights(m);
  renderizarGrafico(m);

  $('#lista-origens').innerHTML = barrasVerticais(m.origens);
  $('#lista-segmentos').innerHTML = barrasVerticais(m.segmentos);
  $('#lista-prazos').innerHTML = barrasVerticais(m.prazos);
  $('#lista-situacoes').innerHTML = barrasVerticais(m.situacoes);
  $('#resumo-periodo').textContent = `${fmtDia(m.periodo.de)} — ${fmtDia(m.periodo.ate)}`;
}

/* ---------- cartões ---------- */
function btnAjuda(texto) {
  return `<span class="com-ajuda">
    <button type="button" class="btn-ajuda" aria-label="O que é esta métrica?">?</button>
    <span class="tooltip-ajuda" role="tooltip">${texto}</span>
  </span>`;
}

function cartao({ rotulo, valor, sub, ajuda, delta, destaque, semDados }) {
  return `
    <div class="metrica-card${destaque ? ' destaque' : ''}${semDados ? ' sem-dados' : ''}">
      <div class="rotulo-m"><span>${rotulo}</span>${btnAjuda(ajuda)}</div>
      <div class="valor">${valor}</div>
      ${sub ? `<div class="sub-m">${sub}</div>` : ''}
      ${delta ? `<div class="delta ${delta.cls}">${delta.texto}</div>` : ''}
    </div>`;
}

function variacaoTexto(deltaPct) {
  if (deltaPct === null || deltaPct === undefined) return null;
  const sinal = deltaPct > 0 ? '+' : deltaPct < 0 ? '−' : '±';
  return {
    texto: `${sinal}${fmtNum(Math.abs(deltaPct))}% vs. período anterior`,
    cls: deltaPct > 0 ? 'pos' : deltaPct < 0 ? 'neg' : 'neutro',
  };
}

function renderizarCards(m) {
  const c = m.comparativo || {};
  const semForm = m.form_entradas === 0;
  const variacaoConversao = () => {
    if (c.conversao_delta === null || c.conversao_delta === undefined) return null;
    const sinal = c.conversao_delta > 0 ? '+' : c.conversao_delta < 0 ? '−' : '±';
    return {
      texto: `${sinal}${fmtNum(Math.abs(c.conversao_delta))} p.p. vs. período anterior`,
      cls: c.conversao_delta > 0 ? 'pos' : c.conversao_delta < 0 ? 'neg' : 'neutro',
    };
  };

  $('#cards-acessos').innerHTML = [
    cartao({
      rotulo: 'Visitas ao site', valor: fmtNum(m.lp_entradas), ajuda: AJUDAS.visitas,
      sub: 'Quantidade de acessos à página inicial', delta: variacaoTexto(c.lp_delta),
    }),
    cartao({
      rotulo: 'Acessos ao formulário', valor: fmtNum(m.form_entradas), ajuda: AJUDAS.form,
      sub: 'Total de acessos à página de cadastro', delta: variacaoTexto(c.form_delta),
    }),
    cartao({
      rotulo: 'Formulários iniciados', valor: fmtNum(m.form_iniciados), ajuda: AJUDAS.iniciados,
      sub: 'Visitantes que começaram a responder', delta: variacaoTexto(c.iniciados_delta),
    }),
  ].join('');

  $('#cards-captacao').innerHTML = [
    cartao({
      rotulo: 'Leads recebidos', valor: fmtNum(m.leads), ajuda: AJUDAS.leads,
      sub: `${fmtNum(m.leads_novos)} aguardando contato`, delta: variacaoTexto(c.leads_delta), destaque: true,
    }),
    cartao({
      rotulo: 'Taxa de conversão', valor: semForm ? 'Sem dados' : `${m.conversao_form}%`,
      ajuda: AJUDAS.conversao, sub: 'Leads recebidos ÷ acessos ao formulário',
      delta: variacaoConversao(), destaque: true, semDados: semForm,
    }),
    cartao({
      rotulo: 'Leads prioritários', valor: fmtNum(m.leads_alta_prioridade), ajuda: AJUDAS.prioridade,
      sub: `Alto potencial comercial · pontuação média ${fmtNum(m.pontuacao_media)}`,
    }),
  ].join('');

  $('#cards-potencial').innerHTML = [
    cartao({
      rotulo: 'Empresas interessadas', valor: fmtNum(m.empresas_interessadas), ajuda: AJUDAS.empresas,
      sub: 'Empresas únicas que enviaram formulário',
    }),
    cartao({
      rotulo: 'Total de funcionários estimados', valor: fmtNum(m.funcionarios), ajuda: AJUDAS.funcionarios,
      sub: 'Somatório estimado dos leads do período',
    }),
    cartao({
      rotulo: 'Potencial de refeições por dia', valor: fmtNum(m.alimentacoes_dia), ajuda: AJUDAS.refeicoes,
      sub: 'Estimativa somada dos portes informados',
    }),
    cartao({
      rotulo: 'Leads aguardando contato', valor: fmtNum(m.leads_novos), ajuda: AJUDAS.aguardando,
      sub: 'Status “novo” no painel',
    }),
    cartao({
      rotulo: 'Leads com proposta enviada', valor: 'Sem dados', ajuda: AJUDAS.propostas,
      sub: 'Métrica ainda não coletada', semDados: true,
    }),
    cartao({
      rotulo: 'Clientes convertidos', valor: fmtNum(m.leads_convertidos), ajuda: AJUDAS.convertidos,
      sub: 'Leads com status “convertido”',
    }),
  ].join('');
}

/* ---------- comparativo com o período anterior ---------- */
function renderizarComparativo(m) {
  const c = m.comparativo || {};
  if (!c.disponivel) {
    $('#comparativo-periodo').innerHTML =
      '<span class="cmp-titulo">Comparativo</span><span class="cmp-item">Sem dados do período anterior para comparação.</span>';
    return;
  }
  const item = (rotulo, deltaPct, sufixo = '%') => {
    if (deltaPct === null || deltaPct === undefined) {
      return `<span class="cmp-item">${rotulo} <strong class="neutro">sem base de comparação</strong></span>`;
    }
    const sinal = deltaPct > 0 ? '+' : deltaPct < 0 ? '−' : '±';
    const cls = deltaPct > 0 ? 'pos' : deltaPct < 0 ? 'neg' : 'neutro';
    return `<span class="cmp-item">${rotulo} <strong class="${cls}">${sinal}${fmtNum(Math.abs(deltaPct))}${sufixo}</strong></span>`;
  };
  $('#comparativo-periodo').innerHTML = `
    <span class="cmp-titulo">Comparado a ${fmtDia(c.periodo.de)} — ${fmtDia(c.periodo.ate)}</span>
    ${item('Acessos ao site', c.lp_delta)}
    ${item('Acessos ao formulário', c.form_delta)}
    ${item('Leads recebidos', c.leads_delta)}
    ${item('Taxa de conversão', c.conversao_delta, ' p.p.')}`;
}

/* ---------- funil de conversão ---------- */
function renderizarFunil(m) {
  const etapas = m.funil;
  const base = etapas[0]?.total || 0;
  if (!base && !etapas.some((e) => e.total)) {
    $('#funil-conversao').innerHTML =
      '<p class="nota">Sem dados no período: nenhum acesso ao formulário foi registrado.</p>';
    return;
  }

  /* maior perda entre etapas consecutivas */
  let maiorPerda = null;
  etapas.slice(1).forEach((e, i) => {
    const perda = etapas[i].total - e.total;
    if (perda > 0 && (!maiorPerda || perda > maiorPerda.perda)) maiorPerda = { i: i + 1, perda };
  });

  let html = '';
  etapas.forEach((e, i) => {
    const largura = base ? Math.max(e.total > 0 ? 3 : 0, (e.total / base) * 100) : 0;
    html += `
      <div class="funil-etapa">
        <div class="funil-cabeca">
          <span class="funil-nome">${e.etapa}</span>
          <span class="funil-valor">${fmtNum(e.total)} <small>${base ? `${fmtNum(pctDe(e.total, base))}% do topo` : ''}</small></span>
        </div>
        <div class="funil-barra"><i style="width:${largura}%"></i></div>
      </div>`;
    if (i < etapas.length - 1) {
      const prox = etapas[i + 1];
      const taxa = e.total ? pctDe(prox.total, e.total) : 0;
      const perda = e.total - prox.total;
      const maior = maiorPerda && maiorPerda.i === i + 1;
      const detalhe = perda > 0
        ? `perderam-se ${fmtNum(perda)} (${fmtNum(100 - taxa)}%)`
        : perda < 0
          ? `+${fmtNum(-perda)} acima da etapa anterior`
          : 'sem perda';
      html += `
        <div class="funil-transicao${maior ? ' maior-perda' : ''}">
          <span class="funil-taxa">${fmtNum(taxa)}% continuaram</span>
          <span class="funil-perda">${detalhe}${maior ? ' <b class="selo-perda">maior perda</b>' : ''}</span>
        </div>`;
    }
  });

  if (!etapas[2].total) {
    html += '<p class="nota">Atenção: nenhum formulário foi enviado com sucesso neste período.</p>';
  }
  $('#funil-conversao').innerHTML = html;
}

/* ---------- insights e alertas ---------- */
function renderizarInsights(m) {
  const itens = [];
  const c = m.comparativo || {};
  const add = (tipo, titulo, texto) => itens.push({ tipo, titulo, texto });

  /* conclusão do formulário */
  if (m.form_iniciados > 0 && m.leads < m.form_iniciados) {
    const perda = m.form_iniciados - m.leads;
    const taxa = pctDe(m.leads, m.form_iniciados);
    if (taxa < 50) {
      add('alerta', 'Muitos iniciaram o formulário, mas poucos concluíram',
        `${fmtNum(m.form_iniciados)} visitantes começaram a responder e apenas ${fmtNum(m.leads)} enviaram (${fmtNum(perda)} não concluíram). Vale revisar o tamanho do formulário e os campos obrigatórios.`);
    } else {
      add('atencao', 'Abandono no formulário',
        `${fmtNum(perda)} visitantes iniciaram o preenchimento, mas não enviaram o formulário (${fmtNum(taxa)}% de conclusão).`);
    }
  }

  /* funil parado */
  if (m.form_entradas > 0 && m.leads === 0) {
    add('alerta', 'Nenhum formulário concluído no período',
      'Houve acessos ao formulário, mas nenhum envio foi registrado. Se isso for inesperado, recomendamos verificar o envio do formulário.');
  }
  if (m.form_entradas > 0 && m.form_iniciados === 0) {
    add('atencao', 'Ninguém começou a preencher',
      'Visitantes acessaram o formulário, mas ninguém iniciou o preenchimento neste período.');
  }

  /* fila de contato */
  if (m.leads_novos > 0) {
    add('acao', 'Leads aguardando contato',
      `Você recebeu ${fmtNum(m.leads_novos)} lead(s) que ainda aguardam contato.`);
  }

  /* comparação com o período anterior */
  if (c.disponivel) {
    if (c.conversao_delta > 0) {
      add('positivo', 'Taxa de conversão em alta',
        `Sua taxa de conversão aumentou em relação ao período anterior: de ${fmtNum(c.conversao_form)}% para ${fmtNum(m.conversao_form)}% (+${fmtNum(c.conversao_delta)} p.p.).`);
    } else if (c.conversao_delta < 0) {
      add('atencao', 'Taxa de conversão em queda',
        `Sua taxa de conversão caiu em relação ao período anterior: de ${fmtNum(c.conversao_form)}% para ${fmtNum(m.conversao_form)}% (${fmtNum(c.conversao_delta)} p.p.).`);
    }
    if ((c.lp_delta ?? 0) > 0 && (c.leads_delta ?? 0) < 0) {
      add('alerta', 'Acessos subiram, mas a geração de leads caiu',
        `O volume de acessos aumentou (+${fmtNum(c.lp_delta)}%), porém os leads recebidos diminuíram (${fmtNum(c.leads_delta)}%).`);
    }
    if ((c.leads_delta ?? 0) > 0) {
      add('positivo', 'Geração de leads em alta',
        `Foram recebidos ${fmtNum(m.leads)} leads neste período, ${fmtNum(c.leads_delta)}% a mais que no período anterior.`);
    }
  }

  /* consistência dos dados */
  if (m.form_iniciados > m.form_entradas) {
    add('atencao', 'Números do funil fora de ordem',
      'Há mais formulários iniciados do que acessos ao formulário no período. Pode ser duplicidade de eventos; recomendamos verificar o rastreamento.');
  }
  if (m.leads > m.form_iniciados && m.form_iniciados > 0) {
    add('atencao', 'Mais leads do que formulários iniciados',
      'O total de leads supera os formulários iniciados no período. Recomendamos verificar a consistência dos eventos registrados.');
  }

  /* oportunidades */
  if (m.leads_alta_prioridade > 0) {
    add('positivo', 'Leads de alto potencial no período',
      `${fmtNum(m.leads_alta_prioridade)} lead(s) classificado(s) como alta prioridade — são as oportunidades mais quentes para contato imediato.`);
  }

  if (!itens.length) {
    add('info', 'Sem alertas no período',
      'Não há mudanças relevantes ou pontos de atenção com os dados disponíveis neste período.');
  }

  const ICONES = {
    alerta: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" stroke-width="2" stroke-linecap="round"><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".8" fill="#C0392B" stroke="none"/><path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.4h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    atencao: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A87A28" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5"/><circle cx="12" cy="16" r=".8" fill="#A87A28" stroke="none"/></svg>',
    acao: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A87A28" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    positivo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12B76A" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.6 2.6L16 9.5"/></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C6B62" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".8" fill="#5C6B62" stroke="none"/></svg>',
  };

  $('#lista-insights').innerHTML = itens.map((i) => `
    <div class="insight ins-${i.tipo}">
      ${ICONES[i.tipo] || ICONES.info}
      <div><h3>${i.titulo}</h3><p>${i.texto}</p></div>
    </div>`).join('');
}

/* ---------- gráfico diário com séries alternáveis ---------- */
function renderizarGrafico(m) {
  $('#series-toggle').innerHTML = SERIES.map((s) => `
    <button type="button" class="legenda-btn${seriesAtivas[s.chave] ? ' ativo' : ''}" data-serie="${s.chave}" aria-pressed="${seriesAtivas[s.chave]}">
      <i style="background:${s.cor}"></i>${s.nome}
    </button>`).join('');

  const ativas = SERIES.filter((s) => seriesAtivas[s.chave]);
  if (!ativas.length) {
    $('#grafico-diario').innerHTML = '<p class="nota">Nenhuma série ativa — clique na legenda para exibir.</p>';
    return;
  }

  const maximos = {};
  ativas.forEach((s) => { maximos[s.chave] = Math.max(1, ...m.serie.map((d) => d[s.chave] || 0)); });

  $('#grafico-diario').innerHTML = m.serie.map((d) => {
    const dica = `${fmtDia(d.data)} · ` + SERIES.map((s) => `${fmtNum(d[s.chave] || 0)} ${s.nome.toLowerCase()}`).join(' · ');
    return `
      <div class="barra-dia" title="${escapeHtml(dica)}">
        <div class="grupo">
          ${ativas.map((s) => `<div class="barra serie-${s.chave}" style="height:${((d[s.chave] || 0) / maximos[s.chave]) * 100}%"></div>`).join('')}
        </div>
        <div class="data">${d.data.slice(8)}/${d.data.slice(5, 7)}</div>
      </div>`;
  }).join('');
}

$('#series-toggle').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-serie]');
  if (!btn || !metricasAtuais) return;
  seriesAtivas[btn.dataset.serie] = !seriesAtivas[btn.dataset.serie];
  renderizarGrafico(metricasAtuais);
});

/* ---------- tooltips (?) : hover no desktop, toque no celular ---------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-ajuda');
  const abertos = document.querySelectorAll('.com-ajuda.aberto');
  if (!btn) { abertos.forEach((el) => el.classList.remove('aberto')); return; }
  e.preventDefault();
  const wrap = btn.closest('.com-ajuda');
  const estavaAberto = wrap.classList.contains('aberto');
  abertos.forEach((el) => el.classList.remove('aberto'));
  wrap.classList.toggle('aberto', !estavaAberto);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.com-ajuda.aberto').forEach((el) => el.classList.remove('aberto'));
});

function barrasVerticais(itens) {
  if (!itens.length) return '<p class="nota">Sem dados no período.</p>';
  const max = Math.max(1, ...itens.map((i) => i.total));
  return itens.map((i) => `
    <div class="linha-o">
      <div class="rotulo-o"><span>${i.nome}</span><strong>${fmtNum(i.total)}</strong></div>
      <div class="barra-o"><i style="width:${(i.total / max) * 100}%"></i></div>
    </div>`).join('');
}

/* ================= LEADS ================= */
let cacheLeads = [];

async function carregarLeads() {
  const q = encodeURIComponent($('#busca-leads').value || '');
  const status = encodeURIComponent($('#filtro-status').value || '');
  const r = await api(`/api/admin/leads?q=${q}&status=${status}`);
  cacheLeads = r.leads;

  $('#tabela-leads').innerHTML = r.leads.map((l) => `
    <tr>
      <td>${fmtData(l.criadoEm)}</td>
      <td><strong>${escapeHtml(l.nome_completo)}</strong><br>
          <a href="mailto:${escapeHtml(l.email)}">${escapeHtml(l.email)}</a><br>
          <a href="https://wa.me/${String(l.whatsapp).replace(/\D/g, '')}" target="_blank" rel="noopener">${escapeHtml(l.whatsapp)}</a></td>
      <td>${escapeHtml(l.empresa)}</td>
      <td>${escapeHtml(l.segmento)}<br><span style="color:#5C6B62;font-size:.78rem">${escapeHtml(l.papel_decisao || '')}</span></td>
      <td>${escapeHtml(l.cidade)}/${escapeHtml(l.estado)}</td>
      <td>${escapeHtml(l.funcionarios || '—')}</td>
      <td>${escapeHtml(l.porte_diario || '—')}</td>
      <td>${escapeHtml(l.prazo_para_comecar || '—')}</td>
      <td><strong>${l.pontuacao_prioridade || 0}</strong><br><span style="font-size:.75rem">${escapeHtml(l.classificacao_prioridade || '')}</span></td>
      <td>
        <span class="status-pill st-${l.status || 'novo'}">${(l.status || 'novo').replace('_', ' ')}</span>
        <select class="selecao" data-id="${l.id}" data-status>
          ${['novo', 'em_contato', 'convertido', 'perdido'].map((s) =>
            `<option value="${s}" ${(l.status || 'novo') === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
        </select>
      </td>
      <td><button class="btn-mini" data-excluir="${l.id}">excluir</button></td>
    </tr>`).join('') || '<tr><td colspan="11">Nenhum lead encontrado.</td></tr>';
}

$('#busca-leads').addEventListener('input', debounce(carregarLeads, 300));
$('#filtro-status').addEventListener('change', carregarLeads);

$('#tabela-leads').addEventListener('change', async (e) => {
  const sel = e.target.closest('[data-status]');
  if (!sel) return;
  await api(`/api/admin/leads/${sel.dataset.id}`, { method: 'PATCH', body: { status: sel.value } });
  carregarLeads();
});

$('#tabela-leads').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-excluir]');
  if (!btn) return;
  if (!confirm('Excluir este lead? Essa ação não pode ser desfeita.')) return;
  await api(`/api/admin/leads/${btn.dataset.excluir}`, { method: 'DELETE' });
  carregarLeads();
});

$('#btn-csv').addEventListener('click', () => {
  window.location.href = '/api/admin/leads.csv';
});

/* ================= CONFIGURAÇÕES ================= */
async function carregarConfig() {
  const { config, grupo } = await api('/api/admin/config');
  const evo = config.evolution || {};
  $('#cfg-evo-url').value = evo.apiUrl || '';
  $('#cfg-evo-key').value = evo.apiKey || '';
  $('#cfg-evo-instance').value = evo.instance || '';
  mostrarGrupoAtual(grupo);
}

function mostrarGrupoAtual(grupo) {
  $('#grupo-atual').textContent = grupo?.jid
    ? `Grupo escolhido: ${grupo.nome || grupo.jid} (${grupo.jid})`
    : 'Nenhum grupo escolhido ainda.';
}

async function carregarGrupos(forcar = false) {
  const sel = $('#sel-grupos');
  sel.innerHTML = '<option>carregando grupos...</option>';
  try {
    const r = await api(`/api/admin/whatsapp-grupos${forcar ? '?forcar=1' : ''}`);
    if (!r.grupos || !r.grupos.length) {
      sel.innerHTML = `<option>${r.erro ? 'erro: ' + escapeHtml(r.erro) : 'nenhum grupo encontrado'}</option>`;
      return;
    }
    const atual = (await api('/api/admin/grupo-notificacao')).grupo;
    sel.innerHTML = r.grupos.map((g) =>
      `<option value="${g.jid}" data-nome="${escapeHtml(g.nome)}" ${atual?.jid === g.jid ? 'selected' : ''}>${escapeHtml(g.nome)}</option>`
    ).join('');
    const estado = r.conexao?.estado || '—';
    aviso(`Conexão: ${estado} · ${r.grupos.length} grupos encontrados.`, '#aviso-grupo');
  } catch (e) {
    sel.innerHTML = `<option>${escapeHtml(e.message)}</option>`;
    aviso(e.message, '#aviso-grupo');
  }
}

$('#btn-carregar-grupos').addEventListener('click', () => carregarGrupos(true));

$('#btn-salvar-grupo').addEventListener('click', async () => {
  const sel = $('#sel-grupos');
  const opcao = sel.options[sel.selectedIndex];
  const jid = sel.value;
  if (!jid || !/@g\.us$/.test(jid)) return aviso('Escolha um grupo na lista primeiro.', '#aviso-grupo');
  await api('/api/admin/grupo-notificacao', {
    method: 'POST',
    body: { jid, nome: opcao?.dataset.nome || opcao?.textContent || '' },
  });
  mostrarGrupoAtual({ jid, nome: opcao?.dataset.nome || opcao?.textContent || '' });
  aviso('Grupo salvo! Todo lead novo será avisado lá.', '#aviso-grupo');
});

$('#btn-msg-teste').addEventListener('click', async () => {
  try {
    const r = await api('/api/admin/whatsapp-teste', { method: 'POST', body: {} });
    aviso(r.sent ? 'Mensagem de teste enviada ao grupo.' : `Falha: ${r.error || 'verifique a configuração'}`, '#aviso-grupo');
  } catch (e) {
    aviso(e.message, '#aviso-grupo');
  }
});

$('#btn-salvar-config').addEventListener('click', async () => {
  await api('/api/admin/config', {
    method: 'PUT',
    body: {
      evolution: {
        apiUrl: $('#cfg-evo-url').value,
        apiKey: $('#cfg-evo-key').value,
        instance: $('#cfg-evo-instance').value,
      },
    },
  });
  aviso('Credenciais salvas.', '#aviso-config');
  carregarConfig();
});

$('#btn-salvar-senha').addEventListener('click', async () => {
  if (!$('#cfg-senha').value) return aviso('Digite a nova senha (ou deixe como está).', '#aviso-senha');
  await api('/api/admin/config', { method: 'PUT', body: { adminSenha: $('#cfg-senha').value } });
  $('#cfg-senha').value = '';
  aviso('Senha do painel atualizada.', '#aviso-senha');
});

/* ================= EXPORTAR PROJETO ================= */
$('#btn-exportar-projeto').addEventListener('click', async () => {
  const el = $('#aviso-exportacao');
  el.textContent = 'Gerando o arquivo .zip...';
  el.classList.remove('oculto');
  try {
    const res = await fetch('/api/admin/exportar', { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`erro ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cassarotti-leads-export.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    el.textContent = 'Projeto exportado com sucesso.';
  } catch (e) {
    el.textContent = `Falha ao exportar: ${e.message}`;
  }
  setTimeout(() => el.classList.add('oculto'), 7000);
});

function aviso(texto, alvo = '#aviso-config') {
  const el = $(alvo);
  el.textContent = texto;
  el.classList.add('visivel');
  setTimeout(() => el.classList.remove('visivel'), 7000);
}

/* ================= utilitários ================= */
function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
