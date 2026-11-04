import { ACTIVITIES, ECONOMY } from '../../data/activities';
import { RELATION_LABELS } from '../../data/labels';
import { MEMBER_ORDER, MEMBERS } from '../../data/members';
import { describeRelation, estimateMoney, relationKey } from '../../engine';
import type { ActivityId, GameState, MemberId, RelationKey } from '../../engine/types';
import { Avatar } from './Avatar';
import { DivergingBar } from './Meter';
import { fmtMoney } from './TopBar';

export function PlanPanel({ state, onAdvance }: { state: GameState; onAdvance: () => void }) {
  const est = estimateMoney(state);
  const groups = new Map<ActivityId, MemberId[]>();
  for (const id of MEMBER_ORDER) groups.set(state.plan[id], [...(groups.get(state.plan[id]) ?? []), id]);
  const signed = (v: number) => `${v >= 0 ? '+' : '−'}${fmtMoney(Math.abs(v))}`;
  const range = est.min === est.max ? signed(est.min) : `${signed(est.min)} a ${signed(est.max)}`;

  return (
    <section className="panel panel--plan">
      <h2>Plano da semana {state.week}</h2>
      <ul className="plan-list">
        {[...groups.entries()].map(([act, ids]) => (
          <li key={act}>
            <span className="plan-list__act">
              {ACTIVITIES[act].icon} {ACTIVITIES[act].name}
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
      <p className={`estimate ${est.max < 0 ? 'estimate--neg' : ''}`}>
        Caixa previsto: <strong>{range}</strong>
        <span className="muted small"> · inclui aluguel de {fmtMoney(ECONOMY.weeklyRent)}</span>
      </p>
      <p className="muted small">Quem faz a mesma atividade passa a semana junta — e a relação muda.</p>
      <button className="primary-btn" onClick={onAdvance}>
        Avançar semana ▶
      </button>
    </section>
  );
}

export function SongsPanel({ state }: { state: GameState }) {
  const d = state.draft;
  return (
    <section className="panel">
      <h2>Músicas</h2>
      <div className="draft">
        <div className="draft__head">
          <span>✍️ Em composição</span>
          <span className="muted">{d ? `${Math.min(100, Math.round(d.progress))}%` : 'nenhuma'}</span>
        </div>
        <div className="progress">
          <span style={{ width: `${d ? Math.min(100, d.progress) : 0}%` }} />
        </div>
        <p className="muted small">
          {d
            ? `Escrita por ${d.writers.map((w) => MEMBERS[w].name).join(', ')} desde a semana ${d.weekStarted}.`
            : 'Escale alguém para compor e uma nova música começa.'}
        </p>
      </div>
      {state.songs.length > 0 ? (
        <ul className="songs">
          {[...state.songs].reverse().map((s) => (
            <li key={s.id} className="song-card">
              <div className="song-card__title">
                <span className="vinyl" aria-hidden="true" />
                <strong>{s.title}</strong>
                <span className="song-card__writers">
                  {s.writers.map((w) => (
                    <Avatar key={w} id={w} size={20} />
                  ))}
                </span>
              </div>
              <div className="song-card__stats">
                <span title="Qualidade">Qualidade {s.quality}</span>
                <span title="Originalidade">Originalidade {s.originality}</span>
                <span title="Lapidação: sobe com ensaios">Lapidação {Math.round(s.polish)}%</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted small">Repertório vazio. Toda banda começa assim.</p>
      )}
    </section>
  );
}

const PAIRS: [MemberId, MemberId][] = [];
for (let i = 0; i < MEMBER_ORDER.length; i++)
  for (let j = i + 1; j < MEMBER_ORDER.length; j++) PAIRS.push([MEMBER_ORDER[i], MEMBER_ORDER[j]]);

export function RelationsPanel({ state }: { state: GameState }) {
  return (
    <section className="panel">
      <h2>Relações</h2>
      <ul className="relations">
        {PAIRS.map(([a, b]) => {
          const key = relationKey(a, b);
          const rel = state.relations[key];
          const desc = describeRelation(rel);
          return (
            <li key={key} className="relation">
              <div className="relation__head">
                <span className="relation__pair">
                  <Avatar id={a} size={24} />
                  <Avatar id={b} size={24} />
                </span>
                <span className="relation__names">
                  {MEMBERS[a].name} & {MEMBERS[b].name}
                </span>
                <span className={`relation__label relation__label--${desc.tone}`}>{desc.label}</span>
              </div>
              <div className="relation__bars">
                {(Object.keys(RELATION_LABELS) as RelationKey[]).map((k) => (
                  <DivergingBar key={k} label={RELATION_LABELS[k]} value={rel[k]} inverse={k === 'rivalidade'} />
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
