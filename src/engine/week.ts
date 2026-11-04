// Resolução de uma semana. Todas as fórmulas estão documentadas em docs/FORMULAS.md.
import { ACTIVITIES, ECONOMY, FLAVOR, SONG_TITLES } from '../data/activities';
import { EMOTION_LABELS, RELATION_LABELS, SKILL_LABELS } from '../data/labels';
import { MEMBER_ORDER, MEMBERS } from '../data/members';
import { PAIR_LINES } from '../data/pairs';
import { applyRelationDelta, getRelation, pairInteraction, synergy } from './relations';
import { createRng, type Rng } from './rng';
import type {
  ActivityId,
  Delta,
  EmotionKey,
  GameState,
  LogEntry,
  MemberId,
  MemberState,
  RelationKey,
  SkillKey,
  WeekReport,
} from './types';
import { clamp, gainScale } from './util';

const trait = (id: MemberId, k: keyof (typeof MEMBERS)['julia']['traits']) => MEMBERS[id].traits[k] ?? 0;

/**
 * Fator de disposição (0.36..1.0): motivação alta e estresse baixo rendem mais.
 * mf = (0.6 + motivação/250) × (1 − estresse/250)
 */
export function moodFactor(m: MemberState): number {
  return (0.6 + m.emotions.motivacao / 250) * (1 - m.emotions.estresse / 250);
}

export const BURNOUT_STRESS = 85;

/** Registra mudanças de uma integrante para exibir no resumo. */
class MemberChanges {
  private deltas = new Map<string, Delta>();
  constructor(private m: MemberState) {}

  skill(k: SkillKey, v: number) {
    const before = this.m.skills[k];
    this.m.skills[k] = clamp(before + Math.round(v));
    this.track(SKILL_LABELS[k], this.m.skills[k] - before);
  }
  emotion(k: EmotionKey, v: number) {
    const before = this.m.emotions[k];
    this.m.emotions[k] = clamp(before + Math.round(v));
    this.track(EMOTION_LABELS[k], this.m.emotions[k] - before, k === 'estresse');
  }
  private track(label: string, v: number, inverse = false) {
    if (v === 0) return;
    const d = this.deltas.get(label);
    if (d) d.value += v;
    else this.deltas.set(label, { label, value: v, inverse });
  }
  list(): Delta[] {
    return [...this.deltas.values()].filter((d) => d.value !== 0);
  }
}

interface WeekContext {
  s: GameState;
  rng: Rng;
  entries: LogEntry[];
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

export function advanceWeek(prev: GameState): WeekResult {
  if (prev.finished) {
    return { state: prev, report: { week: prev.week, entries: [], money: 0, fans: 0, reputation: 0 } };
  }
  const s: GameState = structuredClone(prev);
  const rng = createRng(s.seed);

  const byActivity: Record<ActivityId, MemberId[]> = {
    ensaiar: [],
    compor: [],
    descansar: [],
    divulgar: [],
    bico: [],
  };
  for (const id of MEMBER_ORDER) byActivity[s.plan[id]].push(id);

  const ctx: WeekContext = {
    s,
    rng,
    entries: [],
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
    ctx.mf[id] = moodFactor(s.members[id]) * (burnt && s.plan[id] !== 'descansar' ? 0.5 : 1);
  }

  // 1. Atividades individuais
  const memberText: Partial<Record<MemberId, string>> = {};
  for (const id of MEMBER_ORDER) {
    const act = s.plan[id];
    memberText[id] = rng.pick(FLAVOR[id][act]);
    RESOLVERS[act](ctx, id);
  }

  // 2. Música em composição pode ter sido concluída
  const songEntry = finishSongIfReady(ctx);

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

  // Monta o relatório: integrantes → música → duplas → banda → alertas
  // (list() é lido aqui, então já inclui o efeito do caixa no vermelho.)
  const entries: LogEntry[] = MEMBER_ORDER.map((id) => ({
    kind: 'member' as const,
    members: [id],
    text: memberText[id]!,
    deltas: ctx.changes[id].list(),
  }));
  if (songEntry) entries.push(songEntry);
  entries.push(...pairEntries, ...bandEntries, ...ctx.entries, ...wellbeingWarnings(s));

  const report: WeekReport = {
    week: s.week,
    entries,
    money: ctx.money,
    fans: ctx.fans,
    reputation: ctx.reputation,
  };

  s.week += 1;
  if (s.week > s.maxWeeks) s.finished = true;
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

    // Lapida a música mais recente que ainda não está perfeita.
    const song = [...ctx.s.songs].reverse().find((x) => x.polish < 100);
    if (song) song.polish = clamp(song.polish + (4 + m.skills.tecnica * 0.08) * mf);
  },

