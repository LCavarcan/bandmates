// Conversas da semana: uma por semana, com uma integrante.
// A resposta depende da abordagem e de quem ela é (traços) e de como está (emoções).
import type { MemberId, Outcome } from '../engine/types';
import { any, emo, emotionMax, emotionMin, modifier, narr, say } from './dsl';

export type TalkApproach = 'ouvir' | 'encorajar' | 'cobrar';

export const TALK_ORDER: TalkApproach[] = ['ouvir', 'encorajar', 'cobrar'];

export const TALK_APPROACHES: Record<TalkApproach, { label: string; icon: string; description: string }> = {
  ouvir: { label: 'Perguntar como ela está', icon: '🫖', description: 'Escutar sem pressa. Costuma aliviar o estresse.' },
  encorajar: { label: 'Elogiar o trabalho dela', icon: '🌟', description: 'Dá confiança. Algumas precisam mais do que outras.' },
  cobrar: { label: 'Cobrar mais empenho', icon: '📋', description: 'Motiva quem gosta de desafio. Machuca quem já está no limite.' },
};

/** Abertura da cena de conversa. */
export const TALK_OPENING: Record<MemberId, string> = {
  julia: 'Você chama a Júlia para um café. Ela chega dez minutos antes, de batom, como se fosse uma entrevista.',
  lia: 'Você encontra a Lia na escada do porão, fone em um ouvido só. Ela tira o fone quando você senta.',
  bia: 'Bia está deitada no chão do estúdio, olhando o teto e batucando no próprio joelho. “Senta aí.”',
  nina: 'Nina está organizando os cabos por cor. Ela termina o vermelho antes de olhar para você.',
};

