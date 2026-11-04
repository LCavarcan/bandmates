import { describe, expect, it } from 'vitest';
import { EVENTS, EVENTS_BY_ID } from '../data/events';
import { MEMBER_ORDER } from '../data/members';
import { TALK_ORDER, TALKS } from '../data/talks';
import { autoResolve, playCampaign } from './bot';
import {
  activityMultiplier,
  advanceWeek,
  canTalk,
  createNewGame,
  currentEvent,
  deserialize,
  epilogue,
  eventChoices,
  getRelation,
  planIssues,
  resolveEvent,
  SAVE_VERSION,
  serialize,
  setActivity,
  startSong,
  talk,
  type ActivityId,
  type GameState,
} from './index';
import { finalizeSong, recordContribution } from './music';
import { applyEffects, evaluate } from './narrative';
import { createRng } from './rng';
import { pickWeekEvent } from './events';
import { applyRelationDelta } from './relations';

const SEED = 777;
const planAll = (s: GameState, act: ActivityId) => MEMBER_ORDER.reduce((acc, id) => setActivity(acc, id, act), s);
const withLiaSong = (s: GameState) =>
  startSong(s, { title: 'T', genre: 'indie', theme: 'saudade', direction: 'emocional', leader: 'lia' }).state;

/** Estado com um evento específico pendente, como se tivesse disparado no fim da semana `week`. */
function pending(id: string, base: GameState = createNewGame(SEED), week = base.week): GameState {
  return { ...structuredClone(base), pendingEvent: { id, week } };
}

describe('dados dos eventos', () => {
  it('têm ids únicos, escolhas únicas e desfecho padrão em toda escolha', () => {
    const ids = EVENTS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of EVENTS) {
      expect(e.cast.length, e.id).toBeGreaterThan(0);
      expect(e.choices.length, e.id).toBeGreaterThanOrEqual(2);
      expect(new Set(e.choices.map((c) => c.id)).size, e.id).toBe(e.choices.length);
      if (!e.followUp) expect(e.trigger, `${e.id} precisa de trigger`).toBeDefined();
      for (const c of e.choices) {
        expect(c.outcomes.at(-1)!.when, `${e.id}/${c.id}: último desfecho deve ser o padrão`).toBeUndefined();
        if (c.requires) expect(c.requiresText, `${e.id}/${c.id}`).toBeTruthy();
      }
    }
  });

  it('toda continuação tem uma linha de epílogo para o caso de não acontecer', () => {
    for (const e of EVENTS) if (e.followUp) expect(e.epilogue, e.id).toBeTruthy();
  });

  it('a Véspera ocupa a penúltima semana, logo depois da última vaga de continuações', () => {
    const s = createNewGame(SEED);
    expect(evaluate(EVENTS_BY_ID.vespera.trigger!, s, s.maxWeeks - 1)).toBe(true);
  });

  it('todo agendamento aponta para uma continuação existente', () => {
    for (const e of EVENTS)
      for (const c of e.choices)
        for (const o of c.outcomes)
          for (const fx of o.effects)
            if (fx.type === 'schedule') {
              expect(EVENTS_BY_ID[fx.event], `${e.id} agenda ${fx.event}`).toBeDefined();
              expect(EVENTS_BY_ID[fx.event].followUp).toBe(true);
            }
  });

  it('há pelo menos 8 eventos principais e mais eventos do que semanas', () => {
    const main = EVENTS.filter((e) => !e.followUp).length;
    expect(main).toBeGreaterThanOrEqual(8);
    expect(main).toBeGreaterThan(createNewGame(SEED).maxWeeks);
  });

  it('todos os desfechos de todos os eventos e conversas aplicam sem erro', () => {
    const base = withLiaSong(createNewGame(SEED));
    for (const e of EVENTS)
      for (const c of e.choices)
        for (const o of c.outcomes) expect(() => applyEffects(structuredClone(base), o.effects), `${e.id}/${c.id}`).not.toThrow();
    for (const id of MEMBER_ORDER)
      for (const a of TALK_ORDER) for (const o of TALKS[id][a]) expect(() => applyEffects(structuredClone(base), o.effects)).not.toThrow();
  });
});

