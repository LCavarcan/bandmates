// Salvamento local. Nenhum dado sai do computador.
import { SAVE_VERSION } from './state';
import type { GameState } from './types';

export const SAVE_KEY = 'bandmates.save';

/** Interface mínima de armazenamento (localStorage no navegador, mapa em memória nos testes). */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface SaveFile {
  version: number;
  savedAt: string;
  state: GameState;
}

export function serialize(state: GameState): string {
  const file: SaveFile = { version: SAVE_VERSION, savedAt: new Date().toISOString(), state };
  return JSON.stringify(file);
}

/** Retorna null se o arquivo for inválido ou de versão incompatível. */
export function deserialize(raw: string): GameState | null {
  try {
    const file = JSON.parse(raw) as Partial<SaveFile>;
    if (!file || typeof file !== 'object' || !file.state) return null;
    const migrated = migrate(file.version ?? 0, file.state);
    return migrated && isValidState(migrated) ? migrated : null;
  } catch {
    return null;
  }
}

const MEMBER_IDS = ['julia', 'lia', 'bia', 'nina'] as const;
const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

/**
 * Validação estrutural de um estado carregado (de localStorage ou de arquivo importado).
 * Não garante que os números façam sentido, só que a interface não vai quebrar ao ler o estado.
 */
export function isValidState(s: unknown): s is GameState {
  if (!s || typeof s !== 'object') return false;
  const st = s as Record<string, any>;
  if (![st.week, st.maxWeeks, st.money, st.fans, st.reputation, st.seed].every(isNum)) return false;
  if (!st.members || !st.plan || !st.relations || !st.flags) return false;
  for (const id of MEMBER_IDS) {
    const m = st.members[id];
    if (!m || !m.skills || !m.emotions || typeof st.plan[id] !== 'string') return false;
    if (![m.skills.composicao, m.skills.tecnica, m.skills.ritmo, m.skills.presenca].every(isNum)) return false;
    if (![m.emotions.motivacao, m.emotions.estresse, m.emotions.confianca].every(isNum)) return false;
  }
  if (Object.keys(st.relations).length !== 6) return false;
  for (const k of ['songs', 'history', 'eventLog', 'scheduled', 'modifiers', 'shows']) if (!Array.isArray(st[k])) return false;
  return typeof st.finished === 'boolean';
}

/** Ponto único para atualizar saves antigos quando o formato mudar. Cada passo leva da versão N para N+1. */
const MIGRATIONS: Record<number, (state: any) => any> = {
  // v1 → v2: músicas ganharam gênero, tema, direção, líder, estado de gravação e lançamento.
  1: (st) => {
    const defaults = { genre: 'indie', theme: 'cidade', direction: 'emocional' };
    st.songs = (st.songs ?? []).map((x: any) => ({
      ...defaults,
      leader: x.writers?.[0] ?? 'lia',
      commercial: 40,
      cohesion: 55,
      identity: 50,
      status: 'composta',
      recording: null,
      recordingQuality: null,
      score: null,
      release: null,
      ...x,
    }));
    if (st.draft) st.draft = { ...defaults, title: 'Sem título', leader: st.draft.writers?.[0] ?? 'lia', ...st.draft };
    // "compor" sem rascunho deixou de ser válido.
    if (!st.draft) for (const k of Object.keys(st.plan ?? {})) if (st.plan[k] === 'compor') st.plan[k] = 'ensaiar';
    st.pendingRelease = null;
    st.version = 2;
    return st;
  },
  // v2 → v3: eventos narrativos, modificadores, conversas e bônus de música.
  2: (st) => {
    st.flags ??= {};
    st.pendingEvent = null;
    st.eventLog = [];
    st.scheduled = [];
    st.modifiers = [];
    st.talkedWeek = null;
    if (st.draft) st.draft.bonus ??= {};
    st.version = 3;
    return st;
  },
  // v3 → v4: shows, seletiva do festival.
  3: (st) => {
    st.booking = null;
    st.shows = [];
    st.festival = null;
    // Saves que já estavam na semana da seletiva entram nela com a banda escalada.
    if (!st.finished && st.week === st.maxWeeks) {
      st.booking = { venue: 'festival' };
      for (const k of Object.keys(st.plan)) st.plan[k] = 'show';
    }
    st.version = 4;
    return st;
  },
};

function migrate(version: number, state: GameState): GameState | null {
  let st: any = state;
  let v = version;
  while (v < SAVE_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) return null;
    st = step(st);
    v++;
  }
  return v === SAVE_VERSION ? (st as GameState) : null;
}

export function saveGame(store: KeyValueStore, state: GameState): void {
  store.setItem(SAVE_KEY, serialize(state));
}

export function loadGame(store: KeyValueStore): GameState | null {
  const raw = store.getItem(SAVE_KEY);
  return raw ? deserialize(raw) : null;
}

export function deleteSave(store: KeyValueStore): void {
  store.removeItem(SAVE_KEY);
}
