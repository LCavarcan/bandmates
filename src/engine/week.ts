// Resolução de uma semana. Fórmulas documentadas em docs/mecanicas/.
import { ACTIVITIES, ECONOMY, FLAVOR } from '../data/activities';
import { RELATION_LABELS } from '../data/labels';
import { MEMBER_ORDER, MEMBERS } from '../data/members';
import { PAIR_LINES } from '../data/pairs';
import { MemberChanges, trait } from './changes';
import { pickWeekEvent } from './events';
import { bookFestival, FESTIVAL_VENUE, festivalResult, performerEffects, resolveShow, showMoneyRange } from './shows';
import { activityMultiplier } from './narrative';
import {
  composeContribution,
  finalizeRecording,
  finalizeSong,
  planIssues,
  recordContribution,
  recordingTarget,
  rehearsalTarget,
  releaseOutcome,
  releaseText,
  streamingFor,
} from './music';
import { applyRelationDelta, getRelation, pairInteraction } from './relations';
import { createRng, type Rng } from './rng';
import type { ActivityId, Delta, GameState, LogEntry, MemberId, MemberState, RelationKey, WeekReport } from './types';
import { clamp, gainScale } from './util';

/**
 * Fator de disposição (0.36..1.0): motivação alta e estresse baixo rendem mais.
 * mf = (0.6 + motivação/250) × (1 − estresse/250)
 */
export function moodFactor(m: MemberState): number {
  return (0.6 + m.emotions.motivacao / 250) * (1 - m.emotions.estresse / 250);
}

export const BURNOUT_STRESS = 85;

interface WeekContext {
  s: GameState;
  rng: Rng;
  /** Alertas extras gerados durante a resolução (ex.: atraso no trabalho). */
  extra: LogEntry[];
  changes: Record<MemberId, MemberChanges>;
  /** Fator de disposição calculado no início da semana (antes das mudanças). */
  mf: Record<MemberId, number>;
  byActivity: Record<ActivityId, MemberId[]>;
  money: number;
  fans: number;
  reputation: number;
}

export interface WeekResult {
  state: GameState;
  report: WeekReport;
}

export class InvalidPlanError extends Error {}