export const TALKS: Record<MemberId, Record<TalkApproach, Outcome[]>> = {
  julia: {
    ouvir: [
      {
        when: emotionMin('julia', 'estresse', 50),
        effects: [emo('julia', 'estresse', -10), emo('julia', 'confianca', 2)],
        result: [
          narr('Júlia fala por vinte minutos sem parar — da banda, da mãe, de um produtor que não respondeu.'),
          say('julia', 'Nossa. Eu precisava disso. Ninguém pergunta como eu tô. Acham que eu tô sempre ótima.'),
        ],
      },
      {
        effects: [emo('julia', 'estresse', -5), emo('julia', 'motivacao', 2)],
        result: [say('julia', 'Eu? Tô ótima!'), narr('Ela está mesmo. Mas gosta que você perguntou.')],
      },
    ],
    encorajar: [
      {
        effects: [emo('julia', 'confianca', 6), emo('julia', 'motivacao', 3)],
        result: [
          say('julia', 'Sério? Você acha?'),
          narr('Ela finge que não liga. Meia hora depois, você a ouve contando para a Bia, palavra por palavra.'),
        ],
      },
    ],
    cobrar: [
      {
        effects: [emo('julia', 'motivacao', 5), emo('julia', 'estresse', 4)],
        result: [
          say('julia', 'Finalmente alguém falando sério nessa banda.'),
          narr('Ela sai da conversa com uma lista de metas e um brilho meio assustador no olhar.'),
        ],
      },
    ],
  },
  lia: {
    ouvir: [
      {
        when: emotionMax('lia', 'confianca', 45),
        effects: [emo('lia', 'estresse', -10), emo('lia', 'confianca', 4)],
        result: [
          narr('Lia demora para começar. Quando começa, fala de uma música que não consegue terminar e de um medo que não consegue nomear.'),
          narr('Você só escuta. É o suficiente.'),
        ],
      },
      {
        effects: [emo('lia', 'estresse', -8), emo('lia', 'motivacao', 2)],
        result: [narr('Vocês falam de livros, não da banda. Lia sai mais leve, com uma indicação sua anotada no braço.')],
      },
    ],
    encorajar: [
      {
        when: emotionMax('lia', 'confianca', 45),
        effects: [emo('lia', 'confianca', 8)],
        result: [
          say('lia', 'Você gostou mesmo da letra?'),
          narr('Ela não acredita totalmente. Mas guarda o elogio como quem guarda um bilhete no bolso.'),
        ],
      },
      {
        effects: [emo('lia', 'confianca', 4), emo('lia', 'motivacao', 2)],
        result: [narr('Lia sorri para o chão.'), say('lia', 'Obrigada.')],
      },
    ],
    cobrar: [
      {
        when: emotionMin('lia', 'confianca', 60),
        effects: [emo('lia', 'motivacao', 4), emo('lia', 'estresse', 3)],
        result: [say('lia', 'Tá. Eu sei que posso mais.'), narr('Ela não discute. Naquela semana, escreve como quem tem algo a provar.')],
      },
      {
        effects: [emo('lia', 'confianca', -6), emo('lia', 'estresse', 7), emo('lia', 'motivacao', -3)],
        result: [narr('Lia escuta tudo calada. Concorda com a cabeça. Depois passa o resto do dia sem abrir o caderno.')],
      },
    ],
  },
  bia: {
    ouvir: [
      {
        when: any(emotionMin('bia', 'estresse', 40), emotionMax('bia', 'motivacao', 55)),
        effects: [emo('bia', 'estresse', -8), emo('bia', 'motivacao', 4)],
        result: [
          narr('Bia faz piada da primeira pergunta. E da segunda. Na terceira, fala da mãe, das contas, de não saber o que vai ser da vida.'),
          narr('Depois faz piada de novo — mas mais leve.'),
        ],
      },
      {
        effects: [emo('bia', 'motivacao', 3), emo('bia', 'estresse', -4)],
        result: [say('bia', 'Tô de boa! Quer pão de queijo?'), narr('Ela realmente está de boa.')],
      },
    ],
    encorajar: [
      {
        effects: [emo('bia', 'motivacao', 6), emo('bia', 'confianca', 3)],
        result: [narr('Bia responde com uma virada de bateria em sua homenagem. Bem alta. Duas vezes.')],
      },
    ],
    cobrar: [
      {
        when: emotionMax('bia', 'estresse', 49),
        effects: [emo('bia', 'motivacao', 2), modifier('bia', 'todas', 1.15, 1, 'Bia prometeu foco')],
        result: [
          say('bia', 'Tá, tá, chefe.'),
          narr('Ela bate continência. Mas na semana seguinte chega cinco minutos antes — e faz questão de que você veja.'),
        ],
      },
      {
        effects: [emo('bia', 'motivacao', -6), emo('bia', 'estresse', 6)],
        result: [narr('Bia ri, mas é uma risada diferente.'), say('bia', 'Beleza.'), narr('Ela fica quieta o resto do ensaio, o que nunca acontece.')],
      },
    ],
  },
  nina: {
    ouvir: [
      {
        when: emotionMin('nina', 'estresse', 55),
        effects: [emo('nina', 'estresse', -10), emo('nina', 'confianca', 3)],
        result: [say('nina', 'Tá tudo bem.'), narr('Você espera. Depois de um silêncio longo:'), say('nina', 'Na verdade, não tá.'), narr('Ela não fala muito mais que isso. Mas fala.')],
      },
      {
        effects: [emo('nina', 'estresse', -4)],
        result: [say('nina', 'Tá tudo bem.'), narr('Está mesmo, ao que parece. Ela agradece a pergunta com um aceno formal.')],
      },
    ],
    encorajar: [
      {
        effects: [emo('nina', 'confianca', 4), emo('nina', 'estresse', -3)],
        result: [say('nina', 'O baixo da ponte ficou bom mesmo?'), narr('Ela anota o elogio. Literalmente: você a vê anotando.')],
      },
    ],
    cobrar: [
      {
        when: emotionMin('nina', 'estresse', 70),
        effects: [emo('nina', 'estresse', 8), emo('nina', 'confianca', -4)],
        result: [narr('Nina não responde. Só aumenta a velocidade do metrônomo.'), narr('Não era isso que ela precisava ouvir.')],
      },
      {
        effects: [emo('nina', 'motivacao', 5), emo('nina', 'confianca', 2)],
        result: [say('nina', 'Concordo.'), narr('Ela parece aliviada de alguém ter dito. Já tem um plano pronto, em três versões.')],
      },
    ],
  },
};