  compor(ctx, id) {
    const s = ctx.s;
    const m = s.members[id];
    const c = ctx.changes[id];
    const mf = ctx.mf[id];
    if (!s.draft) {
      s.draft = { progress: 0, qualityWeighted: 0, originalityWeighted: 0, writers: [], weekStarted: s.week };
    }
    const draft = s.draft;

    // Parceria: química média com as outras compositoras da semana.
    const partners = ctx.byActivity.compor.filter((o) => o !== id);
    let collab = 1;
    let tensionBonus = 0;
    if (partners.length) {
      const rels = partners.map((o) => getRelation(s.relations, id, o));
      const avgSyn = rels.reduce((a, r) => a + synergy(r), 0) / rels.length;
      collab = 1 + clamp(avgSyn, -30, 30) / 100;
      // Discordância com respeito gera originalidade.
      tensionBonus = rels.reduce((a, r) => a + (r.respeito >= 20 ? Math.max(0, r.rivalidade) * 0.15 : 0), 0) / rels.length;
    }

    const contribution = (8 + m.skills.composicao * 0.25 + trait(id, 'criatividade') * 0.08) * mf * collab;
    const quality = m.skills.composicao * 0.7 + m.skills.tecnica * 0.15 + mf * 15;
    const originality = trait(id, 'criatividade') * 0.55 + m.skills.composicao * 0.3 + ctx.rng.int(0, 10) + tensionBonus;

    draft.progress += contribution;
    draft.qualityWeighted += quality * contribution;
    draft.originalityWeighted += originality * contribution;
    if (!draft.writers.includes(id)) draft.writers.push(id);

    c.skill('composicao', (3 + trait(id, 'criatividade') / 50) * mf * gainScale(m.skills.composicao) + ctx.rng.next());
    c.emotion('estresse', 4);
    if (trait(id, 'sensibilidade') >= 70) {
      // Sensíveis oscilam: semana produtiva dá confiança, semana travada machuca.
      c.emotion('confianca', contribution >= 20 ? 4 : -3);
    } else {
      c.emotion('confianca', 2);
    }
    if (trait(id, 'ambicao') >= 70) c.emotion('motivacao', 2);
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

    const songBoost = 1 + Math.min(ctx.s.songs.length, 4) * 0.25;
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

  bico(ctx, id) {
    const c = ctx.changes[id];
    let pay = ECONOMY.bicoBase + ctx.rng.int(0, ECONOMY.bicoVariance);
    if (trait(id, 'impulsividade') >= 60 && ctx.rng.chance(0.2)) {
      pay -= 40;
      ctx.entries.push({
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

function finishSongIfReady(ctx: WeekContext): LogEntry | null {
  const s = ctx.s;
  const d = s.draft;
  if (!d || d.progress < 100) return null;

  const used = new Set(s.songs.map((x) => x.title));
  const free = SONG_TITLES.filter((t) => !used.has(t));
  const title = free.length ? ctx.rng.pick(free) : `Faixa ${s.songs.length + 1}`;

  const quality = Math.round(clamp(d.qualityWeighted / d.progress));
  const originality = Math.round(clamp(d.originalityWeighted / d.progress));
  s.songs.push({
    id: `song-${s.songs.length + 1}`,
    title,
    quality,
    originality,
    polish: 0,
    writers: [...d.writers],
    weekCreated: s.week,
  });
  s.draft = null;

  for (const w of d.writers) ctx.changes[w].emotion('confianca', 5);
  const names = d.writers.map((w) => MEMBERS[w].name).join(' e ');
  return {
    kind: 'song',
    members: [...d.writers],
    text: `Nova música pronta: “${title}”, assinada por ${names}.`,
    deltas: [
      { label: 'Qualidade', value: quality },
      { label: 'Originalidade', value: originality },
    ],
  };
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
  let min = -ECONOMY.weeklyRent;
  let max = -ECONOMY.weeklyRent;
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
