// Teste de fumaça da interface: renderiza cada tela com estados reais de campanha.
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MEMBER_ORDER } from '../data/members';
import { advanceWeek, createNewGame, setActivity } from '../engine';
import type { GameState, WeekReport } from '../engine/types';
import { MemberCard } from './components/MemberCard';
import { SeasonEnd, TitleScreen } from './components/Screens';
import { PlanPanel, RelationsPanel, SongsPanel } from './components/SidePanel';
import { TopBar } from './components/TopBar';
import { WeekReportModal } from './components/WeekReportModal';
import { StudioBackdrop } from './art/StudioBackdrop';

const noop = () => {};

function playWeeks(n: number): { state: GameState; report: WeekReport } {
  let s = createNewGame(99);
  s = setActivity(setActivity(s, 'bia', 'compor'), 'julia', 'divulgar');
  let report!: WeekReport;
  for (let i = 0; i < n; i++) ({ state: s, report } = advanceWeek(s));
  return { state: s, report };
}

describe('interface', () => {
  it('renderiza a tela de título com e sem save', () => {
    expect(renderToString(<TitleScreen saved={null} onContinue={noop} onNew={noop} />)).toContain('Bandmates');
    const html = renderToString(<TitleScreen saved={playWeeks(2).state} onContinue={noop} onNew={noop} />);
    expect(html).toContain('Continuar');
  });

  it('renderiza o estúdio depois de algumas semanas', () => {
    const { state, report } = playWeeks(4);
    const html = renderToString(
      <>
        <TopBar state={state} onMenu={noop} />
        <StudioBackdrop week={state.week} />
        {MEMBER_ORDER.map((id) => (
          <MemberCard key={id} member={state.members[id]} activity={state.plan[id]} disabled={false} onChoose={noop} />
        ))}
        <PlanPanel state={state} onAdvance={noop} />
        <SongsPanel state={state} />
        <RelationsPanel state={state} />
        <WeekReportModal report={report} onClose={noop} />
      </>,
    );
    for (const name of ['Júlia', 'Lia', 'Bia', 'Nina']) expect(html).toContain(name);
    expect(html).toContain('Semana');
    expect(state.songs.length).toBeGreaterThan(0);
    expect(html).toContain(state.songs[0].title);
  });

  it('renderiza o fim da temporada', () => {
    const { state } = playWeeks(12);
    expect(state.finished).toBe(true);
    expect(renderToString(<SeasonEnd state={state} onNew={noop} onMenu={noop} />)).toContain('Fim da temporada');
  });
});
