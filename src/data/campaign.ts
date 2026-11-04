// Objetivo da campanha: a seletiva do Festival Maré Alta, na semana 12.
import type { Condition, FestivalTier, MemberId } from '../engine/types';
import { all, emotionMin, hasFlag, not } from './dsl';

export interface GoalDef {
  id: string;
  label: string;
  hint: string;
  condition: Condition;
}

/** Metas intermediárias. Cada uma cumprida até a seletiva soma pontos na avaliação. */
export const GOALS: GoalDef[] = [
  { id: 'gravar2', label: 'Gravar 2 músicas', hint: 'O júri pede uma demo.', condition: { type: 'songs', statuses: ['gravada', 'lancada'], min: 2 } },
  { id: 'lancar1', label: 'Lançar uma música', hint: 'Ter algo para o júri ouvir antes.', condition: { type: 'songs', statuses: ['lancada'], min: 1 } },
  { id: 'shows3', label: 'Fazer 3 shows', hint: 'Experiência de palco.', condition: { type: 'shows', min: 3 } },
  { id: 'showbom', label: 'Fazer um show com nota 60+', hint: 'Alguém do festival pode estar na plateia.', condition: { type: 'shows', min: 1, minScore: 60 } },
  { id: 'fas150', label: 'Chegar a 150 fãs', hint: 'Público que vá até a seletiva.', condition: { type: 'resource', key: 'fans', min: 150 } },
  { id: 'rep20', label: 'Reputação 20', hint: 'Que a cena saiba quem vocês são.', condition: { type: 'resource', key: 'reputation', min: 20 } },
  { id: 'unidas', label: 'Banda unida', hint: 'Química média entre os pares ≥ 15.', condition: { type: 'unity', min: 15 } },
];

export const GOAL_POINTS = 3;

/** Pesos da avaliação final do júri (somam 1). */
export const FESTIVAL_WEIGHTS = {
  performance: 0.4,
  song: 0.2,
  fans: 0.15,
  reputation: 0.15,
  unity: 0.1,
};

export const FESTIVAL_TIERS: Record<FestivalTier, { min: number; title: string; text: string }> = {
  selecionadas: {
    min: 66,
    title: 'Selecionadas!',
    text: 'O júri anuncia a banda vencedora da seletiva. Demora um segundo para vocês entenderem que é o nome de vocês. A Bia é a primeira a gritar.',
  },
  alternativo: {
    min: 52,
    title: 'Palco alternativo',
    text: 'Não foi a vaga principal. Mas uma das juradas procura vocês na saída: o festival tem um palco menor, às quatro da tarde, e ele é de vocês se quiserem.',
  },
  nao_foi: {
    min: 0,
    title: 'Não foi dessa vez',
    text: 'Outra banda leva a vaga. Na calçada, depois do resultado, ninguém fala nada por um tempo. Então a Júlia diz: “ano que vem”. E ninguém discorda.',
  },
};

/** Epílogos: para cada integrante, o primeiro cujo `when` for verdadeiro (o último é o padrão). */
export const EPILOGUES: Record<MemberId, { when?: Condition; text: string }[]> = {
  julia: [
    { when: hasFlag('julia_dividiu'), text: 'Júlia aprendeu que um palco cheio de gente brilha mais que um holofote só. Ainda canta de olhos fechados — mas, no último refrão, abre e olha para as outras.' },
    { when: hasFlag('julia_protagonista'), text: 'Júlia virou o rosto da banda nas redes. Os convites chegam no nome dela. Às vezes, ela esquece de repassar.' },
    { when: emotionMin('julia', 'motivacao', 60), text: 'Júlia já tem a lista de produtores para a próxima temporada. Desta vez, escreveu o nome da banda em cima do dela.' },
    { text: 'Júlia termina a temporada cansada de esperar reconhecimento. Ainda não decidiu se fica — mas ainda não foi embora.' },
  ],
  lia: [
    { when: { type: 'flag', name: 'romance', equals: 'juntas' }, text: 'Lia continua escrevendo nos cadernos. Agora deixa um deles aberto, de propósito, em cima do amplificador do baixo.' },
    { when: hasFlag('lia_confiou'), text: 'Lia mostrou três músicas novas para a banda antes de terminá-las. Para ela, isso é quase gritar.' },
    { when: emotionMin('lia', 'confianca', 60), text: 'Lia sobe ao palco sem se esconder atrás do amplificador. Ainda fecha os olhos no solo — por escolha, não por medo.' },
    { text: 'Lia fecha a temporada com o caderno cheio e a boca fechada. As músicas dizem por ela.' },
  ],
  bia: [
    { when: hasFlag('bia_plano'), text: 'A mãe da Bia foi ao último show. Ficou no fundo, de braços cruzados. Na última música, descruzou.' },
    { when: all(emotionMin('bia', 'motivacao', 60), not(hasFlag('nina_ignorada'))), text: 'Bia continua chegando atrasada. Cinco minutos, no máximo. Para ela, é um recorde — e todo mundo sabe.' },
    { when: emotionMin('bia', 'motivacao', 60), text: 'Bia ainda transforma ensaio em festa. Mas agora, antes de ir embora, pergunta à Nina o que ficou para a próxima semana.' },
    { text: 'Bia termina a temporada mais quieta do que começou. A bateria continua alta; ela, nem tanto.' },
  ],
  nina: [
    { when: { type: 'flag', name: 'romance', equals: 'juntas' }, text: 'Nina ainda conta os tempos com o pé esquerdo. Agora alguém sabe disso — e acha bonito.' },
    { when: hasFlag('trocaram_de_lugar'), text: 'Nina descobriu que gosta de explicar linhas de baixo para estranhos. Ninguém acredita quando ela conta.' },
    { when: { type: 'emotion', member: 'nina', key: 'estresse', max: 50 }, text: 'Nina terminou a temporada sem nenhuma planilha atrasada e, pela primeira vez, sem medo do improviso.' },
    { text: 'Nina terminou a temporada exausta, mas com cada nota no lugar. Em algum momento, vai precisar aprender a errar.' },
  ],
};

/** Epílogo do arco entre Lia e Nina (opcional). */
export const ROMANCE_EPILOGUE: { when?: Condition; text: string | null }[] = [
  {
    when: { type: 'flag', name: 'romance', equals: 'juntas' },
    text: 'Lia e Nina não fizeram anúncio nenhum. Mas no show final, na ponte da última música, as duas se viraram uma para a outra ao mesmo tempo — e o público inteiro entendeu antes da banda.',
  },
  {
    when: { type: 'flag', name: 'romance', equals: 'amigas' },
    text: 'Lia e Nina não viraram um casal. Viraram outra coisa, mais difícil de nomear: duas pessoas que sabem exatamente quando a outra precisa de silêncio.',
  },
  {
    when: hasFlag('lia_nina_momento'),
    text: 'Algo ficou no ar entre Lia e Nina naquele estúdio vazio. Ninguém tocou no assunto. Talvez na próxima temporada.',
  },
  { text: null },
];
