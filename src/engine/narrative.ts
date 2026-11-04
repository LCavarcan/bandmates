// Núcleo narrativo: avalia condições e aplica efeitos descritos como dados.
// Usado por eventos (events.ts) e conversas (talk.ts). Ver docs/mecanicas/eventos.md.
import { ACTIVITIES } from '../data/activities';
import { RELATION_LABELS } from '../data/labels';
import { MEMBER_ORDER, MEMBERS } from '../data/members';
import { MemberChanges } from './changes';
import { applyRelationDelta, getRelation, relationKey, synergy } from './relations';
import type { Rng } from './rng';
import type {
  ActivityId,
  Condition,
  Delta,
  Effect,
  GameState,
  LogEntry,
  MemberId,
  Modifier,
  Outcome,
  RelationKey,
  ResourceKey,
  Song,
  SongBonus,
} from './types';
import { clamp } from './util';

const inRange = (v: number, c: { min?: number; max?: number }) =>
  (c.min === undefined || v >= c.min) && (c.max === undefined || v <= c.max);

/** Sinergia média entre todos os pares da banda. */
export function bandUnity(s: GameState): number {
  const rels = Object.values(s.relations);
  return rels.reduce((acc, r) => acc + synergy(r), 0) / rels.length;
}

/** Música lançada na semana `week`, se houver. */
export function releasedIn(s: GameState, week: number): Song | undefined {
  return s.songs.find((x) => x.release?.week === week);
}

/**
 * Avalia uma condição.
 * `week` é a semana de referência (a que acabou de ser jogada, ao disparar eventos).
 * Sem `rng`, condições de chance são consideradas verdadeiras.
 */
export function evaluate(c: Condition, s: GameState, week: number, rng?: Rng): boolean {
  switch (c.type) {
    case 'week':
      return inRange(week, c);
    case 'emotion':
      return inRange(s.members[c.member].emotions[c.key], c);
    case 'skill':
      return inRange(s.members[c.member].skills[c.key], c);
    case 'relation':
      return inRange(getRelation(s.relations, c.a, c.b)[c.key], c);
    case 'resource':
      return inRange(s[c.key], c);
    case 'flag': {
      const has = c.name in s.flags;
      if (c.exists !== undefined && has !== c.exists) return false;
      if (c.equals !== undefined) return s.flags[c.name] === c.equals;
      return c.exists !== undefined ? true : has;
    }
    case 'did':
      return c.activities.includes(s.plan[c.member]);
    case 'together':
      return s.plan[c.a] === s.plan[c.b] && c.activities.includes(s.plan[c.a]);
    case 'draft':
      return (
        !!s.draft &&
        (c.leader === undefined || s.draft.leader === c.leader) &&
        (c.minProgress === undefined || s.draft.progress >= c.minProgress)
      );
    case 'released': {
      const song = releasedIn(s, week);
      if (!song || !song.release) return false;
      if (c.reception && !c.reception.includes(song.release.reception)) return false;
      if (c.writer && !song.writers.includes(c.writer)) return false;
      if (c.notLeader && song.leader === c.notLeader) return false;
      return true;
    }
    case 'songs':
      return s.songs.filter((x) => c.statuses.includes(x.status)).length >= c.min;
    case 'shows':
      return s.shows.filter((x) => x.venue !== 'festival' && x.score >= (c.minScore ?? 0)).length >= c.min;
    case 'unity':
      return bandUnity(s) >= c.min;
    case 'chance':
      return rng ? rng.chance(c.p) : true;
    case 'all':
      return c.of.every((x) => evaluate(x, s, week, rng));
    case 'any':
      return c.of.some((x) => evaluate(x, s, week, rng));
    case 'not':
      return !evaluate(c.of, s, week, rng);
  }
}

/** Primeiro desfecho cujo `when` é verdadeiro (ou sem `when`). */
export function pickOutcome(outcomes: Outcome[], s: GameState, week: number): Outcome {
  const o = outcomes.find((x) => !x.when || evaluate(x.when, s, week));
  if (!o) throw new Error('Escolha sem desfecho aplicável: inclua um desfecho sem "when" no fim.');
  return o;
}

/** Multiplicador ativo para uma integrante numa atividade nesta semana. */
export function activityMultiplier(s: GameState, id: MemberId, act: ActivityId): number {
  return s.modifiers
    .filter((m) => m.untilWeek >= s.week && (m.member === null || m.member === id) && (m.activity === 'todas' || m.activity === act))
    .reduce((acc, m) => acc * m.mult, 1);
}

const RESOURCE_LABEL: Record<ResourceKey, string> = { money: 'Dinheiro', fans: 'Fãs', reputation: 'Reputação' };
const BONUS_LABEL: Record<keyof SongBonus, string> = {
  quality: 'qualidade',
  originality: 'originalidade',
  commercial: 'apelo',
  cohesion: 'coesão',
  identity: 'identidade',
};

