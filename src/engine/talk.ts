// Conversa da semana com uma integrante.
import { TALKS, type TalkApproach } from '../data/talks';
import type { StoryResult } from './events';
import { applyEffects, pickOutcome } from './narrative';
import type { GameState, MemberId } from './types';

export function canTalk(s: GameState): boolean {
  return !s.finished && !s.pendingEvent && s.talkedWeek !== s.week;
}

export function talk(prev: GameState, member: MemberId, approach: TalkApproach): StoryResult {
  if (!canTalk(prev)) return { state: prev, result: [], entries: [] };
  const s: GameState = structuredClone(prev);
  const outcome = pickOutcome(TALKS[member][approach], s, s.week);
  const entries = applyEffects(s, outcome.effects);
  s.talkedWeek = s.week;
  return { state: s, result: outcome.result, entries };
}
