import { describe, expect, it } from 'vitest';
import { ECONOMY } from '../data/activities';
import { MEMBER_ORDER } from '../data/members';
import {
  advanceWeek,
  createNewGame,
  deserialize,
  estimateMoney,
  getRelation,
  loadGame,
  saveGame,
  serialize,
  setActivity,
  startSong,
  type ActivityId,
  type GameState,
  type KeyValueStore,
} from './index';
import { autoResolve } from './bot';

const SEED = 12345;

const withSong = (s: GameState) =>
  startSong(s, { title: 'Teste', genre: 'indie', theme: 'cidade', direction: 'emocional', leader: 'lia' }).state;

/** Avança uma semana resolvendo antes qualquer evento pendente. */
const step = (s: GameState) => advanceWeek(autoResolve(s)).state;

function planAll(s: GameState, act: ActivityId): GameState {
  return MEMBER_ORDER.reduce((acc, id) => setActivity(acc, id, act), s);
}

describe('estado inicial', () => {
  it('começa na semana 1 com quatro integrantes e seis relações', () => {
    const s = createNewGame(SEED);
    expect(s.week).toBe(1);
    expect(Object.keys(s.members)).toHaveLength(4);
    expect(Object.keys(s.relations)).toHaveLength(6);
    expect(s.money).toBe(ECONOMY.startMoney);
  });

  it('setActivity não muta o estado original', () => {
    const s = createNewGame(SEED);
    const s2 = setActivity(s, 'julia', 'descansar');
    expect(s.plan.julia).toBe('ensaiar');
    expect(s2.plan.julia).toBe('descansar');
  });

  it('o plano inicial é válido (ninguém compõe sem música definida)', () => {
    const s = createNewGame(SEED);
    expect(() => advanceWeek(s)).not.toThrow();
  });
});

