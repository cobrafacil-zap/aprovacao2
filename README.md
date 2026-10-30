# Cassarotti Foods — Formulário de leads + Painel administrativo

Formulário interativo de qualificação de leads (5 etapas) com capa animada, tema
de vidro escuro e envio direto para a equipe comercial. Inclui painel em `/admin`
com métricas de leads e notificação de novos leads em um grupo do WhatsApp via
**Evolution API**.

## Como rodar

```bash
npm install
npm start          # http://localhost:3000  (painel em /admin)
```

- **Site (formulário):** `public/index.html`
- **Painel:** `/admin` — senha padrão `Comsoc1#`

Em produção (Vercel) o banco é o **Upstash Redis**; em desenvolvimento os dados
ficam em arquivos JSON dentro de `data/` (criado automaticamente).

## Estrutura

```
api/index.js          entrypoint serverless da Vercel
server.js             servidor local
src/app.js            app Express
src/routes/leads.js   POST /api/leads, POST /api/track e /api/admin/*
src/lib/db.js         Upstash Redis (prod) ou JSON em data/ (dev)
src/lib/auth.js       login do painel (senha + cookie de sessão)
src/lib/analytics.js  métricas de leads
src/lib/evolution.js  notificação em grupo do WhatsApp (Evolution API)
public/               formulário, painel, imagens
```

## Configuração (arquivo `.env.example`)

| Variável | O que é | Obrigatória? |
| --- | --- | --- |
| `ADMIN_SENHA` | senha do `/admin` (padrão `Comsoc1#`) | não |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | banco de dados (nomes oficiais Upstash) | **sim, em produção** |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | os mesmos, com nomes alternativos | alternativa |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` | WhatsApp — notificação de leads | não |
| `EVOLUTION_GROUP_ID` | JID do grupo que recebe os avisos (alternativa ao seletor do painel) | não |
| `PORT` | porta do servidor local (`npm start`) | não |

Os pontos de configuração do formulário (WhatsApp comercial, cores, logo, fotos)
estão comentados no topo do `public/index.html` e do `<style>`.

## Métricas do painel

Cards: visitas, formulários iniciados, leads recebidos, alta prioridade,
**refeições/dia (potencial)**, **funcionários (potencial)**, conversão e leads do
último dia. Mais gráfico diário, funil de qualificação, origem do tráfego,
segmentos e prazos. A aba **Leads** tem busca, filtro de status (novo / em
contato / convertido / perdido) e exportação em CSV.

As somas de refeições/dia e funcionários usam o ponto médio de cada faixa
respondida no formulário (ex.: `501 a 2.000` → 1.250) — são estimativas de
potencial, não contagens exatas.

## Evolution API (grupo do WhatsApp)

A integração segue o padrão do projeto `P/repo` (`server/lib/whatsapp.js`): o
admin escolhe o grupo no painel e todo lead recebido vira uma mensagem lá com
nome, empresa, segmento, local, funcionários, refeições/dia, prazo, contato e
pontuação de prioridade. A notificação nunca bloqueia o formulário.

Credenciais (já configuradas em produção):

```
EVOLUTION_API_URL=https://evolution.metodogl.site
EVOLUTION_API_KEY=...            (a mesma do projeto PAINEL GL)
EVOLUTION_INSTANCE=painel-gl
```

Também podem ser preenchidas em **/admin → Configurações** (as variáveis de
ambiente têm prioridade). Para escolher o grupo:

1. Em **/admin → Configurações**, clique em **Carregar grupos** (a lista vem
   direto da Evolution — 42 grupos na conta atual).
2. Selecione o grupo desejado no seletor e clique em **Salvar grupo**.
3. Use **Enviar mensagem de teste** para conferir o aviso no grupo.

## Publicação

Publicado em **https://aprovacao2.vercel.app** (projeto Vercel `aprovacao2`).
Para republicar: `vercel deploy --prod`.

## Exportar e instalar em outro servidor

O projeto inteiro é o conteúdo desta pasta (sem `node_modules`, `data` nem
`.vercel`). Para colocar em outra conta/servidor:

### Opção 1 — Vercel (recomendada, sem servidor para cuidar)
1. Suba a pasta para um repositório Git (GitHub/GitLab).
2. Na Vercel: **New Project → Import** o repositório (detecção automática).
3. Em **Settings → Environment Variables**, cadastre as do `.env.example`
   (obrigatórias: as duas do banco; as demais são opcionais).
4. **Deploy**. Pronto — `https://SEU-PROJETO.vercel.app`.

### Opção 2 — servidor Node comum (VPS, cPanel, Railway, Render…)
```bash
npm install
# crie o .env a partir do .env.example e preencha
npm start          # sobe em http://localhost:3000
```
- Coloque um proxy (nginx/Caddy) com HTTPS na frente da porta 3000.
- O banco (Upstash) continua sendo na nuvem — funciona de qualquer servidor.
- Sem banco configurado, os dados ficam em `data/*.json` (bom só para testes).

### Banco de dados
Crie um banco gratuito em <https://upstash.com>, copie a **URL** e o **token**
REST e cadastre nas variáveis. As chaves usam o prefixo `cfdb:`, então podem
compartilhar o mesmo banco de outros projetos sem conflito.

### WhatsApp (opcional)
Precisa de uma instância da **Evolution API**. Depois de subir o site:
1. `/admin` → **Configurações** → **Carregar grupos**.
2. Escolha o grupo → **Salvar grupo** (ou use `EVOLUTION_GROUP_ID`).
3. **Enviar mensagem de teste** para conferir.

## Acessibilidade

Contraste AA, labels em todos os campos, navegação por teclado, foco visível,
`prefers-reduced-motion` respeitado, mobile first e layout sem rolagem
(o cartão se ajusta a cada etapa). Lighthouse: 100% em acessibilidade, boas
práticas e SEO.
