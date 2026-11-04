import { EMOTION_LABELS, SKILL_LABELS } from '../data/labels';
import { MEMBERS } from '../data/members';
import type { Delta, EmotionKey, MemberId, MemberState, SkillKey, TraitKey } from './types';
import { clamp } from './util';

/** Valor de um traço (0 se a personagem não o possui). */
export const trait = (id: MemberId, k: TraitKey) => MEMBERS[id].traits[k] ?? 0;

/** Aplica mudanças em uma integrante e registra os deltas para exibir na interface. */
export class MemberChanges {
  private deltas = new Map<string, Delta>();
  constructor(private m: MemberState) {}

  skill(k: SkillKey, v: number) {
    const before = this.m.skills[k];
    this.m.skills[k] = clamp(before + Math.round(v));
    this.track(SKILL_LABELS[k], this.m.skills[k] - before);
  }
  emotion(k: EmotionKey, v: number) {
    const before = this.m.emotions[k];
    this.m.emotions[k] = clamp(before + Math.round(v));
    this.track(EMOTION_LABELS[k], this.m.emotions[k] - before, k === 'estresse');
  }
  private track(label: string, v: number, inverse = false) {
    if (v === 0) return;
    const d = this.deltas.get(label);
    if (d) d.value += v;
    else this.deltas.set(label, { label, value: v, inverse });
  }
  list(): Delta[] {
    return [...this.deltas.values()].filter((d) => d.value !== 0);
  }
}
