import type { ActivityId, MemberId } from '../engine/types';

export interface ActivityDef {
  id: ActivityId;
  name: string;
  icon: string;
  short: string;
  description: string;
  /** Custo fixo em R$ por integrante que realiza a atividade. */
  cost: number;
}

export const ACTIVITY_ORDER: ActivityId[] = ['ensaiar', 'compor', 'descansar', 'divulgar', 'bico'];

export const ACTIVITIES: Record<ActivityId, ActivityDef> = {
  ensaiar: {
    id: 'ensaiar',
    name: 'Ensaiar',
    icon: '🥁',
    short: 'Técnica e ritmo',
    description: 'Melhora técnica e ritmo e lapida a música mais recente. Rende mais em grupo. Cansa.',
    cost: 0,
  },
  compor: {
    id: 'compor',
    name: 'Compor',
    icon: '✍️',
    short: 'Avança a música',
    description: 'Avança a música em andamento. Composição e criatividade pesam; parcerias podem render — ou brigar.',
    cost: 0,
  },
  descansar: {
    id: 'descansar',
    name: 'Descansar',
    icon: '☕',
    short: 'Reduz estresse',
    description: 'Reduz o estresse e recupera a motivação. Nem todo mundo sabe descansar.',
    cost: 0,
  },
  divulgar: {
    id: 'divulgar',
    name: 'Divulgar',
    icon: '📣',
    short: 'Ganha fãs (R$ 40)',
    description: 'Cartazes, redes sociais e conversa de bar. Ganha fãs; rende mais com músicas prontas e presença de palco.',
    cost: 40,
  },
  bico: {
    id: 'bico',
    name: 'Trabalho extra',
    icon: '💼',
    short: 'Ganha dinheiro',
    description: 'Um turno no café, aulas particulares, freelas. Paga as contas, mas rouba energia.',
    cost: 0,
  },
};

/** Constantes de economia (ver docs/FORMULAS.md). */
export const ECONOMY = {
  startMoney: 600,
  startFans: 30,
  startReputation: 5,
  weeklyRent: 120,
  bicoBase: 110,
  bicoVariance: 30,
};

/**
 * Falas curtas por personagem e atividade, usadas no resumo semanal.
 * {n} é substituído pelo nome. Escritas à mão: nenhuma geração automática de texto.
 */