export function advanceWeek(prev: GameState): WeekResult {
  if (prev.finished) {
    return { state: prev, report: { week: prev.week, entries: [], money: 0, fans: 0, reputation: 0 } };
  }
  const issues = planIssues(prev);
  if (issues.length) throw new InvalidPlanError(issues.join(' '));

  const s: GameState = structuredClone(prev);
  const rng = createRng(s.seed);

  const byActivity: Record<ActivityId, MemberId[]> = {
    ensaiar: [],
    compor: [],
    gravar: [],
    descansar: [],
    divulgar: [],
    bico: [],
    show: [],
  };
  for (const id of MEMBER_ORDER) byActivity[s.plan[id]].push(id);

  const ctx: WeekContext = {
    s,
    rng,
    extra: [],
    changes: {} as Record<MemberId, MemberChanges>,
    mf: {} as Record<MemberId, number>,
    byActivity,
    money: 0,
    fans: 0,
    reputation: 0,
  };
  for (const id of MEMBER_ORDER) {
    ctx.changes[id] = new MemberChanges(s.members[id]);
    const burnt = s.members[id].emotions.estresse >= BURNOUT_STRESS;
    // Modificadores de eventos/conversas multiplicam o rendimento na atividade escolhida.
    ctx.mf[id] =
      moodFactor(s.members[id]) * (burnt && s.plan[id] !== 'descansar' ? 0.5 : 1) * activityMultiplier(s, id, s.plan[id]);
  }

  // 1. Atividades individuais
  const memberText: Partial<Record<MemberId, string>> = {};
  for (const id of MEMBER_ORDER) {
    const act = s.plan[id];
    memberText[id] = rng.pick(FLAVOR[id][act]);
    RESOLVERS[act](ctx, id);
  }
  if (byActivity.compor.length && s.draft && !byActivity.compor.includes(s.draft.leader)) {
    ctx.extra.push({
      kind: 'warning',
      members: [s.draft.leader],
      text: `Sem ${MEMBERS[s.draft.leader].name}, que lidera “${s.draft.title}”, a composição andou devagar.`,
      deltas: [],
    });
  }

  // 2. Show da semana (a banda inteira)
  const musicEntries: LogEntry[] = [];
  let festivalPerformance: number | null = null;
  if (s.booking) {
    const { show, entry } = resolveShow(s, s.booking.venue, ctx.mf, ctx.changes, rng);
    if (s.booking.venue === FESTIVAL_VENUE) festivalPerformance = show.score;
    else ctx.money += show.money;
    ctx.fans += show.fans;
    ctx.reputation += show.reputation;
    musicEntries.push(entry);
  }

  // 3. Música: composição concluída, gravação concluída, lançamento, streaming
  const composed = finishSongIfReady(ctx);
  if (composed) musicEntries.push(composed);
  const recorded = finishRecordingIfReady(ctx);
  if (recorded) musicEntries.push(recorded);
  const streaming = collectStreaming(ctx);
  if (streaming) musicEntries.push(streaming);
  const released = releaseIfPending(ctx);
  if (released) musicEntries.push(released);

  // 3. Interações em dupla (mesma atividade)
  const pairEntries: LogEntry[] = [];
  for (const act of Object.keys(byActivity) as ActivityId[]) {
    const group = byActivity[act];
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        pairEntries.push(resolvePair(ctx, group[i], group[j], act));
      }
    }
  }

  // 4. Custos fixos
  ctx.money -= ECONOMY.weeklyRent;
  const bandEntries: LogEntry[] = [
    {
      kind: 'band',
      members: [],
      text: 'Aluguel do estúdio e contas da semana.',
      deltas: [{ label: 'Dinheiro', value: -ECONOMY.weeklyRent }],
    },
  ];

  s.money += ctx.money;
  s.fans = Math.max(0, s.fans + ctx.fans);
  s.reputation = clamp(s.reputation + ctx.reputation);

  // A avaliação do júri usa os números já atualizados com a própria seletiva.
  if (festivalPerformance !== null) s.festival = festivalResult(s, festivalPerformance);

  if (s.money < 0) {
    for (const id of MEMBER_ORDER) {
      ctx.changes[id].emotion('motivacao', -4);
      ctx.changes[id].emotion('estresse', 4);
    }
    bandEntries.push({
      kind: 'warning',
      members: [...MEMBER_ORDER],
      text: 'O caixa está no vermelho. A preocupação com as contas pesa sobre todo mundo.',
      deltas: [
        { label: 'Motivação (todas)', value: -4 },
        { label: 'Estresse (todas)', value: 4, inverse: true },
      ],
    });
  }

  // Monta o relatório. list() é lido aqui, então já inclui o efeito do caixa no vermelho.
  const entries: LogEntry[] = MEMBER_ORDER.map((id) => ({
    kind: 'member' as const,
    members: [id],
    text: memberText[id]!,
    deltas: ctx.changes[id].list(),
  }));
  entries.push(...musicEntries, ...pairEntries, ...bandEntries, ...ctx.extra, ...wellbeingWarnings(s));

  const report: WeekReport = {
    week: s.week,
    entries,
    money: ctx.money,
    fans: ctx.fans,
    reputation: ctx.reputation,
  };

  // Evento narrativo da semana (não há eventos depois da última semana).
  if (s.week < s.maxWeeks) pickWeekEvent(s, s.week, rng);

  // O show marcado vale só para esta semana.
  if (s.booking) {
    s.booking = null;
    for (const id of MEMBER_ORDER) if (s.plan[id] === 'show') s.plan[id] = 'ensaiar';
  }

  s.week += 1;
  if (s.week > s.maxWeeks) s.finished = true;
  else if (s.week === s.maxWeeks) bookFestival(s);
  s.modifiers = s.modifiers.filter((m) => m.untilWeek >= s.week);
  s.seed = rng.seed();
  s.history = [...s.history, report].slice(-s.maxWeeks);
  return { state: s, report };
}

// ---------------------------------------------------------------------------
// Atividades

