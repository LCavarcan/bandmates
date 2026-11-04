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

export type ActivityId = 'ensaiar' | 'compor' | 'gravar' | 'descansar' | 'divulgar' | 'bico' | 'show';

export type VenueId = 'bar' | 'porao' | 'calourada' | 'aurora' | 'festival';

export type GenreId = 'indie' | 'pop' | 'alternativo' | 'punk';
export type ThemeId =
  | 'amor'
  | 'cidade'
  | 'amizade'
  | 'liberdade'
  | 'saudade'
  | 'ambicao'
  | 'recomeco'
  | 'rebeldia';
export type DirectionId = 'comercial' | 'experimental' | 'emocional';

/** Escolhas feitas ao iniciar uma música. */
export interface SongConcept {
  title: string;
  genre: GenreId;
  theme: ThemeId;
  direction: DirectionId;
  leader: MemberId;
}

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
export interface SongDraft extends SongConcept {
  progress: number;
  /** Somatórios ponderados pelo progresso de cada contribuição. */
  qualityWeighted: number;
  originalityWeighted: number;
  writers: MemberId[];
  weekStarted: number;
  /** Ajustes vindos de eventos, somados aos atributos quando a música fica pronta. */
  bonus: Partial<SongBonus>;
}

export interface SongBonus {
  quality: number;
  originality: number;
  commercial: number;
  cohesion: number;
  identity: number;
}

export type SongStatus = 'composta' | 'gravada' | 'lancada';

export interface RecordingProgress {
  progress: number;
  performanceWeighted: number;
  players: MemberId[];
}

export type Reception = 'aclamada' | 'hit' | 'boa' | 'morna';

export interface ReleaseResult {
  week: number;
  fans: number;
  reputation: number;
  reception: Reception;
  /** Total ganho com streaming desde o lançamento. */
  earnings: number;
  /** Fãs ganhos com streaming desde o lançamento (além do lançamento). */
  streamFans: number;
}

export interface Song extends SongConcept {
  id: string;
  writers: MemberId[];
  weekCreated: number;
  status: SongStatus;
  /** Atributos de composição (0..100). */
  quality: number;
  originality: number;
  commercial: number;
  cohesion: number;
  identity: number;
  /** Lapidação obtida em ensaios (0..100). */
  polish: number;
  recording: RecordingProgress | null;
  /** Qualidade da gravação (0..100), definida ao terminar de gravar. */
  recordingQuality: number | null;
  /** Nota final da faixa gravada (0..100). */
  score: number | null;
  release: ReleaseResult | null;
}

export interface Delta {
  label: string;
  value: number;
  /** Se true, valor positivo é ruim (ex.: estresse). Usado só para colorir a interface. */
  inverse?: boolean;
}

export type LogKind = 'member' | 'pair' | 'band' | 'song' | 'show' | 'warning';

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
  /** Música gravada marcada para lançamento no fim desta semana. */
  pendingRelease: string | null;
  /** Semente do gerador pseudoaleatório: torna a simulação reproduzível. */
  seed: number;
  history: WeekReport[];
  /** Escolhas narrativas e marcos. */
  flags: Record<string, FlagValue>;
  /** Evento aguardando decisão (bloqueia o avanço da semana). */
  pendingEvent: { id: string; week: number } | null;
  /** Eventos já vistos e a escolha feita. */
  eventLog: { id: string; week: number; choice: string }[];
  /** Eventos de continuação agendados para uma semana futura. */
  scheduled: { event: string; week: number }[];
  /** Modificadores temporários de atividade (vindos de eventos e conversas). */
  modifiers: Modifier[];
  /** Semana em que houve a última conversa (uma por semana). */
  talkedWeek: number | null;
  /** Show marcado para esta semana (a banda inteira se apresenta). */
  booking: { venue: VenueId } | null;
  shows: ShowResult[];
  /** Resultado da seletiva do festival (fim da campanha). */
  festival: FestivalResult | null;
  finished: boolean;
}

export type ShowTier = 'memoravel' | 'bom' | 'morno' | 'desastre';

export interface ShowResult {
  week: number;
  venue: VenueId;
  score: number;
  tier: ShowTier;
  audience: number;
  money: number;
  fans: number;
  reputation: number;
  setlist: string[];
  covers: number;
}

