// Seleção e resolução de eventos narrativos.
import { EVENTS, EVENTS_BY_ID } from '../data/events';
import { applyEffects, evaluate, pickOutcome } from './narrative';
import type { Rng } from './rng';
import type { DialogueLine, EventChoice, EventDef, GameState, LogEntry } from './types';

export function seenEvent(s: GameState, id: string): boolean {
  return s.eventLog.some((e) => e.id === id);
}

/**
 * Escolhe o evento da semana que acabou (`week`), se houver. Muta `s`:
 * consome agendamentos vencidos e define `pendingEvent`.
 * Candidatos: continuações agendadas vencidas + eventos comuns elegíveis ainda não vistos.
 * Vence a maior prioridade (empate sorteado). Continuações vencidas que perderem voltam na semana seguinte.
 */
export function pickWeekEvent(s: GameState, week: number, rng: Rng): EventDef | null {
  const due = s.scheduled.filter((x) => x.week <= week && EVENTS_BY_ID[x.event] && !seenEvent(s, x.event));
  s.scheduled = s.scheduled.filter((x) => x.week > week);

  const candidates: EventDef[] = [
    ...due.map((x) => EVENTS_BY_ID[x.event]),
    ...EVENTS.filter((e) => !e.followUp && !seenEvent(s, e.id) && (!e.trigger || evaluate(e.trigger, s, week, rng))),
  ];
  let chosen: EventDef | null = null;
  if (candidates.length) {
    const top = Math.max(...candidates.map((e) => e.priority));
    chosen = rng.pick(candidates.filter((e) => e.priority === top));
  }
  for (const d of due) if (d.event !== chosen?.id) s.scheduled.push({ event: d.event, week: week + 1 });

  s.pendingEvent = chosen ? { id: chosen.id, week } : null;
  return chosen;
}

export function currentEvent(s: GameState): EventDef | null {
  return s.pendingEvent ? EVENTS_BY_ID[s.pendingEvent.id] ?? null : null;
}

export interface ChoiceView {
  choice: EventChoice;
  available: boolean;
}

export function eventChoices(s: GameState): ChoiceView[] {
  const ev = currentEvent(s);
  if (!ev) return [];
  return ev.choices.map((choice) => ({
    choice,
    available: !choice.requires || evaluate(choice.requires, s, s.pendingEvent!.week),
  }));
}

export interface StoryResult {
  state: GameState;
  result: DialogueLine[];
  entries: LogEntry[];
}

/** Aplica a escolha da jogadora no evento pendente. */
export function resolveEvent(prev: GameState, choiceId: string): StoryResult {
  const ev = currentEvent(prev);
  const view = eventChoices(prev).find((c) => c.choice.id === choiceId);
  if (!ev || !view || !view.available) return { state: prev, result: [], entries: [] };

  const s: GameState = structuredClone(prev);
  const week = s.pendingEvent!.week;
  const outcome = pickOutcome(view.choice.outcomes, s, week);
  const entries = applyEffects(s, outcome.effects);
  s.eventLog.push({ id: ev.id, week, choice: choiceId });
  s.pendingEvent = null;
  return { state: s, result: outcome.result, entries };
}
