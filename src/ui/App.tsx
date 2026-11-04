import { useCallback, useEffect, useState } from 'react';
import { MEMBER_ORDER } from '../data/members';
import {
  advanceWeek,
  bandIdentity,
  createNewGame,
  deleteSave,
  loadGame,
  recordingTarget,
  saveGame,
  setActivity,
  setRelease,
  startSong,
} from '../engine';
import type { ActivityId, GameState, LogEntry, MemberId, SongConcept, WeekReport } from '../engine/types';
import { StudioBackdrop } from './art/StudioBackdrop';
import { ComposeModal } from './components/ComposeModal';
import { MemberCard } from './components/MemberCard';
import { PlanPanel } from './components/PlanPanel';
import { RelationsPanel } from './components/RelationsPanel';
import { SeasonEnd, TitleScreen } from './components/Screens';
import { SongsPanel } from './components/SongsPanel';
import { TopBar } from './components/TopBar';
import { EntriesModal, WeekReportModal } from './components/WeekReportModal';

// localStorage pode estar indisponível (modo privado, etc.). O jogo continua, só não salva.
const store = (() => {
  try {
    localStorage.setItem('bandmates.probe', '1');
    localStorage.removeItem('bandmates.probe');
    return localStorage;
  } catch {
    return null;
  }
})();

type Overlay =
  | { kind: 'report'; report: WeekReport }
  | { kind: 'compose' }
  | { kind: 'reactions'; title: string; entries: LogEntry[] }
  | null;

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [saved, setSaved] = useState<GameState | null>(() => (store ? loadGame(store) : null));
  const [overlay, setOverlay] = useState<Overlay>(null);

  // Salvamento automático a cada mudança de estado.
  useEffect(() => {
    if (game && store) {
      saveGame(store, game);
      setSaved(game);
    }
  }, [game]);

  const startNew = () => {
    if (store) deleteSave(store);
    setOverlay(null);
    setGame(createNewGame());
  };

  const choose = (id: MemberId, a: ActivityId) => setGame((g) => (g ? setActivity(g, id, a) : g));

  const advance = () => {
    if (!game) return;
    const r = advanceWeek(game);
    setGame(r.state);
    setOverlay({ kind: 'report', report: r.report });
  };

  const confirmSong = (c: SongConcept) => {
    if (!game) return;
    const r = startSong(game, c);
    setGame(r.state);
    setOverlay({ kind: 'reactions', title: `“${r.state.draft?.title ?? c.title}”`, entries: r.entries });
  };

  const closeOverlay = useCallback(() => setOverlay(null), []);

  if (!game) {
    return <TitleScreen saved={saved} onContinue={() => saved && setGame(saved)} onNew={startNew} />;
  }

  const unavailable: Partial<Record<ActivityId, string>> = {};
  if (!game.draft) unavailable.compor = 'Defina uma nova música no painel “Músicas” para poder compor.';
  if (!recordingTarget(game)) unavailable.gravar = 'Não há música composta esperando gravação.';
  const identity = bandIdentity(game);

  return (
    <div className="app">
      <TopBar state={game} onMenu={() => setGame(null)} />
      <main className="studio">
        <div className="studio__main">
          <div className="scene">
            <StudioBackdrop week={game.week} />
            <div className="scene__caption">
              <p className="eyebrow">Estúdio Porão 27 · {identity.label}</p>
              <h1>{game.finished ? 'Temporada encerrada' : `Semana ${game.week} — o que a banda vai fazer?`}</h1>
            </div>
          </div>
          {game.finished ? (
            <SeasonEnd state={game} onNew={startNew} onMenu={() => setGame(null)} />
          ) : (
            <div className="members">
              {MEMBER_ORDER.map((id) => (
                <MemberCard
                  key={id}
                  member={game.members[id]}
                  activity={game.plan[id]}
                  disabled={false}
                  unavailable={unavailable}
                  onChoose={(a) => choose(id, a)}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="studio__side">
          {!game.finished && <PlanPanel state={game} onAdvance={advance} />}
          <SongsPanel
            state={game}
            onNewSong={() => setOverlay({ kind: 'compose' })}
            onToggleRelease={(id) => setGame((g) => (g ? setRelease(g, id) : g))}
          />
          <RelationsPanel state={game} />
        </aside>
      </main>
      {overlay?.kind === 'report' && <WeekReportModal report={overlay.report} onClose={closeOverlay} />}
      {overlay?.kind === 'compose' && <ComposeModal state={game} onConfirm={confirmSong} onCancel={closeOverlay} />}
      {overlay?.kind === 'reactions' && (
        <EntriesModal
          eyebrow="Nova música"
          title={overlay.title}
          entries={overlay.entries}
          sectionTitles={{ member: 'Reações da banda' }}
          buttonLabel="Mãos à obra"
          onClose={closeOverlay}
        />
      )}
    </div>
  );
}
