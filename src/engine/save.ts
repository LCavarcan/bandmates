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
    if (!migrated || !migrated.members || typeof migrated.week !== 'number') return null;
    return migrated;
  } catch {
    return null;
  }
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
