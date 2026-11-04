import { GOAL_POINTS } from '../../data/campaign';
import { goalsStatus } from '../../engine';
import type { GameState } from '../../engine/types';

export function GoalsPanel({ state }: { state: GameState }) {
  const goals = goalsStatus(state);
  const done = goals.filter((g) => g.done).length;
  const weeksLeft = state.maxWeeks - state.week;
  return (
    <section className="panel panel--goals">
      <h2>🌊 Rumo ao Maré Alta</h2>
      <p className="goals__countdown">
        {weeksLeft > 0 ? (
          <>
            Seletiva em <strong>{weeksLeft}</strong> semana{weeksLeft > 1 ? 's' : ''} (semana {state.maxWeeks}).
          </>
        ) : (
          <strong>É agora.</strong>
        )}
      </p>
      <ul className="goals">
        {goals.map((g) => (
          <li key={g.id} className={g.done ? 'goal goal--done' : 'goal'} title={g.hint}>
            <span aria-hidden="true">{g.done ? '✅' : '⬜'}</span> {g.label}
          </li>
        ))}
      </ul>
      <p className="muted small">
        {done}/{goals.length} metas · cada meta cumprida vale +{GOAL_POINTS} na avaliação do júri.
      </p>
    </section>
  );
}
