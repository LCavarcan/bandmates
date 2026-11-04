// Shows, metas e a seletiva do festival. Fórmulas em docs/mecanicas/shows.md.
import { EPILOGUES, FESTIVAL_TIERS, FESTIVAL_WEIGHTS, GOAL_POINTS, GOALS, ROMANCE_EPILOGUE } from '../data/campaign';
import { EVENTS_BY_ID } from '../data/events';
import { MEMBER_ORDER } from '../data/members';
import { COVER_VALUE, SETLIST_SIZE, SHOW_TIERS, VENUES } from '../data/venues';
import type { MemberChanges } from './changes';
import { trait } from './changes';
import { seenEvent } from './events';
import { bandUnity, evaluate } from './narrative';
import type { Rng } from './rng';
import type {
  FestivalResult,
  FestivalTier,
  GameState,
  LogEntry,
  MemberId,
  MemberState,
  ShowResult,
  ShowTier,
  Song,
  VenueId,
} from './types';
import { clamp, gainScale } from './util';

export const FESTIVAL_VENUE: VenueId = 'festival';

// ---------------------------------------------------------------------------
// Agendamento

/** Motivo pelo qual não dá para marcar o show, ou null se for possível. */
export function bookingBlocker(s: GameState, venue: VenueId): string | null {
  const v = VENUES[venue];
  if (s.finished) return 'A temporada acabou.';
  if (v.special) return 'Só na semana da seletiva.';
  if (s.week >= s.maxWeeks) return 'A semana 12 é da seletiva.';
  if (s.fans < v.minFans) return `Precisa de ${v.minFans} fãs.`;
  if (s.reputation < v.minReputation) return `Precisa de reputação ${v.minReputation}.`;
  const last = [...s.shows].reverse().find((x) => x.venue === venue);
  if (last && s.week - last.week < v.cooldown) return `Disponível de novo na semana ${last.week + v.cooldown}.`;
  return null;
}

/** Marca (ou cancela, com null) o show da semana. A banda inteira passa a ter "show" no plano. */
export function setBooking(s: GameState, venue: VenueId | null): GameState {
  if (s.booking?.venue === FESTIVAL_VENUE) return s; // a seletiva não pode ser cancelada
  if (venue && bookingBlocker(s, venue)) return s;
  const plan = { ...s.plan };
  for (const id of MEMBER_ORDER) plan[id] = venue ? 'show' : plan[id] === 'show' ? 'ensaiar' : plan[id];
  return { ...s, booking: venue ? { venue } : null, plan };
}

/** Na semana da seletiva, a banda inteira está escalada automaticamente. */
export function bookFestival(s: GameState): void {
  s.booking = { venue: FESTIVAL_VENUE };
  for (const id of MEMBER_ORDER) s.plan[id] = 'show';
}

// ---------------------------------------------------------------------------
// Apresentação

/** Até 4 músicas próprias (as melhores); o resto do setlist são covers. */
export function setlistOf(s: GameState): { songs: Song[]; covers: number } {
  const songValue = (x: Song) => x.score ?? x.quality * 0.8;
  const songs = [...s.songs].sort((a, b) => songValue(b) - songValue(a)).slice(0, SETLIST_SIZE);
  return { songs, covers: SETLIST_SIZE - songs.length };
}

export function setlistQuality(s: GameState): number {
  const { songs, covers } = setlistOf(s);
  const own = songs.map((x) => (x.score ?? x.quality * 0.8) * 0.6 + x.polish * 0.4);
  return (own.reduce((a, v) => a + v, 0) + covers * COVER_VALUE) / SETLIST_SIZE;
}

/** Desempenho de palco de uma integrante. */
export function stagePerformance(m: MemberState, mf: number): number {
  return (m.skills.presenca * 0.45 + m.skills.tecnica * 0.3 + m.skills.ritmo * 0.25) * (0.6 + 0.4 * mf);
}

/** Faixa de cachê + bilheteria prevista (a nota do show define onde cai). */
export function showMoneyRange(s: GameState, venue: VenueId): { min: number; max: number } {
  const v = VENUES[venue];
  const gate = audienceFor(s, venue) * v.perHead;
  return { min: Math.round(v.fee * 0.6 + gate), max: Math.round(v.fee * 1.0 + gate) };
}

export function audienceFor(s: GameState, venue: VenueId): number {
  const v = VENUES[venue];
  return Math.round(v.capacity * clamp(0.25 + s.fans / (v.capacity * 2.5) + s.reputation / 150, 0.15, 1));
}

export function tierOf(score: number): ShowTier {
  if (score >= SHOW_TIERS.memoravel.min) return 'memoravel';
  if (score >= SHOW_TIERS.bom.min) return 'bom';
  if (score >= SHOW_TIERS.morno.min) return 'morno';
  return 'desastre';
}

/** Efeitos individuais de subir ao palco (chamado por integrante na resolução da semana). */
export function performerEffects(id: MemberId, m: MemberState, c: MemberChanges, mf: number, rng: Rng): void {
  c.skill('presenca', 2 * mf * gainScale(m.skills.presenca) + rng.next());
  c.emotion('estresse', 10 + trait(id, 'perfeccionismo') / 20 + (trait(id, 'sociabilidade') < 40 ? 5 : 0));
  if (trait(id, 'ambicao') >= 70) c.emotion('motivacao', 5);
  if (trait(id, 'sociabilidade') >= 80) c.emotion('motivacao', 4);
}