type Resolver = (ctx: WeekContext, id: MemberId) => void;

const RESOLVERS: Record<ActivityId, Resolver> = {
  ensaiar(ctx, id) {
    const m = ctx.s.members[id];
    const c = ctx.changes[id];
    const mf = ctx.mf[id];
    const groupSize = ctx.byActivity.ensaiar.length;
    const group = groupSize >= 2 ? 1 : 0.7;

    c.skill('tecnica', (3.5 + trait(id, 'disciplina') / 40) * mf * gainScale(m.skills.tecnica) * group + ctx.rng.next());
    c.skill('ritmo', 3 * mf * gainScale(m.skills.ritmo) * group + ctx.rng.next());
    if (trait(id, 'sociabilidade') >= 60 && groupSize >= 2) c.skill('presenca', 1);

    c.emotion('estresse', 6 + trait(id, 'perfeccionismo') / 25);
    c.emotion('confianca', 2);
    if (trait(id, 'impulsividade') >= 60) c.emotion('motivacao', groupSize >= 2 ? 3 : -4);

    const song = rehearsalTarget(ctx.s);
    if (song) song.polish = clamp(song.polish + (4 + m.skills.tecnica * 0.08) * mf);
  },

  compor(ctx, id) {
    const s = ctx.s;
    const draft = s.draft!; // garantido por planIssues
    const m = s.members[id];
    const c = ctx.changes[id];
    const mf = ctx.mf[id];

    const contrib = composeContribution(s, draft, id, mf, ctx.byActivity.compor, ctx.rng);
    draft.progress += contrib.progress;
    draft.qualityWeighted += contrib.quality * contrib.progress;
    draft.originalityWeighted += contrib.originality * contrib.progress;
    if (!draft.writers.includes(id)) draft.writers.push(id);

    c.skill('composicao', (3 + trait(id, 'criatividade') / 50) * mf * gainScale(m.skills.composicao) + ctx.rng.next());
    c.emotion('estresse', 4);
    if (trait(id, 'sensibilidade') >= 70) {
      // Sensíveis oscilam: semana produtiva dá confiança, semana travada machuca.
      c.emotion('confianca', contrib.progress >= 20 ? 4 : -3);
    } else {
      c.emotion('confianca', 2);
    }
    if (trait(id, 'ambicao') >= 70) c.emotion('motivacao', 2);
  },

  gravar(ctx, id) {
    const s = ctx.s;
    const song = recordingTarget(s)!; // garantido por planIssues
    const m = s.members[id];
    const c = ctx.changes[id];
    ctx.money -= ACTIVITIES.gravar.cost;

    song.recording ??= { progress: 0, performanceWeighted: 0, players: [] };
    const r = recordContribution(s, m, ctx.mf[id], ctx.byActivity.gravar);
    song.recording.progress += r.progress;
    song.recording.performanceWeighted += r.performance * r.progress;
    if (!song.recording.players.includes(id)) song.recording.players.push(id);

    c.skill('tecnica', 1.5 * gainScale(m.skills.tecnica) + ctx.rng.next());
    c.emotion('estresse', 7 + trait(id, 'perfeccionismo') / 20);
    c.emotion('confianca', 2);
  },

  descansar(ctx, id) {
    const c = ctx.changes[id];
    if (trait(id, 'disciplina') >= 70) {
      // Quem não sabe parar descansa pela metade.
      c.emotion('estresse', -15);
      c.emotion('motivacao', 1);
    } else if (trait(id, 'impulsividade') >= 60) {
      c.emotion('estresse', -30);
      c.emotion('motivacao', 8);
    } else {
      c.emotion('estresse', -24);
      c.emotion('motivacao', 6);
    }
    c.emotion('confianca', trait(id, 'sensibilidade') >= 70 ? 3 : 1);
  },

  divulgar(ctx, id) {
    const m = ctx.s.members[id];
    const c = ctx.changes[id];
    const mf = ctx.mf[id];
    ctx.money -= ACTIVITIES.divulgar.cost;

    const released = ctx.s.songs.filter((x) => x.status === 'lancada').length;
    const songBoost = 1 + Math.min(released, 4) * 0.25;
    const fans = Math.round(
      (6 + m.skills.presenca * 0.15 + trait(id, 'sociabilidade') * 0.08) * mf * songBoost + ctx.rng.int(0, 3),
    );
    ctx.fans += fans;
    if (m.skills.presenca >= 60) ctx.reputation += 1;

    c.skill('presenca', 2 * mf * gainScale(m.skills.presenca) + ctx.rng.next());
    c.emotion('estresse', 5);
    if (trait(id, 'sociabilidade') >= 60) {
      c.emotion('motivacao', 4);
      c.emotion('confianca', 2);
    } else if (trait(id, 'sociabilidade') < 40) {
      c.emotion('estresse', 4);
      c.emotion('motivacao', -3);
    }
  },

  show(ctx, id) {
    performerEffects(id, ctx.s.members[id], ctx.changes[id], ctx.mf[id], ctx.rng);
  },

  bico(ctx, id) {
    const c = ctx.changes[id];
    let pay = ECONOMY.bicoBase + ctx.rng.int(0, ECONOMY.bicoVariance);
    if (trait(id, 'impulsividade') >= 60 && ctx.rng.chance(0.2)) {
      pay -= 40;
      ctx.extra.push({
        kind: 'warning',
        members: [id],
        text: `${MEMBERS[id].name} chegou atrasada no trabalho extra e descontaram do pagamento.`,
        deltas: [{ label: 'Dinheiro', value: -40 }],
      });
    }
    ctx.money += pay;
    c.emotion('estresse', trait(id, 'disciplina') >= 70 ? 7 : 10);
    c.emotion('motivacao', trait(id, 'ambicao') >= 70 ? -9 : -5);
  },
};

