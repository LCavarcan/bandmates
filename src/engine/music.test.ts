import { describe, expect, it } from 'vitest';
import { MEMBER_ORDER } from '../data/members';
import { playCampaign } from './bot';
import {
  advanceWeek,
  createNewGame,
  deserialize,
  getRelation,
  planIssues,
  setActivity,
  setRelease,
  startSong,
  streamingFor,
  type ActivityId,
  type GameState,
  type SongConcept,
  SAVE_VERSION,
} from './index';
import { finalizeSong, releaseOutcome } from './music';
import type { Song, SongDraft } from './types';

const SEED = 4242;
const LIA_INDIE: SongConcept = { title: 'Teste', genre: 'indie', theme: 'amor', direction: 'emocional', leader: 'lia' };

const planAll = (s: GameState, act: ActivityId) => MEMBER_ORDER.reduce((acc, id) => setActivity(acc, id, act), s);

/** Rascunho idêntico para comparar escolhas isoladas. */
function draftWith(over: Partial<SongDraft>): SongDraft {
  return {
    ...LIA_INDIE,
    progress: 100,
    qualityWeighted: 65 * 100,
    originalityWeighted: 60 * 100,
    writers: ['lia'],
    weekStarted: 1,
    bonus: {},
    ...over,
  };
}

/** Faixa gravada pronta para testar lançamento. */
function recordedSong(over: Partial<Song> = {}): Song {
  return {
    ...finalizeSong(createNewGame(SEED), draftWith({})),
    status: 'gravada',
    recordingQuality: 60,
    score: 65,
    ...over,
  };
}

describe('conceito da música', () => {
  it('compor sem música definida é bloqueado', () => {
    const s = setActivity(createNewGame(SEED), 'lia', 'compor');
    expect(planIssues(s)).toHaveLength(1);
    expect(() => advanceWeek(s)).toThrow();
    expect(planIssues(startSong(s, LIA_INDIE).state)).toHaveLength(0);
  });

  it('não permite iniciar duas músicas ao mesmo tempo', () => {
    const s = startSong(createNewGame(SEED), LIA_INDIE).state;
    const again = startSong(s, { ...LIA_INDIE, title: 'Outra' });
    expect(again.state).toBe(s);
    expect(again.entries).toHaveLength(0);
  });

  it('a banda reage às escolhas conforme os traços', () => {
    const base = createNewGame(SEED);
    const comercial = startSong(base, { ...LIA_INDIE, genre: 'pop', direction: 'comercial', leader: 'nina' }).state;
    // Lia (criatividade 90) detesta comercial; Júlia (ambiciosa) adora.
    expect(comercial.members.lia.emotions.motivacao).toBeLessThan(base.members.lia.emotions.motivacao);
    expect(comercial.members.julia.emotions.motivacao).toBeGreaterThan(base.members.julia.emotions.motivacao);
  });

  it('Júlia se ressente quando não lidera e a rivalidade com a líder sobe', () => {
    const base = createNewGame(SEED);
    const s = startSong(base, LIA_INDIE).state;
    expect(getRelation(s.relations, 'julia', 'lia').rivalidade).toBeGreaterThan(getRelation(base.relations, 'julia', 'lia').rivalidade);
    const led = startSong(base, { ...LIA_INDIE, leader: 'julia' }).state;
    expect(getRelation(led.relations, 'julia', 'lia').rivalidade).toBe(getRelation(base.relations, 'julia', 'lia').rivalidade);
  });

  it('o título é limpo e limitado', () => {
    const s = startSong(createNewGame(SEED), { ...LIA_INDIE, title: '   ' }).state;
    expect(s.draft!.title).toBe('Sem título');
  });
});

describe('composição', () => {
  it('a líder presente acelera a composição', () => {
    const base = startSong(planAll(createNewGame(SEED), 'descansar'), LIA_INDIE).state;
    const withLeader = advanceWeek(setActivity(setActivity(base, 'lia', 'compor'), 'nina', 'compor')).state;
    const withoutLeader = advanceWeek(setActivity(base, 'nina', 'compor')).state;
    expect(withLeader.draft!.progress).toBeGreaterThan(withoutLeader.draft!.progress * 1.5);
  });

  it('direção comercial dá mais apelo; experimental dá mais originalidade', () => {
    const s = createNewGame(SEED);
    const com = finalizeSong(s, draftWith({ direction: 'comercial' }));
    const exp = finalizeSong(s, draftWith({ direction: 'experimental' }));
    const emo = finalizeSong(s, draftWith({ direction: 'emocional' }));
    expect(com.commercial).toBeGreaterThan(exp.commercial);
    expect(exp.originality).toBeGreaterThan(com.originality);
    expect(emo.identity).toBeGreaterThan(com.identity);
  });

  it('pop tem mais apelo que alternativo; tema que combina com o gênero dá coesão', () => {
    const s = createNewGame(SEED);
    expect(finalizeSong(s, draftWith({ genre: 'pop' })).commercial).toBeGreaterThan(
      finalizeSong(s, draftWith({ genre: 'alternativo' })).commercial,
    );
    expect(finalizeSong(s, draftWith({ genre: 'punk', theme: 'rebeldia' })).cohesion).toBeGreaterThan(
      finalizeSong(s, draftWith({ genre: 'punk', theme: 'saudade' })).cohesion,
    );
  });

  it('a líder em sintonia com o tema e o gênero gera mais identidade', () => {
    const s = createNewGame(SEED);
    const own = finalizeSong(s, draftWith({ leader: 'lia', genre: 'indie', theme: 'saudade' }));
    const alien = finalizeSong(s, draftWith({ leader: 'lia', genre: 'pop', theme: 'rebeldia' }));
    expect(own.identity).toBeGreaterThan(alien.identity);
  });
});