export const FLAVOR: Record<MemberId, Record<ActivityId, string[]>> = {
  julia: {
    ensaiar: [
      'Júlia ensaiou como se o estúdio estivesse lotado. Três vezes o mesmo refrão, sempre um tom acima.',
      'Júlia gravou o ensaio no celular “para referência”. Assistiu cinco vezes antes de dormir.',
    ],
    compor: [
      'Júlia jurou que a música precisava de um refrão “que dê pra cantar no ônibus”. Escreveu quatro.',
      'Júlia passou a tarde cantarolando melodias no gravador. Metade era ótima; a outra metade era de outra pessoa.',
    ],
    descansar: [
      'Júlia “descansou” num show de outra banda. Voltou com três contatos e uma inveja produtiva.',
      'Júlia dormiu até meio-dia e acordou com quarenta mensagens. Respondeu todas sorrindo.',
    ],
    divulgar: [
      'Júlia conversou com metade do bar e saiu com o Instagram de um produtor anotado no guardanapo.',
      'Júlia fez uma live improvisada no terraço. Cantou, riu e pediu para todo mundo compartilhar.',
    ],
    bico: [
      'Júlia cantou num casamento. Pagaram bem, mas ninguém perguntou o nome da banda.',
      'Júlia trabalhou no caixa da loja de discos e passou o turno inteiro olhando para a seção de lançamentos.',
    ],
  },
  lia: {
    ensaiar: [
      'Lia ensaiou de olhos fechados, virada para o amplificador. Ninguém interrompeu.',
      'Lia trocou as cordas no meio do ensaio e ficou dez minutos afinando em silêncio. Valeu a pena.',
    ],
    compor: [
      'Lia escreveu uma estrofe às três da manhã, apagou, e reescreveu de memória ao acordar.',
      'Lia encheu duas páginas do caderno. Quando perguntaram sobre o que era, disse “sobre nada”.',
    ],
    descansar: [
      'Lia passou o dia num sebo. Voltou com um livro de poemas e o celular desligado.',
      'Lia dormiu mais do que acharia razoável admitir. Acordou mais leve.',
    ],
    divulgar: [
      'Lia colou cartazes de madrugada, quando ninguém poderia puxar conversa.',
      'Lia respondeu comentários nas redes com mensagens longas e sinceras. Algumas pessoas choraram.',
    ],
    bico: [
      'Lia deu aulas de violão para uma criança que só queria tocar música de videogame. Ensinou mesmo assim.',
      'Lia fez o turno da noite na livraria. Escreveu versos no verso das notas fiscais.',
    ],
  },
  bia: {
    ensaiar: [
      'Bia transformou o ensaio em jam session. Ninguém soube explicar como, mas o groove ficou melhor.',
      'Bia chegou quarenta minutos atrasada com pão de queijo para todo mundo. Tocou como se tivesse chegado cedo.',
    ],
    compor: [
      'Bia batucou na mesa até sair uma ideia. A ideia era boa. Ela não lembra mais qual era.',
      'Bia propôs mudar a música inteira para 7/8. Ninguém deixou, mas uma parte da ideia ficou.',
    ],
    descansar: [
      'Bia foi para a praia sem avisar ninguém. Mandou foto do pôr do sol no grupo da banda.',
      'Bia passou o domingo jogando videogame e cozinhando. Voltou recarregada e cheia de histórias.',
    ],
    divulgar: [
      'Bia fez amizade com o dono do bar da esquina. Agora tem um pôster da banda acima da chapa.',
      'Bia gravou um vídeo tocando bateria em baldes na rua. Viralizou um pouquinho.',
    ],
    bico: [
      'Bia trabalhou de garçonete num evento e ganhou gorjeta por fazer o bolo dançar.',
      'Bia carregou equipamento para outra banda. Voltou com dinheiro e opiniões sobre o baterista deles.',
    ],
  },
  nina: {
    ensaiar: [
      'Nina ensaiou com metrônomo a 60, depois 80, depois 120. Anotou tudo numa planilha.',
      'Nina repetiu a mesma passagem até as pontas dos dedos ficarem dormentes. Ficou perfeita.',
    ],
    compor: [
      'Nina organizou a estrutura da música num quadro branco: introdução, verso, ponte. Funcionou.',
      'Nina sugeriu uma linha de baixo que mudou o clima da música inteira. Fingiu que não era nada.',
    ],
    descansar: [
      'Nina tirou o dia de folga. Passou a tarde revisando partituras “só para relaxar”.',
      'Nina tentou meditar. Durou onze minutos, cronometrados.',
    ],
    divulgar: [
      'Nina montou um calendário de postagens impecável. Escrever as legendas foi a parte difícil.',
      'Nina distribuiu panfletos com uma eficiência assustadora. Não sorriu para ninguém.',
    ],
    bico: [
      'Nina fez a revisão técnica de uma gravação alheia. Encontrou trinta e dois erros e corrigiu todos.',
      'Nina deu aula de teoria musical. A aluna saiu assustada e muito bem informada.',
    ],
  },
};

/** Títulos de músicas originais. Usados em ordem pseudoaleatória sem repetição. */
export const SONG_TITLES = [
  'Ruído de Fundo',
  'Avenida às Três',
  'Café Frio',
  'Ninguém Me Avisou',
  'Fita Cassete',
  'Neon e Chuva',
  'Quarto Andar',
  'Último Ônibus',
  'Barulho Bom',
  'Cartas que Não Mandei',
  'Pulso',
  'Estática',
  'Tudo Ao Mesmo Tempo',
  'Maré Alta',
];
