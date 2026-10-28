/**
 * Autenticação do painel — mesmo padrão do projeto oferta-fit:
 * senha única + sessão em cookie HttpOnly (30 dias).
 * Senha: ADMIN_SENHA (env) → settings.adminSenha → 'Comsoc1#'
 */
import crypto from 'node:crypto';
import { sessaoGet, sessaoSet, sessaoDelete, id } from './db.js';

const COOKIE = 'cf_session';
const DIAS = 30;

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
    })
  );
}

export async function criarSessao(res, usuarioId = 'admin', tipo = 'admin') {
  const token = id('ses') + crypto.randomBytes(24).toString('hex');
  await sessaoSet(token, { usuarioId, tipo, criadoEm: new Date().toISOString() }, DIAS);
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DIAS * 86400}`);
  return token;
}

export async function destruirSessao(req, res) {
  const token = parseCookies(req)[COOKIE];
  if (token) await sessaoDelete(token);
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
}

export async function sessaoAtual(req) {
  return sessaoGet(parseCookies(req)[COOKIE]);
}

export async function isSessaoAdmin(req) {
  const s = await sessaoAtual(req);
  return !!s && s.tipo === 'admin';
}

export async function requireAdmin(req, res, next) {
  if (!(await isSessaoAdmin(req))) {
    return res.status(401).json({ error: 'login de administrador necessário' });
  }
  next();
}
