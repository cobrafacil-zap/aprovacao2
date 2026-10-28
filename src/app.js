/**
 * Aplicação Express — formulário + painel de leads da Cassarotti Foods.
 * Estrutura espelhada do projeto oferta-fit.
 */
import express from 'express';
import 'express-async-errors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes/leads.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '256kb' }));

/* rotas da API */
app.use('/api', routes);

/* páginas */
app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin.html')));
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

/* erros */
app.use((err, req, res, next) => {
  console.error('[cassarotti]', err);
  res.status(500).json({ error: 'erro interno' });
});

export default app;
