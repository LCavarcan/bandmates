import { MEMBERS } from '../../data/members';
import { DIRECTIONS, GENRES, RECEPTION, THEMES } from '../../data/music';
import { canStartSong, streamingFor } from '../../engine';
import type { GameState, Song, SongStatus } from '../../engine/types';
import { Avatar } from './Avatar';
import { fmtMoney } from './TopBar';

const STATUS_LABEL: Record<SongStatus, string> = { composta: 'Composta', gravada: 'Gravada', lancada: 'Lançada' };

function MiniStat({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <span className={`ministat ${strong ? 'ministat--strong' : ''}`} title={`${label}: ${value}`}>
      <span className="ministat__value">{value}</span>
      <span className="ministat__label">{label}</span>
    </span>
  );
}

function SongCard({ song, state, onToggleRelease }: { song: Song; state: GameState; onToggleRelease: (id: string | null) => void }) {
  const pending = state.pendingRelease === song.id;
  const stream = streamingFor(song, state.week);
  return (
    <li className={`song-card song-card--${song.status}`}>
      <div className="song-card__title">
        <span className="vinyl" aria-hidden="true" />
        <strong>{song.title}</strong>
        <span className={`badge badge--${song.status}`}>{STATUS_LABEL[song.status]}</span>
      </div>
      <div className="song-card__meta">
        <span>
          {GENRES[song.genre].icon} {GENRES[song.genre].name} · {THEMES[song.theme].name} · {DIRECTIONS[song.direction].name}
        </span>
        <span className="song-card__writers">
          {song.writers.map((w) => (
            <Avatar key={w} id={w} size={20} />
          ))}
        </span>
      </div>
      <div className="song-card__stats">
        <MiniStat label="Qualidade" value={song.quality} />
        <MiniStat label="Original." value={song.originality} />
        <MiniStat label="Apelo" value={song.commercial} />
        <MiniStat label="Coesão" value={song.cohesion} />
        <MiniStat label="Identid." value={song.identity} />
        {song.score === null ? (
          <MiniStat label="Lapidação" value={Math.round(song.polish)} />
        ) : (
          <MiniStat label="Nota" value={song.score} strong />
        )}
      </div>
      {song.status === 'composta' && song.recording && (
        <div>
          <span className="muted small">🎙️ Gravando: {Math.min(100, Math.round(song.recording.progress))}%</span>
          <div className="progress progress--rec">
            <span style={{ width: `${Math.min(100, song.recording.progress)}%` }} />
          </div>
        </div>
      )}
      {song.status === 'composta' && !song.recording && (
        <p className="muted small">Escale alguém para gravar. Ensaiar antes aumenta a lapidação.</p>
      )}
      {song.status === 'gravada' && !state.finished && (
        <button className={pending ? 'primary-btn primary-btn--small' : 'ghost-btn'} onClick={() => onToggleRelease(pending ? null : song.id)}>
          {pending ? '✓ Será lançada nesta semana' : '🚀 Lançar nesta semana'}
        </button>
      )}
      {song.release && (
        <div className="song-card__release">
          <span className={`reception reception--${song.release.reception}`}>{RECEPTION[song.release.reception].label}</span>
          <span className="muted small">
            semana {song.release.week} · +{song.release.fans + song.release.streamFans} fãs · {fmtMoney(song.release.earnings)} em streaming
            {stream.money > 0 ? ` · ~${fmtMoney(stream.money)} nesta semana` : ''}
          </span>
        </div>
      )}
    </li>
  );
}

interface Props {
  state: GameState;
  onNewSong: () => void;
  onToggleRelease: (id: string | null) => void;
}

export function SongsPanel({ state, onNewSong, onToggleRelease }: Props) {
  const d = state.draft;
  return (
    <section className="panel">
      <h2>Músicas</h2>
      {d ? (
        <div className="draft">
          <div className="draft__head">
            <span>✍️ “{d.title}”</span>
            <span className="muted">{Math.min(100, Math.round(d.progress))}%</span>
          </div>
          <div className="progress">
            <span style={{ width: `${Math.min(100, d.progress)}%` }} />
          </div>
          <p className="muted small">
            {GENRES[d.genre].name} · {THEMES[d.theme].name} · {DIRECTIONS[d.direction].name} · liderada por {MEMBERS[d.leader].name}
            {d.writers.length > 0 && ` · escrita por ${d.writers.map((w) => MEMBERS[w].name).join(', ')}`}
          </p>
        </div>
      ) : (
        <div className="draft draft--empty">
          <p className="muted small">Nenhuma música em composição.</p>
          {canStartSong(state) && (
            <button className="primary-btn primary-btn--small" onClick={onNewSong}>
              ✍️ Nova música
            </button>
          )}
        </div>
      )}
      {state.songs.length > 0 ? (
        <ul className="songs">
          {[...state.songs].reverse().map((s) => (
            <SongCard key={s.id} song={s} state={state} onToggleRelease={onToggleRelease} />
          ))}
        </ul>
      ) : (
        <p className="muted small">Repertório vazio. Toda banda começa assim.</p>
      )}
    </section>
  );
}
