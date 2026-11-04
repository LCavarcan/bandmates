// Teste de fumaça da interface: renderiza cada tela com estados reais de campanha.
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { MEMBER_ORDER } from '../data/members';
import { createNewGame, startSong } from '../engine';
import { playCampaign } from '../engine/bot';
import type { GameState, WeekReport } from '../engine/types';
import { MemberCard } from './components/MemberCard';
import { SeasonEnd, TitleScreen } from './components/Screens';
import { ComposeModal } from './components/ComposeModal';
import { PlanPanel } from './components/PlanPanel';
import { RelationsPanel } from './components/RelationsPanel';
import { SongsPanel } from './components/SongsPanel';
import { TopBar } from './components/TopBar';
import { EntriesModal, WeekReportModal } from './components/WeekReportModal';
import { StoryModal } from './components/StoryModal';
import { GoalsPanel } from './components/GoalsPanel';
import { ShowsPanel } from './components/ShowsPanel';
import { MobileActionBar } from './components/MobileActionBar';
import { saveFileName } from './saveFile';
import { EVENTS } from '../data/events';
import { StudioBackdrop } from './art/StudioBackdrop';

const noop = () => {};

function playWeeks(n: number): { state: GameState; report: WeekReport } {
  const { state, reports } = playCampaign(
    createNewGame(99),
    { concept: { genre: 'indie', theme: 'saudade', direction: 'emocional', leader: 'lia' } },
    n,
  );
  return { state, report: reports[reports.length - 1] };
}

// Qualquer aviso do React (chaves duplicadas, props inválidas…) apareceria no console do navegador.
let consoleError: MockInstance;
let consoleWarn: MockInstance;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
  consoleWarn = vi.spyOn(console, 'warn');
});
afterEach(() => {
  expect(consoleError, 'console.error durante a renderização').not.toHaveBeenCalled();
  expect(consoleWarn, 'console.warn durante a renderização').not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe('interface', () => {
  it('renderiza a tela de título com e sem save', () => {
    const empty = renderToString(<TitleScreen saved={null} onContinue={noop} onNew={noop} onImport={noop} />);
    expect(empty).toContain('Bandmates');
    expect(empty).toContain('Importar save');
    expect(empty).not.toContain('Exportar save');
    const html = renderToString(<TitleScreen saved={playWeeks(2).state} onContinue={noop} onNew={noop} onImport={noop} />);
    expect(html).toContain('Continuar');
    expect(html).toContain('Exportar save');
  });

  it('renderiza o estúdio depois de algumas semanas', () => {
    const { state, report } = playWeeks(6);
    const html = renderToString(
      <>
        <TopBar state={state} onMenu={noop} />
        <StudioBackdrop week={state.week} />
        {MEMBER_ORDER.map((id) => (
          <MemberCard key={id} member={state.members[id]} activity={state.plan[id]} disabled={false} onChoose={noop} />
        ))}
        <PlanPanel state={state} onAdvance={noop} onOpenEvent={noop} />
        <SongsPanel state={state} onNewSong={noop} onToggleRelease={noop} />
        <RelationsPanel state={state} />
        <GoalsPanel state={state} />
        <ShowsPanel state={state} onBook={noop} />
        <WeekReportModal report={report} onClose={noop} />
      </>,
    );
    for (const name of ['Júlia', 'Lia', 'Bia', 'Nina']) expect(html).toContain(name);
    expect(html).toContain('Semana');
    expect(state.songs.length).toBeGreaterThan(0);
    expect(html).toContain(state.songs[0].title);
  });

  it('renderiza o modal de composição e as reações', () => {
    const s = createNewGame(5);
    expect(renderToString(<ComposeModal state={s} onConfirm={noop} onCancel={noop} />)).toContain('Direção artística');
    const { entries } = startSong(s, { title: 'X', genre: 'pop', theme: 'amor', direction: 'comercial', leader: 'nina' });
    expect(entries.length).toBeGreaterThan(0);
    const html = renderToString(<EntriesModal eyebrow="Nova música" title="X" entries={entries} buttonLabel="ok" onClose={noop} />);
    expect(html).toContain('Lia');
  });

  it('mostra músicas em todos os estados ao longo da campanha', () => {
    const { state } = playWeeks(12);
    const html = renderToString(<SongsPanel state={state} onNewSong={noop} onToggleRelease={noop} />);
    expect(html).toContain('Lançada');
  });

  it('renderiza cada evento como cena', () => {
    const s = createNewGame(5);
    for (const e of EVENTS) {
      const html = renderToString(
        <StoryModal
          state={s}
          eyebrow="Acontecimento"
          title={e.title}
          cast={e.cast}
          scene={e.scene}
          choices={e.choices.map((c) => ({ id: c.id, label: c.label, hint: c.hint }))}
          onChoose={() => ({ result: [], entries: [] })}
          onDone={noop}
        />,
      );
      expect(html).toContain(e.choices[0].label.replace(/"/g, '&quot;'));
    }
  });

  it('barra do celular: avançar, problema do plano ou acontecimento pendente', () => {
    const s = createNewGame(5);
    expect(renderToString(<MobileActionBar state={s} onAdvance={noop} onOpenEvent={noop} />)).toContain('Avançar');
    const blocked = { ...s, plan: { ...s.plan, lia: 'compor' as const } };
    expect(renderToString(<MobileActionBar state={blocked} onAdvance={noop} onOpenEvent={noop} />)).toContain('Defina a nova música');
    const pendingEv = { ...s, pendingEvent: { id: 'o_cartaz', week: 1 } };
    expect(renderToString(<MobileActionBar state={pendingEv} onAdvance={noop} onOpenEvent={noop} />)).toContain('Acontecimento');
  });

  it('atividades bloqueadas continuam tocáveis (para mostrar o motivo no celular)', () => {
    const s = createNewGame(5);
    const html = renderToString(
      <MemberCard member={s.members.lia} activity="ensaiar" disabled={false} unavailable={{ compor: 'Defina uma música.' }} onChoose={noop} talkNote="Conversa da semana já feita" />,
    );
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('Conversa da semana já feita');
  });

  it('nome do arquivo de backup indica a semana', () => {
    expect(saveFileName({ ...createNewGame(5), week: 7 })).toMatch(/^bandmates-semana-7-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('renderiza o fim da temporada', () => {
    const { state } = playWeeks(12);
    expect(state.finished).toBe(true);
    expect(state.festival).not.toBeNull();
    const html = renderToString(<SeasonEnd state={state} onNew={noop} onMenu={noop} />);
    expect(html).toContain('Avaliação do júri');
    expect(html).toContain('Epílogo');
    expect(renderToString(<ShowsPanel state={{ ...state, finished: false, booking: { venue: 'festival' } }} onBook={noop} />)).toContain('seletiva');
  });
});
