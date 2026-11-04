import { useEffect, useMemo, useState } from 'react';
import { SONG_TITLES } from '../../data/activities';
import { MEMBER_ORDER, MEMBERS } from '../../data/members';
import { DIRECTION_ORDER, DIRECTIONS, GENRE_ORDER, GENRES, THEME_ORDER, THEMES } from '../../data/music';
import { genreAffinity, knownFit, themeResonance, TITLE_MAX } from '../../engine';
import type { DirectionId, GameState, GenreId, MemberId, SongConcept, ThemeId } from '../../engine/types';
import { moodOf, Portrait } from '../art/Portrait';
import { Avatar } from './Avatar';

/** Quem ama (≥80) ou torce o nariz (≤40) para uma opção. */
function Fans({ love, dislike }: { love: MemberId[]; dislike?: MemberId[] }) {
  if (!love.length && !dislike?.length) return null;
  return (
    <span className="option__fans">
      {love.map((id) => (
        <span key={id} className="fan fan--love" title={`${MEMBERS[id].name} adora`}>
          <Avatar id={id} size={18} />♥
        </span>
      ))}
      {dislike?.map((id) => (
        <span key={id} className="fan fan--meh" title={`${MEMBERS[id].name} não curte`}>
          <Avatar id={id} size={18} />…
        </span>
      ))}
    </span>
  );
}

/** Resultado já descoberto da combinação tema × gênero; nada enquanto não foi testada. */
function FitMark({ fit, genre }: { fit: boolean | null; genre: string }) {
  if (fit === null) return null;
  return fit ? (
    <span className="match" title={`Testado: combina com ${genre}`}>✦</span>
  ) : (
    <span className="match match--no" title={`Testado: não combina com ${genre}`}>✕</span>
  );
}

function freeTitle(state: GameState, avoid?: string): string {
  const used = new Set(state.songs.map((s) => s.title));
  const free = SONG_TITLES.filter((t) => !used.has(t) && t !== avoid);
  return free.length ? free[Math.floor(Math.random() * free.length)] : `Faixa ${state.songs.length + 1}`;
}

interface Props {
  state: GameState;
  onConfirm: (c: SongConcept) => void;
  onCancel: () => void;
}

export function ComposeModal({ state, onConfirm, onCancel }: Props) {
  const [title, setTitle] = useState(() => freeTitle(state));
  const [genre, setGenre] = useState<GenreId>('indie');
  const [theme, setTheme] = useState<ThemeId>('cidade');
  const [direction, setDirection] = useState<DirectionId>('emocional');
  const [leader, setLeader] = useState<MemberId>('lia');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const genreFans = useMemo(
    () =>
      Object.fromEntries(
        GENRE_ORDER.map((g) => [
          g,
          {
            love: MEMBER_ORDER.filter((id) => genreAffinity(id, g) >= 80),
            dislike: MEMBER_ORDER.filter((id) => genreAffinity(id, g) <= 40),
          },
        ]),
      ) as Record<GenreId, { love: MemberId[]; dislike: MemberId[] }>,
    [],
  );

  const recentLeaders = state.songs.slice(-3).map((s) => s.leader);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="compose-title">
      <form
        className="modal modal--wide"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm({ title, genre, theme, direction, leader });
        }}
      >
        <header className="modal__head">
          <p className="eyebrow">Nova música</p>
          <h2 id="compose-title">O que a banda vai escrever?</h2>
        </header>
        <div className="modal__body compose">
          <label className="field">
            <span className="field__label">Título</span>
            <span className="field__row">
              <input
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Título da música"
              />
              <button type="button" className="ghost-btn" onClick={() => setTitle(freeTitle(state, title))} title="Sugerir outro título">
                🎲
              </button>
            </span>
          </label>

          <fieldset>
            <legend>Gênero</legend>
            <div className="options options--4">
              {GENRE_ORDER.map((g) => (
                <button type="button" key={g} className={`option ${genre === g ? 'option--on' : ''}`} onClick={() => setGenre(g)} aria-pressed={genre === g}>
                  <span className="option__title">
                    {GENRES[g].icon} {GENRES[g].name}
                  </span>
                  <span className="option__desc">{GENRES[g].description}</span>
                  <Fans {...genreFans[g]} />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Tema</legend>
            <div className="options options--chips">
              {THEME_ORDER.map((t) => (
                <button type="button" key={t} className={`chip-option ${theme === t ? 'chip-option--on' : ''}`} onClick={() => setTheme(t)} aria-pressed={theme === t}>
                  {THEMES[t].name}
                  <FitMark fit={knownFit(state, genre, t)} genre={GENRES[genre].name} />
                  <Fans love={MEMBER_ORDER.filter((id) => themeResonance(id, t) >= 80)} />
                </button>
              ))}
            </div>
            <p className="muted small">
              Alguns temas combinam com o gênero (mais coesão) — só dá para saber compondo. ✦ já testado e combina · ✕ já testado e
              não combina. ♥ tema pessoal para alguém (mais identidade, se ela liderar).
            </p>
          </fieldset>

          <fieldset>
            <legend>Direção artística</legend>
            <div className="options options--3">
              {DIRECTION_ORDER.map((d) => (
                <button type="button" key={d} className={`option ${direction === d ? 'option--on' : ''}`} onClick={() => setDirection(d)} aria-pressed={direction === d}>
                  <span className="option__title">
                    {DIRECTIONS[d].icon} {DIRECTIONS[d].name}
                  </span>
                  <span className="option__desc">{DIRECTIONS[d].description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Quem lidera a composição</legend>
            <div className="options options--4 options--leaders">
              {MEMBER_ORDER.map((id) => {
                const p = MEMBERS[id];
                const m = state.members[id];
                return (
                  <button
                    type="button"
                    key={id}
                    className={`leader ${leader === id ? 'leader--on' : ''}`}
                    style={{ ['--c' as string]: p.color }}
                    onClick={() => setLeader(id)}
                    aria-pressed={leader === id}
                  >
                    <span className="leader__portrait">
                      <Portrait profile={p} mood={moodOf(m)} size={64} />
                    </span>
                    <span className="leader__name">{p.name}</span>
                    <span className="leader__stat">Composição {m.skills.composicao}</span>
                    {recentLeaders.includes(id) && <span className="leader__note">liderou há pouco</span>}
                  </button>
                );
              })}
            </div>
            <p className="muted small">
              A líder pesa mais no resultado e precisa estar compondo para a música andar rápido. Quem mais compuser na semana entra nos arranjos.
            </p>
          </fieldset>
        </div>
        <footer className="modal__foot">
          <button type="button" className="ghost-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="primary-btn" disabled={!title.trim()}>
            Começar a compor
          </button>
        </footer>
      </form>
    </div>
  );
}
