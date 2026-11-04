import { RELATION_LABELS } from '../../data/labels';
import { MEMBER_ORDER, MEMBERS } from '../../data/members';
import { describeRelation, relationKey } from '../../engine';
import type { GameState, MemberId, RelationKey } from '../../engine/types';
import { Avatar } from './Avatar';
import { DivergingBar } from './Meter';

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
