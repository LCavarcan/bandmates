import { SHOW_TIERS, VENUE_ORDER, VENUES } from '../../data/venues';
import { audienceFor, bookingBlocker, FESTIVAL_VENUE, setlistOf, showMoneyRange } from '../../engine';
import type { GameState, VenueId } from '../../engine/types';
import { fmtMoney } from './TopBar';

interface Props {
  state: GameState;
  onBook: (venue: VenueId | null) => void;
}

export function ShowsPanel({ state, onBook }: Props) {
  const booked = state.booking?.venue ?? null;
  const { covers } = setlistOf(state);
  const recent = [...state.shows].reverse().slice(0, 3);

  if (booked === FESTIVAL_VENUE) {
    return (
      <section className="panel panel--festival">
        <h2>🌊 Semana da seletiva</h2>
        <p>A banda inteira sobe ao palco do Festival Maré Alta. O júri avalia a apresentação, a melhor música, o público, a reputação e a união da banda.</p>
        <p className="muted small">Público previsto: ~{audienceFor(state, FESTIVAL_VENUE)} pessoas. {covers > 0 && `Setlist com ${covers} cover(s).`}</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Shows</h2>
      <p className="muted small">
        Um show ocupa a semana da banda inteira. Rende cachê e fãs; a nota depende de presença, técnica, repertório lapidado e união.
        {covers > 0 && ` Sem músicas suficientes, o setlist leva ${covers} cover(s) — menos reputação.`}
      </p>
      <ul className="venues">
        {VENUE_ORDER.map((id) => {
          const v = VENUES[id];
          const blocker = bookingBlocker(state, id);
          const isBooked = booked === id;
          const range = showMoneyRange(state, id);
          return (
            <li key={id} className={`venue ${isBooked ? 'venue--booked' : ''} ${blocker && !isBooked ? 'venue--locked' : ''}`}>
              <div className="venue__head">
                <span className="venue__name">
                  {v.icon} {v.name}
                </span>
                <span className="muted small">{v.capacity} lugares</span>
              </div>
              <p className="venue__desc">{v.description}</p>
              <div className="venue__foot">
                <span className="small">
                  {blocker && !isBooked ? `🔒 ${blocker}` : `~${audienceFor(state, id)} pessoas · ${fmtMoney(range.min)}–${fmtMoney(range.max)}`}
                </span>
                {isBooked ? (
                  <button className="primary-btn primary-btn--small" onClick={() => onBook(null)}>
                    ✓ Marcado · cancelar
                  </button>
                ) : (
                  <button className="ghost-btn" disabled={!!blocker || !!booked} onClick={() => onBook(id)}>
                    Marcar
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {recent.length > 0 && (
        <ul className="show-history">
          {recent.map((sh, i) => (
            <li key={i}>
              <span>
                Sem. {sh.week} · {VENUES[sh.venue].icon} {VENUES[sh.venue].name}
              </span>
              <span className={`tier tier--${sh.tier}`}>
                {SHOW_TIERS[sh.tier].label} · {sh.score}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
