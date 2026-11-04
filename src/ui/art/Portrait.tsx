// Retratos provisórios originais, desenhados em SVG.
// Para trocar por arte definitiva: substitua este componente por <img> de cada expressão,
// mantendo a mesma interface (member + mood). A lógica do jogo não depende daqui.
import type { MemberProfile, PortraitConfig } from '../../data/members';
import type { MemberState } from '../../engine/types';

export type Mood = 'animada' | 'neutra' | 'cansada' | 'tensa' | 'abatida';

export const MOOD_LABELS: Record<Mood, string> = {
  animada: 'Animada',
  neutra: 'Tranquila',
  cansada: 'Cansada',
  tensa: 'Tensa',
  abatida: 'Desanimada',
};

export function moodOf(m: MemberState): Mood {
  const { estresse, motivacao } = m.emotions;
  if (estresse >= 75) return 'tensa';
  if (motivacao <= 30) return 'abatida';
  if (estresse >= 55) return 'cansada';
  if (motivacao >= 70) return 'animada';
  return 'neutra';
}

const INK = '#2a1d2e';

function BackHair({ c }: { c: PortraitConfig }) {
  switch (c.hairStyle) {
    case 'ondulado':
      return (
        <path
          fill={c.hair}
          d="M50 90 C38 40 78 26 100 28 C138 26 168 48 152 100 C162 128 172 162 160 196 C142 206 122 192 116 176 L84 176 C78 192 58 206 40 196 C28 160 40 128 50 90 Z"
        />
      );
    case 'chanel':
      return (
        <path
          fill={c.hair}
          d="M50 96 C46 44 74 32 100 32 C126 32 154 44 150 96 L153 146 C138 152 122 150 113 140 L87 140 C78 150 62 152 47 146 Z"
        />
      );
    case 'cachos': {
      const curls: [number, number, number][] = [
        [58, 72, 24], [78, 46, 26], [104, 38, 28], [130, 48, 26], [148, 74, 23],
        [152, 102, 18], [48, 100, 18], [54, 126, 14], [148, 126, 14], [90, 32, 18], [118, 30, 18],
      ];
      return <g fill={c.hair}>{curls.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>;
    }
    case 'rabo':
      return (
        <g fill={c.hair}>
          <path d="M138 58 C178 66 182 132 160 176 C154 146 150 112 132 84 Z" />
          <ellipse cx="100" cy="88" rx="46" ry="50" />
        </g>
      );
  }
}

function FrontHair({ c }: { c: PortraitConfig }) {
  switch (c.hairStyle) {
    case 'ondulado':
      return (
        <path
          fill={c.hair}
          d="M56 96 C54 46 94 30 122 40 C144 48 152 68 147 92 C136 70 116 60 96 66 C80 71 66 82 56 96 Z"
        />
      );
    case 'chanel':
      return (
        <path
          fill={c.hair}
          d="M56 86 C56 50 78 40 100 40 C122 40 144 50 144 86 L132 79 L120 84 L108 78 L96 84 L84 78 L72 84 Z"
        />
      );
    case 'cachos':
      return (
        <g>
          <g fill={c.hair}>
            {[[70, 62, 14], [90, 54, 15], [112, 53, 15], [132, 62, 13]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
          {c.accessory === 'bandana' && (
            <path fill={c.outfitAccent} d="M56 72 C80 56 120 56 144 72 L141 83 C120 68 80 68 59 83 Z" />
          )}
        </g>
      );
    case 'rabo':
      return (
        <path
          fill={c.hair}
          d="M57 90 C54 50 80 40 100 42 C120 40 147 50 143 90 C136 68 120 58 103 60 L100 50 L97 60 C80 58 64 68 57 90 Z"
        />
      );
  }
}

function Eyes({ mood, c }: { mood: Mood; c: PortraitConfig }) {
  const xs = [82, 118];
  if (mood === 'animada') {
    return (
      <g stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round">
        {xs.map((x) => <path key={x} d={`M${x - 8} 103 Q${x} 94 ${x + 8} 103`} />)}
      </g>
    );
  }
  const lowered = mood === 'cansada' || mood === 'abatida';
  const y = mood === 'abatida' ? 103 : 101;
  return (
    <g>
      {xs.map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx="5.5" ry={mood === 'tensa' ? 7 : 6.5} fill={c.eyes} />
          <circle cx={x + 2} cy={y - 2.5} r="1.8" fill="#fff" />
          {lowered && (
            <path d={`M${x - 8} ${y - 1} Q${x} ${y - 4} ${x + 8} ${y - 1} L${x + 8} ${y - 9} L${x - 8} ${y - 9} Z`} fill={c.skin} />
          )}
          {lowered && <path d={`M${x - 8} ${y - 1} Q${x} ${y - 4} ${x + 8} ${y - 1}`} stroke={INK} strokeWidth="2" fill="none" />}
        </g>
      ))}
    </g>
  );
}

function Brows({ mood, c }: { mood: Mood; c: PortraitConfig }) {
  const d: Record<Mood, [string, string]> = {
    animada: ['M73 86 Q82 80 91 85', 'M109 85 Q118 80 127 86'],
    neutra: ['M73 89 Q82 86 91 88', 'M109 88 Q118 86 127 89'],
    cansada: ['M73 90 L91 90', 'M109 90 L127 90'],
    tensa: ['M73 90 Q82 87 91 84', 'M109 84 Q118 87 127 90'],
    abatida: ['M73 93 Q82 89 91 87', 'M109 87 Q118 89 127 93'],
  };
  return (
    <g stroke={c.hair} strokeWidth="4" strokeLinecap="round" fill="none">
      <path d={d[mood][0]} />
      <path d={d[mood][1]} />
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  if (mood === 'animada') return <path d="M88 122 Q100 138 112 122 Z" fill="#8a2f3f" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />;
  const d: Record<Exclude<Mood, 'animada'>, string> = {
    neutra: 'M91 125 Q100 131 109 125',
    cansada: 'M93 127 L107 127',
    tensa: 'M89 128 Q94.5 123 100 128 Q105.5 133 111 128',
    abatida: 'M92 130 Q100 123 108 130',
  };
  return <path d={d[mood]} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />;
}

function Accessory({ c }: { c: PortraitConfig }) {
  switch (c.accessory) {
    case 'oculos':
      return (
        <g stroke="#2d2a3a" strokeWidth="2.6" fill="rgba(255,255,255,0.12)">
          <circle cx="82" cy="101" r="12" />
          <circle cx="118" cy="101" r="12" />
          <path d="M94 100 Q100 96 106 100" fill="none" />
        </g>
      );
    case 'brincos':
      return (
        <g stroke={c.outfitAccent} strokeWidth="2.5" fill="none">
          <circle cx="57" cy="121" r="6" />
          <circle cx="143" cy="121" r="6" />
        </g>
      );
    case 'fone':
      return (
        <g>
          <path d="M64 168 C62 196 138 196 136 168" stroke="#22252e" strokeWidth="7" fill="none" />
          <rect x="54" y="158" width="20" height="24" rx="8" fill="#22252e" />
          <rect x="126" y="158" width="20" height="24" rx="8" fill="#22252e" />
          <rect x="58" y="163" width="12" height="14" rx="5" fill={c.outfitAccent} />
          <rect x="130" y="163" width="12" height="14" rx="5" fill={c.outfitAccent} />
        </g>
      );
    default:
      return null;
  }
}

export function Portrait({ profile, mood, size = 160 }: { profile: MemberProfile; mood: Mood; size?: number }) {
  const c = profile.portrait;
  return (
    <svg
      className="portrait"
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      role="img"
      aria-label={`${profile.name}, ${MOOD_LABELS[mood].toLowerCase()}`}
    >
      <BackHair c={c} />
      {/* corpo */}
      <path d="M26 222 C28 178 60 160 100 160 C140 160 172 178 174 222 Z" fill={c.outfit} />
      <path d="M78 162 L100 190 L122 162" fill="none" stroke={c.outfitAccent} strokeWidth="5" strokeLinejoin="round" />
      {/* pescoço e cabeça */}
      <path d="M86 128 L86 164 Q100 174 114 164 L114 128 Z" fill={c.skinShade} />
      <ellipse cx="58" cy="104" rx="7" ry="10" fill={c.skinShade} />
      <ellipse cx="142" cy="104" rx="7" ry="10" fill={c.skinShade} />
      <ellipse cx="100" cy="96" rx="43" ry="50" fill={c.skin} />
      {mood === 'animada' && (
        <g fill="#ff7f86" opacity="0.4">
          <ellipse cx="71" cy="116" rx="9" ry="5" />
          <ellipse cx="129" cy="116" rx="9" ry="5" />
        </g>
      )}
      {mood === 'tensa' && <path d="M140 76 q4 6 0 9 q-4 -3 0 -9 Z" fill="#9fd8ff" />}
      <path d="M100 104 Q96 114 101 116" stroke={c.skinShade} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Eyes mood={mood} c={c} />
      <Brows mood={mood} c={c} />
      <Mouth mood={mood} />
      <FrontHair c={c} />
      <Accessory c={c} />
    </svg>
  );
}
