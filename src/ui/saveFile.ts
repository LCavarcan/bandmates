// Backup do save em arquivo: tudo local, sem servidor.
import { deserialize, serialize } from '../engine';
import type { GameState } from '../engine/types';

export function saveFileName(state: GameState): string {
  const date = new Date().toISOString().slice(0, 10);
  return `bandmates-semana-${Math.min(state.week, state.maxWeeks)}-${date}.json`;
}

/** Baixa o save como arquivo .json. */
export function downloadSave(state: GameState): void {
  const blob = new Blob([serialize(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = saveFileName(state);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lê um arquivo de save. Retorna null se for inválido ou de versão incompatível. */
export async function readSaveFile(file: File): Promise<GameState | null> {
  if (file.size > 5_000_000) return null;
  return deserialize(await file.text());
}
