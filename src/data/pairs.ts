import type { ActivityId } from '../engine/types';

/**
 * Textos de interação em dupla. {a} e {b} viram nomes.
 * O "tom" é decidido pelas regras do motor (engine/relations.ts) a partir de traços e relação.
 */
export type PairTone = 'harmonia' | 'atrito' | 'faisca' | 'neutro';

export const PAIR_LINES: Record<ActivityId, Record<PairTone, string[]>> = {
  ensaiar: {
    harmonia: [
      '{a} e {b} encontraram um encaixe no meio do ensaio e trocaram um sorriso de quem sabe.',
      '{a} e {b} ficaram depois do horário só para tocar mais uma vez.',
    ],
    atrito: [
      '{a} corrigiu o tempo de {b} pela quinta vez. {b} parou de responder.',
      'O ensaio entre {a} e {b} terminou com um “tá, tanto faz” que ninguém achou que era “tanto faz”.',
    ],
    faisca: [
      '{a} e {b} disputaram quem segurava a última nota. Ficou incrível — e ninguém admitiu.',
      '{a} acelerou; {b} acompanhou e acelerou mais. O resto da banda só assistiu.',
    ],
    neutro: [
      '{a} e {b} ensaiaram juntas sem grandes acontecimentos. Às vezes isso é bom.',
    ],
  },
  compor: {
    harmonia: [
      '{a} terminou uma frase que {b} tinha começado. As duas ficaram em silêncio um segundo a mais.',
      '{a} e {b} escreveram juntas até perderem a noção da hora. A música agradece.',
    ],
    atrito: [
      '{a} achou a ideia de {b} “meio óbvia”. {b} achou o comentário de {a} “meio cruel”.',
      '{a} e {b} discutiram por quarenta minutos sobre uma única palavra do refrão.',
    ],
    faisca: [
      '{a} e {b} discordaram em tudo — e, de algum jeito, a música saiu melhor por isso.',
      '{a} desafiou {b} a escrever algo mais ousado. {b} aceitou o desafio.',
    ],
    neutro: [
      '{a} e {b} dividiram o trabalho: uma na letra, outra na harmonia.',
    ],
  },
  gravar: {
    harmonia: [
      '{a} e {b} gravaram juntas olhando uma para a outra. Dá para ouvir isso na faixa.',
      'Na hora de gravar, {a} contou o tempo e {b} entrou exatamente onde devia. Sem precisar falar nada.',
    ],
    atrito: [
      '{a} pediu para regravar a parte de {b} “só mais uma vez”. Foi a sétima.',
      '{a} e {b} discordaram sobre a mixagem e passaram o resto da sessão sem se olhar.',
    ],
    faisca: [
      '{a} e {b} transformaram a gravação numa disputa de quem errava menos. Ninguém errou.',
    ],
    neutro: [
      '{a} e {b} gravaram suas partes com profissionalismo. Café, tomada, café, tomada.',
    ],
  },
  descansar: {
    harmonia: [
      '{a} e {b} saíram para comer pastel e ficaram conversando até a feira fechar.',
      '{a} e {b} assistiram a um filme ruim e riram dele a noite toda.',
    ],
    atrito: [
      '{a} e {b} tentaram descansar juntas, mas cada uma queria um programa diferente.',
    ],
    faisca: [
      '{a} e {b} transformaram uma partida de sinuca numa competição seríssima.',
    ],
    neutro: [
      '{a} e {b} cruzaram uma com a outra na padaria e conversaram um pouco.',
    ],
  },
  divulgar: {
    harmonia: [
      '{a} e {b} formaram uma dupla de divulgação surpreendentemente eficiente.',
    ],
    atrito: [
      '{a} achou que {b} estava falando demais com os fãs. {b} achou que {a} estava falando de menos.',
    ],
    faisca: [
      '{a} e {b} apostaram quem conseguia mais seguidores no fim de semana.',
    ],
    neutro: [
      '{a} e {b} dividiram os bairros e cada uma cuidou do seu.',
    ],
  },
  show: {
    harmonia: [
      'No meio do show, {a} e {b} se olharam e sorriram ao mesmo tempo. A plateia percebeu.',
      '{a} errou uma entrada; {b} cobriu tão rápido que parecia ensaiado.',
    ],
    atrito: [
      '{a} acelerou o tempo no palco. {b} não perdoou — nem no palco, nem no camarim.',
      'Entre uma música e outra, {a} e {b} trocaram uma frase seca que o microfone quase pegou.',
    ],
    faisca: [
      '{a} e {b} disputaram a atenção da plateia a noite inteira. A plateia ganhou.',
    ],
    neutro: [
      '{a} e {b} fizeram o show sem grandes trocas. Profissionais.',
    ],
  },
  bico: {
    harmonia: [
      '{a} e {b} pegaram o mesmo turno extra e transformaram o cansaço em piada interna.',
    ],
    atrito: [
      '{a} e {b} trabalharam juntas e descobriram que têm ideias muito diferentes sobre “pausa para o café”.',
    ],
    faisca: [
      '{a} e {b} competiram para ver quem ganhava mais gorjeta.',
    ],
    neutro: [
      '{a} e {b} pegaram o mesmo ônibus de volta do trabalho, em silêncio cansado.',
    ],
  },
};