describe('avanço de semana', () => {
  it('avança a semana, cobra aluguel e gera relatório', () => {
    const s = planAll(createNewGame(SEED), 'ensaiar');
    const { state, report } = advanceWeek(s);
    expect(state.week).toBe(2);
    expect(state.money).toBe(s.money - ECONOMY.weeklyRent);
    expect(report.entries.length).toBeGreaterThanOrEqual(4);
    expect(state.history).toHaveLength(1);
  });

  it('não muta o estado anterior', () => {
    const s = planAll(createNewGame(SEED), 'ensaiar');
    const before = JSON.stringify(s);
    advanceWeek(s);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('é determinístico com a mesma semente', () => {
    const a = advanceWeek(createNewGame(SEED)).state;
    const b = advanceWeek(createNewGame(SEED)).state;
    expect(a).toEqual(b);
  });

  it('encerra a campanha após a última semana', () => {
    let s = planAll(createNewGame(SEED), 'descansar');
    for (let i = 0; i < s.maxWeeks; i++) s = step(s);
    expect(s.finished).toBe(true);
    const again = advanceWeek(s);
    expect(again.state).toBe(s);
  });
});

describe('atividades', () => {
  it('ensaiar melhora técnica e aumenta estresse', () => {
    const s = planAll(createNewGame(SEED), 'ensaiar');
    const { state } = advanceWeek(s);
    for (const id of MEMBER_ORDER) {
      expect(state.members[id].skills.tecnica).toBeGreaterThan(s.members[id].skills.tecnica);
      expect(state.members[id].emotions.estresse).toBeGreaterThan(s.members[id].emotions.estresse);
    }
  });

  it('ensaiar em grupo rende mais que sozinha', () => {
    // Compara a soma de ganhos ao longo de várias semanas para diluir o arredondamento.
    let solo = setActivity(planAll(createNewGame(SEED), 'descansar'), 'julia', 'ensaiar');
    let group = planAll(createNewGame(SEED), 'ensaiar');
    for (let i = 0; i < 4; i++) {
      solo = step(solo);
      group = step(group);
    }
    expect(group.members.julia.skills.ritmo).toBeGreaterThan(solo.members.julia.skills.ritmo);
  });

  it('descansar reduz estresse — mas a disciplinada Nina descansa menos', () => {
    let s = planAll(createNewGame(SEED), 'ensaiar');
    s = advanceWeek(s).state; // sobe o estresse
    const rested = advanceWeek(planAll(s, 'descansar')).state;
    const drop = (id: 'bia' | 'nina') => s.members[id].emotions.estresse - rested.members[id].emotions.estresse;
    expect(drop('bia')).toBeGreaterThan(0);
    expect(drop('nina')).toBeGreaterThan(0);
    expect(drop('bia')).toBeGreaterThan(drop('nina'));
  });

  it('compor acumula progresso e eventualmente conclui uma música', () => {
    let s = withSong(planAll(createNewGame(SEED), 'descansar'));
    s = setActivity(s, 'lia', 'compor');
    const first = advanceWeek(s).state;
    expect(first.draft).not.toBeNull();
    expect(first.draft!.progress).toBeGreaterThan(0);

    s = first;
    for (let i = 0; i < 8 && s.songs.length === 0; i++) s = step(s);
    expect(s.songs).toHaveLength(1);
    expect(s.songs[0].writers).toContain('lia');
    expect(s.songs[0].quality).toBeGreaterThan(0);
    expect(s.draft).toBeNull();
  });

  it('compor em dupla termina mais rápido que sozinha', () => {
    const base = withSong(planAll(createNewGame(SEED), 'descansar'));
    const solo = advanceWeek(setActivity(base, 'lia', 'compor')).state.draft!.progress;
    const duo = advanceWeek(setActivity(setActivity(base, 'lia', 'compor'), 'nina', 'compor')).state.draft!.progress;
    expect(duo).toBeGreaterThan(solo);
  });

  it('trabalho extra gera dinheiro', () => {
    const s = planAll(createNewGame(SEED), 'bico');
    const { state } = advanceWeek(s);
    expect(state.money).toBeGreaterThan(s.money);
  });

  it('divulgar custa dinheiro e traz fãs', () => {
    const s = planAll(createNewGame(SEED), 'divulgar');
    const { state } = advanceWeek(s);
    expect(state.fans).toBeGreaterThan(s.fans);
    expect(state.money).toBeLessThan(s.money - ECONOMY.weeklyRent);
  });

  it('estimativa de dinheiro cobre o resultado real', () => {
    let s = createNewGame(SEED);
    s = setActivity(setActivity(s, 'bia', 'bico'), 'julia', 'divulgar');
    const est = estimateMoney(s);
    const delta = advanceWeek(s).state.money - s.money;
    expect(delta).toBeGreaterThanOrEqual(est.min);
    expect(delta).toBeLessThanOrEqual(est.max);
  });
});

describe('relações', () => {
  it('integrantes na mesma atividade alteram a relação entre si', () => {
    const s = planAll(createNewGame(SEED), 'descansar');
    const { state } = advanceWeek(s);
    const before = getRelation(s.relations, 'lia', 'nina');
    const after = getRelation(state.relations, 'lia', 'nina');
    expect(after).not.toEqual(before);
  });

  it('perfeccionista e impulsiva ensaiando juntas geram atrito', () => {
    let s = planAll(createNewGame(SEED), 'descansar');
    s = setActivity(setActivity(s, 'bia', 'ensaiar'), 'nina', 'ensaiar');
    const { state } = advanceWeek(s);
    expect(getRelation(state.relations, 'bia', 'nina').afinidade).toBeLessThan(
      getRelation(s.relations, 'bia', 'nina').afinidade,
    );
  });

  it('quem não divide atividade não muda a relação', () => {
    let s = withSong(createNewGame(SEED));
    s = setActivity(setActivity(setActivity(setActivity(s, 'julia', 'ensaiar'), 'lia', 'compor'), 'bia', 'descansar'), 'nina', 'bico');
    const { state } = advanceWeek(s);
    expect(state.relations).toEqual(s.relations);
  });
});

describe('salvamento', () => {
  const memoryStore = (): KeyValueStore => {
    const m = new Map<string, string>();
    return {
      getItem: (k) => m.get(k) ?? null,
      setItem: (k, v) => void m.set(k, v),
      removeItem: (k) => void m.delete(k),
    };
  };

  it('salvar e carregar preserva a campanha', () => {
    const store = memoryStore();
    const s = advanceWeek(advanceWeek(createNewGame(SEED)).state).state;
    saveGame(store, s);
    expect(loadGame(store)).toEqual(s);
  });

  it('rejeita saves corrompidos ou de versão desconhecida', () => {
    expect(deserialize('não é json')).toBeNull();
    const raw = JSON.parse(serialize(createNewGame(SEED)));
    raw.version = 999;
    expect(deserialize(JSON.stringify(raw))).toBeNull();
  });
});
