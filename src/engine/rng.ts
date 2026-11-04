// Gerador pseudoaleatório determinístico (mulberry32).
// Mesma semente + mesmas decisões = mesmo resultado. Facilita testes e balanceamento.

export interface Rng {
  /** Número em [0, 1). */
  next(): number;
  /** Inteiro em [min, max]. */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  chance(p: number): boolean;
  /** Semente atual, para persistir no estado. */
  seed(): number;
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (p) => next() < p,
    seed: () => s,
  };
}
