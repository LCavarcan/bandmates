import type { DirectionId, GenreId, Reception, SkillKey, ThemeId } from '../engine/types';

export interface GenreDef {
  id: GenreId;
  name: string;
  icon: string;
  description: string;
  /** Habilidade que mais pesa na qualidade da composição neste gênero. */
  keySkill: SkillKey;
  commercial: number;
  originality: number;
  /** Temas que combinam naturalmente com o gênero (+coesão). */
  themes: ThemeId[];
}

export const GENRE_ORDER: GenreId[] = ['indie', 'pop', 'alternativo', 'punk'];

export const GENRES: Record<GenreId, GenreDef> = {
  indie: {
    id: 'indie',
    name: 'Indie rock',
    icon: '🎸',
    description: 'Guitarras, melodia e letra. Equilibrado; a composição pesa mais.',
    keySkill: 'composicao',
    commercial: 0,
    originality: 4,
    themes: ['cidade', 'saudade', 'amor'],
  },
  pop: {
    id: 'pop',
    name: 'Pop',
    icon: '✨',
    description: 'Refrão que gruda. Alto apelo comercial; a presença de quem canta faz diferença.',
    keySkill: 'presenca',
    commercial: 15,
    originality: -6,
    themes: ['amor', 'amizade', 'ambicao'],
  },
  alternativo: {
    id: 'alternativo',
    name: 'Alternativo',
    icon: '🌀',
    description: 'Estruturas estranhas e timbres inesperados. Original, menos comercial; técnica pesa.',
    keySkill: 'tecnica',
    commercial: -6,
    originality: 10,
    themes: ['recomeco', 'cidade', 'saudade'],
  },
  punk: {
    id: 'punk',
    name: 'Punk rock',
    icon: '⚡',
    description: 'Rápido, alto e honesto. Ritmo é tudo.',
    keySkill: 'ritmo',
    commercial: -3,
    originality: 3,
    themes: ['rebeldia', 'liberdade', 'amizade'],
  },
};

export interface ThemeDef {
  id: ThemeId;
  name: string;
  commercial: number;
}

export const THEME_ORDER: ThemeId[] = ['amor', 'cidade', 'amizade', 'liberdade', 'saudade', 'ambicao', 'recomeco', 'rebeldia'];

export const THEMES: Record<ThemeId, ThemeDef> = {
  amor: { id: 'amor', name: 'Amor não correspondido', commercial: 10 },
  cidade: { id: 'cidade', name: 'Cidade à noite', commercial: 4 },
  amizade: { id: 'amizade', name: 'Amizade', commercial: 6 },
  liberdade: { id: 'liberdade', name: 'Liberdade', commercial: 2 },
  saudade: { id: 'saudade', name: 'Saudade', commercial: 0 },
  ambicao: { id: 'ambicao', name: 'Ambição', commercial: 5 },
  recomeco: { id: 'recomeco', name: 'Recomeço', commercial: 0 },
  rebeldia: { id: 'rebeldia', name: 'Rebeldia', commercial: -4 },
};

export interface DirectionDef {
  id: DirectionId;
  name: string;
  icon: string;
  description: string;
  commercial: number;
  originality: number;
  cohesion: number;
  identity: number;
}

export const DIRECTION_ORDER: DirectionId[] = ['comercial', 'experimental', 'emocional'];

export const DIRECTIONS: Record<DirectionId, DirectionDef> = {
  comercial: {
    id: 'comercial',
    name: 'Comercial',
    icon: '📻',
    description: 'Pensada para tocar em todo lugar. Mais fãs, menos originalidade. Nem todo mundo vai gostar.',
    commercial: 20,
    originality: -10,
    cohesion: 0,
    identity: -5,
  },
  experimental: {
    id: 'experimental',
    name: 'Experimental',
    icon: '🧪',
    description: 'Arriscar tudo. Mais originalidade e reputação, menos alcance e coesão.',
    commercial: -15,
    originality: 18,
    cohesion: -8,
    identity: 0,
  },
  emocional: {
    id: 'emocional',
    name: 'Emocional',
    icon: '💔',
    description: 'Verdade acima de tudo. Reforça a identidade da banda; a sensibilidade de quem lidera conta.',
    commercial: 0,
    originality: 5,
    cohesion: 5,
    identity: 10,
  },
};

export const RECEPTION: Record<Reception, { label: string; lines: string[] }> = {
  aclamada: {
    label: 'Aclamada',
    lines: [
      'Um blog de música da cidade chamou “{t}” de “a faixa mais honesta do ano”. Ninguém na banda sabe lidar com isso.',
      'Gente que nunca foi a um show de vocês está compartilhando “{t}” com textos longos e emocionados.',
    ],
  },
  hit: {
    label: 'Hit local',
    lines: [
      '“{t}” começou a tocar em festas. Alguém mandou um vídeo de uma pista inteira cantando o refrão.',
      'A rádio universitária colocou “{t}” na programação. Três vezes no mesmo dia.',
    ],
  },
  boa: {
    label: 'Boa recepção',
    lines: [
      '“{t}” foi bem recebida: comentários carinhosos, alguns fãs novos, nenhuma surpresa.',
      'Quem ouviu “{t}” gostou. Agora é fazer mais gente ouvir.',
    ],
  },
  morna: {
    label: 'Recepção morna',
    lines: [
      '“{t}” saiu e… passou. Algumas curtidas, um comentário dizendo “legal”.',
      'O lançamento de “{t}” não fez barulho. Às vezes a música certa sai na hora errada.',
    ],
  },
};

/**
 * Reações às escolhas de uma nova música. {n} = integrante, {g} = gênero, {l} = líder, {t} = tema.
 * Cada chave corresponde a uma regra em engine/music.ts (reactToConcept).
 */
export const REACTIONS = {
  genreLove: ['{n} abriu um sorriso enorme quando ouviu “{g}”.', '{n} já estava batucando antes de terminarem a frase “vamos fazer {g}”.'],
  genreDislike: ['{n} torceu o nariz para {g}, mas topou.', '{n} disse “tudo bem” num tom que não parecia tudo bem.'],
  commercialHate: ['{n} acha que “comercial” é só outro jeito de dizer “sem alma”.'],
  commercialLove: ['{n} já está imaginando a música tocando no rádio.'],
  experimentalLove: ['{n} ficou visivelmente animada com a ideia de arriscar.'],
  experimentalDoubt: ['{n} perguntou, meio séria, quem exatamente ia ouvir isso.'],
  experimentalStress: ['{n} começou a desenhar uma estrutura para o caos. Por precaução.'],
  emotionalLove: ['{n} ficou quieta um tempo e depois disse: “essa eu quero fazer direito”.'],
  leader: ['{n} vai liderar a composição.', 'A música vai ter a assinatura de {n}.'],
  personalTheme: ['“{t}” é um tema pessoal para {n}. Dá para ver no jeito como ela segura o caderno.'],
  wantedToLead: ['{n} queria ter liderado essa. Disse que “tudo bem”, mas não para de olhar para {l}.'],
};

/** Adjetivo de cada direção para descrever a identidade da banda. */
export const DIRECTION_ADJECTIVE = { comercial: 'radiofônico', experimental: 'experimental', emocional: 'confessional' } as const;
