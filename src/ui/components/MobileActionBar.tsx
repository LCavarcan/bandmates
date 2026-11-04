// Barra fixa no rodapé, só no celular (o CSS a esconde em telas largas).
// Mantém o botão de avançar sempre à mão, sem rolar até o painel do plano.
import { estimateMoney, planIssues } from '../../engine';
import type { GameState } from '../../engine/types';
import { fmtMoney } from './TopBar';

interface Props {
  state: GameState;
  onAdvance: () => void;
  onOpenEvent: () => void;
}

export function MobileActionBar({ state, onAdvance, onOpenEvent }: Props) {
  const issues = planIssues(state).filter((i) => !state.pendingEvent || !i.startsWith('Há um acontecimento'));
  const est = estimateMoney(state);
  const signed = (v: number) => `${v >= 0 ? '+' : '−'}${fmtMoney(Math.abs(v))}`;

  return (
    <div className="mobile-bar" role="region" aria-label="Ações da semana">
      <div className="mobile-bar__info">
        <strong>Semana {state.week}</strong>
        {issues.length > 0 ? (
          <span className="mobile-bar__issue">⚠️ {issues[0]}</span>
        ) : (
          <span className="muted small">Caixa: {est.min === est.max ? signed(est.min) : `${signed(est.min)} a ${signed(est.max)}`}</span>
        )}
      </div>
      {state.pendingEvent ? (
        <button className="primary-btn primary-btn--small" onClick={onOpenEvent}>
          ✨ Acontecimento
        </button>
      ) : (
        <button className="primary-btn primary-btn--small" onClick={onAdvance} disabled={issues.length > 0}>
          Avançar ▶
        </button>
      )}
    </div>
  );
}
