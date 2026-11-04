import { ECONOMY } from '../data/activities';
import { MEMBER_ORDER, MEMBERS, START_RELATIONS } from '../data/members';
import type { ActivityId, GameState, MemberId, MemberState, Plan } from './types';

export const SAVE_VERSION = 2;
export const CAMPAIGN_WEEKS = 12;

export function createNewGame(seed: number = Date.now() % 2147483647): GameState {
  const members = {} as Record<MemberId, MemberState>;
  for (const id of MEMBER_ORDER) {
    const p = MEMBERS[id];
    members[id] = { id, skills: { ...p.startSkills }, emotions: { ...p.startEmotions } };
  }
  const relations: GameState['relations'] = {};
  for (const [k, r] of Object.entries(START_RELATIONS)) relations[k] = { ...r };

  return {
    version: SAVE_VERSION,
    week: 1,
    maxWeeks: CAMPAIGN_WEEKS,
    money: ECONOMY.startMoney,
    fans: ECONOMY.startFans,
    reputation: ECONOMY.startReputation,
    members,
    relations,
    draft: null,
    songs: [],
    plan: { julia: 'ensaiar', lia: 'ensaiar', bia: 'ensaiar', nina: 'ensaiar' },
    pendingRelease: null,
    seed: seed >>> 0,
    history: [],
    flags: {},
    finished: false,
  };
}

export function setActivity(state: GameState, member: MemberId, activity: ActivityId): GameState {
  if (state.finished) return state;
  return { ...state, plan: { ...state.plan, [member]: activity } as Plan };
}
