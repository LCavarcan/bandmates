import { useEffect, type ReactNode } from 'react';
import type { LogEntry, LogKind, WeekReport } from '../../engine/types';
import { Avatar } from './Avatar';
import { DeltaChips } from './DeltaChips';
import { fmtMoney } from './TopBar';

const SECTIONS: { kind: LogKind; title: string }[] = [
  { kind: 'member', title: 'Cada uma na sua' },
  { kind: 'song', title: 'Música' },
  { kind: 'pair', title: 'Entre elas' },
  { kind: 'band', title: 'Banda' },
  { kind: 'warning', title: 'Atenção' },
];

const sign = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '');

interface EntriesModalProps {
  eyebrow: string;
  title: string;
  summary?: ReactNode;
  entries: LogEntry[];
  buttonLabel: string;
  /** Títulos de seção alternativos (ex.: "Reações" em vez de "Cada uma na sua"). */
  sectionTitles?: Partial<Record<LogKind, string>>;
  onClose: () => void;
}

/** Modal genérico que lista acontecimentos agrupados por tipo. */
export function EntriesModal({ eyebrow, title, summary, entries, buttonLabel, sectionTitles, onClose }: EntriesModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="entries-title">
      <div className="modal">
        <header className="modal__head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="entries-title">{title}</h2>
          {summary}
        </header>
        <div className="modal__body">
          {entries.length === 0 && <p className="muted">Ninguém comentou nada. Às vezes o silêncio também é resposta.</p>}
          {SECTIONS.map(({ kind, title: defaultTitle }) => {
            const items = entries.filter((e) => e.kind === kind);
            if (!items.length) return null;
            return (
              <section key={kind} className={`log log--${kind}`}>
                <h3>{sectionTitles?.[kind] ?? defaultTitle}</h3>
                {items.map((e, i) => (
                  <div key={i} className="log__entry">
                    <span className="log__who">
                      {e.members.length === 0 && <span className="log__icon">🏠</span>}
                      {e.members.length > 0 && e.members.length <= 2 && e.members.map((m) => <Avatar key={m} id={m} size={30} />)}
                      {e.members.length > 2 && <span className="log__icon">👥</span>}
                    </span>
                    <div className="log__text">
                      <p>{e.text}</p>
                      <DeltaChips deltas={e.deltas} />
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
        <footer className="modal__foot">
          <button className="primary-btn" onClick={onClose} autoFocus>
            {buttonLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}

export function WeekReportModal({ report, onClose }: { report: WeekReport; onClose: () => void }) {
  return (
    <EntriesModal
      eyebrow="Fim da semana"
      title={`Semana ${report.week}`}
      entries={report.entries}
      buttonLabel="Planejar a próxima semana"
      onClose={onClose}
      summary={
        <div className="summary">
          <span className={report.money >= 0 ? 'up' : 'down'}>
            💰 {sign(report.money)}
            {fmtMoney(Math.abs(report.money))}
          </span>
          <span className={report.fans > 0 ? 'up' : ''}>
            💜 {sign(report.fans)}
            {Math.abs(report.fans)} fãs
          </span>
          <span className={report.reputation > 0 ? 'up' : ''}>
            ⭐ {sign(report.reputation)}
            {Math.abs(report.reputation)} rep.
          </span>
        </div>
      }
    />
  );
}
