/**
 * Rotas da API
 *   POST /api/leads        → recebe o formulário, grava o lead e avisa o grupo no WhatsApp
 *   POST /api/track        → eventos de analytics (visitas, início do formulário)
 *   /api/admin/*           → painel administrativo (exige sessão)
 */
import express from 'express';
import { read, write, update, id, agora, eventoAdd, eventoLista } from '../lib/db.js';
import { criarSessao, destruirSessao, isSessaoAdmin, requireAdmin } from '../lib/auth.js';
import { resumo } from '../lib/analytics.js';
import {
  whatsappConfigurado, estadoConexaoWhatsApp, listarGruposWhatsApp,
  getGrupoNotificacao, setGrupoNotificacao, avisarLeadNoGrupo, enviarWhatsApp,
  limparCredenciais,
} from '../lib/evolution.js';

const router = express.Router();

/* ============================================================
   FORMULÁRIO — cadastro de lead
   ============================================================ */
router.post('/leads', async (req, res) => {
  const b = req.body || {};

  const obrigatorio = {
    nome_completo: b.nome_completo,
    empresa: b.empresa,
    segmento: b.segmento,
    porte_diario: b.porte_diario,
    estado: b.estado,
    cidade: b.cidade,
    email: b.email,
    whatsapp: b.whatsapp,
  };
  const faltando = Object.entries(obrigatorio).filter(([, v]) => !v).map(([k]) => k);
  if (faltando.length) {
    return res.status(400).json({ error: `campos obrigatórios ausentes: ${faltando.join(', ')}` });
  }
  if (!b.consentimento) {
    return res.status(400).json({ error: 'consentimento é obrigatório' });
  }

  const lead = {
    id: id('lead'),
    criadoEm: agora(),
    status: 'novo',                    // novo | em_contato | convertido | perdido
    nome_completo: String(b.nome_completo).trim(),
    empresa: String(b.empresa).trim(),
    segmento: b.segmento,
    papel_decisao: b.papel_decisao || null,
    funcionarios: b.funcionarios || null,
    porte_diario: b.porte_diario || null,
    estado: b.estado,
    cidade: String(b.cidade).trim(),
    servicos_de_interesse: Array.isArray(b.servicos_de_interesse) ? b.servicos_de_interesse : [],
    situacao_atual: b.situacao_atual || null,
    prazo_para_comecar: b.prazo_para_comecar || null,
    email: String(b.email).trim(),
    whatsapp: String(b.whatsapp).trim(),
    consentimento: true,
    pontuacao_prioridade: Number(b.pontuacao_prioridade) || 0,
    classificacao_prioridade: b.classificacao_prioridade || null,
    origem: b.origem || null,
  };

  await update('leads', [], (lista) => { lista.push(lead); return lista; });
  await eventoAdd({
    id: id('evt'), ts: agora(), tipo: 'lead_criado', sessao: b.sessao || null,
    pagina: lead.origem?.pagina || null, utm: lead.origem || null,
    referrer: lead.origem?.referrer || null, valor: lead.pontuacao_prioridade,
    leadId: lead.id, origem: 'site', dispositivo: detectarDispositivo(req),
  });

  /* notificação no grupo (nunca bloqueia o cadastro) */
  let notificacao = { sent: false, error: 'não enviada' };
  try {
    notificacao = await avisarLeadNoGrupo(lead);
  } catch (e) {
    notificacao = { sent: false, error: String(e.message || e) };
  }

  res.json({ ok: true, leadId: lead.id, notificacao });
});

/* ============================================================
   ANALYTICS LEVE (visitas e início do formulário)
   ============================================================ */
router.post('/track', async (req, res) => {
  const b = req.body || {};
  await eventoAdd({
    id: id('evt'),
    ts: agora(),
    tipo: b.tipo || 'evento',
    sessao: b.sessao || null,
    pagina: b.pagina || null,
    utm: b.utm || null,
    referrer: b.referrer || null,
    valor: null,
    origem: 'site',
    dispositivo: detectarDispositivo(req),
  });
  res.json({ ok: true });
});

function detectarDispositivo(req) {
  const ua = String(req.headers['user-agent'] || '');
  return /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop';
}

/* ============================================================
   PAINEL — login (sem sessão) e demais rotas protegidas
   ============================================================ */
router.post('/admin/login', async (req, res) => {
  const { senha } = req.body || {};
  const settings = await read('settings', {});
  const esperada = process.env.ADMIN_SENHA || settings.adminSenha || 'Comsoc1#';
  if (String(senha) !== String(esperada)) {
    return res.status(401).json({ error: 'senha incorreta' });
  }
  await criarSessao(res, 'admin', 'admin');
  res.json({ ok: true });
});

router.post('/admin/sair', async (req, res) => {
  await destruirSessao(req, res);
  res.json({ ok: true });
});

router.get('/admin/sessao', async (req, res) => {
  res.json({ admin: await isSessaoAdmin(req) });
});

router.use('/admin', requireAdmin);

/* ---------- métricas ---------- */
router.get('/admin/metricas', async (req, res) => {
  const { de, ate, dias } = req.query;
  const m = await resumo({ de, ate, dias: Number(dias) || 14 });
  res.json(m);
});

