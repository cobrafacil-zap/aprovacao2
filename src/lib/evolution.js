/**
 * WhatsApp via Evolution API (self-hosted) — aviso de novos leads em um grupo.
 *
 * Mesma integração do projeto "P/repo" (server/lib/whatsapp.js): o admin
 * escolhe um grupo no painel e todo lead recebido vira uma mensagem lá.
 * A notificação é SEMPRE silenciosa: nunca pode atrasar ou derrubar o envio
 * do formulário.
 *
 * Credenciais (nesta ordem de precedência):
 *   variáveis de ambiente  →  salvas no painel (/admin → WhatsApp)
 *     EVOLUTION_API_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE
 */
import { read, write } from './db.js';

/* as credenciais podem vir do env ou do painel; a leitura é assíncrona */
let credenciaisCache = null;

export async function carregarCredenciais() {
  if (credenciaisCache) return credenciaisCache;
  const settings = await read('settings', {});
  const evo = settings.evolution || {};
  credenciaisCache = {
    apiUrl: process.env.EVOLUTION_API_URL || evo.apiUrl || '',
    apiKey: process.env.EVOLUTION_API_KEY || evo.apiKey || '',
    instance: process.env.EVOLUTION_INSTANCE || evo.instance || '',
    fonte: process.env.EVOLUTION_API_URL ? 'ambiente' : (evo.apiUrl ? 'painel' : 'nenhuma'),
  };
  return credenciaisCache;
}

export function limparCredenciais() { credenciaisCache = null; }

export async function whatsappConfigurado() {
  const c = await carregarCredenciais();
  return Boolean(c.apiUrl && c.apiKey && c.instance);
}

/** Normaliza para o formato 55DDDNÚMERO (sem +, parênteses, espaços ou traço). */
export function numeroWhatsApp(bruto) {
  let n = String(bruto || '').replace(/\D/g, '');
  if (!n) return '';
  if (n.length >= 10 && n.length <= 11) n = '55' + n;
  return n.length >= 12 ? n : '';
}

/**
 * Manda uma mensagem de texto pela Evolution.
 * Nunca lança: devolve { sent, error } e quem chama decide o que fazer.
 */
export async function enviarWhatsApp({ numero, texto }) {
  const c = await carregarCredenciais();
  if (!(await whatsappConfigurado())) return { sent: false, error: 'whatsapp não configurado' };

  // Grupo (JID 120363...@g.us) entra direto; número normal passa pela régua.
  const destino = /@g\.us$/.test(String(numero || '').trim())
    ? String(numero).trim()
    : numeroWhatsApp(numero);
  if (!destino) return { sent: false, error: 'sem número válido' };

  try {
    const res = await fetch(`${c.apiUrl.replace(/\/$/, '')}/message/sendText/${encodeURIComponent(c.instance)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: c.apiKey },
      body: JSON.stringify({ number: destino, text: String(texto || '') }),
    });
    const raw = await res.text();
    if (!res.ok) return { sent: false, error: `evolution ${res.status}: ${raw.slice(0, 160)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e?.message || e).slice(0, 160) };
  }
}

/* ---------- Grupo de notificação (escolhido no painel) ---------- */
const CHAVE_GRUPO = 'grupoNotificacao';

export async function getGrupoNotificacao() {
  try {
    const s = await read('settings', {});
    return s[CHAVE_GRUPO] || null;
  } catch {
    return null;
  }
}

export async function setGrupoNotificacao({ jid, nome } = {}) {
  await update_settings((s) => { s[CHAVE_GRUPO] = { jid: String(jid || ''), nome: String(nome || '') }; });
}

async function update_settings(fn) {
  const s = await read('settings', {});
  fn(s);
  await write('settings', s);
}

/** Estado da conexão da instância ('open' = conectado). */
export async function estadoConexaoWhatsApp() {
  if (!(await whatsappConfigurado())) return { conectado: false, estado: 'nao_configurado' };
  const c = await carregarCredenciais();
  try {
    const res = await fetch(`${c.apiUrl.replace(/\/$/, '')}/instance/connectionState/${encodeURIComponent(c.instance)}`, {
      headers: { apikey: c.apiKey },
    });
    const json = await res.json().catch(() => ({}));
    const estado = String(json?.instance?.state || json?.state || '').toLowerCase();
    return { conectado: estado === 'open', estado: estado || 'desconhecido' };
  } catch {
    return { conectado: false, estado: 'sem_resposta' };
  }
}

