import type { EmotionKey, GenreId, MemberId, Relation, SkillKey, ThemeId, TraitKey } from '../engine/types';

/** Configuração visual do retrato provisório (SVG). Trocar por arte definitiva não exige mudar a lógica. */
export interface PortraitConfig {
  skin: string;
  skinShade: string;
  hair: string;
  hairStyle: 'ondulado' | 'chanel' | 'cachos' | 'rabo';
  eyes: string;
  outfit: string;
  outfitAccent: string;
  accessory?: 'oculos' | 'brincos' | 'bandana' | 'fone';
}

export interface MemberProfile {
  id: MemberId;
  name: string;
  role: string;
  /** Cor de identidade da personagem na interface. */
  color: string;
  tagline: string;
  bio: string;
  wants: string;
  fears: string;
  musicalTaste: string;
  traits: Partial<Record<TraitKey, number>>;
  /** Afinidade com cada gênero (0..100): afeta qualidade, coesão e reação ao escolher o gênero. */
  genres: Record<GenreId, number>;
  /** Quanto cada tema ressoa com ela (0..100; ausente = 40). */
  themes: Partial<Record<ThemeId, number>>;
  startSkills: Record<SkillKey, number>;
  startEmotions: Record<EmotionKey, number>;
  portrait: PortraitConfig;
}

export const MEMBER_ORDER: MemberId[] = ['julia', 'lia', 'bia', 'nina'];

