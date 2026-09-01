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
    emailOficial: 'julianaconstantino.2016@gmail.com',
    instagram: 'https://www.instagram.com/julianaconstantino',
    tiktok: 'https://www.tiktok.com/@julianaconstantino',
    facebook: null,
    youtube: null,
  },

  address: {
    street: 'Av. Antônio Frederico Ozanam, 9300, Apto 52, Bloco 4',
    neighborhood: 'Jardim Shangai',
    city: 'Jundiaí',
    state: 'SP',
    zip: '13.214-206',
  },

  legal: {
    cnpjCampanha: '68.504.085/0001-89',
    razaoSocial: 'ELEICAO 2026 JULIANA CONSTANTINO DE OLIVEIRA DEPUTADO FEDERAL',
    dataAbertura: '11/08/2026',
    naturezaJuridica: '409-0 — Candidato a Cargo Político Eletivo',
    atividadePrincipal: '94.92-8-00 — Atividades de organizações políticas',
    situacaoCadastral: 'ATIVA',
    partidoUf: 'Missão - São Paulo',
    autorizadoPor: 'Partido Missão',
    enderecoSiteComunicado: true,
  },

  home: {
    heroEyebrow: 'Eleições 2026 · Partido Missão · Jundiaí-SP · Deputada Federal',
    ctaPrimary: 'Conheça minhas propostas',
    ctaSecondary: 'Quem é a Juliana',
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

// Cinco frentes. Linguagem direta, voz da candidata.
export const PILLARS = [
  {
    id: 'impostos',
    numero: '01',
    titulo: 'Menos imposto, mais bolso',
    resumo:
      'Antes de criar tributo novo, o Congresso tem que cortar o que já tem. ' +
      'O brasileiro trabalha cinco meses por ano só pra pagar imposto.',
    acoes: [
      'Revisão da tabela do IR pra todos',
      'Revisar privilégios de empresas de grande porte que não reinvestem no país',
      'Diminuir impostos sobre consumo',
    ],
  },
  {
    id: 'maquina',
    numero: '02',
    titulo: 'Menos máquina, mais serviço',
    resumo:
      'A máquina pública está inchada e não vemos retorno em serviços.',
    acoes: [
      'Cortar salários acima do teto',
      'Acabar com o auxílio-moradia, auxílio-combustível e auxílio-alimentação que viraram salário',
      'Diminuir a verba de gabinete e a quantidade de assessores permitidos',
    ],
  },
  {
    id: 'controle-gastos',
    numero: '03',
    titulo: 'Controle de gastos do governo',
    resumo:
      'Diminuir os gastos da máquina pública e, por consequência, os ' +
      'empréstimos do governo — assim os juros caem. Com menos impostos e ' +
      'menos juros, a moeda fica mais valorizada e o poder de compra aumenta.',
    acoes: [
      'Teto real de gasto público, com auditoria anual',
      'Acabar com desperdício e mordomia bancada com dinheiro público',
      'Vinculação de empréstimo público a projeto com retorno mensurável',
    ],
  },
  {
    id: 'seguranca',
    numero: '04',
    titulo: 'Pena firme, cidadão protegido',
    resumo:
      '',
    acoes: [
      'Penas maiores pra todo tipo de crime',
      'O preso deve trabalhar pra pagar suas despesas e manter sua família',
      'Proibição das saídas temporárias (saidinhas) e das visitas íntimas',
    ],
  },
  {
    id: 'educacao',
    numero: '05',
    titulo: 'A igualdade começa na educação de base de qualidade para todos',
    resumo:
      '',
    acoes: [
      'Fim da aprovação automática sem critério de aprendizagem',
      'Salas separadas e professores preparados pra ensinar alunos neurodivergentes',
      'Programa nacional de reforço escolar pra alfabetização até os oito anos',
    ],
  },
];

// Recorte local — Jundiaí-SP e pautas nacionais detalhadas
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
    id: 'saude-publica',
    numero: '02',
    titulo: 'Saúde pública que funciona',
    intro:
      'Filas pra consultas, filas pra cirurgias, pronto-socorro lotado. ' +
      'O SUS precisa de gestão, não só de mais dinheiro.',
    corpo: [
      'Metas e avaliação de resultado por município, não só dinheiro novo',
      'Emendas têm que ser fiscalizadas pra saber se chegaram onde deveriam',
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
      'Diminuir a carga tributária sobre a folha de pagamento — gera mais empregos',
      'Diminuir ou até zerar impostos sobre alimentos e medicamentos',
      'Tirar privilégios de empresa grande que não reinveste no país',
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
      'Reestruturação das polícias em geral',
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
      'vai. Prestação de contas é obrigação, não favor.',
    corpo: [
      'Prestação de contas é obrigação, sigilo sob gastos com cartão corporativo deve ser proibido',
      'Cada emenda pública com nome do autor e destino rastreável',
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
      'Salas separadas e professores preparados pra alunos neurodivergentes',
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
  'Antes de criar imposto novo, precisa cortar desperdícios e mordomias bancadas com dinheiro público.',
  'Menos máquina pública. Mais serviço público.',
  'Passar de série tem que significar que o aluno aprendeu.',
];

// Texto cru da candidata — usado na página "sobre"
export const ABOUT_TEXT = {
  oQueDefendo:
    'Sou de Jundiaí, mãe, cristã e incomodada. Defendo um Congresso menor ' +
    'em privilégio e maior em fiscalização — e menos impostos para todos. ' +
    'Um país que atola seus cidadãos e empresas de impostos é um país que ' +
    'perde talentos e deixa de gerar empregos, pois quem pode muda de país.',
  corruptoSeProtege:
    'Temos um Congresso que legisla em causa própria, muitos de seus membros ' +
    'são conhecidos por participar de esquemas de corrupção e nada acontece.',
};