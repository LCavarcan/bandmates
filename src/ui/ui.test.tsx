// Teste de fumaça da interface: renderiza cada tela com estados reais de campanha.
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
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
import { StudioBackdrop } from './art/StudioBackdrop';

const noop = () => {};

function playWeeks(n: number): { state: GameState; report: WeekReport } {
  const { state, reports } = playCampaign(
    createNewGame(99),
    { concept: { genre: 'punk', theme: 'liberdade', direction: 'emocional', leader: 'bia' } },
    n,
  );
  return { state, report: reports[reports.length - 1] };
}

describe('interface', () => {
  it('renderiza a tela de título com e sem save', () => {
    expect(renderToString(<TitleScreen saved={null} onContinue={noop} onNew={noop} />)).toContain('Bandmates');
    const html = renderToString(<TitleScreen saved={playWeeks(2).state} onContinue={noop} onNew={noop} />);
    expect(html).toContain('Continuar');
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
        <PlanPanel state={state} onAdvance={noop} />
        <SongsPanel state={state} onNewSong={noop} onToggleRelease={noop} />
        <RelationsPanel state={state} />
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

  it('renderiza o fim da temporada', () => {
    const { state } = playWeeks(12);
    expect(state.finished).toBe(true);
    expect(renderToString(<SeasonEnd state={state} onNew={noop} onMenu={noop} />)).toContain('Fim da temporada');
  });
});
