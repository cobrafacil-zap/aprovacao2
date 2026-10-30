/**
 * Carrega o arquivo .env (se existir) sem dependências externas.
 *
 * Em produção (Vercel) as variáveis vêm do painel da plataforma e este
 * carregador é ignorado (o arquivo normalmente não existe lá). Ele serve
 * para `npm start` em servidor comum: sobe o site sem precisar exportar
 * variáveis manualmente.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const caminho = resolve(dirname(fileURLToPath(import.meta.url)), '../../.env');
  const linhas = readFileSync(caminho, 'utf8').split(/\r?\n/);
  for (const linha of linhas) {
    const m = linha.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let valor = m[2].trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = valor;
  }
} catch {
  /* sem arquivo .env: usa as variáveis já definidas no sistema */
}
