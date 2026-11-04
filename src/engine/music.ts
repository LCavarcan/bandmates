// Ciclo musical: conceito → composição → gravação → lançamento → streaming.
// Fórmulas documentadas em docs/mecanicas/musica.md.
import { ECONOMY } from '../data/activities';
import { MEMBER_ORDER, MEMBERS } from '../data/members';
import { DIRECTION_ADJECTIVE, DIRECTIONS, GENRES, REACTIONS, RECEPTION, THEMES } from '../data/music';
import { MemberChanges, trait } from './changes';
import { applyRelationDelta, getRelation, synergy } from './relations';
import { createRng, type Rng } from './rng';
import type {
  GameState,
  GenreId,
  LogEntry,
  MemberId,
  MemberState,
  Reception,
  Song,
  SongConcept,
  SongDraft,
  ThemeId,
} from './types';
import { clamp } from './util';

export const TITLE_MAX = 40;

export const themeResonance = (id: MemberId, theme: ThemeId) => MEMBERS[id].themes[theme] ?? 40;
export const genreAffinity = (id: MemberId, genre: GenreId) => MEMBERS[id].genres[genre];

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w)\}/g, (_, k: string) => vars[k] ?? '');

// ---------------------------------------------------------------------------
// Conceito

export function canStartSong(s: GameState): boolean {
  return !s.draft && !s.finished;
}

/**
 * Inicia uma nova música com as escolhas da jogadora.
 * Devolve o novo estado e as reações imediatas da banda (já aplicadas).
 */
export function startSong(prev: GameState, concept: SongConcept): { state: GameState; entries: LogEntry[] } {
  if (!canStartSong(prev)) return { state: prev, entries: [] };
  const s: GameState = structuredClone(prev);
  const title = concept.title.trim().slice(0, TITLE_MAX) || 'Sem título';
  s.draft = {
    ...concept,
    title,
    progress: 0,
    qualityWeighted: 0,
    originalityWeighted: 0,
    writers: [],
    weekStarted: s.week,
  };
  const rng = createRng(s.seed);
  const entries = reactToConcept(s, s.draft, rng);
  s.seed = rng.seed();
  return { state: s, entries };
}

