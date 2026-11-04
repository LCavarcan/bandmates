import { describe, expect, it } from 'vitest';
import { FESTIVAL_WEIGHTS } from '../data/campaign';
import { EVENTS_BY_ID } from '../data/events';
import { MEMBER_ORDER } from '../data/members';
import { VENUES } from '../data/venues';
import { autoResolve, playCampaign, type BotConcept } from './bot';
import { MemberChanges } from './changes';
import {
  advanceWeek,
  bookingBlocker,
  createNewGame,
  deserialize,
  epilogue,
  festivalResult,
  goalsStatus,
  planIssues,
  resolveEvent,
  SAVE_VERSION,
  serialize,
  setActivity,
  setBooking,
  setlistOf,
  type GameState,
  type MemberId,
} from './index';
import { finalizeSong } from './music';
import { evaluate } from './narrative';
import { applyRelationDelta } from './relations';
import { createRng } from './rng';
import { resolveShow } from './shows';

const SEED = 2026;
const LIA: BotConcept = { genre: 'indie', theme: 'saudade', direction: 'emocional', leader: 'lia' };

const pending = (id: string, base: GameState = createNewGame(SEED), week = base.week): GameState => ({
  ...structuredClone(base),
  pendingEvent: { id, week },
});

function showScore(s: GameState, seed = 1) {
  const st = structuredClone(s);
  const mf = Object.fromEntries(MEMBER_ORDER.map((id) => [id, 0.85])) as Record<MemberId, number>;
  const changes = Object.fromEntries(MEMBER_ORDER.map((id) => [id, new MemberChanges(st.members[id])])) as Record<MemberId, MemberChanges>;
  return resolveShow(st, 'bar', mf, changes, createRng(seed)).show;
}

function withSongs(s: GameState, n: number, polish = 0): GameState {
  const st = structuredClone(s);
  for (let i = 0; i < n; i++) {
    const song = finalizeSong(st, {
      title: `S${i}`, genre: 'indie', theme: 'cidade', direction: 'emocional', leader: 'lia',
      progress: 100, qualityWeighted: 7000, originalityWeighted: 6500, writers: ['lia'], weekStarted: 1, bonus: {},
    });
    st.songs.push({ ...song, id: `s${i}`, polish });
  }
  return st;
}

describe('agendamento de shows', () => {
  it('marcar um show escala a banda inteira; cancelar devolve ao ensaio', () => {
    const s = setBooking(createNewGame(SEED), 'bar');
    expect(s.booking).toEqual({ venue: 'bar' });
    expect(MEMBER_ORDER.every((id) => s.plan[id] === 'show')).toBe(true);
    expect(planIssues(s)).toEqual([]);
    const off = setBooking(s, null);
    expect(off.booking).toBeNull();
    expect(MEMBER_ORDER.every((id) => off.plan[id] === 'ensaiar')).toBe(true);
  });

  it('com show marcado, não dá para mudar a atividade de uma integrante', () => {
    const s = setBooking(createNewGame(SEED), 'bar');
    expect(setActivity(s, 'lia', 'compor')).toBe(s);
  });

  it('casas maiores exigem fãs e reputação', () => {
    const s = createNewGame(SEED);
    expect(bookingBlocker(s, 'bar')).toBeNull();
    expect(bookingBlocker(s, 'aurora')).toMatch(/fãs/);
    expect(setBooking(s, 'aurora')).toBe(s);
    expect(bookingBlocker({ ...s, fans: 500, reputation: 5 }, 'aurora')).toMatch(/reputação/);
    expect(bookingBlocker({ ...s, fans: 500, reputation: 30 }, 'aurora')).toBeNull();
  });

  it('a mesma casa precisa de intervalo entre shows', () => {
    let s = setBooking(createNewGame(SEED), 'bar');
    s = autoResolve(advanceWeek(s).state);
    expect(s.shows).toHaveLength(1);
    expect(bookingBlocker(s, 'bar')).toMatch(/semana/);
    s = autoResolve(advanceWeek(s).state);
    expect(bookingBlocker(s, 'bar')).toBeNull();
  });
});

describe('o show', () => {
  it('gera cachê, público, fãs e entra no histórico', () => {
    const s = setBooking(createNewGame(SEED), 'bar');
    const after = advanceWeek(s).state;
    const show = after.shows[0];
    expect(show.venue).toBe('bar');
    expect(show.audience).toBeGreaterThan(0);
    expect(show.audience).toBeLessThanOrEqual(VENUES.bar.capacity);
    expect(after.money).toBe(s.money + show.money - 120);
    expect(after.booking).toBeNull();
    expect(after.plan.lia).toBe('ensaiar');
  });

  it('sem músicas próprias o setlist é de covers; com músicas, a nota sobe', () => {
    const none = createNewGame(SEED);
    expect(setlistOf(none).covers).toBe(4);
    const four = withSongs(none, 4, 80);
    expect(setlistOf(four).covers).toBe(0);
    expect(showScore(four).score).toBeGreaterThan(showScore(none).score);
    expect(showScore(four).reputation).toBeGreaterThan(showScore(none).reputation);
  });

  it('ensaiar (lapidação) melhora o show', () => {
    const base = createNewGame(SEED);
    expect(showScore(withSongs(base, 3, 90)).score).toBeGreaterThan(showScore(withSongs(base, 3, 0)).score);
  });

  it('uma banda unida faz um show melhor', () => {
    const good = createNewGame(SEED);
    const bad = createNewGame(SEED);
    for (const k of Object.keys(good.relations)) {
      const [a, b] = k.split('|') as MemberId[];
      applyRelationDelta(good.relations, a, b, { afinidade: 50, respeito: 50, confianca: 50 });
      applyRelationDelta(bad.relations, a, b, { afinidade: -50, rivalidade: 60 });
    }
    expect(showScore(good).score).toBeGreaterThan(showScore(bad).score);
  });
});