describe('disparo de eventos', () => {
  it('"Quarenta minutos" dispara quando Bia e Nina ensaiam juntas sem afinidade', () => {
    const ev = EVENTS_BY_ID.quarenta_minutos;
    let s = planAll(createNewGame(SEED), 'ensaiar');
    expect(evaluate(ev.trigger!, s, 2)).toBe(true);
    expect(evaluate(ev.trigger!, s, 1)).toBe(false); // cedo demais
    s = setActivity(s, 'bia', 'descansar');
    expect(evaluate(ev.trigger!, s, 2)).toBe(false); // não estavam juntas
  });

  it('"O refrão" exige uma música liderada pela Lia com algum progresso', () => {
    const ev = EVENTS_BY_ID.o_refrao;
    let s = withLiaSong(createNewGame(SEED));
    expect(evaluate(ev.trigger!, s, 3)).toBe(false);
    s.draft!.progress = 30;
    expect(evaluate(ev.trigger!, s, 3)).toBe(true);
  });

  it('o avanço de semana pode deixar um evento pendente, que bloqueia a semana seguinte', () => {
    let s = planAll(createNewGame(SEED), 'ensaiar');
    s = advanceWeek(s).state; // semana 1: o cartaz do festival
    expect(s.pendingEvent?.id).toBe('o_cartaz');
    s = advanceWeek(autoResolve(s)).state; // semana 2: Bia e Nina ensaiaram juntas
    expect(s.pendingEvent).not.toBeNull();
    expect(planIssues(s)).toContain('Há um acontecimento esperando sua decisão.');
    expect(() => advanceWeek(s)).toThrow();
  });

  it('um evento visto não se repete', () => {
    let s = planAll(createNewGame(SEED), 'ensaiar');
    s = advanceWeek(autoResolve(advanceWeek(s).state)).state;
    const first = s.pendingEvent!.id;
    s = autoResolve(s);
    for (let i = 0; i < 8; i++) {
      s = advanceWeek(autoResolve(s)).state;
      expect(s.pendingEvent?.id).not.toBe(first);
    }
  });

  it('não há evento depois da última semana', () => {
    const s = { ...planAll(createNewGame(SEED), 'ensaiar'), week: 12 };
    const after = advanceWeek(s).state;
    expect(after.finished).toBe(true);
    expect(after.pendingEvent).toBeNull();
  });
});