/**
 * Lista os grupos do WhatsApp (para o seletor do painel).
 * Cada versão da Evolution responde num endpoint diferente; tentamos todos.
 */
export async function listarGruposWhatsApp({ forcar = false } = {}) {
  if (!(await whatsappConfigurado())) return { grupos: [], erro: 'whatsapp não configurado' };
  const c = await carregarCredenciais();

  /* cache de 10 min: a Evolution tem limite de consultas */
  const CHAVE_CACHE = 'cacheGruposWhats';
  if (!forcar) {
    const s = await read('settings', {});
    const cache = s[CHAVE_CACHE];
    if (cache && Array.isArray(cache.grupos) && cache.grupos.length &&
        Date.now() - (cache.em || 0) < 10 * 60 * 1000) {
      return { grupos: cache.grupos, erro: null, emCache: true };
    }
  }

  const inst = encodeURIComponent(c.instance);
  const tentativas = [
    `/group/fetchAllGroups/${inst}?getParticipants=false`,
    `/group/fetchAllGroups/${inst}`,
    `/group/list/${inst}`,
    `/group/findGroups/${inst}`,
  ];
  const erros = [];
  for (const caminho of tentativas) {
    try {
      const res = await fetch(`${c.apiUrl.replace(/\/$/, '')}${caminho}`, { headers: { apikey: c.apiKey } });
      const raw = await res.text();
      if (/rate-overlimit|rate.?limit/i.test(raw)) {
        return { grupos: [], erro: 'a Evolution está com limite de consultas agora — espere ~1 minuto e atualize.' };
      }
      if (!res.ok) { erros.push(`${caminho.split('?')[0]} → ${res.status}`); continue; }
      const json = JSON.parse(raw || 'null');
      const bruto = Array.isArray(json) ? json
        : Array.isArray(json?.data) ? json.data
        : Array.isArray(json?.groups) ? json.groups
        : Array.isArray(json?.response) ? json.response
        : Array.isArray(json?.response?.data) ? json.response.data
        : [];
      const grupos = bruto
        .map((g) => ({ jid: String(g?.id ?? g?.jid ?? '').trim(), nome: String(g?.subject ?? g?.name ?? '').trim() }))
        .filter((g) => /@g\.us$/.test(g.jid))
        .map((g) => ({ jid: g.jid, nome: g.nome || g.jid }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      if (grupos.length) {
        await update_settings((s) => { s[CHAVE_CACHE] = { grupos, em: Date.now() }; });
      }
      return { grupos, erro: null };
    } catch (e) {
      erros.push(`${caminho.split('?')[0]} → ${String(e?.message || e).slice(0, 60)}`);
    }
  }
  return { grupos: [], erro: `a Evolution recusou a listagem (${erros.slice(0, 2).join(' · ')})` };
}

/** Mensagem de novo lead pro grupo (fatos, sem propaganda). */
export function mensagemNovoLead(lead) {
  const quando = new Date(lead?.criadoEm || Date.now())
    .toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return [
    '📥 *Novo lead — Cassarotti Foods*',
    `${lead.nome_completo} · ${lead.empresa}`,
    `${lead.segmento} · ${lead.papel_decisao || '—'}`,
    `${lead.cidade}/${lead.estado} · ${quando}`,
    '',
    `Funcionários: ${lead.funcionarios || '—'}`,
    `Alimentações/dia: ${lead.porte_diario || '—'}`,
    `Serviço: ${(lead.servicos_de_interesse || []).join(', ') || '—'}`,
    `Prazo: ${lead.prazo_para_comecar || '—'}`,
    '',
    `WhatsApp: ${lead.whatsapp}`,
    `E-mail: ${lead.email}`,
    `Prioridade: ${lead.pontuacao_prioridade} pts (${lead.classificacao_prioridade})`,
  ].join('\n');
}

/** Avisa o grupo escolhido. Nunca lança. */
export async function avisarLeadNoGrupo(lead) {
  try {
    const grupo = await getGrupoNotificacao();
    if (!grupo?.jid) return { sent: false, error: 'nenhum grupo escolhido no painel' };
    return await enviarWhatsApp({ numero: grupo.jid, texto: mensagemNovoLead(lead) });
  } catch (e) {
    return { sent: false, error: String(e?.message || e).slice(0, 160) };
  }
}
