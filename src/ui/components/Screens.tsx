import { useRef, useState } from 'react';
import { downloadSave, readSaveFile } from '../saveFile';
import { FESTIVAL_TIERS } from '../../data/campaign';
import { MEMBER_ORDER, MEMBERS } from '../../data/members';
import { describeRelation, epilogue } from '../../engine';
import type { GameState } from '../../engine/types';
import { moodOf, Portrait } from '../art/Portrait';
import { fmtMoney } from './TopBar';

export function TitleScreen({
  saved,
  onContinue,
  onNew,
  onImport,
}: {
  saved: GameState | null;
  onContinue: () => void;
  onNew: () => void;
  onImport: (state: GameState) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    const state = await readSaveFile(file);
    if (state) onImport(state);
    else setImportMsg('Esse arquivo não é um save válido do Bandmates (ou é de uma versão incompatível).');
  };
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
      <p className="title-screen__tag">
        Quatro garotas, um estúdio alugado e doze semanas até a seletiva do Festival Maré Alta.
      </p>
      <div className="title-screen__actions">
        {saved && !saved.finished && (
          <button className="primary-btn" onClick={onContinue}>
            Continuar — semana {saved.week}
          </button>
        )}
        {saved && saved.finished && (
          <button className="primary-btn" onClick={onContinue}>
            Ver o final da temporada
          </button>
        )}
        {confirming ? (
          <div className="confirm">
            <span>Isso apaga a campanha salva. Tem certeza?</span>
            <button className="danger-btn" onClick={onNew}>
              Sim, começar do zero
            </button>
            <button className="ghost-btn" onClick={() => setConfirming(false)}>
              Cancelar
            </button>
          </div>
        ) : (
          <button className={saved ? 'ghost-btn' : 'primary-btn'} onClick={() => (saved ? setConfirming(true) : onNew())}>
            Nova campanha
          </button>
        )}
      </div>
      <div className="title-screen__files">
        {saved && (
          <button className="link-btn" onClick={() => downloadSave(saved)}>
            ⬇️ Exportar save (backup)
          </button>
        )}
        <button className="link-btn" onClick={() => fileInput.current?.click()}>
          ⬆️ Importar save
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            void importFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {importMsg && <p className="import-error">{importMsg}</p>}
      <p className="muted small">Progresso salvo automaticamente neste navegador. Funciona offline. Use o backup para levar o save a outro aparelho.</p>
    </main>
  );
}

export function SeasonEnd({ state, onNew, onMenu }: { state: GameState; onNew: () => void; onMenu: () => void }) {
  const f = state.festival;
  const tier = f ? FESTIVAL_TIERS[f.tier] : null;
  const ep = epilogue(state);
  const released = state.songs.filter((s) => s.status === 'lancada').length;
  const best = [...state.songs].sort((a, b) => (b.score ?? b.quality * 0.8) - (a.score ?? a.quality * 0.8))[0];

  return (
    <section className={`season-end ${f ? `season-end--${f.tier}` : ''}`}>
      <p className="eyebrow">Seletiva do Festival Maré Alta</p>
      <h2>{tier ? tier.title : 'Fim da temporada'}</h2>
      {tier && <p className="season-end__verdict">{tier.text}</p>}

      {f && (
        <div className="jury">
          <h3>Avaliação do júri · {f.score}</h3>
          <ul>
            {f.components.map((c) => (
              <li key={c.label}>
                <span>{c.label}</span>
                <span className="jury__bar">
                  <span style={{ width: `${c.value}%` }} />
                </span>
                <span className="jury__value">
                  {c.value} <span className="muted small">×{c.weight}</span>
                </span>
              </li>
            ))}
            <li>
              <span>Metas cumpridas ({f.goalsDone})</span>
              <span />
              <span className="jury__value">+{f.goalsBonus}</span>
            </li>
          </ul>
        </div>
      )}

      <div className="season-end__stats">
        <div><strong>{state.fans}</strong><span>fãs</span></div>
        <div><strong>{fmtMoney(state.money)}</strong><span>em caixa</span></div>
        <div><strong>{state.reputation}</strong><span>reputação</span></div>
        <div><strong>{state.songs.length}</strong><span>músicas ({released} lançadas)</span></div>
        <div><strong>{state.shows.length}</strong><span>shows</span></div>
      </div>
      {best && (
        <p>
          A música que mais marcou a temporada foi <strong>“{best.title}”</strong>.
        </p>
      )}

      <h3>Epílogo</h3>
      <ul className="epilogue">
        {ep.members.map(({ id, text }) => (
          <li key={id} style={{ ['--c' as string]: MEMBERS[id].color }}>
            <span className="epilogue__portrait">
              <Portrait profile={MEMBERS[id]} mood={moodOf(state.members[id])} size={72} />
            </span>
            <span>
              <strong>{MEMBERS[id].name}.</strong> {text}
            </span>
          </li>
        ))}
      </ul>
      {ep.romance && <p className="epilogue__romance">💜 {ep.romance}</p>}

      <details className="season-end__relations">
        <summary>Como ficaram as relações</summary>
        <ul>
          {Object.entries(state.relations).map(([k, r]) => {
            const [a, b] = k.split('|') as (keyof typeof MEMBERS)[];
            return (
              <li key={k}>
                {MEMBERS[a].name} & {MEMBERS[b].name}: <em>{describeRelation(r).label}</em>
              </li>
            );
          })}
        </ul>
      </details>

      <div className="title-screen__actions">
        <button className="primary-btn" onClick={onNew}>
          Nova campanha
        </button>
        <button className="ghost-btn" onClick={onMenu}>
          Menu
        </button>
      </div>
    </section>
  );
}