describe('resolução e consequências', () => {
  it('aplica os efeitos, registra a escolha e libera a semana', () => {
    const s = pending('quarenta_minutos');
    const r = resolveEvent(s, 'acordo');
    expect(r.state.pendingEvent).toBeNull();
    expect(r.state.eventLog).toEqual([{ id: 'quarenta_minutos', week: s.week, choice: 'acordo' }]);
    expect(r.state.flags.bia_combinou).toBe(true);
    expect(getRelation(r.state.relations, 'bia', 'nina').respeito).toBe(getRelation(s.relations, 'bia', 'nina').respeito + 3);
    expect(r.result.length).toBeGreaterThan(0);
  });

  it('escolhas com requisito ficam indisponíveis e não podem ser forçadas', () => {
    let s = withLiaSong(createNewGame(SEED));
    applyRelationDelta(s.relations, 'julia', 'lia', { respeito: -50 });
    s = pending('o_refrao', s);
    expect(eventChoices(s).find((c) => c.choice.id === 'juntas')!.available).toBe(false);
    expect(resolveEvent(s, 'juntas').state).toBe(s);
  });

  it('o mesmo pedido tem desfechos diferentes conforme a relação', () => {
    const friendly = createNewGame(SEED);
    applyRelationDelta(friendly.relations, 'bia', 'nina', { afinidade: 30 });
    const good = resolveEvent(pending('duas_da_manha', friendly), 'bia').state;
    const bad = resolveEvent(pending('duas_da_manha'), 'bia').state;
    expect(getRelation(good.relations, 'bia', 'nina').afinidade).toBeGreaterThan(getRelation(friendly.relations, 'bia', 'nina').afinidade);
    expect(getRelation(bad.relations, 'bia', 'nina').afinidade).toBeLessThan(getRelation(createNewGame(SEED).relations, 'bia', 'nina').afinidade);
  });

  it('uma escolha pode agendar uma continuação semanas depois', () => {
    let s = planAll(pending('quarenta_minutos'), 'descansar');
    s = resolveEvent(s, 'rir').state;
    expect(s.scheduled).toHaveLength(1);
    s = advanceWeek(s).state;
    expect(s.pendingEvent?.id).not.toBe('de_novo');
    s = advanceWeek(autoResolve(s)).state;
    expect(s.pendingEvent?.id).toBe('de_novo');
    expect(currentEvent(s)!.title).toBe('De novo');
  });

  it('modificadores alteram o rendimento e expiram', () => {
    let s = resolveEvent(pending('quarenta_minutos'), 'nina_fala').state;
    expect(activityMultiplier(s, 'bia', 'ensaiar')).toBeCloseTo(1.15);
    expect(activityMultiplier(s, 'bia', 'compor')).toBe(1);
    expect(activityMultiplier(s, 'nina', 'ensaiar')).toBe(1);
    s = planAll(s, 'descansar');
    s = advanceWeek(s).state;
    s = advanceWeek(autoResolve(s)).state;
    expect(activityMultiplier(s, 'bia', 'ensaiar')).toBe(1);
    expect(s.modifiers).toHaveLength(0);
  });

  it('o bônus de um evento muda a música quando ela fica pronta', () => {
    const base = withLiaSong(createNewGame(SEED));
    base.draft!.progress = 100;
    base.draft!.qualityWeighted = 6000;
    base.draft!.originalityWeighted = 6000;
    const withJulia = resolveEvent(pending('o_refrao', base), 'julia').state;
    const plain = finalizeSong(base, base.draft!);
    const changed = finalizeSong(withJulia, withJulia.draft!);
    expect(changed.commercial).toBe(Math.min(100, plain.commercial + 10));
    expect(changed.originality).toBe(plain.originality - 4);
  });
});

describe('conversas', () => {
  it('uma conversa por semana, e não durante um evento pendente', () => {
    const s = createNewGame(SEED);
    expect(canTalk(s)).toBe(true);
    const after = talk(s, 'julia', 'ouvir').state;
    expect(canTalk(after)).toBe(false);
    expect(talk(after, 'lia', 'ouvir').state).toBe(after);
    expect(canTalk(pending('quarenta_minutos'))).toBe(false);
    const next = advanceWeek(after).state;
    expect(canTalk(next) || next.pendingEvent !== null).toBe(true);
  });

  it('cobrar funciona com quem é disciplinada e machuca quem está insegura', () => {
    const s = createNewGame(SEED);
    const nina = talk(s, 'nina', 'cobrar').state;
    expect(nina.members.nina.emotions.motivacao).toBeGreaterThan(s.members.nina.emotions.motivacao);
    const lia = talk(s, 'lia', 'cobrar').state; // confiança inicial 40
    expect(lia.members.lia.emotions.confianca).toBeLessThan(s.members.lia.emotions.confianca);
  });

  it('encorajar a Lia insegura rende mais que quando ela está confiante', () => {
    const low = createNewGame(SEED);
    const high = createNewGame(SEED);
    high.members.lia.emotions.confianca = 70;
    const gainLow = talk(low, 'lia', 'encorajar').state.members.lia.emotions.confianca - 40;
    const gainHigh = talk(high, 'lia', 'encorajar').state.members.lia.emotions.confianca - 70;
    expect(gainLow).toBeGreaterThan(gainHigh);
  });
});

