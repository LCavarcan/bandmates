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

/** Ponto único para atualizar saves antigos quando o formato mudar. */
function migrate(version: number, state: GameState): GameState | null {
  if (version === SAVE_VERSION) return state;
  // Versões futuras: adicionar passos de migração aqui (v1 → v2 → ...).
  return null;
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
