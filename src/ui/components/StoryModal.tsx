// Cena narrativa em estilo visual novel: retratos, falas, escolhas e consequências.
// Usada pelos eventos e pelas conversas.
import { useState, type CSSProperties } from 'react';
import { MEMBERS } from '../../data/members';
import type { DialogueLine, GameState, LogEntry, MemberId } from '../../engine/types';
import { moodOf, Portrait } from '../art/Portrait';
import { Avatar } from './Avatar';
import { DeltaChips } from './DeltaChips';

export interface StoryChoice {
  id: string;
  label: string;
  icon?: string;
  hint?: string;
  disabled?: boolean;
  reason?: string;
}

interface Props {
  state: GameState;
  eyebrow: string;
  title: string;
  cast: MemberId[];
  scene: DialogueLine[];
  choices: StoryChoice[];
  /** Aplica a escolha (atualizando o jogo) e devolve o que mostrar em seguida. */
  onChoose: (id: string) => { result: DialogueLine[]; entries: LogEntry[] };
  onDone: () => void;
  /** Se definido, permite fechar antes de escolher (conversas). Eventos não podem ser adiados. */
  onCancel?: () => void;
}

function Lines({ lines }: { lines: DialogueLine[] }) {
  return (
    <div className="dialogue">
      {lines.map((l, i) =>
        l.speaker ? (
          <p key={i} className="line line--speech" style={{ '--c': MEMBERS[l.speaker].color, animationDelay: `${i * 0.08}s` } as CSSProperties}>
            <span className="line__speaker">{MEMBERS[l.speaker].name}</span>
            <span className="line__text">{l.text}</span>
          </p>
        ) : (
          <p key={i} className="line line--narration" style={{ animationDelay: `${i * 0.08}s` }}>
            {l.text}
          </p>
        ),
      )}
    </div>
  );
}

export function StoryModal({ state, eyebrow, title, cast, scene, choices, onChoose, onDone, onCancel }: Props) {
  const [outcome, setOutcome] = useState<{ result: DialogueLine[]; entries: LogEntry[] } | null>(null);
  // Retratos usam o estado de quando a cena abriu, para a expressão não mudar no meio da leitura.
  const [snapshot] = useState(state);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="story-title">
      <div className="modal modal--story">
        <div className="story__stage">
          {cast.map((id) => (
            <div key={id} className="story__actor" style={{ '--c': MEMBERS[id].color } as CSSProperties}>
              <Portrait profile={MEMBERS[id]} mood={moodOf(snapshot.members[id])} size={cast.length > 2 ? 120 : 150} />
            </div>
          ))}
        </div>
        <header className="modal__head modal__head--story">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="story-title">{title}</h2>
        </header>
        <div className="modal__body">
          <Lines lines={scene} />
          {outcome ? (
            <>
              <hr className="story__divider" />
              <Lines lines={outcome.result} />
              {outcome.entries.length > 0 && (
                <ul className="consequences">
                  {outcome.entries.map((e, i) => (
                    <li key={i}>
                      <span className="consequences__who">
                        {e.members.slice(0, 2).map((m) => (
                          <Avatar key={m} id={m} size={22} />
                        ))}
                      </span>
                      <span className="consequences__text">
                        {e.deltas.length ? <DeltaChips deltas={e.deltas} /> : <span className="muted small">{e.text}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="story__choices">
              {choices.map((c) => (
                <button
                  key={c.id}
                  className="story-choice"
                  disabled={c.disabled}
                  title={c.disabled ? c.reason : c.hint}
                  onClick={() => setOutcome(onChoose(c.id))}
                >
                  <span className="story-choice__label">
                    {c.icon && <span aria-hidden="true">{c.icon} </span>}
                    {c.label}
                  </span>
                  {(c.disabled ? c.reason : c.hint) && <span className="story-choice__hint">{c.disabled ? `🔒 ${c.reason}` : c.hint}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <footer className="modal__foot">
          {!outcome && onCancel && (
            <button className="ghost-btn" onClick={onCancel}>
              Deixar para depois
            </button>
          )}
          {outcome && (
            <button className="primary-btn" onClick={onDone} autoFocus>
              Continuar
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