/* ---------- leads ---------- */
router.get('/admin/leads', async (req, res) => {
  const { q, status } = req.query;
  let lista = await read('leads', []);
  lista = lista.slice().sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
  if (status) lista = lista.filter((l) => (l.status || 'novo') === status);
  if (q) {
    const termo = String(q).toLowerCase();
    lista = lista.filter((l) =>
      [l.nome_completo, l.empresa, l.email, l.whatsapp, l.cidade, l.estado, l.segmento]
        .some((v) => String(v || '').toLowerCase().includes(termo)));
  }
  res.json({ leads: lista });
});

router.patch('/admin/leads/:id', async (req, res) => {
  const { status, observacao } = req.body || {};
  const permitidos = ['novo', 'em_contato', 'convertido', 'perdido'];
  const leads = await read('leads', []);
  const lead = leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'lead não encontrado' });
  if (status) {
    if (!permitidos.includes(status)) return res.status(400).json({ error: 'status inválido' });
    lead.status = status;
  }
  if (observacao !== undefined) lead.observacao = observacao;
  lead.atualizadoEm = agora();
  await write('leads', leads);
  res.json({ ok: true, lead });
});

router.delete('/admin/leads/:id', async (req, res) => {
  const leads = await read('leads', []);
  const lista = leads.filter((l) => l.id !== req.params.id);
  await write('leads', lista);
  res.json({ ok: true });
});

/* exportação CSV */
router.get('/admin/leads.csv', async (req, res) => {
  const leads = await read('leads', []);
  const colunas = [
    'criadoEm', 'status', 'nome_completo', 'empresa', 'segmento', 'papel_decisao',
    'funcionarios', 'porte_diario', 'estado', 'cidade', 'servicos_de_interesse',
    'situacao_atual', 'prazo_para_comecar', 'email', 'whatsapp',
    'pontuacao_prioridade', 'classificacao_prioridade',
  ];
  const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const linhas = [
    colunas.join(','),
    ...leads.map((l) => colunas.map((c) => escapar(Array.isArray(l[c]) ? l[c].join(' | ') : l[c])).join(',')),
  ];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="leads-cassarotti.csv"');
  res.send('\ufeff' + linhas.join('\n'));
});

/* ---------- configurações (credenciais da Evolution e senha) ---------- */
router.get('/admin/config', async (req, res) => {
  const s = { ...(await read('settings', {})) };
  delete s.adminSenha;
  delete s.cacheGruposWhats;
  if (s.evolution) {
    s.evolution = {
      apiUrl: s.evolution.apiUrl || '',
      instance: s.evolution.instance || '',
      apiKey: s.evolution.apiKey ? '••••••••' : '',
    };
  }
  res.json({ config: s, grupo: await getGrupoNotificacao() });
});

router.put('/admin/config', async (req, res) => {
  const s = await read('settings', {});
  const b = req.body || {};

  if (b.adminSenha) s.adminSenha = String(b.adminSenha);

  s.evolution = s.evolution || {};
  if (b.evolution) {
    if (b.evolution.apiUrl !== undefined) s.evolution.apiUrl = String(b.evolution.apiUrl).trim();
    if (b.evolution.instance !== undefined) s.evolution.instance = String(b.evolution.instance).trim();
    /* a chave só é trocada se um valor real for enviado */
    if (b.evolution.apiKey && !/•/.test(b.evolution.apiKey)) {
      s.evolution.apiKey = String(b.evolution.apiKey).trim();
    }
  }

  await write('settings', s);
  limparCredenciais();           /* as credenciais mudaram */
  res.json({ ok: true });
});

/* ---------- WhatsApp (Evolution): grupos e notificação ---------- */
router.get('/admin/whatsapp-grupos', async (req, res) => {
  if (!(await whatsappConfigurado())) {
    return res.status(503).json({ error: 'WhatsApp não configurado. Preencha URL, API key e instância em Configurações.' });
  }
  const forcar = String(req.query.forcar || '') === '1';
  const [lista, conexao] = await Promise.all([
    listarGruposWhatsApp({ forcar }),
    estadoConexaoWhatsApp(),
  ]);
  res.json({ grupos: lista.grupos, erro: lista.erro || null, conexao });
});

router.get('/admin/grupo-notificacao', async (req, res) => {
  res.json({ grupo: await getGrupoNotificacao() });
});

router.post('/admin/grupo-notificacao', async (req, res) => {
  const jid = String(req.body?.jid || '').trim();
  const nome = String(req.body?.nome || '').trim().slice(0, 120);
  if (!/^\d+@g\.us$/.test(jid)) return res.status(400).json({ error: 'jid de grupo inválido' });
  await setGrupoNotificacao({ jid, nome });
  res.json({ ok: true, grupo: { jid, nome } });
});

router.post('/admin/whatsapp-teste', async (req, res) => {
  const grupo = await getGrupoNotificacao();
  const destino = req.body?.jid || grupo?.jid;
  if (!destino) return res.status(400).json({ error: 'escolha um grupo primeiro' });
  const texto = req.body?.texto || '*Teste — Cassarotti Foods*\nMensagem de teste do painel de leads.';
  res.json(await enviarWhatsApp({ numero: destino, texto }));
});

/* eventos recentes (apoio ao painel) */
router.get('/admin/eventos', async (req, res) => {
  const eventos = await eventoLista(200);
  res.json({ eventos: eventos.slice(-30).reverse() });
});

export default router;
