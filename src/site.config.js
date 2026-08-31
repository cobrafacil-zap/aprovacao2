/**
 * Dados de configuração da campanha — Juliana Constantino 1424
 *
 * Candidato: Deputada Federal — Partido Missão — Jundiaí-SP 2026
 *
 * Identidade visual (original, não inspirada no material de campanha fornecido):
 *  - Sistema monocromático preto profundo + off-white + amarelo-mostarda
 *  - Acento secundário: verde-musgo (institucional)
 *  - Tipografia: DM Serif Display (manchetes, citações) + Inter (corpo) + JetBrains Mono (metadados)
 *
 * ⚠️ LGPD/TSE: CNPJ de campanha, partido e endereço do site devem aparecer no rodapé.
 */

export const SITE = {
  // Identificação
  name: 'Juliana Constantino',
  shortName: 'Juliana',
  role: 'Candidata a Deputada Federal',
  state: 'São Paulo',
  city: 'Jundiaí',
  party: 'Missão',
  partyFull: 'Partido Missão',
  number: '1424',
  numberDisplay: '1424',
  coalition: 'Partido Missão',

  // Slogan — frase em primeira pessoa, sem populismo, direta
  slogan: 'Não vim buscar benefício. Vim fazer o sistema parar de funcionar contra você.',
  subtitle: 'Renovar o Congresso com gente que fiscaliza de verdade.',

  // Bio curta
  shortBio:
    'Sou de Jundiaí, mãe, cristã e incomodada com um Congresso que protege quem ' +
    'deveria fiscalizar. Acredito que o próximo passo do Brasil é menos máquina ' +
    'pública inchada e mais poder de compra no bolso de quem trabalha.',

  // Contatos — preencher com dados reais da campanha
  contacts: {
    email: 'contato@julianaconstantino.com.br',
    press: 'imprensa@julianaconstantino.com.br',
    instagram: 'https://www.instagram.com/julianaconstantino',
    tiktok: 'https://www.tiktok.com/@julianaconstantino',
    facebook: null,
    youtube: null,
  },

  // Endereço do comitê (preencher)
  address: {
    street: null,
    city: 'Jundiaí',
    state: 'SP',
    zip: null,
  },

  // Identificação legal obrigatória (Res. TSE 23.732/2024)
  legal: {
    cnpjCampanha: '00.000.000/0001-00',
    partidoUf: 'Missão - São Paulo',
    autorizadoPor: 'Partido Missão',
    enderecoSiteComunicado: true,
  },

  // Configuração da Home
  home: {
    heroEyebrow: 'Eleições 2026 · Partido Missão · Jundiaí-SP · Deputada Federal',
    ctaPrimary: 'Conheça minhas propostas',
    ctaSecondary: 'Falar com a Juliana',
    manifesto:
      'O Congresso virou balcão de negócios. Alguns deputados buscam o cargo ' +
      'pra usar verba, gabinete com 25 assessores, combustível e moradia. ' +
      'Eu não vim pra isso. Vim pra fiscalizar, cortar desperdício e devolver ' +
      'pra quem produz.',
  },

  // Meta/SEO
  seo: {
    title: 'Juliana Constantino · 1424 · Candidata a Deputada Federal',
    description:
      'Juliana Constantino, 1424 do Partido Missão. Candidata a Deputada Federal ' +
      'por Jundiaí-SP em 2026. Menos impostos, menos máquina pública, mais poder de compra.',
    keywords:
      'Juliana Constantino, 1424, Partido Missão, Deputada Federal, Jundiaí, ' +
      'eleições 2026, Congresso, fiscalização',
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image',
  },

  // Integrações
  integrations: {
    donationPlatform: null,
    donationUrl: '#',
    whatsappGroup: null,
  },
};

export const NAV = [
  { href: '/', label: 'Início' },
  { href: '/sobre/', label: 'Quem é' },
  { href: '/propostas/', label: 'Propostas' },
  { href: '/apoie/', label: 'Apoie' },
  { href: '/contato/', label: 'Contato' },
];

