# Formulário de Qualificação — Cassarotti Foods

Formulário interativo de captação e qualificação de leads, em 5 etapas, com
envio para a equipe comercial via WhatsApp.

Pessoas chegam vindas do Instagram e da página de vendas, respondem a algumas
perguntas rápidas e, ao final, o botão principal abre o WhatsApp comercial com a
mensagem já preenchida.

## Como rodar

É um único arquivo HTML com CSS e JavaScript embutidos — sem build, sem
dependências de servidor.

- Basta abrir o `index.html` em qualquer navegador; ou
- subir a pasta em qualquer hospedagem estática (Hostinger, Vercel, Netlify,
  GitHub Pages, Apache/Nginx).

Para testar localmente:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicação

Este projeto está no ar em **https://aprovacao2.vercel.app** (projeto Vercel
`aprovacao2`). Para republicar depois de alterar os arquivos:

```bash
vercel deploy --prod
```

## Arquivos

| Arquivo | Descrição |
| --- | --- |
| `index.html` | Formulário completo (CSS + JS embutidos) |
| `logo-cassarotti-claro.png` | Logo em versão clara (wordmark creme + ícone dourado), usado sobre o vidro escuro |
| `logo-cassarotti.png` | Logo original (preto e dourado), mantido para uso em fundos claros |
| `capa-fundadora.png` | Foto da capa inicial (foto real da fundadora) |

## Onde configurar

Tudo está comentado no próprio `index.html`.

1. **Endpoint do formulário** — no bloco `CONFIGURAÇÃO` do `<script>`:

   ```js
   const FORM_ENDPOINT = '{ENDPOINT_DO_FORMULARIO}';
   ```

   Troque pelo URL real da sua API/webhook (RD Station, Make, Pipedrive etc.).
   Enquanto estiver com o placeholder, o formulário roda em **modo demonstração**:
   monta o payload completo, registra no console do navegador e segue para a tela
   de agradecimento.

   O envio é um `POST` em JSON com todas as respostas, data/hora, origem (parâmetros
   UTM da URL) e a `pontuacao_prioridade` (cálculo interno, nunca exibida ao lead).

2. **WhatsApp comercial** — logo abaixo:

   ```js
   const WHATSAPP_NUMERO = '5543991662424';
   ```

3. **Telefone e e-mail exibidos** — na tela de agradecimento (trecho `contatos-secundarios`
   do HTML) e no rodapé.

4. **Cores** — no bloco `CORES E TOKENS` do `<style>` (variáveis CSS no topo):
   tema de **vidro escuro translúcido** (`--vidro`, `--vidro-forte`), textos claros
   (`--texto`, `--texto-suave`) e o acento em laranja queimado (`--acento`) para
   botões e destaques. O dourado (`--dourado`) aparece nas seleções e detalhes.

5. **Logo** — os arquivos `logo-cassarotti-claro.png` (usado na interface escura)
   e `logo-cassarotti.png` (original, para fundos claros). Ao trocar o logo,
   mantenha os dois ou aponte os `src` do HTML para o seu arquivo.

6. **Foto da capa** — substitua `capa-fundadora.png`. Se não quiser foto na capa,
   basta remover o bloco `<figure class="capa-foto">` do HTML.

## Como funciona

- **Capa inicial** com foto real da empresa; ao clicar, a capa sobe e o formulário
  aparece.
- **Fundo que clareia**: nasce quase preto e vai abrindo para um cinza grafite
  conforme as etapas avançam (`atualizarFundo` no JS). Os painéis são de
  **vidro escuro translúcido**, sempre um pouco menos escuros que o fundo.
- **Uma pergunta por tela**, com transição suave de ~400 ms. Perguntas de escolha
  única avançam sozinhas em 300 ms; telas com campo de texto usam o botão
  *Continuar*. Enter também avança quando a validação passa.
- **Validação em tempo real** com mensagens suaves, foco automático no próximo
  campo e botão *Voltar* em todas as etapas (sem perder respostas).
- **Rascunho salvo no `localStorage`**: se a página for fechada, as respostas
  continuam ali. Se o envio falhar, os dados ficam guardados e o botão
  *Tentar novamente* reenvia.
- **Pontuação de prioridade** (uso interno): porte, prazo, papel na decisão e
  segmento — incluída no JSON enviado.

## Acessibilidade

Contraste AA em todos os textos, `label` em todos os campos, navegação por
teclado, `fieldset`/`legend` nas perguntas, foco visível, `prefers-reduced-motion`
respeitado e alvos de toque grandes (mobile first). Auditoria do Lighthouse:
100% em acessibilidade, boas práticas e SEO.
