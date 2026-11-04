import type { Delta } from '../../engine/types';

/** Atributos de música: exibidos como valor absoluto, não como ganho/perda. */
const INFO_LABELS = new Set(['Qualidade', 'Originalidade', 'Apelo', 'Coesão', 'Identidade', 'Gravação', 'Nota final', 'Nota do show', 'Público']);

export function DeltaChips({ deltas }: { deltas: Delta[] }) {
  if (!deltas.length) return null;
  return (
    <div className="chips">
      {deltas.map((d) => {
        const good = d.inverse ? d.value < 0 : d.value > 0;
        const neutralStat = INFO_LABELS.has(d.label);
        return (
          <span key={d.label} className={`chip ${neutralStat ? 'chip--info' : good ? 'chip--good' : 'chip--bad'}`}>
            {neutralStat ? `${d.label} ${d.value}` : `${d.value > 0 ? '+' : ''}${d.value} ${d.label}`}
          </span>
        );
      })}
    </div>
  );
}