// Cinco eixos de luta — linguagem direta, sem populismo
export const PILLARS = [
  {
    id: 'impostos',
    numero: '01',
    titulo: 'Menos imposto, mais bolso',
    resumo:
      'A carga tributária brasileira é uma das piores do mundo. Antes de criar ' +
      'novos tributos, o Congresso precisa cortar o que existe.',
    acoes: [
      'Revisão da tabela do IR pra desonerar quem ganha até 5 salários mínimos',
      'Fim de privilégios tributários pra grandes empresas que não reinvestem no país',
      'Transparência ativa: portal público com destino de cada centavo arrecadado',
    ],
  },
  {
    id: 'maquina',
    numero: '02',
    titulo: 'Menos máquina, mais serviço',
    resumo:
      'A máquina pública está inchada e o serviço sumiu. Cortar gasto é ' +
      'questão de respeito com quem paga imposto.',
    acoes: [
      'Fim da verba de gabinete que permite 25 assessores por parlamentar',
      'Fim dos auxílios moradia, combustível e alimentação que se confundem com salário',
      'Auditoria pública anual de todos os cargos comissionados do Executivo',
    ],
  },
  {
    id: 'juros',
    numero: '03',
    titulo: 'Juros menores, moeda forte',
    resumo:
      'Taxa Selic em dois dígitos é escolha política. Juro alto é transferência ' +
      'de renda dos mais pobres pra banqueiros.',
    acoes: [
      'CPI permanente do Sistema Financeiro pra investigar spread bancário',
      'Fim do sigilo bancário do Banco Central sobre operações com títulos públicos',
      'Marco regulatório das fintechs pra garantir concorrência real',
    ],
  },
  {
    id: 'seguranca',
    numero: '04',
    titulo: 'Penas firmes, cidadão protegido',
    resumo:
      'Quem cumpre a lei tem direito a um Estado que cumpre a sua parte. ' +
      'Criminalidade se combate com investigação e punição, não com improviso.',
    acoes: [
      'Aumento de pena pra crimes hediondos cometidos com violência grave',
      'Fim da progressão de regime automática sem avaliação de conduta',
      'Reestruturação da polícia investigativa federal com concurso anual',
    ],
  },
  {
    id: 'educacao',
    numero: '05',
    titulo: 'Educação com base e mérito',
    resumo:
      'Apoio a quem escolhe o homeschooling e novas diretrizes: só passa pra ' +
      'próxima série quem tem condição de aprender.',
    acoes: [
      'Regulamentação clara do homeschooling com avaliação anual do MEC',
      'Fim da aprovação automática sem critério de aprendizagem',
      'Programa nacional de reforço escolar pra alfabetização até os 8 anos',
    ],
  },
];

