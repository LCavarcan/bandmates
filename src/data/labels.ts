import type { EmotionKey, RelationKey, SkillKey, TraitKey } from '../engine/types';

export const SKILL_LABELS: Record<SkillKey, string> = {
  composicao: 'Composição',
  tecnica: 'Técnica',
  ritmo: 'Ritmo',
  presenca: 'Presença',
};

export const EMOTION_LABELS: Record<EmotionKey, string> = {
  motivacao: 'Motivação',
  estresse: 'Estresse',
  confianca: 'Confiança',
};

export const TRAIT_LABELS: Record<TraitKey, string> = {
  ambicao: 'Ambiciosa',
  criatividade: 'Criativa',
  sociabilidade: 'Sociável',
  disciplina: 'Disciplinada',
  perfeccionismo: 'Perfeccionista',
  impulsividade: 'Impulsiva',
  sensibilidade: 'Sensível',
  competitividade: 'Competitiva',
};

export const RELATION_LABELS: Record<RelationKey, string> = {
  afinidade: 'Afinidade',
  respeito: 'Respeito',
  confianca: 'Confiança',
  rivalidade: 'Rivalidade',
};
