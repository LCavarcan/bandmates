/** Barra horizontal 0..100. "inverse" = valor alto é ruim (ex.: estresse). */
export function Meter({ label, value, inverse = false, compact = false }: { label: string; value: number; inverse?: boolean; compact?: boolean }) {
  const level = inverse ? 100 - value : value;
  const tone = level >= 60 ? 'good' : level >= 35 ? 'mid' : 'bad';
  return (
    <div className={`meter ${compact ? 'meter--compact' : ''}`} title={`${label}: ${Math.round(value)}`}>
      <span className="meter__label">{label}</span>
      <span className="meter__track">
        <span className={`meter__fill meter__fill--${tone}`} style={{ width: `${value}%` }} />
      </span>
      <span className="meter__value">{Math.round(value)}</span>
    </div>
  );
}

/** Barra divergente -100..100, usada nas relações. */
export function DivergingBar({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  const positive = value >= 0;
  const good = inverse ? !positive : positive;
  const width = Math.abs(value) / 2;
  return (
    <div className="dbar" title={`${label}: ${value > 0 ? '+' : ''}${Math.round(value)}`}>
      <span className="dbar__label">{label}</span>
      <span className="dbar__track">
        <span
          className={`dbar__fill ${good ? 'dbar__fill--good' : 'dbar__fill--bad'}`}
          style={positive ? { left: '50%', width: `${width}%` } : { right: '50%', width: `${width}%` }}
        />
      </span>
    </div>
  );
}
