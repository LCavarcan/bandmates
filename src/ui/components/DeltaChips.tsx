import type { Delta } from '../../engine/types';

export function DeltaChips({ deltas }: { deltas: Delta[] }) {
  if (!deltas.length) return null;
  return (
    <div className="chips">
      {deltas.map((d) => {
        const good = d.inverse ? d.value < 0 : d.value > 0;
        const neutralStat = d.label === 'Qualidade' || d.label === 'Originalidade';
        return (
          <span key={d.label} className={`chip ${neutralStat ? 'chip--info' : good ? 'chip--good' : 'chip--bad'}`}>
            {neutralStat ? `${d.label} ${d.value}` : `${d.value > 0 ? '+' : ''}${d.value} ${d.label}`}
          </span>
        );
      })}
    </div>
  );
}
