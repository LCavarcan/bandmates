import { ACTIVITIES, ECONOMY } from '../../data/activities';
import { VENUES } from '../../data/venues';
import { MEMBER_ORDER } from '../../data/members';
import { describeModifier, estimateMoney, planIssues, recordingTarget, rehearsalTarget } from '../../engine';
import type { ActivityId, GameState, MemberId } from '../../engine/types';
import { Avatar } from './Avatar';
import { fmtMoney } from './TopBar';

export function PlanPanel({ state, onAdvance, onOpenEvent }: { state: GameState; onAdvance: () => void; onOpenEvent: () => void }) {
  const est = estimateMoney(state);
  const issues = planIssues(state);
  const groups = new Map<ActivityId, MemberId[]>();
  for (const id of MEMBER_ORDER) groups.set(state.plan[id], [...(groups.get(state.plan[id]) ?? []), id]);
  const signed = (v: number) => `${v >= 0 ? '+' : '−'}${fmtMoney(Math.abs(v))}`;
  const range = est.min === est.max ? signed(est.min) : `${signed(est.min)} a ${signed(est.max)}`;
  const release = state.songs.find((s) => s.id === state.pendingRelease);

  const detail = (act: ActivityId): string | null => {
    if (act === 'show' && state.booking) return `${VENUES[state.booking.venue].icon} ${VENUES[state.booking.venue].name}`;
    if (act === 'compor' && state.draft) return `“${state.draft.title}”`;
    const rec = recordingTarget(state);
    if (act === 'gravar' && rec) return `“${rec.title}”`;
    const reh = rehearsalTarget(state);
    if (act === 'ensaiar' && reh) return `lapida “${reh.title}”`;
    return null;
  };

  return (
    <section className="panel panel--plan">
      <h2>Plano da semana {state.week}</h2>
      <ul className="plan-list">
        {[...groups.entries()].map(([act, ids]) => (
          <li key={act}>
            <span className="plan-list__act">
              {ACTIVITIES[act].icon} {ACTIVITIES[act].name}
              {detail(act) && <span className="plan-list__detail">{detail(act)}</span>}
            </span>
            <span className="plan-list__who">
              {ids.map((id) => (
                <Avatar key={id} id={id} size={24} />
              ))}
              {ids.length >= 2 && <span className="together">juntas</span>}
            </span>
          </li>
        ))}
      </ul>
      {release && (
        <p className="release-note">
          🚀 Lançamento de <strong>“{release.title}”</strong> no fim da semana.
          {!groups.has('divulgar') && <span className="muted small"> Ninguém divulgando: o alcance será menor.</span>}
        </p>
      )}
      <p className={`estimate ${est.max < 0 ? 'estimate--neg' : ''}`}>
        Caixa previsto: <strong>{range}</strong>
        <span className="muted small"> · inclui aluguel de {fmtMoney(ECONOMY.weeklyRent)}, streaming e show</span>
      </p>
      {state.modifiers.length > 0 && (
        <ul className="modifiers">
          {state.modifiers.map((m, i) => (
            <li key={i} className={m.mult >= 1 ? 'modifier--up' : 'modifier--down'}>
              {m.mult >= 1 ? '🔥' : '🧊'} {describeModifier(m)}
            </li>
          ))}
        </ul>
      )}
      {state.pendingEvent && (
        <button className="ghost-btn event-btn" onClick={onOpenEvent}>
          ✨ Ver o acontecimento pendente
        </button>
      )}
      {issues.length > 0 && (
        <ul className="issues">
          {issues.map((i) => (
            <li key={i}>⚠️ {i}</li>
          ))}
        </ul>
      )}
      <p className="muted small">Quem faz a mesma atividade passa a semana junta — e a relação muda.</p>
      <button className="primary-btn" onClick={onAdvance} disabled={issues.length > 0}>
        Avançar semana ▶
      </button>
    </section>
  );
}
