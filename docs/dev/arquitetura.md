# Arquitetura

O projeto usa TypeScript, React 19 e Vite, sem bibliotecas de estado nem de roteamento.

```
src/
  engine/              motor do jogo (não importa React)
    types.ts           tipos do estado e do relatório
    state.ts           createNewGame, setActivity, SAVE_VERSION
    week.ts            advanceWeek: resolução da semana
    music.ts           conceito, composição, gravação, lançamento, streaming
    relations.ts       sinergia, interações em dupla, rótulos
    narrative.ts       avaliador de condições e aplicador de efeitos (dados → estado)
    events.ts          seleção e resolução de eventos
    talk.ts            conversa da semana
    shows.ts           agendamento, show, metas, festival, epílogos
    changes.ts         MemberChanges: aplica e registra deltas
    save.ts            serialização, versão e migrações
    rng.ts             gerador pseudoaleatório com semente (mulberry32)
    bot.ts             jogadora automática (só para testes)
    index.ts           API pública do motor
  data/                conteúdo (sem lógica)
    members.ts         integrantes, traços, gostos, relações iniciais
    activities.ts      atividades, economia, falas, títulos
    music.ts           gêneros, temas, direções, recepção, reações
    pairs.ts           falas de dupla
    events.ts          eventos narrativos (cenas, escolhas, desfechos)
    talks.ts           conversas por personagem e abordagem
    dsl.ts             atalhos para escrever eventos como dados
    venues.ts          casas de show e faixas de nota
    campaign.ts        metas, pesos do júri, resultados, epílogos
    labels.ts          rótulos de interface
  ui/
    App.tsx            orquestra o estado e os modais
    ErrorBoundary.tsx  saída segura se a renderização falhar
    saveFile.ts        exportar/importar o save como arquivo
    art/               retratos e cenário em SVG (substituíveis)
    components/        telas e painéis
    styles.css         identidade visual (inclui o layout para celular, ≤ 700px)
scripts/
  build-arquivo.mjs    empacota dist/ num único Bandmates.html e confere se não há URL externa
```

## Princípios

### O motor é puro

A interface chama funções que **recebem o estado e devolvem um novo estado**, sem mutar o anterior:

| Função | Retorno |
|---|---|
| `advanceWeek(state)` | `{ state, report }` |
| `startSong(state, concept)` | `{ state, entries }` (reações) |
| `setActivity`, `setRelease` | novo estado |
| `planIssues(state)` | lista de problemas que bloqueiam o avanço |
| `resolveEvent(state, choiceId)` | `{ state, result, entries }` |
| `talk(state, member, approach)` | `{ state, result, entries }` |
| `setBooking(state, venue \| null)` | novo estado (a banda inteira escalada) |
| `festivalResult`, `epilogue`, `goalsStatus` | leitura do estado |

Internamente, `advanceWeek` faz um `structuredClone` e trabalha na cópia.

### Determinismo

A semente do RNG faz parte do estado. Com a mesma semente e as mesmas decisões, o resultado é idêntico. Isso facilita testes, reprodução de bugs e balanceamento.

### Dados separados da lógica

Personagens, falas, gêneros, temas, eventos, conversas e constantes ficam em `src/data/`. Os eventos são **dados puros**: condições e efeitos são objetos, não funções, e o motor os interpreta em `narrative.ts`. Adicionar uma fala, um título ou um tema não exige mexer no motor.

### A interface só apresenta

Os componentes leem o estado e chamam o motor. Nenhuma regra de jogo vive na interface. A única exceção são rótulos visuais, como a expressão do retrato.

## Fluxo de uma semana

```
MemberCard (escolhe atividade) ──► setActivity ──► estado
SongsPanel  (Nova música)      ──► ComposeModal ──► startSong ──► EntriesModal (reações)
SongsPanel  (Lançar)           ──► setRelease
MemberCard  (Conversar)         ──► StoryModal ──► talk
PlanPanel   (Avançar)          ──► advanceWeek ──► WeekReportModal
                                                  └► pendingEvent? ──► StoryModal ──► resolveEvent
                                                  └► salvamento automático (useEffect)
```
