import { useState } from 'react';
import { MEMBER_ORDER, MEMBERS } from '../../data/members';
import { describeRelation } from '../../engine';
import type { GameState } from '../../engine/types';
import { moodOf, Portrait } from '../art/Portrait';
import { fmtMoney } from './TopBar';

export function TitleScreen({
  saved,
  onContinue,
  onNew,
}: {
  saved: GameState | null;
  onContinue: () => void;
  onNew: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <main className="title-screen">
      <div className="title-screen__band">
        {MEMBER_ORDER.map((id, i) => (
          <div key={id} className="title-screen__member" style={{ animationDelay: `${i * 0.12}s` }}>
            <Portrait profile={MEMBERS[id]} mood="animada" size={150} />
            <span style={{ color: MEMBERS[id].color }}>{MEMBERS[id].name}</span>
          </div>
        ))}
      </div>
      <h1 className="logo">Bandmates</h1>
      <p className="title-screen__tag">Quatro garotas, um estúdio alugado e doze semanas para virar uma banda de verdade.</p>
      <div className="title-screen__actions">
        {saved && !saved.finished && (
          <button className="primary-btn" onClick={onContinue}>
            Continuar — semana {saved.week}
          </button>
        )}
        {saved && saved.finished && (
          <button className="primary-btn" onClick={onContinue}>
            Ver fim da temporada
          </button>
        )}
        {confirming ? (
          <div className="confirm">
            <span>Isso apaga a campanha salva. Tem certeza?</span>
            <button className="danger-btn" onClick={onNew}>Sim, começar do zero</button>
            <button className="ghost-btn" onClick={() => setConfirming(false)}>Cancelar</button>
          </div>
        ) : (
          <button className={saved ? 'ghost-btn' : 'primary-btn'} onClick={() => (saved ? setConfirming(true) : onNew())}>
            Nova campanha
          </button>
        )}
      </div>
      <p className="muted small">Progresso salvo automaticamente neste computador. Funciona offline.</p>
    </main>
  );
}

export function SeasonEnd({ state, onNew, onMenu }: { state: GameState; onNew: () => void; onMenu: () => void }) {
  const rank = (s: GameState['songs'][number]) => s.score ?? (s.quality + s.originality) / 2;
  const best = [...state.songs].sort((a, b) => rank(b) - rank(a))[0];
  const released = state.songs.filter((s) => s.status === 'lancada').length;
  return (
    <section className="season-end">
      <p className="eyebrow">Fim da temporada</p>
      <h2>Doze semanas depois…</h2>
      <div className="season-end__stats">
        <div><strong>{state.fans}</strong><span>fãs</span></div>
        <div><strong>{fmtMoney(state.money)}</strong><span>em caixa</span></div>
        <div><strong>{state.reputation}</strong><span>reputação</span></div>
        <div><strong>{state.songs.length}</strong><span>músicas ({released} lançadas)</span></div>
      </div>
      {best && (
        <p>
          A música mais marcante foi <strong>“{best.title}”</strong>
          {best.score !== null ? ` (nota ${best.score})` : ` (qualidade ${best.quality}, originalidade ${best.originality})`}.
        </p>
      )}
      <div className="season-end__band">
        {MEMBER_ORDER.map((id) => (
          <div key={id} className="season-end__member">
            <Portrait profile={MEMBERS[id]} mood={moodOf(state.members[id])} size={90} />
            <span>{MEMBERS[id].name}</span>
          </div>
        ))}
      </div>
      <ul className="season-end__relations">
        {Object.entries(state.relations).map(([k, r]) => {
          const [a, b] = k.split('|') as (keyof typeof MEMBERS)[];
          return (
            <li key={k}>
              {MEMBERS[a].name} & {MEMBERS[b].name}: <em>{describeRelation(r).label}</em>
            </li>
          );
        })}
      </ul>
      <p className="muted small">
        Nas próximas versões, a temporada termina com a seletiva do festival — e o que vocês construíram decide o resultado.
      </p>
      <div className="title-screen__actions">
        <button className="primary-btn" onClick={onNew}>Nova campanha</button>
        <button className="ghost-btn" onClick={onMenu}>Menu</button>
      </div>
    </section>
  );
}
