// Tipos centrais do motor de Bandmates.
// O motor não conhece React: recebe estado + ações e devolve novo estado + relatório.

export type MemberId = 'julia' | 'lia' | 'bia' | 'nina';

export type SkillKey = 'composicao' | 'tecnica' | 'ritmo' | 'presenca';

export type TraitKey =
  | 'ambicao'
  | 'criatividade'
  | 'sociabilidade'
  | 'disciplina'
  | 'perfeccionismo'
  | 'impulsividade'
  | 'sensibilidade'
  | 'competitividade';

export type EmotionKey = 'motivacao' | 'estresse' | 'confianca';

export type ActivityId = 'ensaiar' | 'compor' | 'descansar' | 'divulgar' | 'bico';

/** Dimensões de uma relação entre duas integrantes (escala -100..100). */
export interface Relation {
  afinidade: number;
  respeito: number;
  confianca: number;
  rivalidade: number;
}
export type RelationKey = keyof Relation;

/** Parte dinâmica de uma integrante (o que muda durante a campanha). */
export interface MemberState {
  id: MemberId;
  skills: Record<SkillKey, number>;
  emotions: Record<EmotionKey, number>;
}

/** Música em composição. Acumula contribuições até completar 100% de progresso. */
export interface SongDraft {
  progress: number;
  /** Somatórios ponderados pelo progresso de cada contribuição. */
  qualityWeighted: number;
  originalityWeighted: number;
  writers: MemberId[];
  weekStarted: number;
}

export interface Song {
  id: string;
  title: string;
  quality: number;
  originality: number;
  /** Lapidação obtida em ensaios (0..100). */
  polish: number;
  writers: MemberId[];
  weekCreated: number;
}

export interface Delta {
  label: string;
  value: number;
  /** Se true, valor positivo é ruim (ex.: estresse). Usado só para colorir a interface. */
  inverse?: boolean;
}

export type LogKind = 'member' | 'pair' | 'band' | 'song' | 'warning';

export interface LogEntry {
  kind: LogKind;
  members: MemberId[];
  text: string;
  deltas: Delta[];
}

export interface WeekReport {
  week: number;
  entries: LogEntry[];
  money: number;
  fans: number;
  reputation: number;
}

export type Plan = Record<MemberId, ActivityId>;

export interface GameState {
  version: number;
  week: number;
  maxWeeks: number;
  money: number;
  fans: number;
  reputation: number;
  members: Record<MemberId, MemberState>;
  /** Chave: par ordenado "a|b" (ver relationKey). */
  relations: Record<string, Relation>;
  draft: SongDraft | null;
  songs: Song[];
  plan: Plan;
  /** Semente do gerador pseudoaleatório: torna a simulação reproduzível. */
  seed: number;
  history: WeekReport[];
  /** Escolhas narrativas e marcos (usado pelos próximos sistemas de eventos). */
  flags: Record<string, number | boolean | string>;
  finished: boolean;
}