// ---------------------------------------------------------------------------
// Música

function finishSongIfReady(ctx: WeekContext): LogEntry | null {
  const s = ctx.s;
  const d = s.draft;
  if (!d || d.progress < 100) return null;
  const song = finalizeSong(s, d);
  s.songs.push(song);
  s.draft = null;

  for (const w of song.writers) ctx.changes[w].emotion('confianca', 5);
  const names = song.writers.map((w) => MEMBERS[w].name).join(' e ');
  return {
    kind: 'song',
    members: song.writers.slice(0, 2),
    text: `Música composta: “${song.title}”, assinada por ${names}. Agora ela precisa ser gravada.`,
    deltas: [
      { label: 'Qualidade', value: song.quality },
      { label: 'Originalidade', value: song.originality },
      { label: 'Apelo', value: song.commercial },
      { label: 'Coesão', value: song.cohesion },
      { label: 'Identidade', value: song.identity },
    ],
  };
}

function finishRecordingIfReady(ctx: WeekContext): LogEntry | null {
  const song = ctx.s.songs.find((x) => x.status === 'composta' && x.recording && x.recording.progress >= 100);
  if (!song) return null;
  const players = song.recording!.players;
  finalizeRecording(song);
  song.recording = null;
  const full = players.length === MEMBER_ORDER.length;
  return {
    kind: 'song',
    members: players.slice(0, 2),
    text: `“${song.title}” está gravada${full ? ', com a banda inteira no estúdio' : ''}. Pronta para lançar.`,
    deltas: [
      { label: 'Gravação', value: song.recordingQuality! },
      { label: 'Nota final', value: song.score! },
    ],
  };
}

function releaseIfPending(ctx: WeekContext): LogEntry | null {
  const s = ctx.s;
  const song = s.songs.find((x) => x.id === s.pendingRelease && x.status === 'gravada');
  s.pendingRelease = null;
  if (!song) return null;

  const promoters = ctx.byActivity.divulgar.length;
  const out = releaseOutcome(song, promoters, s.reputation);
  ctx.fans += out.fans;
  ctx.reputation += out.reputation;
  song.status = 'lancada';
  song.release = { week: s.week, fans: out.fans, reputation: out.reputation, reception: out.reception, earnings: 0, streamFans: 0 };

  const good = out.reception !== 'morna';
  for (const w of song.writers) ctx.changes[w].emotion('confianca', good ? 4 : -4);
  for (const id of MEMBER_ORDER) ctx.changes[id].emotion('motivacao', good ? 3 : -2);

  const extra = promoters ? ` A divulgação da semana ampliou o alcance (${promoters} divulgando).` : '';
  return {
    kind: 'song',
    members: song.writers.slice(0, 2),
    text: `Lançamento! ${releaseText(song, out.reception, ctx.rng)}${extra}`,
    deltas: [
      { label: 'Fãs', value: out.fans },
      { label: 'Reputação', value: out.reputation },
    ],
  };
}