/** Regras de reação às escolhas musicais. Cada personagem reage pelos próprios traços e gostos. */
function reactToConcept(s: GameState, c: SongConcept, rng: Rng): LogEntry[] {
  const entries: LogEntry[] = [];
  const gName = GENRES[c.genre].name;
  const leaderName = MEMBERS[c.leader].name;
  const recentLeaders = s.songs.slice(-2).map((x) => x.leader);

  for (const id of MEMBER_ORDER) {
    const ch = new MemberChanges(s.members[id]);
    const lines: string[] = [];
    let rivalryUp = false;
    const say = (key: keyof typeof REACTIONS) =>
      lines.push(fill(rng.pick(REACTIONS[key]), { n: MEMBERS[id].name, g: gName, l: leaderName, t: THEMES[c.theme].name }));

    const aff = genreAffinity(id, c.genre);
    if (aff >= 80) {
      say('genreLove');
      ch.emotion('motivacao', 4);
    } else if (aff <= 40) {
      say('genreDislike');
      ch.emotion('motivacao', -3);
    }

    if (c.direction === 'comercial') {
      if (trait(id, 'criatividade') >= 80) {
        say('commercialHate');
        ch.emotion('motivacao', -5);
      } else if (trait(id, 'ambicao') >= 70) {
        say('commercialLove');
        ch.emotion('motivacao', 5);
      }
    } else if (c.direction === 'experimental') {
      if (trait(id, 'criatividade') >= 60) {
        say('experimentalLove');
        ch.emotion('motivacao', 4);
      } else if (trait(id, 'ambicao') >= 70) {
        say('experimentalDoubt');
        ch.emotion('motivacao', -3);
      }
      if (trait(id, 'perfeccionismo') >= 80) {
        say('experimentalStress');
        ch.emotion('estresse', 4);
      }
    } else if (trait(id, 'sensibilidade') >= 70) {
      say('emotionalLove');
      ch.emotion('motivacao', 4);
    }

    if (id === c.leader) {
      say('leader');
      ch.emotion('confianca', 4);
      if (themeResonance(id, c.theme) >= 85) {
        say('personalTheme');
        ch.emotion('confianca', 3);
      }
    } else if (
      trait(id, 'ambicao') >= 70 &&
      trait(id, 'competitividade') >= 70 &&
      !recentLeaders.includes(id)
    ) {
      // O conflito de Júlia: quer o protagonismo.
      say('wantedToLead');
      ch.emotion('motivacao', -3);
      applyRelationDelta(s.relations, id, c.leader, { rivalidade: 3 });
      rivalryUp = true;
    }

    if (lines.length) {
      const deltas = ch.list();
      if (rivalryUp) deltas.push({ label: `Rivalidade c/ ${leaderName}`, value: 3, inverse: true });
      entries.push({ kind: 'member', members: [id], text: lines.join(' '), deltas });
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Composição

export interface Contribution {
  progress: number;
  quality: number;
  originality: number;
}

/**
 * Contribuição semanal de uma compositora. A líder pesa 1.0; arranjadoras 0.6;
 * sem a líder na semana, todas pesam 0.5.
 */
export function composeContribution(
  s: GameState,
  draft: SongDraft,
  id: MemberId,
  mf: number,
  composers: MemberId[],
  rng: Rng,
): Contribution {
  const m: MemberState = s.members[id];
  const partners = composers.filter((o) => o !== id);
  const leaderPresent = composers.includes(draft.leader);
  const weight = id === draft.leader ? 1 : leaderPresent ? 0.6 : 0.5;

  let collab = 1;
  let tension = 0;
  if (partners.length) {
    const rels = partners.map((o) => getRelation(s.relations, id, o));
    collab = 1 + clamp(rels.reduce((a, r) => a + synergy(r), 0) / rels.length, -30, 30) / 100;
    // Discordância com respeito gera originalidade.
    tension = rels.reduce((a, r) => a + (r.respeito >= 20 ? Math.max(0, r.rivalidade) * 0.15 : 0), 0) / rels.length;
  }

  const genre = GENRES[draft.genre];
  const progress = (8 + m.skills.composicao * 0.25 + trait(id, 'criatividade') * 0.08) * mf * collab * weight;
  const quality =
    m.skills.composicao * 0.4 +
    m.skills[genre.keySkill] * 0.25 +
    m.skills.tecnica * 0.1 +
    genreAffinity(id, draft.genre) * 0.15 +
    mf * 10;
  const originality = trait(id, 'criatividade') * 0.5 + m.skills.composicao * 0.25 + rng.int(0, 10) + tension;
  return { progress, quality, originality };
}

/** Transforma o rascunho completo em música. Função pura sobre o estado recebido. */
export function finalizeSong(s: GameState, d: SongDraft): Song {
  const genre = GENRES[d.genre];
  const theme = THEMES[d.theme];
  const dir = DIRECTIONS[d.direction];
  const leader = s.members[d.leader];

  let quality = d.qualityWeighted / d.progress;
  if (d.direction === 'emocional') quality += trait(d.leader, 'sensibilidade') * 0.08;

  const originality = d.originalityWeighted / d.progress + genre.originality + dir.originality;

  const commercial =
    15 +
    genre.commercial +
    theme.commercial +
    dir.commercial +
    quality * 0.25 +
    leader.skills.presenca * 0.1 +
    trait(d.leader, 'sociabilidade') * 0.05;

  const writers = d.writers.length ? d.writers : [d.leader];
  let pairSyn = 0;
  let pairs = 0;
  for (let i = 0; i < writers.length; i++)
    for (let j = i + 1; j < writers.length; j++) {
      pairSyn += synergy(getRelation(s.relations, writers[i], writers[j]));
      pairs++;
    }
  const avgAff = writers.reduce((a, w) => a + genreAffinity(w, d.genre), 0) / writers.length;
  const cohesion =
    55 +
    (pairs ? (pairSyn / pairs) * 0.4 : 5) +
    (avgAff - 55) * 0.4 +
    dir.cohesion +
    (genre.themes.includes(d.theme) ? 8 : 0);

  const prev = s.songs;
  const continuity = prev.length
    ? (prev.filter((x) => x.genre === d.genre).length / prev.length) * 15 +
      (prev.filter((x) => x.direction === d.direction).length / prev.length) * 10
    : 12;
  const identity =
    35 + themeResonance(d.leader, d.theme) * 0.25 + genreAffinity(d.leader, d.genre) * 0.15 + dir.identity + continuity;

  return {
    id: `song-${s.songs.length + 1}`,
    title: d.title,
    genre: d.genre,
    theme: d.theme,
    direction: d.direction,
    leader: d.leader,
    writers: [...writers],
    weekCreated: s.week,
    status: 'composta',
    quality: Math.round(clamp(quality)),
    originality: Math.round(clamp(originality)),
    commercial: Math.round(clamp(commercial)),
    cohesion: Math.round(clamp(cohesion)),
    identity: Math.round(clamp(identity)),
    polish: 0,
    recording: null,
    recordingQuality: null,
    score: null,
    release: null,
  };
}

// ---------------------------------------------------------------------------
// Ensaio e gravação

/** Música que está sendo (ou será) gravada: a mais antiga ainda só composta. */
export function recordingTarget(s: GameState): Song | undefined {
  return s.songs.find((x) => x.status === 'composta' && x.recording) ?? s.songs.find((x) => x.status === 'composta');
}

/** O ensaio lapida a próxima música a ser gravada; senão, a mais recente que ainda não está perfeita. */
export function rehearsalTarget(s: GameState): Song | undefined {
  return recordingTarget(s) ?? [...s.songs].reverse().find((x) => x.polish < 100);
}

export function recordContribution(m: MemberState, mf: number): { progress: number; performance: number } {
  return {
    progress: (18 + m.skills.tecnica * 0.2 + m.skills.ritmo * 0.1) * mf,
    performance: (m.skills.tecnica * 0.45 + m.skills.ritmo * 0.35 + m.skills.presenca * 0.2) * (0.7 + 0.3 * mf),
  };
}

/** Fecha a gravação: define qualidade de gravação e a nota final da faixa. */
export function finalizeRecording(song: Song): void {
  const r = song.recording!;
  const fullBand = r.players.length === MEMBER_ORDER.length ? 5 : 0;
  const recQ = clamp((r.performanceWeighted / r.progress) * 0.75 + song.polish * 0.25 + fullBand);
  song.recordingQuality = Math.round(recQ);
  song.score = scoreOf(song.quality, song.recordingQuality, song.cohesion, song.originality, song.identity);
  song.status = 'gravada';
}

export function scoreOf(quality: number, recording: number, cohesion: number, originality: number, identity: number): number {
  return Math.round(clamp(quality * 0.25 + recording * 0.3 + cohesion * 0.15 + originality * 0.15 + identity * 0.15));
}

// ---------------------------------------------------------------------------
// Lançamento e streaming

export function receptionOf(song: Song): Reception {
  const score = song.score ?? 0;
  if (score >= 72 && song.originality >= 65) return 'aclamada';
  if (song.commercial >= 65 && score >= 55) return 'hit';
  if (score >= 50) return 'boa';
  return 'morna';
}

/** Resultado do lançamento. `promoters` = integrantes divulgando na mesma semana. */
export function releaseOutcome(song: Song, promoters: number, reputation: number): { fans: number; reputation: number; reception: Reception } {
  const score = (song.score ?? 0) / 100;
  const reception = receptionOf(song);
  const fans = Math.round(score * (12 + song.commercial * 0.7) * (1 + 0.3 * promoters) * (1 + reputation / 80));
  const rep =
    Math.round(score * (song.originality * 0.07 + song.identity * 0.05)) +
    (reception === 'aclamada' ? 3 : (song.score ?? 0) >= 75 ? 2 : 0);
  return { fans, reputation: rep, reception };
}

export function releaseText(song: Song, reception: Reception, rng: Rng): string {
  return rng.pick(RECEPTION[reception].lines).replaceAll('{t}', song.title);
}

/** Renda e fãs semanais de uma música lançada (zero na semana do lançamento). Determinístico. */
export function streamingFor(song: Song, week: number): { money: number; fans: number } {
  if (!song.release || week <= song.release.week) return { money: 0, fans: 0 };
  const decay = Math.pow(ECONOMY.streamDecay, week - song.release.week - 1);
  const score = (song.score ?? 0) / 100;
  return {
    money: Math.round((10 + song.commercial * 0.8 + song.release.fans * 0.3) * score * decay),
    fans: Math.round(song.release.fans * 0.2 * decay),
  };
}

export function setRelease(s: GameState, songId: string | null): GameState {
  if (s.finished) return s;
  if (songId && s.songs.find((x) => x.id === songId)?.status !== 'gravada') return s;
  return { ...s, pendingRelease: songId };
}

// ---------------------------------------------------------------------------
// Validação do plano e identidade

/** Problemas que impedem avançar a semana. Lista vazia = plano válido. */
export function planIssues(s: GameState): string[] {
  const issues: string[] = [];
  const acts = MEMBER_ORDER.map((id) => s.plan[id]);
  if (acts.includes('compor') && !s.draft) issues.push('Defina a nova música antes de escalar alguém para compor.');
  if (acts.includes('gravar') && !recordingTarget(s)) issues.push('Não há música composta esperando gravação.');
  return issues;
}

export function bandIdentity(s: GameState): { label: string; genre: GenreId | null } {
  if (!s.songs.length) return { label: 'Ainda procurando o próprio som', genre: null };
  const top = <K extends string>(keys: K[]) => {
    const count = new Map<K, number>();
    for (const k of keys) count.set(k, (count.get(k) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };
  const genre = top(s.songs.map((x) => x.genre));
  const direction = top(s.songs.map((x) => x.direction));
  return { label: `${GENRES[genre].name} ${DIRECTION_ADJECTIVE[direction]}`, genre };
}
