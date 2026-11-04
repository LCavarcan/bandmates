import { useEffect } from 'react';
import type { LogKind, WeekReport } from '../../engine/types';
import { Avatar } from './Avatar';
import { DeltaChips } from './DeltaChips';
import { fmtMoney } from './TopBar';

const SECTIONS: { kind: LogKind; title: string }[] = [
  { kind: 'member', title: 'Cada uma na sua' },
  { kind: 'song', title: 'No caderno' },
  { kind: 'pair', title: 'Entre elas' },
  { kind: 'band', title: 'Banda' },
  { kind: 'warning', title: 'Atenção' },
];

const sign = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '');

export function WeekReportModal({ report, onClose }: { report: WeekReport; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="modal">
        <header className="modal__head">
          <p className="eyebrow">Fim da semana</p>
          <h2 id="report-title">Semana {report.week}</h2>
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
        </header>
        <div className="modal__body">
          {SECTIONS.map(({ kind, title }) => {
            const items = report.entries.filter((e) => e.kind === kind);
            if (!items.length) return null;
            return (
              <section key={kind} className={`log log--${kind}`}>
                <h3>{title}</h3>
                {items.map((e, i) => (
                  <div key={i} className="log__entry">
                    <span className="log__who">
                      {e.members.length === 0 && <span className="log__icon">🏠</span>}
                      {e.members.length > 0 && e.members.length <= 2 &&
                        e.members.map((m) => <Avatar key={m} id={m} size={30} />)}
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
            Planejar a próxima semana
          </button>
        </footer>
      </div>
    </div>
  );
}