function collectStreaming(ctx: WeekContext): LogEntry | null {
  let money = 0;
  let fans = 0;
  for (const song of ctx.s.songs) {
    const st = streamingFor(song, ctx.s.week);
    if (!st.money && !st.fans) continue;
    song.release!.earnings += st.money;
    song.release!.streamFans += st.fans;
    money += st.money;
    fans += st.fans;
  }
  if (!money && !fans) return null;
  ctx.money += money;
  ctx.fans += fans;
  return {
    kind: 'band',
    members: [],
    text: 'As músicas lançadas continuam tocando por aí.',
    deltas: [
      { label: 'Dinheiro', value: money },
      { label: 'Fãs', value: fans },
    ],
  };
}

// ---------------------------------------------------------------------------

function resolvePair(ctx: WeekContext, a: MemberId, b: MemberId, act: ActivityId): LogEntry {
  const rel = getRelation(ctx.s.relations, a, b);
  const { tone, delta } = pairInteraction(a, b, act, rel);
  applyRelationDelta(ctx.s.relations, a, b, delta);

  // Sorteia quem é {a} na frase para variar o texto.
  const [x, y] = ctx.rng.chance(0.5) ? [a, b] : [b, a];
  const text = ctx.rng
    .pick(PAIR_LINES[act][tone])
    .replaceAll('{a}', MEMBERS[x].name)
    .replaceAll('{b}', MEMBERS[y].name);

  const deltas: Delta[] = (Object.entries(delta) as [RelationKey, number][])
    .filter(([, v]) => v)
    .map(([k, v]) => ({ label: RELATION_LABELS[k], value: v, inverse: k === 'rivalidade' }));
  return { kind: 'pair', members: [a, b], text, deltas };
}

function wellbeingWarnings(s: GameState): LogEntry[] {
  const out: LogEntry[] = [];
  for (const id of MEMBER_ORDER) {
    const e = s.members[id].emotions;
    const name = MEMBERS[id].name;
    if (e.estresse >= BURNOUT_STRESS) {
      out.push({ kind: 'warning', members: [id], text: `${name} está esgotada. Sem descanso, vai render metade na próxima semana.`, deltas: [] });
    } else if (e.estresse >= 70) {
      out.push({ kind: 'warning', members: [id], text: `${name} anda tensa. Talvez seja hora de uma pausa.`, deltas: [] });
    }
    if (e.motivacao <= 25) {
      out.push({ kind: 'warning', members: [id], text: `${name} parece desanimada com a banda.`, deltas: [] });
    }
  }
  return out;
}

/** Estimativa de dinheiro da semana planejada (para o painel de planejamento). */
export function estimateMoney(s: GameState): { min: number; max: number } {
  let base = -ECONOMY.weeklyRent;
  for (const song of s.songs) base += streamingFor(song, s.week).money;
  let min = base;
  let max = base;
  if (s.booking && s.booking.venue !== FESTIVAL_VENUE) {
    const r = showMoneyRange(s, s.booking.venue);
    min += r.min;
    max += r.max;
  }
  for (const id of MEMBER_ORDER) {
    const act = s.plan[id];
    min -= ACTIVITIES[act].cost;
    max -= ACTIVITIES[act].cost;
    if (act === 'bico') {
      min += ECONOMY.bicoBase - (trait(id, 'impulsividade') >= 60 ? 40 : 0);
      max += ECONOMY.bicoBase + ECONOMY.bicoVariance;
    }
  }
  return { min, max };
}
