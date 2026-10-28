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

| Variável | O que é |
| --- | --- |
| `ADMIN_SENHA` | senha do `/admin` (padrão `Comsoc1#`) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis (obrigatório em produção) |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` / `EVOLUTION_GROUP_ID` | notificação de leads em grupo — também configuráveis no próprio painel |

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

Ao cadastrar um lead, o servidor envia uma mensagem com nome, empresa, segmento,
local, funcionários, refeições/dia, prazo, contato e pontuação de prioridade para
o grupo configurado. Configure em **/admin → Configurações**:

1. Preencha URL, API key e nome da instância.
2. Clique em **Testar conexão e listar grupos**.
3. Escolha o grupo na lista (o JID é copiado automaticamente) e salve.
4. Use **Enviar mensagem de teste** para conferir.

## Publicação

Publicado em **https://aprovacao2.vercel.app** (projeto Vercel `aprovacao2`).
Para republicar: `vercel deploy --prod`.

## Acessibilidade

Contraste AA, labels em todos os campos, navegação por teclado, foco visível,
`prefers-reduced-motion` respeitado, mobile first e layout sem rolagem
(o cartão se ajusta a cada etapa). Lighthouse: 100% em acessibilidade, boas
práticas e SEO.
