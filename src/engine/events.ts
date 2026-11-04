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
 * Ordem: continuações agendadas vencidas → eventos comuns elegíveis (maior prioridade; empate sorteado).
 */
export function pickWeekEvent(s: GameState, week: number, rng: Rng): EventDef | null {
  const due = s.scheduled.filter((x) => x.week <= week);
  s.scheduled = s.scheduled.filter((x) => x.week > week);
  // Se duas continuações vencerem juntas, a segunda volta para a semana seguinte.
  const [first, ...rest] = due.filter((x) => EVENTS_BY_ID[x.event] && !seenEvent(s, x.event));
  for (const r of rest) s.scheduled.push({ event: r.event, week: week + 1 });

  let chosen: EventDef | null = first ? EVENTS_BY_ID[first.event] : null;
  if (!chosen) {
    const eligible = EVENTS.filter((e) => !e.followUp && !seenEvent(s, e.id) && (!e.trigger || evaluate(e.trigger, s, week, rng)));
    if (eligible.length) {
      const top = Math.max(...eligible.map((e) => e.priority));
      chosen = rng.pick(eligible.filter((e) => e.priority === top));
    }
  }
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
