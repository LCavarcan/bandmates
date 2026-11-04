import { MEMBERS } from '../../data/members';
import type { MemberId } from '../../engine/types';

/** Avatar circular pequeno com a inicial e a cor da personagem. */
export function Avatar({ id, size = 30 }: { id: MemberId; size?: number }) {
  const p = MEMBERS[id];
  return (
    <span className="avatar" style={{ background: p.color, width: size, height: size, fontSize: size * 0.45 }} title={p.name}>
      {p.name[0]}
    </span>
  );
}
