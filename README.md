# Cassarotti Foods — Landing page + Formulário de leads + Painel administrativo

Landing page institucional em `/` (apresentação da Cassarotti, com chamada para o
formulário), formulário interativo de orçamento de alimentação coletiva em
`/formulario` (4 etapas, capa animada, tema de vidro escuro) e painel em `/admin`
com métricas de entradas, leads e notificação de novos leads em um grupo do
WhatsApp via **Evolution API**.

## Como rodar

```bash
npm install
npm start          # http://localhost:3000  (painel em /admin)
```

- **Landing page (página inicial):** `public/index.html`
- **Formulário:** `/formulario` → `public/formulario.html`
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

Cards: **visitas ao site** (sessões na landing), **acessos ao formulário**,
formulários iniciados, leads recebidos, taxa de conversão, leads prioritários
(segmento × verticais ativas), empresas interessadas, leads aguardando contato
e convertidos. Mais gráfico diário, funil de qualificação (formulário → início →
envio → qualificado), origem do tráfego, segmentos, **campanhas de origem**
(UTM) e status dos leads.
A aba **Leads** mostra contato, empresa, segmento, **origem (campanha)** e
prioridade — com busca, filtro de status (novo / em contato / convertido /
perdido) e exportação em CSV.

Os dados do formulário atual são: nome, empresa, segmento, **faixa de
colaboradores**, e-mail, WhatsApp e origem (campanha/UTM/página). A pontuação de
prioridade soma **segmento** (verticais ativas das campanhas — construção/obras,
saúde, educação — valem mais) com o **porte** (faixa de colaboradores); `alta`
a partir de 75 pontos.

## Rastreamento (pixels e eventos)

Tudo já embutido nas páginas — basta subir o projeto. IDs atuais:

| Ferramenta | ID | Onde dispara |
| --- | --- | --- |
| Meta Pixel | `1863444494824308` | `PageView` em todas as páginas; `Lead` + `Obrigado` (personalizado) na tela de obrigado |
| LinkedIn Insight Tag | `11284833` | `PageView` em todas as páginas |
| LinkedIn — conversão "Lead - Formulário Cassarotti" | `conversionId=32601289` | pixel de conversão na tela de obrigado (mesma conversão associada às campanhas) |
| Google Tag Manager | `GTM-M8DJDVHS` | todas as páginas + evento `lead` no `dataLayer` na tela de obrigado |
| Google Ads — conversão | `AW-17030103726` / `R5V-CKid8o4bEK6Fy7g_` | evento `conversion` quando o formulário é enviado |

Eventos internos (`POST /api/track`): `lp_view`, `pageview`, `form_start`,
`lp_cta_click` e `lead_criado` — alimentam as métricas do painel.

## Exportar / instalar em um servidor novo

1. **Exporte o projeto:** painel `/admin` → Configurações → "Baixar projeto (.zip)"
   (inclui o `.env.example`; não inclui `data/`, `.env`, `node_modules`).
2. **Instale:** `npm install && npm start` (ou deploy na Vercel com
   `api/index.js` como entrypoint serverless).
3. **Variáveis de ambiente:** copie `.env.example` para `.env` e preencha:
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — **obrigatório em
     produção** (sem isso os dados não persistem);
   - `ADMIN_SENHA` — senha do painel;
   - `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` —
     notificação de leads no WhatsApp (também configurável no painel).
4. **WhatsApp:** `/admin` → Configurações → "Carregar grupos" e escolher o grupo
   que recebe os avisos (ou definir `EVOLUTION_GROUP_ID`).
5. **Rastreamento:** os pixels da tabela acima já estão nas páginas. Se for
   trocar de conta de anúncios, atualize os IDs em `public/index.html` e
   `public/formulario.html` (busque por `1863444494824308`, `11284833`,
   `32601289`, `GTM-M8DJDVHS`, `AW-17030103726`).
6. **Teste de fogo:** envie um formulário de teste e confira (a) a mensagem no
   grupo do WhatsApp, (b) o lead na aba Leads, (c) os eventos `Lead`/`lead`/
   conversão no assistente de tags (Meta Eventos, Google Tag Assistant e
   LinkedIn Campaign Manager).

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
