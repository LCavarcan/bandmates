// Cenário provisório do estúdio (SVG original). Substituível por uma ilustração definitiva.
export function StudioBackdrop({ week }: { week: number }) {
  // O céu da janela escurece conforme a temporada avança — detalhe sutil de passagem do tempo.
  const t = Math.min(1, (week - 1) / 11);
  const sky = `hsl(${250 - t * 20} 55% ${30 - t * 12}%)`;
  return (
    <svg className="studio-backdrop" viewBox="0 0 1000 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2a5c" />
          <stop offset="1" stopColor="#2a1f45" />
        </linearGradient>
        <pattern id="foam" width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill="#2f2350" />
          <path d="M0 14 L14 0 L28 14 L14 28 Z" fill="#35285a" />
        </pattern>
        <radialGradient id="lamp" cx="0.5" cy="0" r="0.8">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="220" fill="url(#wall)" />
      <rect x="40" y="20" width="200" height="150" rx="6" fill="url(#foam)" />
      {/* janela com a cidade */}
      <g>
        <rect x="300" y="26" width="230" height="120" rx="8" fill={sky} />
        <g fill="#1a1430">
          <rect x="310" y="90" width="30" height="56" />
          <rect x="345" y="70" width="24" height="76" />
          <rect x="374" y="98" width="40" height="48" />
          <rect x="420" y="60" width="28" height="86" />
          <rect x="452" y="84" width="34" height="62" />
          <rect x="490" y="74" width="30" height="72" />
        </g>
        <g fill="#ffd36b" opacity="0.8">
          {[[352, 80], [358, 100], [428, 72], [434, 96], [460, 94], [498, 86], [382, 108], [316, 104]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="5" height="6" />
          ))}
        </g>
        <circle cx="490" cy="46" r="11" fill="#fff2c9" opacity="0.9" />
        <rect x="300" y="26" width="230" height="120" rx="8" fill="none" stroke="#1a1430" strokeWidth="8" />
        <path d="M415 26 V146 M300 86 H530" stroke="#1a1430" strokeWidth="5" />
      </g>
      {/* pôsteres originais */}
      <g transform="rotate(-4 640 70)">
        <rect x="590" y="30" width="90" height="120" fill="#ff7a6b" />
        <circle cx="635" cy="78" r="26" fill="#2a1f45" />
        <circle cx="635" cy="78" r="8" fill="#ffd36b" />
        <rect x="604" y="118" width="62" height="7" fill="#2a1f45" />
        <rect x="614" y="131" width="42" height="5" fill="#2a1f45" />
      </g>
      <g transform="rotate(3 760 80)">
        <rect x="712" y="40" width="96" height="76" fill="#3ec1b5" />
        <path d="M724 100 L748 60 L770 92 L784 74 L798 100 Z" fill="#2a1f45" />
        <rect x="724" y="104" width="50" height="5" fill="#ffd36b" />
      </g>
      {/* varal de luzes */}
      <path d="M0 14 Q250 52 500 18 Q750 52 1000 14" stroke="#1a1430" strokeWidth="2" fill="none" />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 30 + i * 62;
        const y = 14 + Math.sin((x / 1000) * Math.PI * 2 - Math.PI / 2) * -16 + 18;
        const col = ['#ffb347', '#ff7a6b', '#b59cff', '#3ec1b5'][i % 4];
        return <circle key={i} className="bulb" style={{ animationDelay: `${(i % 5) * 0.6}s` }} cx={x} cy={y} r="5" fill={col} />;
      })}
      {/* amplificador */}
      <g>
        <rect x="860" y="96" width="110" height="110" rx="8" fill="#1a1430" />
        <rect x="872" y="122" width="86" height="74" rx="6" fill="#2b2240" />
        <circle cx="915" cy="159" r="28" fill="#1a1430" />
        <circle cx="915" cy="159" r="10" fill="#2b2240" />
        {[882, 896, 910, 924, 938].map((x) => <circle key={x} cx={x} cy="109" r="3.5" fill="#ffb347" />)}
      </g>
      <rect width="1000" height="220" fill="url(#lamp)" />
      <rect y="200" width="1000" height="20" fill="#1d1630" />
    </svg>
  );
}