export const MEMBERS: Record<MemberId, MemberProfile> = {
  julia: {
    id: 'julia',
    name: 'Júlia',
    role: 'Vocal',
    color: '#ff7a6b',
    tagline: '“Se é pra subir no palco, que seja pra ninguém esquecer.”',
    bio: 'Cantava em casamentos aos quinze e decorou o nome de cada produtor da cidade. Conhece todo mundo — e quer que todo mundo conheça a banda.',
    wants: 'Ver a banda crescer — e ser reconhecida por isso.',
    fears: 'Trabalhar duro e continuar invisível.',
    musicalTaste: 'Pop com refrão grande, divas dos anos 2000, qualquer coisa que dê pra cantar de olhos fechados.',
    traits: { ambicao: 85, sociabilidade: 75, competitividade: 80, sensibilidade: 40 },
    genres: { pop: 90, indie: 55, alternativo: 45, punk: 50 },
    themes: { ambicao: 95, amor: 60, amizade: 60, liberdade: 50, rebeldia: 55 },
    startSkills: { composicao: 35, tecnica: 50, ritmo: 45, presenca: 76 },
    startEmotions: { motivacao: 75, estresse: 30, confianca: 66 },
    portrait: {
      skin: '#c98b62',
      skinShade: '#a96f4b',
      hair: '#5a1f2b',
      hairStyle: 'ondulado',
      eyes: '#3b2318',
      outfit: '#ff7a6b',
      outfitAccent: '#ffd36b',
      accessory: 'brincos',
    },
  },
  lia: {
    id: 'lia',
    name: 'Lia',
    role: 'Guitarra & composição',
    color: '#b59cff',
    tagline: '“Tá tudo na letra. Só não me pede pra explicar.”',
    bio: 'Escreve em cadernos que ninguém tem permissão de abrir. Toca melhor de costas para a plateia e lembra de cada crítica que já recebeu.',
    wants: 'Ser compreendida sem precisar traduzir tudo o que sente.',
    fears: 'Que rejeitem a música — e, com ela, a ela mesma.',
    musicalTaste: 'Indie melancólico, guitarras com reverb, letras que doem um pouquinho.',
    traits: { criatividade: 90, sensibilidade: 80, perfeccionismo: 50, sociabilidade: 30 },
    genres: { indie: 92, alternativo: 80, pop: 35, punk: 45 },
    themes: { amor: 90, saudade: 85, cidade: 70, recomeco: 55 },
    startSkills: { composicao: 72, tecnica: 55, ritmo: 44, presenca: 30 },
    startEmotions: { motivacao: 60, estresse: 38, confianca: 40 },
    portrait: {
      skin: '#f1d0b5',
      skinShade: '#d9ad8e',
      hair: '#26213a',
      hairStyle: 'chanel',
      eyes: '#4a5b3a',
      outfit: '#4d4373',
      outfitAccent: '#b59cff',
      accessory: 'oculos',
    },
  },
  bia: {
    id: 'bia',
    name: 'Bia',
    role: 'Bateria',
    color: '#ffb347',
    tagline: '“Plano? A gente descobre no caminho.”',
    bio: 'Aprendeu bateria em panelas e nunca chegou na hora em lugar nenhum. Quando ela está no estúdio, a sala inteira respira melhor.',
    wants: 'Que tocar continue sendo divertido, mesmo quando virar coisa séria.',
    fears: 'Decepcionar alguém que contava com ela.',
    musicalTaste: 'Punk, samba-rock, qualquer coisa com uma virada de bateria absurda.',
    traits: { impulsividade: 80, sociabilidade: 85, criatividade: 65, disciplina: 20 },
    genres: { punk: 92, indie: 65, alternativo: 60, pop: 55 },
    themes: { amizade: 90, liberdade: 85, rebeldia: 80, cidade: 55 },
    startSkills: { composicao: 40, tecnica: 45, ritmo: 72, presenca: 60 },
    startEmotions: { motivacao: 70, estresse: 20, confianca: 60 },
    portrait: {
      skin: '#7a4a2e',
      skinShade: '#5e3720',
      hair: '#1d1410',
      hairStyle: 'cachos',
      eyes: '#24140c',
      outfit: '#ffb347',
      outfitAccent: '#3ec1b5',
      accessory: 'bandana',
    },
  },
  nina: {
    id: 'nina',
    name: 'Nina',
    role: 'Baixo',
    color: '#3ec1b5',
    tagline: '“De novo. Do compasso doze.”',
    bio: 'Tem planilha para o setlist e metrônomo no celular. Nunca errou uma nota em show — e nunca se perdoou pelas que errou em ensaio.',
    wants: 'Que as coisas saiam do jeito que foram combinadas.',
    fears: 'O imprevisível. Principalmente quando vem de pessoas.',
    musicalTaste: 'Jazz fusion, math rock, linhas de baixo que ninguém nota mas todo mundo sente.',
    traits: { disciplina: 90, perfeccionismo: 85, sensibilidade: 45, sociabilidade: 30, ambicao: 50 },
    genres: { alternativo: 88, indie: 60, pop: 45, punk: 35 },
    themes: { recomeco: 75, saudade: 60, cidade: 60, ambicao: 55, amor: 55 },
    startSkills: { composicao: 45, tecnica: 73, ritmo: 66, presenca: 30 },
    startEmotions: { motivacao: 65, estresse: 42, confianca: 50 },
    portrait: {
      skin: '#e8b98f',
      skinShade: '#c9966c',
      hair: '#141821',
      hairStyle: 'rabo',
      eyes: '#2a1a12',
      outfit: '#1f4f57',
      outfitAccent: '#3ec1b5',
      accessory: 'fone',
    },
  },
};

/**
 * Relações iniciais. Cada par tem história própria:
 * - Júlia & Bia: amigas de escola, confiança antiga, pouco respeito profissional mútuo.
 * - Júlia & Lia: admiração desconfiada — a voz da banda e a autora das músicas.
 * - Lia & Nina: silêncio confortável, respeito técnico.
 * - Bia & Nina: o caos e o metrônomo.
 */
export const START_RELATIONS: Record<string, Relation> = {
  'bia|julia': { afinidade: 35, respeito: 10, confianca: 25, rivalidade: 5 },
  'julia|lia': { afinidade: 5, respeito: 20, confianca: 5, rivalidade: 25 },
  'julia|nina': { afinidade: 0, respeito: 25, confianca: 10, rivalidade: 15 },
  'bia|lia': { afinidade: 25, respeito: 15, confianca: 15, rivalidade: 0 },
  'lia|nina': { afinidade: 15, respeito: 30, confianca: 20, rivalidade: 0 },
  'bia|nina': { afinidade: 5, respeito: 5, confianca: 0, rivalidade: 10 },
};
