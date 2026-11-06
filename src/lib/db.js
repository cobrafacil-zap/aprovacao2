/**
 * Armazenamento — mesmo padrão do projeto oferta-fit:
 *  - Produção (Vercel): Upstash Redis via REST  →  KV_REST_API_URL / KV_REST_API_TOKEN
 *  - Desenvolvimento: arquivos JSON em ./data
 *
 * Prefixo das chaves: cfdb: (isola dos dados de outros projetos no mesmo Redis)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PREFIXO = 'cfdb';
const DATA_DIR = path.join(process.cwd(), 'data');
const MAX_EVENTOS = 5000;

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const usaRedis = !!REDIS_URL;

/* cache curto em memória para reduzir chamadas ao Redis */
const cache = new Map();
function cacheGet(k) {
  const v = cache.get(k);
  return v && v.exp > Date.now() ? v.valor : null;
}
function cacheSet(k, valor) {
  cache.set(k, { valor, exp: Date.now() + 30_000 });
}

async function kv(comando, ...args) {
  const resp = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([comando, ...args]),
  });
  const json = await resp.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

const arquivoDe = (nome) => path.join(DATA_DIR, `${nome}.json`);

export function id(prefixo = 'id') {
  return `${prefixo}_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
}

export function agora() {
  return new Date().toISOString();
}

export async function read(nome, fallback) {
  const emCache = cacheGet(nome);
  if (emCache) return emCache;

  if (usaRedis) {
    const v = await kv('GET', `${PREFIXO}:${nome}`);
    if (v == null || v === '') return fallback;
    let valor;
    try { valor = JSON.parse(v); } catch { valor = fallback; }
    cacheSet(nome, valor);
    return valor;
  }

  try {
    const valor = JSON.parse(fs.readFileSync(arquivoDe(nome), 'utf8'));
    cacheSet(nome, valor);
    return valor;
  } catch {
    return fallback;
  }
}

export async function write(nome, dados) {
  cache.delete(nome);
  if (usaRedis) {
    await kv('SET', `${PREFIXO}:${nome}`, JSON.stringify(dados));
    cacheSet(nome, dados);
    return dados;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const arquivo = arquivoDe(nome);
  const tmp = `${arquivo}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(dados, null, 2));
  fs.renameSync(tmp, arquivo);
  cacheSet(nome, dados);
  return dados;
}

export async function update(nome, fallback, fn) {
  const dados = await read(nome, fallback);
  const resultado = fn(dados);
  await write(nome, dados);
  return resultado;
}

/* ---------- eventos de analytics ---------- */
export async function eventoAdd(evt) {
  const linha = JSON.stringify(evt);
  if (usaRedis) {
    await kv('LPUSH', `${PREFIXO}:events`, linha);
    await kv('LTRIM', `${PREFIXO}:events`, 0, MAX_EVENTOS - 1);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const eventos = await read('events', []);
  eventos.push(evt);
  await write('events', eventos.slice(-MAX_EVENTOS));
}

export async function eventoLista(limite = MAX_EVENTOS) {
  if (usaRedis) {
    const linhas = (await kv('LRANGE', `${PREFIXO}:events`, 0, limite - 1)) || [];
    return linhas.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  }
  return (await read('events', [])).slice(-limite);
}

/* ---------- sessões (login do painel) ---------- */
const sessoesLocal = new Map();

export async function sessaoGet(token) {
  if (!token) return null;
  if (usaRedis) {
    const v = await kv('GET', `${PREFIXO}:sess:${token}`);
    return v ? JSON.parse(v) : null;
  }
  const s = sessoesLocal.get(token);
  return s && s.expira > Date.now() ? s.dados : null;
}

export async function sessaoSet(token, dados, dias = 30) {
  if (usaRedis) {
    await kv('SET', `${PREFIXO}:sess:${token}`, JSON.stringify(dados), 'EX', Math.round(dias * 86400));
    return;
  }
  sessoesLocal.set(token, { dados, expira: Date.now() + dias * 864e5 });
}

export async function sessaoDelete(token) {
  if (usaRedis) {
    await kv('DEL', `${PREFIXO}:sess:${token}`);
    return;
  }
  sessoesLocal.delete(token);
}
