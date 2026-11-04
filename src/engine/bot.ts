// Jogadora automática para testes e balanceamento. Não é usada pela interface.
import { MEMBER_ORDER } from '../data/members';
import { eventChoices, resolveEvent } from './events';
import { planIssues, recordingTarget, setRelease, startSong } from './music';
import { setActivity } from './state';
import type { ActivityId, GameState, MemberId, SongConcept, WeekReport } from './types';
import { advanceWeek } from './week';

export type BotConcept = Omit<SongConcept, 'title'>;

export interface BotOptions {
  /** Conceito usado em todas as músicas. */
  concept: BotConcept;
  /** Número de integrantes divulgando na semana de lançamento. */
  promoters?: number;
}

/** Resolve o evento pendente (se houver) com a primeira escolha disponível. */
export function autoResolve(s: GameState): GameState {
  if (!s.pendingEvent) return s;
  const first = eventChoices(s).find((c) => c.available);
  if (!first) throw new Error(`evento ${s.pendingEvent.id} sem escolha disponível`);
  return resolveEvent(s, first.choice.id).state;
}

/** Decide o plano de uma semana com regras simples e legíveis. */
export function botPlan(s: GameState, opt: BotOptions): GameState {
  let st = autoResolve(s);
  if (!st.draft && !recordingTarget(st) && !st.songs.some((x) => x.status === 'gravada')) {
    st = startSong(st, { ...opt.concept, title: `Faixa ${st.songs.length + 1}` }).state;
  }
  const releasable = st.songs.find((x) => x.status === 'gravada');
  st = setRelease(st, releasable ? releasable.id : null);

  const plan = {} as Record<MemberId, ActivityId>;
  const free = [...MEMBER_ORDER];
  const take = (id: MemberId, a: ActivityId) => {
    plan[id] = a;
    free.splice(free.indexOf(id), 1);
  };

  for (const id of [...free]) if (st.members[id].emotions.estresse >= 70) take(id, 'descansar');
  if (releasable) for (const id of free.slice(0, opt.promoters ?? 2)) take(id, 'divulgar');
  if (st.draft && free.includes(st.draft.leader)) take(st.draft.leader, 'compor');
  if (st.money < 150) for (const id of free.slice(0, 2)) take(id, 'bico');
  if (recordingTarget(st)) for (const id of [...free]) take(id, 'gravar');
  for (const id of [...free]) take(id, 'ensaiar');

  for (const id of MEMBER_ORDER) st = setActivity(st, id, plan[id]);
  if (planIssues(st).length) throw new Error(`bot gerou plano inválido: ${planIssues(st).join(' ')}`);
  return st;
}

export function playCampaign(seed: GameState, opt: BotOptions, weeks = seed.maxWeeks): { state: GameState; reports: WeekReport[] } {
  let s = seed;
  const reports: WeekReport[] = [];
  for (let i = 0; i < weeks && !s.finished; i++) {
    const r = advanceWeek(botPlan(s, opt));
    s = r.state;
    reports.push(r.report);
  }
  return { state: s, reports };
}
