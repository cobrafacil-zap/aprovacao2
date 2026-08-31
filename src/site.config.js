/**
 * Dados de configuração da campanha — Juliana Constantino 1424
 *
 * Candidato: Deputada Federal — Partido Missão — Jundiaí-SP 2026
 *
 * ⚠️ LGPD/TSE: CNPJ de campanha, partido e endereço do site devem aparecer no rodapé.
 */

export const SITE = {
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

  // Frase em primeira pessoa, sem promessa grande
  slogan: 'Não vim buscar benefício. Vim fiscalizar quem está lá.',

  // Subtítulo — escrito do jeito que ela fala
  subtitle: 'Renovar o Congresso com gente que fiscaliza de verdade, não que se beneficia dele.',

  // Bio curta — texto cru, com a voz dela
  shortBio:
    'Sou de Jundiaí, mãe, cristã. Incomodada com um Congresso que virou balcão ' +
    'de negócio. Vou pra Brasília pra fiscalizar — não pra usar.',

  contacts: {
    email: 'contato@julianaconstantino.com.br',
    press: 'imprensa@julianaconstantino.com.br',
    instagram: 'https://www.instagram.com/julianaconstantino',
    tiktok: 'https://www.tiktok.com/@julianaconstantino',
    facebook: null,
    youtube: null,
  },

  address: {
    street: null,
    city: 'Jundiaí',
    state: 'SP',
    zip: null,
  },

  legal: {
    cnpjCampanha: '00.000.000/0001-00',
    partidoUf: 'Missão - São Paulo',
    autorizadoPor: 'Partido Missão',
    enderecoSiteComunicado: true,
  },

  home: {
    heroEyebrow: 'Eleições 2026 · Partido Missão · Jundiaí-SP · Deputada Federal',
    ctaPrimary: 'Conheça minhas propostas',
    ctaSecondary: 'Quem é a Juliana',
    // Texto cru, curto. Sem parágrafos longos.
    manifesto:
      'Corrupto quer se eleger pra se beneficiar do cargo. Corrupto protege ' +
      'corrupto. E é por isso que não mudo o discurso pra agradar ninguém.',
  },

  seo: {
    title: 'Juliana Constantino · 1424 · Candidata a Deputada Federal',
    description:
      'Juliana Constantino, 1424 do Partido Missão. Candidata a Deputada Federal ' +
      'por Jundiaí-SP. Menos imposto, menos máquina, mais fiscalização.',
    keywords:
      'Juliana Constantino, 1424, Partido Missão, Deputada Federal, Jundiaí, ' +
      'eleições 2026, Congresso, fiscalização',
    ogImage: '/og-image.jpg',
    twitterCard: 'summary_large_image',
  },

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

// Cinco frentes. Linguagem direta, sem jargão técnico.
export const PILLARS = [
  {
    id: 'impostos',
    numero: '01',
    titulo: 'Menos imposto, mais bolso',
    resumo:
      'Antes de criar tributo novo, o Congresso tem que cortar o que já tem. ' +
      'O brasileiro trabalha cinco meses por ano só pra pagar imposto.',
    acoes: [
      'Revisar a tabela do IR pra quem ganha até cinco salários mínimos',
      'Tirar privilégio de empresa grande que não reinveste no país',
      'Mostrar, em portal público, pra onde vai cada centavo que o governo arrecada',
    ],
  },
  {
    id: 'maquina',
    numero: '02',
    titulo: 'Menos máquina, mais serviço',
    resumo:
      'A máquina pública tá inchada e o serviço sumiu. Tem deputado com ' +
      'verba de gabinete pra 25 assessores. Isso é absurdo.',
    acoes: [
      'Acabar com a verba de gabinete que banca 25 assessores por parlamentar',
      'Acabar com auxílio-moradia, combustível e alimentação que viraram salário',
      'Publicar, todo ano, a lista dos cargos comissionados do Executivo',
    ],
  },
  {
    id: 'juros',
    numero: '03',
    titulo: 'Juro menor, moeda mais forte',
    resumo:
      'Selic em dois dígitos é escolha política. Juro alto é transferência ' +
      'de renda de pobre pra banqueiro. Quem paga essa conta é quem menos tem.',
    acoes: [
      'CPI permanente do sistema financeiro pra investigar o spread bancário',
      'Tirar o sigilo do Banco Central sobre operações com título público',
      'Regra clara pra fintech — concorrência de verdade, não carta branca',
    ],
  },
  {
    id: 'seguranca',
    numero: '04',
    titulo: 'Pena firme, cidadão protegido',
    resumo:
      'Quem cumpre a lei tem direito a um Estado que cumpre a parte dele. ' +
      'Criminalidade se combate com investigação e punição, não com discurso.',
    acoes: [
      'Pena maior pra crime hediondo cometido com violência grave',
      'Tirar progressão de regime automática — quem cumpre mal, fica preso',
      'Concurso anual pra polícia investigativa federal',
    ],
  },
  {
    id: 'educacao',
    numero: '05',
    titulo: 'Educação com base e mérito',
    resumo:
      'Quem escolhe homeschooling tem meu apoio. E passar de série tem que ' +
      'significar que o aluno aprendeu. Aprovação automática é mentira.',
    acoes: [
      'Regulamentar o homeschooling com avaliação anual de aprendizagem',
      'Acabar com aprovação automática sem critério de conhecimento',
      'Programa de reforço pra alfabetizar toda criança até os oito anos',
    ],
  },
];

// Recorte local — Jundiaí-SP
export const PROPOSALS = [
  {
    id: 'jundiai-mobilidade',
    numero: '01',
    titulo: 'Jundiaí não pode virar só lugar de passagem',
    intro:
      'Tá saindo empreendimento novo toda semana e o transporte público ' +
      'continua o mesmo. O Congresso libera verba e fiscaliza plano diretor.',
    corpo: [
      'Emenda pra ampliar o transporte coletivo metropolitano',
      'Fiscalizar se cada município tá cumprindo a Política Nacional de Mobilidade',
      'Ciclovia e calçada acessível onde a prefeitura não fizer',
    ],
  },
  {
    id: 'jundiai-saude',
    numero: '02',
    titulo: 'Saúde pública que funciona',
    intro:
      'Fila de seis meses pra consulta, pronto-socorro lotado, gente ' +
      'pagando plano de saúde que não usa. O SUS precisa de gestão.',
    corpo: [
      'Metas e avaliação de resultado por município, não só dinheiro novo',
      'Tirar indicação política da direção de hospital federal',
      'Atendimento regional pra paciente não precisar atravessar a cidade',
    ],
  },
  {
    id: 'economia-domestica',
    numero: '03',
    titulo: 'Poder de compra pra quem trabalha',
    intro:
      'Antes de qualquer reforma, devolve renda pra base. O brasileiro já ' +
      'paga imposto demais — e ainda paga tudo mais caro.',
    corpo: [
      'Isenção de IR pra quem ganha até cinco salários mínimos',
      'Reduzir IRPJ de empresa que comprovadamente gera emprego',
      'Tirar PIS/COFINS de item da cesta básica',
    ],
  },
  {
    id: 'seguranca-cidada',
    numero: '04',
    titulo: 'Estado firme contra o crime',
    intro:
      'Não existe Estado de Direito sem investigação qualificada e pena ' +
      'cumprida. Resposta pra criminalidade é técnica, não panfleto.',
    corpo: [
      'Reestruturar as polícias federais com plano de carreira por mérito',
      'Pena maior pra crime patrimonial com violência grave',
      'Acabar com prescrição retroativa em processo de corrupção',
    ],
  },
  {
    id: 'cidadania-fiscal',
    numero: '05',
    titulo: 'Onde vai o dinheiro público',
    intro:
      'A maioria do brasileiro não sabe quanto paga de imposto nem pra onde ' +
      'vai. Transparência não é favor — é obrigação do Estado.',
    corpo: [
      'Portal único federal com a execução do orçamento em tempo real',
      'Cada emenda parlamentar com nome do autor e destino rastreável',
      'Gestor que não prestar contas no prazo toma punição automática',
    ],
  },
  {
    id: 'familia-escola',
    numero: '06',
    titulo: 'Família no centro da educação',
    intro:
      'Apoio homeschooling. E aprovar sem critério é desrespeitar a criança — ' +
      'e a família que paga imposto pra escola funcionar.',
    corpo: [
      'Regulamentar homeschooling com avaliação anual',
      'Acabar com aprovação automática sem critério pedagógico',
      'Reforço escolar com foco em alfabetização até os oito anos',
    ],
  },
];

// Galeria — 6 fotos profissionais da candidata
export const GALLERY = [
  {
    src: '/images/juliana-retrato-branco.jpg',
    alt: 'Juliana Constantino, de camisa branca, braços cruzados, em fundo claro.',
    thumb: '/images/juliana-retrato-branco.jpg',
  },
  {
    src: '/images/juliana-bandeira.jpg',
    alt: 'Juliana Constantino segurando a bandeira do Partido Missão.',
    thumb: '/images/juliana-bandeira.jpg',
  },
  {
    src: '/images/juliana-1424.jpg',
    alt: 'Juliana Constantino com o número 1424, campanha para Deputada Federal.',
    thumb: '/images/juliana-1424.jpg',
  },
  {
    src: '/images/juliana-2.jpg',
    alt: 'Juliana Constantino em retrato da campanha.',
    thumb: '/images/juliana-2.jpg',
  },
  {
    src: '/images/juliana-3.jpg',
    alt: 'Juliana Constantino em mais um retrato da campanha.',
    thumb: '/images/juliana-3.jpg',
  },
  {
    src: '/images/juliana-4.jpg',
    alt: 'Juliana Constantino em outro registro da campanha.',
    thumb: '/images/juliana-4.jpg',
  },
];

// Frases curtas — algumas da própria Juliana
export const QUOTES = [
  'Não vim buscar benefício do cargo. Vim fiscalizar quem está lá.',
  'Corrupto quer se eleger pra se beneficiar do cargo. Corrupto protege corrupto.',
  'Antes de criar imposto novo, precisa cortar o que tem.',
  'Menos máquina pública. Mais serviço público.',
  'Passar de série tem que significar que o aluno aprendeu.',
];