export type FestivalTier = 'selecionadas' | 'alternativo' | 'nao_foi';

export interface FestivalResult {
  score: number;
  tier: FestivalTier;
  components: { label: string; value: number; weight: number }[];
  goalsDone: number;
  goalsBonus: number;
}

export type FlagValue = boolean | number | string;

export interface Modifier {
  label: string;
  /** null = toda a banda. */
  member: MemberId | null;
  activity: ActivityId | 'todas';
  /** Multiplicador do fator de disposição nessa atividade. */
  mult: number;
  /** Última semana (inclusive) em que vale. */
  untilWeek: number;
}

// ---------------------------------------------------------------------------
// Narrativa orientada a dados (eventos e conversas)

export interface DialogueLine {
  /** Sem speaker = narração. */
  speaker?: MemberId;
  text: string;
}

type Range = { min?: number; max?: number };

export type Condition =
  | ({ type: 'week' } & Range)
  | ({ type: 'emotion'; member: MemberId; key: EmotionKey } & Range)
  | ({ type: 'skill'; member: MemberId; key: SkillKey } & Range)
  | ({ type: 'relation'; a: MemberId; b: MemberId; key: RelationKey } & Range)
  | ({ type: 'resource'; key: ResourceKey } & Range)
  | { type: 'flag'; name: string; equals?: FlagValue; exists?: boolean }
  /** A integrante fez uma destas atividades na semana que acabou. */
  | { type: 'did'; member: MemberId; activities: ActivityId[] }
  /** As duas fizeram a mesma atividade (dentre as listadas) na semana que acabou. */
  | { type: 'together'; a: MemberId; b: MemberId; activities: ActivityId[] }
  | { type: 'draft'; leader?: MemberId; minProgress?: number }
  /** Uma música foi lançada na semana que acabou. */
  | { type: 'released'; reception?: Reception[]; writer?: MemberId; notLeader?: MemberId }
  | { type: 'songs'; statuses: SongStatus[]; min: number }
  | { type: 'shows'; min: number; minScore?: number }
  /** Sinergia média entre todos os pares. */
  | { type: 'unity'; min: number }
  | { type: 'chance'; p: number }
  | { type: 'all'; of: Condition[] }
  | { type: 'any'; of: Condition[] }
  | { type: 'not'; of: Condition };

export type ResourceKey = 'money' | 'fans' | 'reputation';

export type Effect =
  | { type: 'emotion'; member: MemberId; key: EmotionKey; value: number }
  | { type: 'skill'; member: MemberId; key: SkillKey; value: number }
  | { type: 'relation'; a: MemberId; b: MemberId; delta: Partial<Relation> }
  | { type: 'resource'; key: ResourceKey; value: number }
  | { type: 'flag'; name: string; value: FlagValue }
  | { type: 'draft'; bonus: Partial<SongBonus> }
  | { type: 'modifier'; member: MemberId | null; activity: ActivityId | 'todas'; mult: number; weeks: number; label: string }
  | { type: 'schedule'; event: string; inWeeks: number };

/** Desfecho de uma escolha: o primeiro cujo `when` for verdadeiro (ou sem `when`) vale. */
export interface Outcome {
  when?: Condition;
  effects: Effect[];
  result: DialogueLine[];
}

export interface EventChoice {
  id: string;
  label: string;
  hint?: string;
  /** Condição para a escolha estar disponível. */
  requires?: Condition;
  requiresText?: string;
  outcomes: Outcome[];
}

export interface EventDef {
  id: string;
  title: string;
  cast: MemberId[];
  /** Maior prioridade dispara primeiro quando vários eventos são possíveis. */
  priority: number;
  /** Continuações só disparam quando agendadas por outro evento. */
  followUp?: boolean;
  /**
   * Continuações: linha de epílogo usada se a temporada acabar antes de a cena acontecer
   * (ver `epilogue` em shows.ts). Obrigatória em toda continuação.
   */
  epilogue?: string;
  /** Condição de ativação (ignorada nas continuações, que usam `when` opcional). */
  trigger?: Condition;
  scene: DialogueLine[];
  choices: EventChoice[];
}