describe('relações na gravação', () => {
  it('química entre quem grava melhora o desempenho', () => {
    const good = createNewGame(SEED);
    const bad = createNewGame(SEED);
    applyRelationDelta(good.relations, 'bia', 'nina', { afinidade: 60, respeito: 60, confianca: 60 });
    applyRelationDelta(bad.relations, 'bia', 'nina', { afinidade: -60, rivalidade: 60 });
    const pGood = recordContribution(good, good.members.nina, 1, ['bia', 'nina']).performance;
    const pBad = recordContribution(bad, bad.members.nina, 1, ['bia', 'nina']).performance;
    expect(pGood).toBeGreaterThan(pBad);
  });
});

describe('campanha com eventos', () => {
  it('uma campanha completa passa por vários eventos sem travar', () => {
    const { state } = playCampaign(createNewGame(SEED), {
      concept: { genre: 'indie', theme: 'saudade', direction: 'emocional', leader: 'lia' },
    });
    expect(state.finished).toBe(true);
    expect(state.eventLog.length).toBeGreaterThanOrEqual(3);
  });

  it('pickWeekEvent é determinístico', () => {
    const s = planAll(createNewGame(SEED), 'ensaiar');
    const a = structuredClone(s);
    const b = structuredClone(s);
    expect(pickWeekEvent(a, 6, createRng(1))?.id).toBe(pickWeekEvent(b, 6, createRng(1))?.id);
  });

  it('migra um save v2 para a versão atual', () => {
    const v2 = JSON.parse(serialize(createNewGame(SEED)));
    v2.version = 2;
    for (const k of ['pendingEvent', 'eventLog', 'scheduled', 'modifiers', 'talkedWeek']) delete v2.state[k];
    const s = deserialize(JSON.stringify(v2))!;
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.eventLog).toEqual([]);
    expect(s.modifiers).toEqual([]);
    expect(() => advanceWeek(s)).not.toThrow();
  });
});

describe('continuações no fim da temporada', () => {
  /** Joga sem fazer nada até o início da semana `week`, resolvendo eventos com a primeira escolha. */
  function idleUntil(week: number): GameState {
    let s = createNewGame(SEED);
    while (s.week < week) {
      s = autoResolve(s);
      if (!s.booking) s = planAll(s, 'descansar');
      s = advanceWeek(s).state;
    }
    return autoResolve(s);
  }

  it('agendamentos que cairiam depois da semana 10 são antecipados', () => {
    const s9 = resolveEvent(pending('voce_acha', idleUntil(9), 8), 'espere').state;
    expect(s9.scheduled.find((x) => x.event === 'no_telhado')!.week).toBe(10);
    const s7 = resolveEvent(pending('voce_acha', idleUntil(7), 6), 'espere').state;
    expect(s7.scheduled.find((x) => x.event === 'no_telhado')!.week).toBe(9);
  });

  it('continuações das semanas 10, 11 e 12 são exibidas ou viram epílogo', () => {
    let s = idleUntil(10);
    const ids = ['de_novo', 'voce_sabia', 'as_outras_perceberam'];
    s = { ...s, eventLog: s.eventLog.filter((e) => !ids.includes(e.id)) };
    s.scheduled = ids.map((event, i) => ({ event, week: 10 + i }));
    while (!s.finished) {
      s = autoResolve(s);
      if (!s.booking) s = planAll(s, 'descansar');
      s = advanceWeek(s).state;
    }
    const seen = new Set(s.eventLog.map((e) => e.id));
    expect(seen.has('vespera')).toBe(true);
    expect(seen.has('de_novo')).toBe(true);
    const unfinished = epilogue(s).unfinished;
    for (const id of ids) expect(seen.has(id) || unfinished.includes(EVENTS_BY_ID[id].epilogue!), id).toBe(true);
    expect(unfinished).toHaveLength(2);
  });

  it('continuações já vistas não aparecem no epílogo', () => {
    const s = createNewGame(SEED);
    s.scheduled = [{ event: 'de_novo', week: 12 }];
    s.eventLog = [{ id: 'de_novo', week: 5, choice: 'juntar' }];
    expect(epilogue(s).unfinished).toEqual([]);
  });
});