describe('gravação', () => {
  it('gravar sem música composta é bloqueado', () => {
    const s = setActivity(createNewGame(SEED), 'nina', 'gravar');
    expect(planIssues(s)).toHaveLength(1);
  });

  it('gravar com a banda toda conclui a faixa, custa dinheiro e gera nota final', () => {
    let s = createNewGame(SEED);
    s = { ...s, songs: [{ ...recordedSong(), status: 'composta', recordingQuality: null, score: null }] };
    const before = s.money;
    s = advanceWeek(planAll(s, 'gravar')).state;
    const song = s.songs[0];
    expect(song.status).toBe('gravada');
    expect(song.score).toBeGreaterThan(0);
    expect(song.recordingQuality).toBeGreaterThan(0);
    expect(s.money).toBe(before - 4 * 50 - 120);
  });

  it('ensaiar antes de gravar aumenta a lapidação da próxima faixa', () => {
    let s = createNewGame(SEED);
    s = { ...s, songs: [{ ...recordedSong(), status: 'composta', recordingQuality: null, score: null }] };
    s = advanceWeek(planAll(s, 'ensaiar')).state;
    expect(s.songs[0].polish).toBeGreaterThan(0);
  });
});

describe('lançamento e streaming', () => {
  it('só músicas gravadas podem ser marcadas para lançamento', () => {
    let s = createNewGame(SEED);
    s = { ...s, songs: [{ ...recordedSong(), status: 'composta' }] };
    expect(setRelease(s, s.songs[0].id).pendingRelease).toBeNull();
  });

  it('lançar traz fãs e reputação; divulgar na mesma semana amplia', () => {
    let s = createNewGame(SEED);
    s = { ...s, songs: [recordedSong()] };
    s = setRelease(s, s.songs[0].id);
    const quiet = advanceWeek(planAll(s, 'ensaiar')).state;
    const loud = advanceWeek(setActivity(setActivity(planAll(s, 'ensaiar'), 'julia', 'divulgar'), 'bia', 'divulgar')).state;
    expect(quiet.songs[0].status).toBe('lancada');
    expect(quiet.songs[0].release!.fans).toBeGreaterThan(0);
    expect(loud.songs[0].release!.fans).toBeGreaterThan(quiet.songs[0].release!.fans);
    expect(quiet.pendingRelease).toBeNull();
  });

  it('caminhos diferentes: comercial rende mais fãs, original rende mais reputação', () => {
    const hit = recordedSong({ commercial: 80, originality: 40, identity: 45 });
    const art = recordedSong({ commercial: 35, originality: 85, identity: 75 });
    const a = releaseOutcome(hit, 0, 10);
    const b = releaseOutcome(art, 0, 10);
    expect(a.fans).toBeGreaterThan(b.fans);
    expect(b.reputation).toBeGreaterThan(a.reputation);
  });

  it('streaming começa na semana seguinte e decai', () => {
    const song = recordedSong({ status: 'lancada', release: { week: 3, fans: 50, reputation: 3, reception: 'boa', earnings: 0, streamFans: 0 } });
    expect(streamingFor(song, 3).money).toBe(0);
    const w4 = streamingFor(song, 4).money;
    const w8 = streamingFor(song, 8).money;
    expect(w4).toBeGreaterThan(0);
    expect(w8).toBeLessThan(w4);
  });
});

describe('campanha completa (bot)', () => {
  it('um ciclo inteiro compõe, grava e lança pelo menos uma música em 12 semanas', () => {
    const { state } = playCampaign(createNewGame(SEED), { concept: { genre: 'indie', theme: 'amor', direction: 'emocional', leader: 'lia' } });
    expect(state.finished).toBe(true);
    expect(state.songs.some((x) => x.status === 'lancada')).toBe(true);
    expect(state.fans).toBeGreaterThan(createNewGame(SEED).fans);
  });
});

describe('migração de save', () => {
  it('converte um save v1 para a versão atual', () => {
    const v1 = {
      version: 1,
      savedAt: '2026-11-04T00:00:00Z',
      state: {
        ...createNewGame(SEED),
        version: 1,
        pendingRelease: undefined,
        plan: { julia: 'ensaiar', lia: 'compor', bia: 'ensaiar', nina: 'ensaiar' },
        draft: null,
        songs: [{ id: 'song-1', title: 'Café Frio', quality: 60, originality: 70, polish: 20, writers: ['lia'], weekCreated: 2 }],
      },
    };
    const s = deserialize(JSON.stringify(v1))!;
    expect(s).not.toBeNull();
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.eventLog).toEqual([]);
    expect(s.songs[0].status).toBe('composta');
    expect(s.songs[0].leader).toBe('lia');
    expect(s.plan.lia).toBe('ensaiar');
    expect(() => advanceWeek(s)).not.toThrow();
  });
});