describe('seletiva do festival', () => {
  it('a semana 12 é a seletiva: banda escalada, sem cancelar, e a campanha termina com resultado', () => {
    let s = { ...createNewGame(SEED), week: 11 };
    s = autoResolve(advanceWeek(s).state);
    expect(s.week).toBe(12);
    expect(s.booking?.venue).toBe('festival');
    expect(setBooking(s, null)).toBe(s);
    expect(bookingBlocker(s, 'bar')).not.toBeNull();
    const end = advanceWeek(s).state;
    expect(end.finished).toBe(true);
    expect(end.festival).not.toBeNull();
    expect(end.shows.at(-1)!.venue).toBe('festival');
  });

  it('os pesos da avaliação somam 1 e metas cumpridas dão bônus', () => {
    expect(Object.values(FESTIVAL_WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    const s = createNewGame(SEED);
    const rich = { ...withSongs(s, 2), fans: 400, reputation: 30 };
    rich.songs = rich.songs.map((x) => ({ ...x, status: 'lancada' as const }));
    expect(goalsStatus(rich).filter((g) => g.done).length).toBeGreaterThan(goalsStatus(s).filter((g) => g.done).length);
    expect(festivalResult(rich, 60).score).toBeGreaterThan(festivalResult(s, 60).score);
  });

  it('balanceamento: jogar bem chega ao menos ao palco alternativo; não fazer nada não passa', () => {
    const good = playCampaign(createNewGame(SEED), { concept: LIA }).state;
    expect(good.festival).not.toBeNull();
    expect(['selecionadas', 'alternativo']).toContain(good.festival!.tier);

    let idle = createNewGame(SEED);
    for (let i = 0; i < 12; i++) {
      idle = autoResolve(idle);
      if (!idle.booking) for (const id of MEMBER_ORDER) idle = setActivity(idle, id, 'descansar');
      idle = advanceWeek(idle).state;
    }
    expect(idle.festival!.tier).toBe('nao_foi');
    expect(good.festival!.score).toBeGreaterThan(idle.festival!.score + 10);
  });
});

describe('romance opcional (Lia e Nina)', () => {
  /** Leva o arco até "No telhado" com a relação escolhida. */
  function roof(afinidade: number, confianca: number): GameState {
    const s = createNewGame(SEED);
    const r = s.relations['lia|nina'];
    applyRelationDelta(s.relations, 'lia', 'nina', { afinidade: afinidade - r.afinidade, confianca: confianca - r.confianca });
    return pending('no_telhado', s);
  }

  it('com reciprocidade, as duas ficam juntas', () => {
    const s = resolveEvent(roof(60, 50), 'perguntar').state;
    expect(s.flags.romance).toBe('juntas');
    expect(s.scheduled.some((x) => x.event === 'as_outras_perceberam')).toBe(true);
    expect(epilogue(s).romance).toMatch(/Lia e Nina/);
  });

  it('sem reciprocidade, seguem amigas — não vira romance só por insistência', () => {
    const s = resolveEvent(roof(46, 20), 'esperar').state;
    expect(s.flags.romance).toBe('amigas');
    expect(epilogue(s).romance).toMatch(/não viraram um casal/);
  });

  it('a jogadora pode recomendar a amizade antes de qualquer declaração', () => {
    const s = resolveEvent(pending('voce_acha'), 'amizade').state;
    expect(s.flags.romance).toBe('amigas');
    expect(s.scheduled.some((x) => x.event === 'no_telhado')).toBe(false);
  });

  it('o arco exige interesse dos dois lados para avançar', () => {
    const s = createNewGame(SEED);
    s.flags.lia_sente_algo = true;
    applyRelationDelta(s.relations, 'lia', 'nina', { afinidade: 40 });
    // Sem o sinal de interesse da Nina (nina_curiosa), a pergunta da Lia não acontece.
    expect(evaluate(EVENTS_BY_ID.voce_acha.trigger!, s, 8)).toBe(false);
    s.flags.nina_curiosa = true;
    expect(evaluate(EVENTS_BY_ID.voce_acha.trigger!, s, 8)).toBe(true);
  });

  it('o romance só acontece passando pela decisão da Lia; sem ela, a campanha termina normalmente', () => {
    for (const seed of [1, 2, 3, 4]) {
      const { state } = playCampaign(createNewGame(seed), { concept: { ...LIA, leader: 'julia', genre: 'pop' } });
      expect(state.finished).toBe(true);
      expect(state.festival).not.toBeNull();
      if (state.flags.romance === 'juntas') expect(state.eventLog.some((e) => e.id === 'no_telhado')).toBe(true);
      if (!state.eventLog.some((e) => e.id === 'voce_acha')) expect(state.flags.romance).toBeUndefined();
    }
  });
});

describe('epílogos', () => {
  it('cada integrante tem um epílogo que reflete as escolhas', () => {
    const s = createNewGame(SEED);
    const base = epilogue(s);
    expect(base.members).toHaveLength(4);
    expect(base.romance).toBeNull();
    s.flags.julia_dividiu = true;
    expect(epilogue(s).members.find((m) => m.id === 'julia')!.text).toMatch(/dividir|holofote/);
  });
});

describe('migração de save', () => {
  it('converte um save v3 para a versão atual', () => {
    const raw = JSON.parse(serialize(createNewGame(SEED)));
    raw.version = 3;
    for (const k of ['booking', 'shows', 'festival']) delete raw.state[k];
    const s = deserialize(JSON.stringify(raw))!;
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.shows).toEqual([]);
    expect(s.booking).toBeNull();
  });
});
