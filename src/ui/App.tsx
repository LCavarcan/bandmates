import { useCallback, useEffect, useState } from 'react';
import { MEMBER_ORDER, MEMBERS } from '../data/members';
import { TALK_APPROACHES, TALK_OPENING, TALK_ORDER, type TalkApproach } from '../data/talks';
import {
  advanceWeek,
  bandIdentity,
  canTalk,
  createNewGame,
  currentEvent,
  eventChoices,
  resolveEvent,
  talk,
  deleteSave,
  loadGame,
  recordingTarget,
  saveGame,
  setActivity,
  setBooking,
  setRelease,
  startSong,
} from '../engine';
import type { ActivityId, EventDef, GameState, LogEntry, MemberId, SongConcept, WeekReport } from '../engine/types';
import { StudioBackdrop } from './art/StudioBackdrop';
import { ComposeModal } from './components/ComposeModal';
import { MemberCard } from './components/MemberCard';
import { PlanPanel } from './components/PlanPanel';
import { RelationsPanel } from './components/RelationsPanel';
import { SeasonEnd, TitleScreen } from './components/Screens';
import { SongsPanel } from './components/SongsPanel';
import { GoalsPanel } from './components/GoalsPanel';
import { ShowsPanel } from './components/ShowsPanel';
import { StoryModal, type StoryChoice } from './components/StoryModal';
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
  /** O evento e as escolhas são capturados ao abrir, para a cena não sumir quando o estado muda. */
  | { kind: 'event'; event: EventDef; choices: StoryChoice[] }
  | { kind: 'talk'; member: MemberId }
  | null;

function eventOverlay(g: GameState): Overlay {
  const event = currentEvent(g);
  if (!event) return null;
  const choices: StoryChoice[] = eventChoices(g).map(({ choice, available }) => ({
    id: choice.id,
    label: choice.label,
    hint: choice.hint,
    disabled: !available,
    reason: choice.requiresText,
  }));
  return { kind: 'event', event, choices };
}

const TALK_CHOICES: StoryChoice[] = TALK_ORDER.map((a) => ({
  id: a,
  label: TALK_APPROACHES[a].label,
  icon: TALK_APPROACHES[a].icon,
  hint: TALK_APPROACHES[a].description,
}));

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

  // Um evento pendente abre sozinho assim que nada mais estiver na tela (ex.: depois do resumo).
  useEffect(() => {
    if (game?.pendingEvent && overlay === null) setOverlay(eventOverlay(game));
  }, [game, overlay]);

  const chooseInEvent = (id: string) => {
    const r = resolveEvent(game!, id);
    setGame(r.state);
    return r;
  };

  const chooseInTalk = (member: MemberId, approach: TalkApproach) => {
    const r = talk(game!, member, approach);
    setGame(r.state);
    return r;
  };

  if (!game) {
    return <TitleScreen saved={saved} onContinue={() => saved && setGame(saved)} onNew={startNew} />;
  }

  const unavailable: Partial<Record<ActivityId, string>> = {};
  if (!game.draft) unavailable.compor = 'Defina uma nova música no painel “Músicas” para poder compor.';
  if (!recordingTarget(game)) unavailable.gravar = 'Não há música composta esperando gravação.';
  const booked = !!game.booking;
  const caption = game.finished
    ? 'Temporada encerrada'
    : game.week === game.maxWeeks
      ? 'Semana 12 — a seletiva do Maré Alta'
      : `Semana ${game.week} — o que a banda vai fazer?`;
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
              <h1>{caption}</h1>
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
                  disabled={booked}
                  unavailable={unavailable}
                  onChoose={(a) => choose(id, a)}
                  onTalk={canTalk(game) ? () => setOverlay({ kind: 'talk', member: id }) : undefined}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="studio__side">
          {!game.finished && <PlanPanel state={game} onAdvance={advance} onOpenEvent={() => setOverlay(eventOverlay(game))} />}
          {!game.finished && <GoalsPanel state={game} />}
          {!game.finished && <ShowsPanel state={game} onBook={(v) => setGame((g) => (g ? setBooking(g, v) : g))} />}
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
      {overlay?.kind === 'event' && (
        <StoryModal
          key={overlay.event.id}
          state={game}
          eyebrow={`Acontecimento · semana ${game.pendingEvent?.week ?? game.week - 1}`}
          title={overlay.event.title}
          cast={overlay.event.cast}
          scene={overlay.event.scene}
          choices={overlay.choices}
          onChoose={chooseInEvent}
          onDone={closeOverlay}
        />
      )}
      {overlay?.kind === 'talk' && (
        <StoryModal
          key={`talk-${overlay.member}`}
          state={game}
          eyebrow="Conversa da semana"
          title={MEMBERS[overlay.member].name}
          cast={[overlay.member]}
          scene={[{ text: TALK_OPENING[overlay.member] }]}
          choices={TALK_CHOICES}
          onChoose={(a) => chooseInTalk(overlay.member, a as TalkApproach)}
          onDone={closeOverlay}
          onCancel={closeOverlay}
        />
      )}
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