/**
 * Resolve o show da semana: nota, público, cachê, fãs e reputação.
 * Muta `s` (histórico de shows) e as emoções via `changes`.
 */
export function resolveShow(
  s: GameState,
  venue: VenueId,
  mf: Record<MemberId, number>,
  changes: Record<MemberId, MemberChanges>,
  rng: Rng,
): { show: ShowResult; entry: LogEntry } {
  const v = VENUES[venue];
  const perf = MEMBER_ORDER.reduce((a, id) => a + stagePerformance(s.members[id], mf[id]), 0) / MEMBER_ORDER.length;
  const rapport = 1 + clamp(bandUnity(s), -30, 30) / 200;
  const { songs, covers } = setlistOf(s);
  const fit = songs.length ? (songs.filter((x) => v.genres.includes(x.genre)).length / songs.length) * 10 : 0;
  const score = Math.round(clamp(perf * rapport * 0.55 + setlistQuality(s) * 0.35 + fit + rng.int(-6, 6)));

  const ownShare = songs.length / SETLIST_SIZE;
  const audience = audienceFor(s, venue);
  const money = Math.round(v.fee * (0.6 + score / 250) + audience * v.perHead);
  const fans = Math.max(0, Math.round(audience * (score / 100) * 0.4 * v.fanFactor * (0.5 + 0.5 * ownShare)));
  const reputation = Math.round(((score - 50) / 8) * v.repFactor * (0.4 + 0.6 * ownShare));
  const tier = tierOf(score);

  for (const id of MEMBER_ORDER) {
    if (score >= 65) changes[id].emotion('confianca', 5);
    else if (score < 45) changes[id].emotion('confianca', -5);
  }

  const show: ShowResult = { week: s.week, venue, score, tier, audience, money, fans, reputation, setlist: songs.map((x) => x.title), covers };
  s.shows.push(show);

  const coverText = covers ? ` O setlist teve ${covers} cover${covers > 1 ? 's' : ''}.` : '';
  const entry: LogEntry = {
    kind: 'show',
    members: [],
    text: `${v.icon} ${v.name} — ${SHOW_TIERS[tier].label}. ${rng.pick(SHOW_TIERS[tier].lines)}${coverText}`,
    deltas: [
      { label: 'Nota do show', value: score },
      { label: 'Público', value: audience },
      ...(venue === FESTIVAL_VENUE ? [] : [{ label: 'Dinheiro', value: money }]),
      { label: 'Fãs', value: fans },
      { label: 'Reputação', value: reputation },
    ],
  };
  return { show, entry };
}

// ---------------------------------------------------------------------------
// Metas e festival

export function goalsStatus(s: GameState): { id: string; label: string; hint: string; done: boolean }[] {
  return GOALS.map((g) => ({ id: g.id, label: g.label, hint: g.hint, done: evaluate(g.condition, s, s.week) }));
}

/** Avaliação do júri. `performance` = nota do show na seletiva. */
export function festivalResult(s: GameState, performance: number): FestivalResult {
  const best = Math.max(0, ...s.songs.map((x) => x.score ?? x.quality * 0.8));
  const components = [
    { label: 'Apresentação na seletiva', value: performance, weight: FESTIVAL_WEIGHTS.performance },
    { label: 'Melhor música', value: Math.round(best), weight: FESTIVAL_WEIGHTS.song },
    { label: 'Público (fãs)', value: Math.round(clamp(s.fans / 3)), weight: FESTIVAL_WEIGHTS.fans },
    { label: 'Reputação', value: Math.round(clamp(s.reputation * 2.5)), weight: FESTIVAL_WEIGHTS.reputation },
    { label: 'União da banda', value: Math.round(clamp(50 + bandUnity(s))), weight: FESTIVAL_WEIGHTS.unity },
  ];
  const goalsDone = goalsStatus(s).filter((g) => g.done).length;
  const goalsBonus = goalsDone * GOAL_POINTS;
  const score = Math.round(clamp(components.reduce((a, c) => a + c.value * c.weight, 0) + goalsBonus));
  const tier: FestivalTier =
    score >= FESTIVAL_TIERS.selecionadas.min ? 'selecionadas' : score >= FESTIVAL_TIERS.alternativo.min ? 'alternativo' : 'nao_foi';
  return { score, tier, components, goalsDone, goalsBonus };
}

export interface Epilogue {
  members: { id: MemberId; text: string }[];
  romance: string | null;
  /** Continuações agendadas que a temporada não deixou acontecer, contadas como epílogo. */
  unfinished: string[];
}

export function epilogue(s: GameState): Epilogue {
  const pick = <T extends { when?: Parameters<typeof evaluate>[0] }>(list: T[]) =>
    list.find((x) => !x.when || evaluate(x.when, s, s.week))!;
  return {
    members: MEMBER_ORDER.map((id) => ({ id, text: pick(EPILOGUES[id]).text })),
    romance: pick(ROMANCE_EPILOGUE).text,
    unfinished: unfinishedStories(s),
  };
}

/** Linhas de epílogo das continuações que ficaram agendadas e não foram vistas. */
export function unfinishedStories(s: GameState): string[] {
  const ids = [...new Set(s.scheduled.map((x) => x.event))].filter((id) => !seenEvent(s, id));
  return ids.map((id) => EVENTS_BY_ID[id]?.epilogue).filter((t): t is string => !!t);
}

