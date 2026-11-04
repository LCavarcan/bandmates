export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const round1 = (v: number) => Math.round(v * 10) / 10;

/** Retorno decrescente: quanto maior a habilidade, menor o ganho (mínimo 25%). */
export const gainScale = (skill: number) => Math.max(0.25, 1 - skill / 120);
