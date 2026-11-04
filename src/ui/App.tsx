import { useCallback, useEffect, useState } from 'react';
import { MEMBER_ORDER } from '../data/members';
import { advanceWeek, createNewGame, deleteSave, loadGame, saveGame, setActivity } from '../engine';
import type { ActivityId, GameState, MemberId, WeekReport } from '../engine/types';
import { StudioBackdrop } from './art/StudioBackdrop';
import { MemberCard } from './components/MemberCard';
import { SeasonEnd, TitleScreen } from './components/Screens';
import { PlanPanel, RelationsPanel, SongsPanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';
import { WeekReportModal } from './components/WeekReportModal';

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

export function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [saved, setSaved] = useState<GameState | null>(() => (store ? loadGame(store) : null));
  const [report, setReport] = useState<WeekReport | null>(null);

  // Salvamento automático a cada mudança de estado.
  useEffect(() => {
    if (game && store) {
      saveGame(store, game);
      setSaved(game);
    }
  }, [game]);

  const startNew = () => {
    if (store) deleteSave(store);
    setReport(null);
    setGame(createNewGame());
  };

  const choose = (id: MemberId, a: ActivityId) => setGame((g) => (g ? setActivity(g, id, a) : g));

  const advance = () => {
    if (!game) return;
    const r = advanceWeek(game);
    setGame(r.state);
    setReport(r.report);
  };

  const closeReport = useCallback(() => setReport(null), []);

  if (!game) {
    return <TitleScreen saved={saved} onContinue={() => saved && setGame(saved)} onNew={startNew} />;
  }

  return (
    <div className="app">
      <TopBar state={game} onMenu={() => setGame(null)} />
      <main className="studio">
        <div className="studio__main">
          <div className="scene">
            <StudioBackdrop week={game.week} />
            <div className="scene__caption">
              <p className="eyebrow">Estúdio Porão 27</p>
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
                  disabled={game.finished}
                  onChoose={(a) => choose(id, a)}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="studio__side">
          {!game.finished && <PlanPanel state={game} onAdvance={advance} />}
          <SongsPanel state={game} />
          <RelationsPanel state={game} />
        </aside>
      </main>
      {report && <WeekReportModal report={report} onClose={closeReport} />}
    </div>
  );
}