/**
 * Aplica efeitos ao estado (mutando `s`, que deve ser uma cópia) e devolve
 * entradas legíveis para a interface. Flags e agendamentos não aparecem: são consequências ocultas.
 */
export function applyEffects(s: GameState, effects: Effect[]): LogEntry[] {
  const changes = new Map<MemberId, MemberChanges>();
  const ch = (id: MemberId) => {
    if (!changes.has(id)) changes.set(id, new MemberChanges(s.members[id]));
    return changes.get(id)!;
  };
  const pairDeltas = new Map<string, { a: MemberId; b: MemberId; deltas: Map<RelationKey, number> }>();
  const band: Delta[] = [];
  const extra: LogEntry[] = [];

  for (const e of effects) {
    switch (e.type) {
      case 'emotion':
        ch(e.member).emotion(e.key, e.value);
        break;
      case 'skill':
        ch(e.member).skill(e.key, e.value);
        break;
      case 'relation': {
        const before = { ...getRelation(s.relations, e.a, e.b) };
        applyRelationDelta(s.relations, e.a, e.b, e.delta);
        const after = getRelation(s.relations, e.a, e.b);
        const key = relationKey(e.a, e.b);
        const entry = pairDeltas.get(key) ?? { a: e.a, b: e.b, deltas: new Map() };
        for (const k of Object.keys(e.delta) as RelationKey[]) {
          entry.deltas.set(k, (entry.deltas.get(k) ?? 0) + (after[k] - before[k]));
        }
        pairDeltas.set(key, entry);
        break;
      }
      case 'resource': {
        const before = s[e.key];
        if (e.key === 'money') s.money += e.value;
        else if (e.key === 'fans') s.fans = Math.max(0, s.fans + e.value);
        else s.reputation = clamp(s.reputation + e.value);
        const d = s[e.key] - before;
        if (d) band.push({ label: RESOURCE_LABEL[e.key], value: d });
        break;
      }
      case 'flag':
        s.flags[e.name] = e.value;
        break;
      case 'draft': {
        if (!s.draft) break;
        const deltas: Delta[] = [];
        for (const [k, v] of Object.entries(e.bonus) as [keyof SongBonus, number][]) {
          s.draft.bonus[k] = (s.draft.bonus[k] ?? 0) + v;
          deltas.push({ label: `${BONUS_LABEL[k]} (música)`, value: v });
        }
        extra.push({ kind: 'song', members: [s.draft.leader], text: `“${s.draft.title}” muda de rumo.`, deltas });
        break;
      }
      case 'modifier': {
        const mod: Modifier = {
          label: e.label,
          member: e.member,
          activity: e.activity,
          mult: e.mult,
          untilWeek: s.week + e.weeks - 1,
        };
        s.modifiers.push(mod);
        extra.push({ kind: 'band', members: e.member ? [e.member] : [], text: describeModifier(mod), deltas: [] });
        break;
      }
      case 'schedule':
        s.scheduled.push({ event: e.event, week: scheduleWeek(s, e.inWeeks) });
        break;
    }
  }

  const entries: LogEntry[] = [];
  for (const id of MEMBER_ORDER) {
    const d = changes.get(id)?.list();
    if (d?.length) entries.push({ kind: 'member', members: [id], text: MEMBERS[id].name, deltas: d });
  }
  for (const { a, b, deltas } of pairDeltas.values()) {
    const list: Delta[] = [...deltas.entries()]
      .filter(([, v]) => v)
      .map(([k, v]) => ({ label: RELATION_LABELS[k], value: v, inverse: k === 'rivalidade' }));
    if (list.length) entries.push({ kind: 'pair', members: [a, b], text: `${MEMBERS[a].name} & ${MEMBERS[b].name}`, deltas: list });
  }
  if (band.length) entries.push({ kind: 'band', members: [], text: 'Banda', deltas: band });
  return [...entries, ...extra];
}

/**
 * Última semana em que uma continuação pode acontecer: a penúltima semana é da *Véspera*
 * (prioridade 10) e a última não tem evento.
 */
export function lastStoryWeek(s: GameState): number {
  return s.maxWeeks - 2;
}

/**
 * Semana de uma continuação agendada para daqui a `inWeeks` semanas, antecipada para
 * `lastStoryWeek` quando cairia depois dela. Se nem assim couber, ela vira linha de epílogo.
 */
export function scheduleWeek(s: GameState, inWeeks: number): number {
  const target = s.week + inWeeks - 1;
  return Math.max(s.week, Math.min(target, lastStoryWeek(s)));
}

export function describeModifier(m: Modifier): string {
  const who = m.member ? MEMBERS[m.member].name : 'Banda';
  const what = m.activity === 'todas' ? 'tudo' : ACTIVITIES[m.activity].name.toLowerCase();
  const pct = Math.round((m.mult - 1) * 100);
  return `${m.label} — ${who}: ${what} ${pct >= 0 ? '+' : ''}${pct}% até a semana ${m.untilWeek}.`;
}
