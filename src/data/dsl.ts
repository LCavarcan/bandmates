// Atalhos para escrever eventos e conversas como dados legíveis.
import type {
  ActivityId,
  Condition,
  DialogueLine,
  Effect,
  EmotionKey,
  FlagValue,
  MemberId,
  Reception,
  Relation,
  RelationKey,
  ResourceKey,
  SkillKey,
  SongBonus,
} from '../engine/types';

// --- falas
export const narr = (text: string): DialogueLine => ({ text });
export const say = (speaker: MemberId, text: string): DialogueLine => ({ speaker, text });

// --- condições
export const all = (...of: Condition[]): Condition => ({ type: 'all', of });
export const any = (...of: Condition[]): Condition => ({ type: 'any', of });
export const not = (of: Condition): Condition => ({ type: 'not', of });
export const weekMin = (min: number): Condition => ({ type: 'week', min });
export const weekIs = (week: number): Condition => ({ type: 'week', min: week, max: week });
export const emotionMin = (member: MemberId, key: EmotionKey, min: number): Condition => ({ type: 'emotion', member, key, min });
export const emotionMax = (member: MemberId, key: EmotionKey, max: number): Condition => ({ type: 'emotion', member, key, max });
export const relMin = (a: MemberId, b: MemberId, key: RelationKey, min: number): Condition => ({ type: 'relation', a, b, key, min });
export const relMax = (a: MemberId, b: MemberId, key: RelationKey, max: number): Condition => ({ type: 'relation', a, b, key, max });
export const moneyMax = (max: number): Condition => ({ type: 'resource', key: 'money', max });
export const hasFlag = (name: string): Condition => ({ type: 'flag', name, exists: true });
export const did = (member: MemberId, ...activities: ActivityId[]): Condition => ({ type: 'did', member, activities });
export const together = (a: MemberId, b: MemberId, ...activities: ActivityId[]): Condition => ({ type: 'together', a, b, activities });
export const hasDraft = (opts: { leader?: MemberId; minProgress?: number } = {}): Condition => ({ type: 'draft', ...opts });
export const released = (opts: { reception?: Reception[]; writer?: MemberId; notLeader?: MemberId } = {}): Condition => ({
  type: 'released',
  ...opts,
});

// --- efeitos
export const emo = (member: MemberId, key: EmotionKey, value: number): Effect => ({ type: 'emotion', member, key, value });
export const skill = (member: MemberId, key: SkillKey, value: number): Effect => ({ type: 'skill', member, key, value });
export const rel = (a: MemberId, b: MemberId, delta: Partial<Relation>): Effect => ({ type: 'relation', a, b, delta });
export const res = (key: ResourceKey, value: number): Effect => ({ type: 'resource', key, value });
export const flag = (name: string, value: FlagValue = true): Effect => ({ type: 'flag', name, value });
export const draftBonus = (bonus: Partial<SongBonus>): Effect => ({ type: 'draft', bonus });
export const modifier = (
  member: MemberId | null,
  activity: ActivityId | 'todas',
  mult: number,
  weeks: number,
  label: string,
): Effect => ({ type: 'modifier', member, activity, mult, weeks, label });
export const schedule = (event: string, inWeeks: number): Effect => ({ type: 'schedule', event, inWeeks });
