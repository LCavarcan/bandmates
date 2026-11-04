// Eventos narrativos escritos à mão. Cada um declara quando pode acontecer,
// o que se vê e o que cada escolha muda. Ver docs/mecanicas/eventos.md.
import type { EventDef } from '../engine/types';
import {
  all,
  any,
  did,
  draftBonus,
  emo,
  emotionMax,
  emotionMin,
  flag,
  hasDraft,
  modifier,
  moneyMax,
  narr,
  rel,
  relMax,
  relMin,
  released,
  res,
  say,
  schedule,
  skill,
  together,
  weekMin,
} from './dsl';

export const EVENTS: EventDef[] = [
  // -------------------------------------------------------------------------
  {
    id: 'quarenta_minutos',
    title: 'Quarenta minutos',
    cast: ['bia', 'nina'],
    priority: 5,
    trigger: all(weekMin(2), together('bia', 'nina', 'ensaiar', 'gravar'), relMax('bia', 'nina', 'afinidade', 25)),
    scene: [
      narr('O ensaio estava marcado para as sete. Às sete e quarenta, a porta do porão se abre com um chute leve.'),
      say('bia', 'Gente! O ônibus quebrou. Quer dizer… eu perdi o ônibus. Mas trouxe pão de queijo!'),
      narr('Nina não tira os olhos do metrônomo, que continua batendo — sessenta por minuto — desde as sete em ponto.'),
      say('nina', 'Quarenta minutos, Bia. São quarenta minutos da semana de quatro pessoas.'),
      narr('Todo mundo olha para você.'),
    ],
    choices: [
      {
        id: 'acordo',
        label: 'Pedir que Bia avise da próxima vez',
        hint: 'Um acordo simples, sem drama.',
        outcomes: [
          {
            effects: [rel('bia', 'nina', { respeito: 3, confianca: 1 }), flag('bia_combinou')],
            result: [
              say('bia', 'Justo. Eu aviso. Juro de dedinho.'),
              say('nina', '…Tá.'),
              narr('Nina pega um pão de queijo. Vindo dela, é quase um abraço.'),
            ],
          },
        ],
      },
      {
        id: 'nina_fala',
        label: 'Deixar Nina dizer tudo o que pensa',
        hint: 'Pode doer. Pode resolver.',
        outcomes: [
          {
            effects: [
              emo('nina', 'estresse', -10),
              emo('bia', 'motivacao', -5),
              rel('bia', 'nina', { afinidade: -3, respeito: 5, confianca: 2 }),
              modifier('bia', 'ensaiar', 1.15, 2, 'Bia quer provar que é confiável'),
            ],
            result: [
              say('nina', 'Eu passo a semana organizando tudo pra que o pouco tempo que a gente tem aqui renda. E aí você chega quando quer, e todo mundo ri, e eu viro a chata.'),
              narr('Silêncio. Até o metrônomo parece mais baixo.'),
              say('bia', 'Eu não sabia que era tão importante pra você.'),
              narr('O ensaio começa vinte minutos depois. Bia não erra uma entrada.'),
            ],
          },
        ],
      },
      {
        id: 'rir',
        label: 'Pegar um pão de queijo e mudar de assunto',
        hint: 'O clima melhora. Para quase todo mundo.',
        outcomes: [
          {
            effects: [
              emo('bia', 'motivacao', 4),
              emo('nina', 'estresse', 6),
              rel('bia', 'nina', { afinidade: -2 }),
              flag('nina_ignorada'),
              schedule('de_novo', 2),
            ],
            result: [
              narr('As risadas voltam. Bia conta a história do ônibus de três jeitos diferentes.'),
              narr('Nina reinicia o metrônomo com um pouco mais de força do que o necessário.'),
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'de_novo',
    title: 'De novo',
    cast: ['nina', 'bia'],
    priority: 9,
    followUp: true,
    scene: [
      narr('Você chega ao estúdio e encontra só a Bia, sozinha, girando uma baqueta.'),
      say('bia', 'A Nina foi embora. Deixou isso.'),
      narr('Um post-it colado na caixa da bateria, letra caprichada: “Ensaio é às 7. Fiquei até as 7h30. — N.”'),
      say('bia', 'Eu cheguei sete e trinta e cinco. Cinco minutos!'),
    ],
    choices: [
      {
        id: 'ir_atras',
        label: 'Ir atrás da Nina',
        outcomes: [
          {
            effects: [emo('nina', 'estresse', -6), emo('nina', 'motivacao', 3)],
            result: [
              narr('Você a encontra no ponto de ônibus, baixo nas costas.'),
              say('nina', 'Não é sobre os cinco minutos. Eu só queria que alguém percebesse que eu sempre espero.'),
              narr('Vocês voltam juntas. Ela não fala mais nada, mas fica até o fim.'),
            ],
          },
        ],
      },
      {
        id: 'cobrar_bia',
        label: 'Ter uma conversa séria com a Bia',
        outcomes: [
          {
            when: emotionMin('bia', 'estresse', 55),
            effects: [emo('bia', 'motivacao', -6), emo('bia', 'estresse', 5), rel('bia', 'nina', { rivalidade: 3 })],
            result: [
              say('bia', 'Tá, eu sou a bagunceira, eu sei. Todo mundo sabe. Precisa repetir?'),
              narr('Ela guarda as baquetas e vai embora antes de você terminar a frase.'),
            ],
          },
          {
            effects: [emo('bia', 'motivacao', -2), rel('bia', 'nina', { respeito: 3 }), modifier('bia', 'todas', 1.15, 2, 'Bia tentando chegar na hora')],
            result: [
              say('bia', '…Você tem razão. Eu acho que eu nunca levei nada tão a sério a ponto de ter medo de estragar.'),
              say('bia', 'Vou colocar três alarmes. E vou pedir desculpa pra ela. Pessoalmente.'),
            ],
          },
        ],
      },
      {
        id: 'juntar',
        label: 'Chamar as duas para resolver juntas',
        hint: 'Depende do quanto elas já se gostam.',
        outcomes: [
          {
            when: relMin('bia', 'nina', 'afinidade', 0),
            effects: [rel('bia', 'nina', { afinidade: 6, confianca: 5 }), emo('nina', 'estresse', -5)],
            result: [
              narr('As três sentam na escada do porão. Demora, mas sai.'),
              say('bia', 'Eu atraso porque eu acho que ninguém vai notar se eu não estiver. Que idiota, né?'),
              say('nina', 'Eu noto. Sempre. Esse é o problema e a parte boa.'),
              narr('Bia ri. Nina quase ri. Você conta como vitória.'),
            ],
          },
          {
            effects: [rel('bia', 'nina', { afinidade: -4, rivalidade: 4 }), emo('nina', 'estresse', 4), emo('bia', 'estresse', 4)],
            result: [
              narr('A conversa dura quatro minutos e vira discussão no terceiro.'),
              say('nina', 'Você não leva nada a sério.'),
              say('bia', 'E você leva tudo!'),
              narr('Pelo menos agora as duas sabem exatamente onde estão.'),
            ],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'o_refrao',
    title: 'O refrão',
    cast: ['julia', 'lia'],
    priority: 6,
    trigger: all(weekMin(2), hasDraft({ leader: 'lia', minProgress: 25 })),
    scene: [
      narr('Júlia chega com o celular na mão e um sorriso que Lia já conhece bem.'),
      say('julia', 'Ouvi a demo de novo. A música é linda, Lia, de verdade. Mas o refrão… ele não explode.'),
      say('lia', 'Ele não é pra explodir.'),
      say('julia', 'Escuta só essa versão.'),
      narr('Ela canta. É grudento. Irritantemente grudento.'),
      narr('Lia fecha o caderno devagar. As duas olham para você.'),
    ],
    choices: [
      {
        id: 'lia',
        label: 'Manter o refrão da Lia',
        hint: 'Mais original. Júlia não vai gostar.',
        outcomes: [
          {
            effects: [
              draftBonus({ originality: 5, identity: 4 }),
              emo('lia', 'confianca', 6),
              emo('julia', 'motivacao', -5),
              rel('julia', 'lia', { rivalidade: 4 }),
            ],
            result: [
              say('lia', 'Obrigada.'),
              say('julia', 'Tá. Vocês que sabem.'),
              narr('Júlia passa o resto da tarde cantando a versão dela baixinho, só para ninguém esquecer que ela existe.'),
            ],
          },
        ],
      },
      {
        id: 'julia',
        label: 'Usar o refrão da Júlia',
        hint: 'Mais comercial. Lia vai sentir.',
        outcomes: [
          {
            effects: [
              draftBonus({ commercial: 10, originality: -4 }),
              emo('lia', 'confianca', -6),
              emo('lia', 'motivacao', -4),
              emo('julia', 'motivacao', 6),
              emo('julia', 'confianca', 3),
              rel('julia', 'lia', { rivalidade: 2, respeito: -2 }),
            ],
            result: [
              say('julia', 'Vocês vão ver. Isso vai tocar em todo lugar.'),
              say('lia', 'Vai.'),
              narr('Lia risca a página inteira do refrão antigo. Ninguém vê. Só você.'),
            ],
          },
        ],
      },
      {
        id: 'juntas',
        label: 'Pedir que as duas reescrevam juntas',
        requires: relMin('julia', 'lia', 'respeito', 20),
        requiresText: 'Exige um mínimo de respeito entre Júlia e Lia.',
        outcomes: [
          {
            when: relMin('julia', 'lia', 'rivalidade', 40),
            effects: [
              draftBonus({ quality: 3, commercial: 4, originality: 3, cohesion: -4 }),
              emo('julia', 'estresse', 8),
              emo('lia', 'estresse', 8),
              rel('julia', 'lia', { rivalidade: 3, respeito: 4 }),
            ],
            result: [
              narr('Três horas de discussão. Duas canetas quebradas. Um refrão que nenhuma das duas escreveria sozinha — e que nenhuma das duas admite que ficou bom.'),
            ],
          },
          {
            effects: [
              draftBonus({ quality: 4, commercial: 5, cohesion: 6 }),
              emo('julia', 'estresse', 4),
              emo('lia', 'estresse', 4),
              rel('julia', 'lia', { respeito: 5, rivalidade: -3, afinidade: 3 }),
            ],
            result: [
              narr('No fim da noite, o refrão tem a melodia da Lia e o salto da Júlia na última nota.'),
              say('julia', 'Não é minha nem sua.'),
              say('lia', 'É nossa. Que estranho.'),
            ],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'o_caderno',
    title: 'O caderno',
    cast: ['lia'],
    priority: 4,
    trigger: all(weekMin(3), any(emotionMax('lia', 'confianca', 50), emotionMin('lia', 'estresse', 50))),
    scene: [
      narr('Fim de ensaio. Todo mundo já foi.'),
      narr('Em cima do amplificador, esquecido, está o caderno da Lia — aquele que ninguém tem permissão de abrir.'),
      narr('Está aberto. Dá para ler a primeira linha de uma página: “pra quem conta os compassos e nunca conta o que sente”.'),
    ],
    choices: [
      {
        id: 'fechar',
        label: 'Fechar sem ler e guardar na mochila dela',
        outcomes: [
          {
            effects: [flag('respeitou_caderno')],
            result: [narr('Você fecha o caderno. Seja lá o que estiver ali, não é seu.')],
          },
        ],
      },
      {
        id: 'avisar',
        label: 'Guardar e mandar mensagem avisando',
        outcomes: [
          {
            effects: [emo('lia', 'estresse', -4), emo('lia', 'confianca', 2), flag('respeitou_caderno'), schedule('uma_coisa_que_escrevi', 2)],
            result: [
              narr('“você esqueceu o caderno. tá guardado comigo.”'),
              narr('A resposta chega em segundos: “obrigada. de verdade.” E logo depois: “você não leu né”.'),
              narr('Você responde que não. É verdade.'),
            ],
          },
        ],
      },
      {
        id: 'ler',
        label: 'Ler só mais uma página',
        hint: 'Ninguém vai saber. Provavelmente.',
        outcomes: [
          {
            effects: [flag('leu_caderno'), flag('lia_sente_algo'), schedule('pagina_dobrada', 3)],
            result: [
              narr('A página seguinte é uma lista: “coisas que a N. faz quando acha que ninguém está vendo”.'),
              narr('Ajeita o cabelo atrás da orelha antes de um solo. Conta os tempos com o pé esquerdo. Sorri só com um lado da boca quando acerta.'),
              narr('A lista é longa. Você fecha o caderno com cuidado, mas fica a sensação de ter entrado num quarto sem bater.'),
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'uma_coisa_que_escrevi',
    title: 'Uma coisa que eu escrevi',
    cast: ['lia'],
    priority: 9,
    followUp: true,
    scene: [
      narr('Lia espera todo mundo sair e se aproxima com o caderno fechado contra o peito.'),
      say('lia', 'Semana passada você podia ter lido. E não leu.'),
      say('lia', 'Então… eu queria te mostrar uma coisa. Só você, por enquanto.'),
    ],
    choices: [
      {
        id: 'ouvir',
        label: 'Ouvir com atenção',
        outcomes: [
          {
            when: hasDraft(),
            effects: [emo('lia', 'confianca', 6), emo('lia', 'motivacao', 5), draftBonus({ identity: 6 }), flag('lia_confiou')],
            result: [
              narr('Ela lê baixinho, sem olhar para você. É a ponte que faltava na música nova.'),
              say('lia', 'Pode entrar na música, se você achar que cabe.'),
            ],
          },
          {
            effects: [emo('lia', 'confianca', 6), emo('lia', 'motivacao', 5), skill('lia', 'composicao', 2), flag('lia_confiou')],
            result: [
              narr('Ela lê baixinho, sem olhar para você. Ainda não é uma música. Mas vai ser.'),
              say('lia', 'Obrigada por não falar nada enquanto eu lia. Ninguém faz isso.'),
            ],
          },
        ],
      },
      {
        id: 'banda',
        label: 'Sugerir que ela mostre para a banda',
        outcomes: [
          {
            when: emotionMin('lia', 'confianca', 50),
            effects: [emo('lia', 'confianca', 3), rel('lia', 'nina', { confianca: 3 }), rel('bia', 'lia', { afinidade: 2 }), draftBonus({ identity: 4, originality: 3 }), flag('lia_confiou')],
            result: [
              narr('Ela hesita. Depois concorda.'),
              narr('No dia seguinte, lê para as três. Bia aplaude de pé. Júlia fica quieta, o que, vindo dela, é um elogio. Nina pede para ler de novo.'),
            ],
          },
          {
            effects: [emo('lia', 'estresse', 6), emo('lia', 'confianca', -2)],
            result: [say('lia', 'Talvez outro dia.'), narr('Ela fecha o caderno. A porta, por enquanto, também.')],
          },
        ],
      },
    ],
  },

  {
    id: 'pagina_dobrada',
    title: 'A página dobrada',
    cast: ['lia'],
    priority: 9,
    followUp: true,
    scene: [
      say('lia', 'Alguém mexeu no meu caderno.'),
      narr('Ela não pergunta. Afirma. Está segurando o caderno aberto na página da lista.'),
      say('lia', 'A página tava dobrada diferente.'),
    ],
    choices: [
      {
        id: 'admitir',
        label: 'Admitir que leu',
        outcomes: [
          {
            when: emotionMin('lia', 'confianca', 45),
            effects: [emo('lia', 'estresse', 4), flag('lia_segredo_compartilhado')],
            result: [
              say('lia', '…Você leu a lista?'),
              narr('Você confirma com a cabeça.'),
              say('lia', 'Não conta pra ninguém. Por favor. Nem pra ela.'),
            ],
          },
          {
            effects: [emo('lia', 'confianca', -4), emo('lia', 'estresse', 6), emo('lia', 'motivacao', -3)],
            result: [narr('Ela pega o caderno e não fala com ninguém pelo resto do dia.')],
          },
        ],
      },
      {
        id: 'negar',
        label: 'Dizer que não foi você',
        outcomes: [
          {
            effects: [flag('mentiu_caderno')],
            result: [
              narr('Ela olha para você um segundo a mais do que o normal.'),
              say('lia', 'Tá.'),
              narr('Ela não acredita. Mas deixa pra lá. Por enquanto.'),
            ],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'duas_da_manha',
    title: 'Duas da manhã',
    cast: ['nina'],
    priority: 5,
    trigger: all(weekMin(2), emotionMin('nina', 'estresse', 60), did('nina', 'ensaiar', 'gravar')),
    scene: [
      narr('Duas da manhã. A luz do porão ainda está acesa.'),
      narr('Nina está sentada no chão, baixo no colo, repetindo a mesma passagem de oito compassos. As pontas dos dedos estão vermelhas.'),
      say('nina', 'Eu errei isso no ensaio. Duas vezes.'),
      narr('Ninguém percebeu. Ela sabe que ninguém percebeu. Não faz diferença.'),
    ],
    choices: [
      {
        id: 'casa',
        label: 'Mandar a Nina para casa',
        outcomes: [
          {
            when: emotionMin('nina', 'confianca', 50),
            effects: [emo('nina', 'estresse', -14), emo('nina', 'motivacao', -2)],
            result: [say('nina', '…Tá. Mas amanhã eu chego mais cedo.'), narr('Ela chega mais cedo. Mas dormiu.')],
          },
          {
            effects: [emo('nina', 'estresse', -8), emo('nina', 'confianca', -3)],
            result: [
              say('nina', 'Você acha que eu não dou conta.'),
              narr('Ela vai. Não era isso que você quis dizer, mas foi o que ela ouviu.'),
            ],
          },
        ],
      },
      {
        id: 'ficar',
        label: 'Sentar e ouvir ela tocar',
        outcomes: [
          {
            effects: [skill('nina', 'tecnica', 2), emo('nina', 'estresse', -6), emo('nina', 'confianca', 4)],
            result: [
              narr('Você não diz nada. Na vigésima vez, a passagem sai perfeita — e ela finalmente para.'),
              say('nina', 'Obrigada por não dizer que tava bom antes de estar.'),
            ],
          },
        ],
      },
      {
        id: 'bia',
        label: 'Mandar mensagem para a Bia (ela está sempre acordada)',
        hint: 'Arriscado. Depende das duas.',
        outcomes: [
          {
            when: relMin('bia', 'nina', 'afinidade', 10),
            effects: [rel('bia', 'nina', { afinidade: 6, confianca: 5 }), emo('nina', 'estresse', -12), emo('bia', 'motivacao', 2)],
            result: [
              narr('Vinte minutos depois, Bia desce a escada com uma pizza e sem dizer oi senta na bateria.'),
              narr('Ela toca a virada mais absurda que você já ouviu. Nina ri — alto, de verdade, pela primeira vez em semanas.'),
              say('nina', 'Você é ridícula.'),
              say('bia', 'E você tá rindo.'),
            ],
          },
          {
            effects: [rel('bia', 'nina', { afinidade: -2, rivalidade: 2 }), emo('nina', 'estresse', 4)],
            result: [
              narr('Bia chega fazendo barulho, como sempre.'),
              say('nina', 'Eu não preciso de plateia.'),
              narr('Bia deixa a pizza e vai embora. Nina come duas fatias, sozinha, às três da manhã.'),
            ],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'pastel_do_jorge',
    title: 'Pastel do Seu Jorge',
    cast: ['julia', 'lia', 'bia'],
    priority: 3,
    trigger: all(weekMin(3), moneyMax(300)),
    scene: [
      narr('Seu Jorge, dono da pastelaria da esquina, desce as escadas do porão segurando um envelope.'),
      narr('“Minha neta disse que vocês são bons. Preciso de uma musiquinha pra rádio do bairro. Trinta segundos. Pago quatrocentos.”'),
      say('bia', 'Pastel de queijo incluso?'),
      say('lia', 'A gente vai fazer… jingle?'),
      say('julia', 'A gente vai fazer quatrocentos reais, Lia.'),
    ],
    choices: [
      {
        id: 'aceitar',
        label: 'Aceitar o trabalho',
        hint: 'R$ 400. A dignidade artística é negociável.',
        outcomes: [
          {
            effects: [res('money', 400), res('reputation', -1), emo('lia', 'motivacao', -6), emo('julia', 'motivacao', 2), emo('bia', 'motivacao', 3), flag('fez_jingle')],
            result: [
              narr('Em dois dias, o bairro inteiro sabe cantar “Pastel do Jorge, quentinho e crocante”. Ninguém sabe o nome da banda.'),
              say('lia', 'Eu nunca mais vou conseguir comer pastel.'),
            ],
          },
        ],
      },
      {
        id: 'punk',
        label: 'Aceitar, mas fazer do jeito da banda: versão punk',
        hint: 'Pode virar meme. Pode virar briga.',
        outcomes: [
          {
            when: relMin('bia', 'lia', 'afinidade', 25),
            effects: [res('money', 400), res('fans', 15), emo('bia', 'motivacao', 6), emo('lia', 'motivacao', 2), rel('bia', 'lia', { afinidade: 4 }), flag('fez_jingle')],
            result: [
              narr('Bia e Lia transformam o jingle num hino punk de trinta segundos com um solo de guitarra no meio.'),
              narr('Seu Jorge fica confuso, mas paga. A rádio toca. Vira meme no bairro — com o nome da banda na descrição.'),
            ],
          },
          {
            effects: [res('money', 400), emo('bia', 'motivacao', 5), emo('lia', 'motivacao', -3), rel('bia', 'lia', { rivalidade: 3 }), flag('fez_jingle')],
            result: [narr('Lia toca no automático. Funciona, mas só a Bia se diverte.')],
          },
        ],
      },
      {
        id: 'recusar',
        label: 'Recusar com educação',
        outcomes: [
          {
            effects: [emo('lia', 'confianca', 4), emo('lia', 'motivacao', 3), emo('julia', 'motivacao', -4), emo('nina', 'estresse', 4)],
            result: [
              say('julia', 'Quatrocentos reais, gente.'),
              say('nina', 'O aluguel vence sexta.'),
              say('lia', 'Eu sei. Obrigada mesmo assim.'),
            ],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'meu_som_novo',
    title: '“Meu som novo”',
    cast: ['julia', 'lia'],
    priority: 7,
    trigger: all(weekMin(3), released({ notLeader: 'julia' })),
    scene: [
      narr('Júlia postou um vídeo cantando o lançamento da semana. Luz bonita, close no rosto, legenda: “meu som novo 🔥”.'),
      narr('O vídeo está indo bem. Os comentários são todos sobre ela.'),
      say('lia', '“Meu.”'),
      narr('Lia diz só isso. Depois guarda o celular no bolso.'),
    ],
    choices: [
      {
        id: 'editar',
        label: 'Pedir que Júlia edite a legenda e marque a banda',
        outcomes: [
          {
            when: emotionMin('julia', 'confianca', 55),
            effects: [emo('julia', 'motivacao', -2), emo('lia', 'confianca', 3), rel('julia', 'lia', { rivalidade: -3, respeito: 3 }), flag('julia_dividiu')],
            result: [
              say('julia', 'Tá, tá. Foi mal. Eu tava empolgada.'),
              narr('Ela edita: “nosso som novo”. Lia curte o post. É a primeira vez que ela curte um post da Júlia.'),
            ],
          },
          {
            effects: [emo('julia', 'confianca', -4), emo('julia', 'motivacao', -4), rel('julia', 'lia', { rivalidade: 2 }), flag('julia_dividiu')],
            result: [
              say('julia', 'Ninguém nunca me dá crédito por nada, e quando eu…'),
              narr('Ela não termina a frase. Edita a legenda. Passa o resto do dia em silêncio.'),
            ],
          },
        ],
      },
      {
        id: 'deixar',
        label: 'Deixar quieto: está trazendo fãs',
        hint: 'Fãs agora. Ressentimento depois.',
        outcomes: [
          {
            effects: [res('fans', 25), emo('julia', 'motivacao', 4), emo('lia', 'confianca', -4), emo('lia', 'motivacao', -3), rel('julia', 'lia', { rivalidade: 5 }), flag('julia_protagonista')],
            result: [narr('O vídeo passa de mil visualizações. Na legenda, ainda: “meu”.')],
          },
        ],
      },
      {
        id: 'repostar',
        label: 'Repostar no perfil da banda, creditando todas',
        outcomes: [
          {
            effects: [res('fans', 12), res('reputation', 2), emo('lia', 'confianca', 2), emo('julia', 'motivacao', -1), rel('julia', 'lia', { respeito: 2 })],
            result: [narr('O perfil da banda reposta o vídeo com a ficha técnica completa. Júlia comenta um coração. Só um.')],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'a_ligacao',
    title: 'A ligação',
    cast: ['bia', 'julia'],
    priority: 4,
    trigger: all(weekMin(4), any(emotionMax('bia', 'motivacao', 60), emotionMin('bia', 'estresse', 55), moneyMax(100))),
    scene: [
      narr('Bia sai no meio do ensaio para atender o telefone. Volta quinze minutos depois, sem o sorriso de sempre.'),
      say('bia', 'Minha mãe. Ela quer que eu faça o vestibular de novo. Disse que “banda é coisa de fim de semana”.'),
      say('bia', 'Ela não tá errada, né? Eu nem sei direito o que a gente tá fazendo.'),
      narr('Do outro lado da sala, Júlia para de cantar.'),
    ],
    choices: [
      {
        id: 'julia',
        label: 'Deixar a Júlia conversar com ela',
        hint: 'Elas se conhecem desde a escola.',
        outcomes: [
          {
            when: relMin('bia', 'julia', 'confianca', 25),
            effects: [rel('bia', 'julia', { confianca: 8, afinidade: 5 }), emo('bia', 'motivacao', 8), emo('julia', 'estresse', 3)],
            result: [
              say('julia', 'Lembra quando você batucava na carteira e a professora te mandava pra diretoria? Você nunca parou.'),
              say('bia', 'Eu era insuportável.'),
              say('julia', 'Ainda é. Fica.'),
            ],
          },
          {
            effects: [emo('bia', 'motivacao', 3), rel('bia', 'julia', { confianca: 2 })],
            result: [narr('Júlia tenta. Fala da banda, do futuro, dos planos dela. Bia escuta. Mas parece que as duas falam de coisas diferentes.')],
          },
        ],
      },
      {
        id: 'plano',
        label: 'Ajudar a Bia a montar um plano para mostrar à mãe',
        outcomes: [
          {
            effects: [
              emo('bia', 'motivacao', 4),
              emo('bia', 'estresse', -6),
              rel('bia', 'nina', { respeito: 4, afinidade: 3 }),
              modifier('bia', 'todas', 1.1, 3, 'Bia com um plano'),
              flag('bia_plano'),
            ],
            result: [
              narr('Vocês montam uma planilha: datas, metas, quanto cada show paga, quanto falta.'),
              narr('Nina, sem ninguém pedir, revisa as contas e corrige duas fórmulas.'),
              say('bia', 'Desde quando você me ajuda?'),
              say('nina', 'Desde que você parou de chegar atrasada. Mais ou menos.'),
            ],
          },
        ],
      },
      {
        id: 'espaco',
        label: 'Dar a semana para ela pensar',
        outcomes: [
          {
            effects: [emo('bia', 'estresse', -15), emo('bia', 'motivacao', -2), flag('bia_pensou')],
            result: [narr('Bia agradece e vai embora cedo. Na semana seguinte, volta. Não fala sobre o assunto — mas também não fala em parar.')],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'depois_que_todo_mundo_foi',
    title: 'Depois que todo mundo foi embora',
    cast: ['lia', 'nina'],
    priority: 6,
    trigger: all(weekMin(4), together('lia', 'nina', 'ensaiar', 'compor', 'gravar'), relMin('lia', 'nina', 'afinidade', 25)),
    scene: [
      narr('Você volta ao estúdio para buscar a chave que esqueceu. A porta está entreaberta.'),
      narr('Lia toca uma melodia que você nunca ouviu. Nina, sentada no amplificador, acompanha no baixo — sem partitura, sem metrônomo.'),
      narr('Nenhuma das duas fala. Nina erra uma nota e, em vez de parar, ri baixinho. Lia sorri sem olhar para ela.'),
    ],
    choices: [
      {
        id: 'sair',
        label: 'Fechar a porta devagar e ir embora',
        outcomes: [
          {
            effects: [rel('lia', 'nina', { afinidade: 6, confianca: 4 }), flag('lia_nina_momento')],
            result: [narr('Você pega a chave outro dia. Algumas coisas não precisam de testemunha.')],
          },
        ],
      },
      {
        id: 'bar',
        label: 'Bater na porta e chamar as duas para o bar com a banda',
        outcomes: [
          {
            effects: [
              rel('lia', 'nina', { afinidade: 2 }),
              rel('bia', 'lia', { afinidade: 3 }),
              rel('julia', 'nina', { afinidade: 3 }),
              emo('lia', 'estresse', -4),
              emo('nina', 'estresse', -4),
            ],
            result: [
              narr('As duas levam um susto. Nina guarda o baixo rápido demais.'),
              narr('No bar, sentam em pontas opostas da mesa — e se olham mais do que conversam com qualquer outra pessoa.'),
            ],
          },
        ],
      },
      {
        id: 'gravar',
        label: 'Pedir para gravarem aquilo agora',
        outcomes: [
          {
            when: hasDraft(),
            effects: [draftBonus({ originality: 6, identity: 4 }), emo('lia', 'estresse', 5), rel('lia', 'nina', { respeito: 4 })],
            result: [
              narr('Lia hesita. Nina diz “vamos”, e é isso que decide.'),
              narr('A melodia entra na música nova. Ninguém comenta de onde ela veio.'),
            ],
          },
          {
            effects: [skill('lia', 'composicao', 2), skill('nina', 'composicao', 2), rel('lia', 'nina', { respeito: 3 })],
            result: [narr('Vocês gravam no celular. A melodia fica guardada para a próxima música.')],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'a_resenha',
    title: 'A resenha',
    cast: ['lia'],
    priority: 6,
    trigger: released({ writer: 'lia', reception: ['morna', 'boa'] }),
    scene: [
      narr('Um blog de música da cidade publicou uma resenha do lançamento.'),
      narr('“A banda tem energia, mas as letras soam como um diário adolescente que alguém esqueceu de fechar.”'),
      narr('Lia ainda não viu. Mas vai ver. Todo mundo sempre vê.'),
    ],
    choices: [
      {
        id: 'mostrar',
        label: 'Mostrar a resenha junto com os comentários bons dos fãs',
        outcomes: [
          {
            effects: [emo('lia', 'confianca', 2), emo('lia', 'estresse', 3)],
            result: [say('lia', '“Diário adolescente.”'), narr('Uma pausa longa.'), say('lia', 'Pelo menos alguém leu a letra.')],
          },
        ],
      },
      {
        id: 'faz_parte',
        label: 'Dizer que crítica faz parte e que ela é boa demais para isso',
        hint: 'Depende de como ela está.',
        outcomes: [
          {
            when: emotionMin('lia', 'confianca', 50),
            effects: [emo('lia', 'confianca', 4), emo('lia', 'motivacao', 3), modifier('lia', 'compor', 1.2, 2, 'Lia escrevendo de raiva')],
            result: [say('lia', '…Tá. Eu vou escrever uma melhor. Só de raiva.')],
          },
          {
            effects: [emo('lia', 'confianca', -6), emo('lia', 'estresse', 8), modifier('lia', 'compor', 0.8, 2, 'Lia travada')],
            result: [narr('Ela concorda com a cabeça. Naquela semana, o caderno fica fechado.')],
          },
        ],
      },
      {
        id: 'esconder',
        label: 'Não comentar nada e torcer para ela não ver',
        outcomes: [
          {
            effects: [flag('escondeu_resenha'), schedule('voce_sabia', 2)],
            result: [narr('Você fecha a aba do navegador. Por enquanto, funciona.')],
          },
        ],
      },
    ],
  },

  {
    id: 'voce_sabia',
    title: 'Você sabia?',
    cast: ['lia'],
    priority: 9,
    followUp: true,
    scene: [
      narr('Lia está com o celular na mão, a tela virada para você. É a resenha.'),
      say('lia', 'Você sabia disso? Faz duas semanas.'),
    ],
    choices: [
      {
        id: 'admitir',
        label: 'Admitir e pedir desculpas',
        outcomes: [
          {
            effects: [emo('lia', 'confianca', -3), emo('lia', 'estresse', 4)],
            result: [say('lia', 'Eu não preciso que me protejam. Preciso que me falem.'), narr('Ela não está brava. Está decepcionada, o que é pior.')],
          },
        ],
      },
      {
        id: 'magoar',
        label: 'Dizer que não queria magoá-la',
        outcomes: [
          {
            when: emotionMin('lia', 'confianca', 50),
            effects: [emo('lia', 'confianca', 1)],
            result: [say('lia', 'Eu sei. Mas da próxima vez, fala. Eu aguento mais do que parece.')],
          },
          {
            effects: [emo('lia', 'confianca', -5), emo('lia', 'motivacao', -4)],
            result: [say('lia', 'Então todo mundo acha que eu não aguento.'), narr('Ela sai antes que você consiga responder.')],
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  {
    id: 'ensaiar_ou_aparecer',
    title: 'Ensaiar ou aparecer?',
    cast: ['julia', 'nina'],
    priority: 5,
    trigger: all(weekMin(5), did('julia', 'divulgar'), relMin('julia', 'nina', 'rivalidade', 15)),
    scene: [
      say('julia', 'A gente precisa estar onde as pessoas estão. Ninguém vai descobrir a banda num porão.'),
      say('nina', 'E quando descobrirem, a gente vai tocar o quê? Uma música que a gente erra no segundo verso?'),
      say('julia', 'Ninguém nota um errinho, Nina.'),
      say('nina', 'Eu noto.'),
      narr('As duas esperam que você desempate.'),
    ],
    choices: [
      {
        id: 'julia',
        label: 'Dar razão à Júlia: as próximas semanas são de divulgação',
        outcomes: [
          {
            effects: [
              modifier(null, 'divulgar', 1.25, 2, 'Foco em divulgação'),
              emo('julia', 'motivacao', 4),
              emo('nina', 'motivacao', -5),
              rel('julia', 'nina', { rivalidade: 3 }),
            ],
            result: [say('julia', 'Obrigada! Finalmente.'), narr('Nina desliga o metrônomo. Não diz nada. Também não liga de novo.')],
          },
        ],
      },
      {
        id: 'nina',
        label: 'Dar razão à Nina: primeiro a banda precisa estar pronta',
        outcomes: [
          {
            effects: [
              modifier(null, 'ensaiar', 1.25, 2, 'Foco em ensaio'),
              modifier(null, 'gravar', 1.25, 2, 'Foco em ensaio'),
              emo('nina', 'motivacao', 4),
              emo('julia', 'motivacao', -5),
              rel('julia', 'nina', { rivalidade: 3 }),
            ],
            result: [say('nina', 'Obrigada.'), say('julia', 'Vocês vão ensaiar pra uma plateia de zero pessoas.')],
          },
        ],
      },
      {
        id: 'trocar',
        label: 'Propor que cada uma passe um dia fazendo o que a outra faz',
        hint: 'Ninguém vai gostar. Talvez funcione.',
        outcomes: [
          {
            effects: [
              rel('julia', 'nina', { respeito: 6, afinidade: 2 }),
              emo('julia', 'estresse', 4),
              emo('nina', 'estresse', 6),
              skill('julia', 'tecnica', 2),
              skill('nina', 'presenca', 2),
              flag('trocaram_de_lugar'),
            ],
            result: [
              narr('Júlia passa três horas com o metrônomo e sai com dor de cabeça e um respeito novo.'),
              narr('Nina distribui panfletos e descobre que as pessoas gostam quando ela explica a linha de baixo.'),
              narr('Nenhuma das duas admite que aprendeu alguma coisa.'),
            ],
          },
        ],
      },
    ],
  },
];

export const EVENTS_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