// Propostas detalhadas — Jundiaí-SP como recorte local
export const PROPOSALS = [
  {
    id: 'jundiai-mobilidade',
    numero: '01',
    titulo: 'Mobilidade urbana pra Jundiaí não virar só lugar de passagem',
    intro:
      'Jundiaí está saturada de empreendimentos novos sem que o transporte público ' +
      'acompanhe. O Congresso pode liberar recursos e fiscalizar planos diretores.',
    corpo: [
      'Destinação de emenda parlamentar pra ampliação do transporte coletivo metropolitano',
      'Fiscalização da aplicação da Política Nacional de Mobilidade Urbana em cada município',
      'Estímulo a projetos de mobilidade ativa (ciclovias e calçadas acessíveis)',
    ],
  },
  {
    id: 'jundiai-saude',
    numero: '02',
    titulo: 'Saúde pública que funciona de verdade',
    intro:
      'Fila de 6 meses pra consulta, pronto-socorro lotado, gente pagando plano ' +
      'que não usa. O SUS precisa de gestão, não só de mais dinheiro.',
    corpo: [
      'Reforma da gestão do SUS com metas e avaliação de resultado por município',
      'Fim da indicação política pra direção de hospitais federais',
      'Programa de atendimento regional pra reduzir deslocamento de pacientes',
    ],
  },
  {
    id: 'economia-domestica',
    numero: '03',
    titulo: 'Poder de compra pra quem trabalha',
    intro:
      'O brasileiro trabalha 5 meses por ano só pra pagar imposto. Antes de ' +
      'qualquer reforma, é preciso devolver renda pra base da pirâmide.',
    corpo: [
      'Isenção de IR pra quem ganha até 5 salários mínimos',
      'Redução gradual da alíquota de IRPJ pra empresas que comprovadamente geram empregos',
      'Fim da cumulatividade de PIS/COFINS sobre itens da cesta básica',
    ],
  },
  {
    id: 'seguranca-cidada',
    numero: '04',
    titulo: 'Estado firme contra o crime',
    intro:
      'Não existe Estado de Direito sem investigação qualificada e pena cumprida. ' +
      'Criminalidade é problema que precisa de resposta técnica, não de discurso.',
    corpo: [
      'Reestruturação das polícias federais com plano de carreira baseado em mérito',
      'Aumento de pena pra crimes patrimoniais cometidos com violência grave',
      'Fim da prescrição retroativa em processos de corrupção',
    ],
  },
  {
    id: 'cidadania-fiscal',
    numero: '05',
    titulo: 'Onde vai o dinheiro público',
    intro:
      'A maior parte do brasileiro não sabe quanto paga de imposto nem pra onde vai. ' +
      'Transparência não é favor — é obrigação.',
    corpo: [
      'Portal único federal com execução orçamentária em tempo real',
      'Rastreabilidade individual de emendas parlamentares com autoria e destino',
      'Punição automática pra gestor que descumprir prazo de prestação de contas',
    ],
  },
  {
    id: 'familia-escola',
    numero: '06',
    titulo: 'Família no centro da educação',
    intro:
      'Apoio ao homeschooling e novas diretrizes: passar de série deve significar ' +
      'que o aluno aprendeu. Sem aprovação automática.',
    corpo: [
      'Regulamentação do homeschooling com avaliação anual de aprendizagem',
      'Fim da aprovação automática sem critério pedagógico',
      'Programa nacional de reforço escolar com foco em alfabetização até os 8 anos',
    ],
  },
];

// Galeria — baseada nas imagens profissionais enviadas
export const GALLERY = [
  {
    src: '/images/juliana-retrato-branco.jpg',
    alt: 'Juliana Constantino, de camisa branca, braços cruzados, em fundo claro — postura firme e olhar direto.',
    caption: 'Firme.',
    thumb: '/images/juliana-retrato-branco.jpg',
  },
  {
    src: '/images/juliana-bandeira.jpg',
    alt: 'Juliana Constantino segurando a bandeira do Partido Missão, em pose frontal.',
    caption: 'Missão.',
    thumb: '/images/juliana-bandeira.jpg',
  },
  {
    src: '/images/juliana-1424.jpg',
    alt: 'Juliana Constantino com número 1424 e chamada ao novo estado — campanha Deputada Federal.',
    caption: '1424.',
    thumb: '/images/juliana-1424.jpg',
  },
  {
    src: '/images/juliana-2.jpg',
    alt: 'Juliana Constantino em retrato adicional da campanha.',
    caption: 'Direto.',
    thumb: '/images/juliana-2.jpg',
  },
  {
    src: '/images/juliana-3.jpg',
    alt: 'Juliana Constantino em mais um retrato da campanha.',
    caption: 'Sem filtro.',
    thumb: '/images/juliana-3.jpg',
  },
  {
    src: '/images/juliana-4.jpg',
    alt: 'Juliana Constantino em outro registro da campanha.',
    caption: 'Sem rodeio.',
    thumb: '/images/juliana-4.jpg',
  },
];

// Frases curtas, sem populismo, pra citar na home
export const QUOTES = [
  'Não vim buscar benefício do cargo. Vim fiscalizar quem está lá.',
  'Achar que corrupto quer se eleger pra se beneficiar é entender o problema.',
  'Antes de criar imposto novo, precisa cortar o que tem.',
  'Menos máquina pública. Mais serviço público.',
  'Educação com mérito não é castigo — é respeito com a criança.',
];
