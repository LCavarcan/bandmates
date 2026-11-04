import type { GameState } from '../../engine/types';

export const fmtMoney = (v: number) => `R$ ${v.toLocaleString('pt-BR')}`;

export function TopBar({ state, onMenu }: { state: GameState; onMenu: () => void }) {
  const weeks = Array.from({ length: state.maxWeeks }, (_, i) => i + 1);
  const shown = Math.min(state.week, state.maxWeeks);
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true">♪</span>
        <span className="brand__name">Bandmates</span>
      </div>

      <div className="calendar" aria-label={`Semana ${shown} de ${state.maxWeeks}`}>
        <span className="calendar__label">
          Semana <strong>{shown}</strong>/{state.maxWeeks}
        </span>
        <ol className="calendar__weeks">
          {weeks.map((w) => {
            const cls = ['week-dot'];
            if (w < state.week) cls.push('week-dot--past');
            if (w === state.week) cls.push('week-dot--now');
            if (w === state.maxWeeks) cls.push('week-dot--goal');
            return (
              <li
                key={w}
                className={cls.join(' ')}
                title={w === state.maxWeeks ? `Semana ${w}: fim da temporada` : `Semana ${w}`}
              />
            );
          })}
        </ol>
      </div>

      <div className="resources">
        <span className={`res ${state.money < 0 ? 'res--danger' : ''}`} title="Dinheiro">
          <span className="res__icon" aria-hidden="true">💰</span>
          {fmtMoney(state.money)}
        </span>
        <span className="res" title="Fãs">
          <span className="res__icon" aria-hidden="true">💜</span>
          {state.fans.toLocaleString('pt-BR')} fãs
        </span>
        <span className="res" title="Reputação (0–100)">
          <span className="res__icon" aria-hidden="true">⭐</span>
          Rep. {state.reputation}
        </span>
      </div>

      <button className="ghost-btn" onClick={onMenu}>
        Menu
      </button>
    </header>
  );
}
