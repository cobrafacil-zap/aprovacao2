/**
 * Servidor local (npm start / npm run dev).
 */
import './src/lib/loadEnv.js';   /* carrega o .env antes de tudo */
import app from './src/app.js';
import { usaRedis } from './src/lib/db.js';

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Cassarotti Leads rodando em http://localhost:${porta}`);
  console.log(`Painel: http://localhost:${porta}/admin  (senha padrão: Comsoc1#)`);
  console.log(`Banco: ${usaRedis ? 'Upstash Redis' : 'arquivos JSON em ./data'}`);
});
