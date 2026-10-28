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
$('#periodo-metricas').addEventListener('change', carregarMetricas);

async function carregarMetricas() {
  const dias = $('#periodo-metricas').value;
  const m = await api(`/api/admin/metricas?dias=${dias}`);

  $('#metricas-cards').innerHTML = [
    ['👀 Visitas', fmtNum(m.visitas), 'sessões no período'],
    ['📝 Formulários iniciados', fmtNum(m.form_iniciados), `${m.conversao}% de conversão em lead`],
    ['📋 Leads recebidos', fmtNum(m.leads), `${m.leads_novos} aguardando contato`],
    ['⭐ Alta prioridade', fmtNum(m.leads_alta_prioridade), `pontuação média ${m.pontuacao_media}`],
    ['🍽 Refeições/dia (potencial)', fmtNum(m.alimentacoes_dia), `média de ${fmtNum(m.alimentacoes_por_lead)} por lead`],
    ['👥 Funcionários (potencial)', fmtNum(m.funcionarios), 'somatório estimado dos leads'],
    ['📊 Conversão', `${m.conversao}%`, 'leads ÷ visitas'],
    ['📈 Leads no último dia', fmtNum(m.serie[m.serie.length - 1]?.leads || 0), m.serie[m.serie.length - 1]?.data || '—'],
  ].map(([rotulo, valor, sub]) => `
    <div class="metrica-card">
      <div class="valor">${valor}</div>
      <div class="rotulo-m">${rotulo}</div>
      <div class="delta">${sub}</div>
    </div>`).join('');

  /* barras diárias */
  const max = Math.max(1, ...m.serie.map((d) => Math.max(d.visitas, d.leads * 3)));
  $('#grafico-diario').innerHTML = m.serie.map((d) => `
    <div class="barra-dia" title="${d.data}: ${d.visitas} visitas, ${d.leads} leads">
      <div class="barra leads" style="height:${(d.leads * 3 / max) * 100}%"></div>
      <div class="barra visitas" style="height:${(d.visitas / max) * 100}%"></div>
      <div class="data">${d.data.slice(8)}/${d.data.slice(5, 7)}</div>
    </div>`).join('');

  $('#lista-funil').innerHTML = barrasVerticais(m.funil.map((f) => ({ nome: f.etapa, total: f.total })));
  $('#lista-origens').innerHTML = barrasVerticais(m.origens);
  $('#lista-segmentos').innerHTML = barrasVerticais(m.segmentos);
  $('#lista-prazos').innerHTML = barrasVerticais(m.prazos);
}

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
