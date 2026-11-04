# Roadmap de evolução — Bandmates

> **Versão de referência:** 0.5.1 (commit `ddd3588`), publicada em <https://lcavarcan.github.io/bandmates/>.
> **Documentos irmãos:** [VISION.md](VISION.md) (para onde vamos) · [BACKLOG.md](BACKLOG.md) (tarefas menores) · [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md) (como medir).
>
> Este roadmap **substitui**, para planejamento futuro, a seção "Próximos passos possíveis" de [projeto/roadmap.md](../projeto/roadmap.md), que passa a ser o histórico das fases do MVP (ver tarefa F0-06).

## Como ler

| Campo | Valores |
|---|---|
| **Prioridade** | **P0** compromete a experiência atual ou bloqueia decisões · **P1** alto valor, fazer na próxima versão · **P2** bom, pode esperar · **P3** ideia, só se houver folga e evidência |
| **Impacto / Complexidade** | baixo · médio · alto |
| **Tamanho** | XS (uma sessão curta) · S · M · L · XL (várias semanas de trabalho em partes) |
| **Independente** | ✅ pode ser feita isoladamente · 🔗 depende de outra tarefa |
| **Horizonte** | **Agora** (v0.6) · **Próxima versão** (v0.7–0.8) · **Pode esperar** (v0.9+) · **Ideia futura** (sem compromisso) |

Tamanhos são relativos, não estimativas em horas. "Cálculo pelas fórmulas" indica uma conta feita a partir do código, **não** um resultado de partida — tudo assim marcado precisa ser confirmado em [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md).

---

## 1. Diagnóstico do estado atual

A auditoria comparou documentação, código e testes. Referências de arquivo são relativas à raiz do repositório.

### 1.1 Implementado e funcionando (sustentado por testes)

| Sistema | Onde | Evidência |
|---|---|---|
| Ciclo semanal determinístico (6 atividades + show, aluguel, alertas) | `src/engine/week.ts` | `engine.test.ts` (avanço, imutabilidade, determinismo, fim da campanha) |
| Personagens: 4 habilidades, traços, 3 emoções, gostos de gênero/tema | `src/data/members.ts`, `src/engine/changes.ts` | testes de atividades por traço |
| Relações em 4 dimensões, interações em dupla por regras de traço | `src/engine/relations.ts` | `engine.test.ts`, `events.test.ts` |
| Composição com conceito (gênero, tema, direção, líder), reações, atributos | `src/engine/music.ts`, `src/data/music.ts` | `music.test.ts` (caminhos diferentes, líder, bônus) |
| Gravação, nota final, lançamento, recepção, streaming com decaimento | `src/engine/music.ts` | `music.test.ts` |
| Eventos orientados a dados: 15 principais + 6 continuações, condições, desfechos condicionais, agendamento, modificadores | `src/data/events.ts`, `src/engine/events.ts`, `src/engine/narrative.ts` | `events.test.ts` (validade dos dados, disparo, bloqueio, continuação, modificador) |
| Conversa semanal (3 abordagens × 4 integrantes) | `src/engine/talk.ts`, `src/data/talks.ts` | `events.test.ts` |
| Shows (4 casas), setlist com covers, seletiva do festival na semana 12, 7 metas, epílogos | `src/engine/shows.ts`, `src/data/venues.ts`, `src/data/campaign.ts` | `campaign.test.ts` |
| Romance opcional Lia & Nina com teste de reciprocidade e amizade como final | `src/data/events.ts` (bloco "Arco romântico") | `campaign.test.ts` |
| Saves v1→v4 com migração, validação estrutural, exportar/importar | `src/engine/save.ts`, `src/ui/saveFile.ts` | `engine.test.ts`, `music.test.ts`, `events.test.ts`, `campaign.test.ts` |
| Build offline em arquivo único com checagem de URLs externas | `scripts/build-arquivo.mjs` | execução do script |
| Publicação automática com testes antes do deploy | `.github/workflows/pages.yml` | execução bem-sucedida no GitHub |

**88 testes** em 5 arquivos. A interface é testada por renderização estática (`renderToString`), com falha em qualquer `console.error`/`console.warn`.

### 1.2 Parcialmente implementado

| Item | O que existe | O que falta |
|---|---|---|
| **Consequências narrativas tardias** | 22 flags são gravadas por eventos | **11 nunca são lidas** por nenhuma condição: `banda_sabe`, `bia_combinou`, `bia_pensou`, `escondeu_resenha`, `fez_jingle`, `leu_caderno`, `lia_segredo_compartilhado`, `lia_vai_falar`, `mentiu_caderno`, `nina_recuou`, `respeitou_caderno`. Escolhas como mentir sobre o caderno ou fazer o jingle **não têm consequência posterior**. |
| **Histórico da temporada** | `state.history` guarda os relatórios das semanas (`week.ts`) | **Nenhuma tela o exibe** (busca em `src/ui`): ao fechar o resumo, a informação some para a jogadora. Ver [BACKLOG B-I02](BACKLOG.md#interface). |
| **Arcos individuais** | Eventos isolados tocam o conflito de cada uma (ex.: *O refrão*, *"Meu som novo"* → Júlia; *A resenha* → Lia; *A ligação* → Bia; *Duas da manhã* → Nina) e epílogos leem flags | Não há estrutura de arco com etapas e resolução; o conflito declarado de cada personagem em [personagens](../design/personagens.md) não tem começo-meio-fim garantido. |
| **Tela de resultado de shows e lançamentos** | Resultados aparecem como entradas do resumo semanal (`WeekReportModal.tsx`) | Não há um "momento" dedicado — o maior evento da semana divide espaço com o aluguel. |
| **Layout para celular** | CSS dedicado ≤ 700px, barra de ação, modais em tela cheia (`styles.css`, `MobileActionBar.tsx`) | **Nunca verificado num aparelho** pelo desenvolvimento (ver [qualidade](../projeto/qualidade.md)). |
| **Arquivo único** | Estrutura conferida pelo script | **Nunca aberto** em navegador via `file://` durante o desenvolvimento. |

### 1.3 Documentação × implementação

| Divergência | Documento | Realidade no código |
|---|---|---|
| Lista de flags "reservadas para expansões" cita 4 | [eventos](../mecanicas/eventos.md) | São 11 flags sem leitura (lista acima). |
| "Os shows são a principal fonte de dinheiro" | [economia](../mecanicas/economia.md) | **Cálculo pelas fórmulas:** no Bar do Zé, com 30 fãs, reputação 5 e setlist só de covers, a nota fica perto de 38–51; o show rende ~R$ 208 ocupando as **quatro** integrantes, enquanto quatro trabalhos extras rendem R$ 440–560. A afirmação só vale em casas maiores ou com mais fãs — a confirmar. |
| README cita "Versão 0.5.0" | `README.md` | `package.json` está em 0.5.1. |
| Dois roadmaps | [projeto/roadmap.md](../projeto/roadmap.md) e este documento | Precisam de papéis distintos (histórico × planejamento). |
| Páginas novas fora da navegação | `mkdocs.yml` | `docs/roadmap/*` ainda não está no `nav` (não alterado nesta tarefa, por instrução). |

### 1.4 Implementado, mas precisa de refinamento

- **Conversa sem memória.** `talk.ts` só registra `talkedWeek`; a mesma abordagem com a mesma pessoa rende sempre igual. Ex.: "Perguntar como ela está" alivia 8–10 de estresse toda semana, de graça — pode tornar o descanso menos necessário (hipótese).
- **Caixa negativo quase sem custo.** Única consequência: −4 motivação e +4 estresse por semana (`week.ts`). Nenhum gasto é bloqueado (`planIssues` não olha o caixa). A pressão financeira pode ser mais fraca do que a documentação sugere.
- **Continuidade de identidade desestimula experimentar gêneros.** `finalizeSong` dá até +15 de identidade pela fração de músicas anteriores do mesmo gênero e +10 pela mesma direção. Coerente com "identidade da banda", mas contrário ao objetivo "incentivo para experimentar".
- **Setlist de 4 × poucas músicas por campanha.** **Cálculo pelas fórmulas:** a Lia sozinha leva ~4 semanas por música; com arranjadora, ~3. Em 12 semanas, com shows e gravações ocupando semanas, a banda tende a ter 2–3 músicas — o setlist de 4 provavelmente leva **covers durante a campanha inteira**, o que reduz fãs e reputação de todos os shows.
- **Expressões dos retratos não acompanham a cena.** `StoryModal.tsx` congela o humor calculado das estatísticas; `DialogueLine` não tem campo de expressão. Uma cena em que a Nina "ri alto pela primeira vez em semanas" pode mostrá-la "cansada".
- **Resumo semanal longo.** Até ~13 entradas por semana (4 individuais + até 6 duplas + banda + streaming + alertas) com o mesmo peso visual.
- **Divulgar parece forte para fãs no início.** **Cálculo pelas fórmulas:** Júlia divulgando gera ~20 fãs por R$ 40; um show no bar com covers gera ~2 fãs.

### 1.5 Tecnicamente frágil

| Fragilidade | Risco | Onde |
|---|---|---|
| **Continuações agendadas para o fim da temporada se perdem.** Eventos não disparam na semana 12 (`if (s.week < s.maxWeeks)`), e uma continuação que perde a disputa é empurrada para a semana seguinte. Ex.: escolher **"Espere"** no romance agenda *No telhado* para a semana 9 e *As outras perceberam* para a 11, que perde para a *Véspera* (prioridade 10 × 9) e vai para a 12 — **nunca aparece**. | Conteúdo escrito que a jogadora não vê; arco incompleto | `src/engine/events.ts`, `src/engine/week.ts` |
| Balanceamento do festival testado com **uma única semente** e um único bot | Ajustes podem "passar no teste" por acaso | `src/engine/campaign.test.ts` |
| Bot sempre escolhe a **primeira** opção de cada evento | Desfechos das demais opções só são validados por aplicação isolada, não em campanha | `src/engine/bot.ts` |
| Sem testes de interação (fluxos de clique, abertura automática de eventos, importação) | Regressões de UI só aparecem jogando | `src/ui/ui.test.tsx` |
| `build-arquivo.mjs` depende do formato exato do HTML gerado pelo Vite | Atualização do Vite pode quebrar o build único (falha de forma explícita, não silenciosa) | `scripts/build-arquivo.mjs` |
| Material for MkDocs entra em fim de vida em maio de 2027 | Documentação deixa de receber correções | `mkdocs.yml`, `requirements-docs.txt` |
| Repositório público **sem licença** | Legalmente "todos os direitos reservados"; contribuições e reuso indefinidos | raiz do repositório |
| `src/data/events.ts` com 1.371 linhas num arquivo | Edição e revisão de conteúdo ficam difíceis conforme cresce | `src/data/events.ts` |

### 1.6 Faltando para uma experiência completa

- **Onboarding.** Não há tutorial nem dicas contextuais na primeira semana (nenhuma ocorrência em `src/ui`); a jogadora encontra 24 botões de atividade e 6 painéis de uma vez.
- **Som.** Nenhum áudio no jogo (nenhuma ocorrência de `AudioContext`/arquivos de áudio). Para um jogo sobre música, é a maior lacuna de imersão.
- **Momentos de palco.** Show e lançamento — os clímaces da carreira — não têm apresentação própria.
- **Previsão de consequências.** A jogadora não tem leitura qualitativa do que uma combinação deve render antes de avançar (só a previsão de caixa).
- **Arcos de amizade/rivalidade com fechamento** além do romance.
- **Licença** do código e do conteúdo.

---

## 2. Avaliação como produto

Avaliação crítica a partir do código e das fórmulas. Itens marcados com 🔬 são hipóteses que [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md) deve confirmar ou derrubar.

### Gameplay e gerenciamento
- **O ciclo é claro, mas corre o risco de virar rotina.** O plano persiste entre semanas (bom: poucos cliques), o que pode levar ao "deixa como está e avança". Faltam *pressões variáveis* que obriguem a repensar o plano — hoje elas vêm quase só de eventos.
- **Decisões relevantes existem** (quem compõe junto, quando descansar, quando fazer show), mas várias têm resposta provavelmente óbvia 🔬: divulgar com a Júlia, trabalho extra com quem não está compondo, conversa "ouvir" com quem está mais estressada.
- **Estratégia dominante possível** 🔬: "Lia lidera indie emocional + Júlia divulga + resto em trabalho extra/ensaio" parece forte em todas as frentes; precisa de medição.
- **Progressão perceptível**: habilidades sobem devagar (retorno decrescente), casas maiores exigem fãs e reputação — há progressão, mas o "salto" (primeira casa nova, primeira música aclamada) não é celebrado.

### Composição e carreira
- **As escolhas artísticas têm consequências reais e testadas** (apelo × originalidade × identidade). É o sistema mais sólido do jogo.
- **Pouca variedade percebida**: a música vira seis números num cartão. Falta *o que* ela é (um verso, uma capa, um som).
- **Experimentar gêneros é desincentivado** pela continuidade de identidade (ver 1.4). Isso pode ser intencional, mas hoje não há recompensa compensatória.
- **Show × lançamento**: são mecanicamente diferentes (semana inteira × botão), bom. Mas o show inicial com covers é fraco 🔬 e repetitivo (setlist automático).

### Personagens e relacionamentos
- **Personalidade influencia a gameplay de forma consistente** (descanso da Nina, atraso da Bia, sensibilidade da Lia, ambição da Júlia). Bem resolvido.
- **Relações evoluem**, mas a jogadora vê barras pequenas e rótulos; **mudanças da semana não são destacadas**, então a evolução pode passar despercebida.
- **Conflitos e reconciliações existem** (*Quarenta minutos* → *De novo*), mas são pontuais.
- **Arcos próprios são incompletos** (ver 1.2). Hoje cada personagem tem *cenas*, não *trajetórias*.
- **O romance é coerente, opcional e recíproco** — mas é **o único arco com estrutura completa**, o que contraria o princípio de que romance não deve ser o caminho principal para desenvolver relações.

### Narrativa e rejogabilidade
- **Ritmo**: no máximo um evento por semana em 11 semanas, com *O cartaz* e *Véspera* fixos → 9 vagas para 19 eventos/continuações. Boa variedade entre partidas, mas arcos longos (romance: até 5 cenas) disputam vagas com o resto 🔬.
- **As escolhas importam no momento**, menos depois (11 flags sem leitura).
- **Motivos para jogar de novo**: eventos diferentes, 3 resultados de festival, epílogos por personagem. Razoável para um MVP; insuficiente para um 1.0 — falta variação de *ponto de partida* e de *estratégia viável* 🔬.
- **Finais**: epílogos combinam 4 personagens × 4 variações + romance; o resultado do festival é o eixo dominante.

### Interface e apresentação
- **Identidade visual existe** (paleta noturna, cor por personagem, SVGs originais) e é consistente.
- **Densidade alta**: cartas com 3 medidores + 4 habilidades + 6 botões; painel lateral com até 6 seções. Funciona no PC; no celular, a rolagem é longa 🔬.
- **Telas que merecem redesenho**: resumo semanal (hierarquia), painel de relações (6 pares × 4 barras), resultado de show/lançamento (inexistente como tela).
- **Maior impacto com menor esforço**: expressão por fala nas cenas (dado + 2–3 expressões novas no SVG), destaque das 2–3 coisas mais importantes da semana, e um momento visual curto para show/lançamento.

---

## 3. Visão de longo prazo e objetivos de produto

Visão completa em [VISION.md](VISION.md). Objetivos verificáveis para chegar ao 1.0:

| # | Objetivo | Como medir (ver [validação](GAMEPLAY_VALIDATION.md)) |
|---|---|---|
| O1 | **Pelo menos três estratégias distintas** chegam ao palco alternativo ou melhor | Cenários E1–E6 |
| O2 | **Nenhuma atividade domina**: em campanhas vencedoras, nenhuma atividade ocupa mais de ~40% das semanas-integrante | Métrica M3 |
| O3 | **Cada integrante tem um arco** com início, virada e resolução visíveis em uma campanha típica | Checklist narrativo |
| O4 | **Consequências tardias perceptíveis**: toda flag gravada é lida por algo (evento, epílogo ou modificador) | Teste automático de flags |
| O5 | **Uma campanha nova é perceptivelmente diferente** da anterior (eventos, músicas, final) | Métrica M9 |
| O6 | **Primeira campanha jogável sem ler a documentação** | Teste com pessoa nova (V-ONB) |
| O7 | **Celular é cidadão de primeira classe** | Playtest completo no celular sem bloqueios |
| O8 | **Custo zero mantido** | Checagem de dependências e URLs externas no CI |

---

## 4. Horizontes

| Horizonte | Fases / tarefas | Meta |
|---|---|---|
| **Agora — v0.6 "MVP validado"** | Fase 0 inteira + F1-01, F1-03 | Saber, com dados, o que está desequilibrado; corrigir o que se perde |
| **Próxima versão — v0.7/v0.8 "Núcleo divertido + apresentação"** | Restante da Fase 1, Fase 2 (P1), Fase 3 (F3-01, F3-02, F3-03) | O ciclo semanal gera decisões não óbvias; cenas e palco têm presença |
| **Pode esperar — v0.9** | Fase 2 (P2), Fase 3 (P2), Fase 4, Fase 5 (P2) | Variedade de carreira e de partidas |
| **Ideia futura** | Itens P3 e a seção "Não desenvolver agora" | Só com evidência de que acrescentam |

---

## 5. Fases e tarefas

### Fase 0 — Estabilização e validação do MVP · *Agora*

Objetivo: transformar suposições em dados e eliminar perdas de conteúdo. **Nenhum sistema novo nesta fase.**

#### F0-01 · Playtest manual completo (PC e celular)
- **Descrição:** Jogar duas campanhas completas no PC (versão publicada e `Bandmates.html`) e uma no celular, seguindo o roteiro de [qualidade](../projeto/qualidade.md) e o diário de partida de [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md#6-diario-de-partida). Registrar bugs, confusões e momentos "chatos".
- **Motivação:** Nenhuma tela foi vista pelo desenvolvimento; o layout de celular e o arquivo único nunca foram abertos.
- **Estado atual:** inexistente · **Prioridade:** P0 · **Impacto:** alto · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Dependências:** nenhuma.
- **Critérios de conclusão:** 3 diários preenchidos; lista de bugs priorizada no backlog; [qualidade](../projeto/qualidade.md) atualizada (itens 👀 viram ✅ ou viram bugs).
- **Área:** testes · **Arquivos:** `docs/projeto/qualidade.md`.

#### F0-02 · Não perder continuações no fim da temporada
- **Descrição:** Garantir que continuações agendadas sejam vistas ou conscientemente descartadas. Opções (escolher uma): (a) não agendar além da semana 10 (antecipar para a última vaga possível); (b) permitir que a *Véspera* ceda lugar a uma continuação pendente e entre como fala dentro da cena; (c) ao terminar a temporada, converter continuações pendentes em linhas de epílogo.
- **Motivação:** Hoje o caminho "Espere" do romance perde *As outras perceberam* (ver 1.5).
- **Estado atual:** precisa de refinamento · **Prioridade:** P0 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** XS · ✅
- **Dependências:** nenhuma.
- **Critérios de conclusão:** teste que agenda continuações para as semanas 10, 11 e 12 e verifica que cada uma é exibida ou vira epílogo; documentação de [eventos](../mecanicas/eventos.md) atualizada.
- **Área:** narrativa, arquitetura · **Arquivos:** `src/engine/events.ts`, `src/engine/week.ts`, `src/engine/events.test.ts`.

#### F0-03 · Ferramenta de validação de balanceamento versionada
- **Descrição:** Um script **versionado no repositório** (ex.: `npm run simular`) que joga N sementes × estratégias definidas em [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md#2-estrategias) e imprime as métricas em tabela. Estratégias são parâmetros de um bot (generalizar `src/engine/bot.ts`), incluindo escolhas de evento diferentes da primeira.
- **Motivação:** As perguntas de balanceamento não se respondem com uma partida manual. **Nota de processo:** simulações avulsas e descartáveis não devem ser usadas; a ferramenta precisa ser código revisado, com aprovação prévia da desenvolvedora antes de rodar.
- **Estado atual:** parcial (o bot existe, com uma estratégia e primeira escolha fixa) · **Prioridade:** P0 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · ✅
- **Dependências:** aprovação da desenvolvedora.
- **Critérios de conclusão:** script commitado com documentação; roda ≥ 20 sementes por estratégia; saída inclui todas as métricas M1–M10; nenhum resultado é registrado sem ter sido executado.
- **Área:** testes · **Arquivos:** `src/engine/bot.ts`, novo `scripts/simular.*`, `docs/dev/testes.md`.

#### F0-04 · Executar a validação de gameplay e registrar resultados
- **Descrição:** Rodar os cenários E1–E8 e as perguntas V1–V10 de [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md); registrar resultados reais numa seção datada; classificar cada hipótese 🔬 deste roadmap como confirmada ou descartada.
- **Motivação:** Todo o balanceamento da Fase 1 depende disso.
- **Estado atual:** inexistente · **Prioridade:** P0 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · 🔗
- **Dependências:** F0-01, F0-03.
- **Critérios de conclusão:** todas as perguntas V1–V10 com resposta sustentada por dados; lista de ajustes de balanceamento com número atual × proposto.
- **Área:** testes, gameplay.

#### F0-05 · Testes de balanceamento com várias sementes
- **Descrição:** Converter o teste "jogar bem chega ao palco alternativo" para rodar em várias sementes e exigir uma proporção mínima, em vez de uma semente fixa.
- **Motivação:** Teste com semente única pode passar por sorte (ver 1.5).
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** XS · ✅
- **Dependências:** idealmente F0-03 (reaproveita estratégias).
- **Critérios de conclusão:** teste usa ≥ 10 sementes; limiar documentado; tempo total de `npm test` continua curto.
- **Área:** testes · **Arquivos:** `src/engine/campaign.test.ts`.

#### F0-06 · Consistência da documentação
- **Descrição:** Corrigir as divergências de 1.3: lista completa de flags sem leitura em [eventos](../mecanicas/eventos.md); revisar a afirmação sobre shows em [economia](../mecanicas/economia.md) após F0-04; versão do README; transformar [projeto/roadmap.md](../projeto/roadmap.md) em histórico com link para este documento; adicionar `docs/roadmap/*` ao `nav` do `mkdocs.yml`.
- **Motivação:** Documentação que diverge do código induz decisões erradas.
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Dependências:** a parte de economia depende de F0-04.
- **Critérios de conclusão:** nenhuma divergência da tabela 1.3 permanece; `npm run docs` sem avisos.
- **Área:** documentação.

#### F0-07 · Testes de interação da interface
- **Descrição:** Adicionar testes de fluxo com DOM simulado (ex.: `@testing-library/react` + `jsdom`, ambos MIT — conferir licença antes): escolher atividade, abrir e confirmar a composição, evento abrindo após o resumo, conversa, marcar/cancelar show, importar save inválido.
- **Motivação:** Hoje só há renderização estática; fluxos com estado (efeitos, modais) não são testados.
- **Estado atual:** inexistente · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** M · ✅
- **Dependências:** nenhuma.
- **Critérios de conclusão:** ≥ 6 fluxos cobertos; rodam no CI; licenças registradas em [decisões](../projeto/decisoes.md).
- **Área:** testes · **Arquivos:** `src/ui/*.test.tsx`, `package.json`, `vite.config.ts`.

#### F0-08 · Definir a licença do projeto
- **Descrição:** Decidir e adicionar a licença do **código** (ex.: MIT) e, separadamente, do **conteúdo** (textos, personagens, arte) — por exemplo uma licença Creative Commons, ou manter todos os direitos sobre o conteúdo. Decisão da autora.
- **Motivação:** O repositório é público e não tem licença (1.5).
- **Estado atual:** inexistente · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** XS · ✅
- **Dependências:** decisão da autora.
- **Critérios de conclusão:** arquivo `LICENSE` (e, se aplicável, nota de licença do conteúdo no README); campo `license` no `package.json`.
- **Área:** documentação.

---

### Fase 1 — Núcleo mais divertido · *Agora → Próxima versão*

Objetivo: fazer o ciclo semanal gerar decisões **não óbvias** e integrar os sistemas que hoje correm em paralelo. Ajustes numéricos só depois de F0-04.

#### F1-01 · Rebalancear shows × trabalho extra × divulgação
- **Descrição:** Com os dados de F0-04, ajustar cachê, bilheteria, fãs por show e custo/eficiência de divulgar e trabalho extra, para que cada atividade tenha um papel: trabalho extra = dinheiro rápido com custo emocional; show = dinheiro + fãs + experiência de palco; divulgar = fãs baratos que dependem de presença.
- **Motivação:** 🔬 Shows iniciais parecem pouco recompensadores frente a trabalho extra (1.3) e divulgar parece dominante para fãs (1.4). Se "shows são recompensadores?" for "não", o pilar de carreira enfraquece.
- **Estado atual:** precisa de refinamento · **Prioridade:** P0 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** S · 🔗
- **Dependências:** F0-04.
- **Critérios de conclusão:** metas M3 e M6 de [validação](GAMEPLAY_VALIDATION.md#3-metricas) atingidas; [economia](../mecanicas/economia.md) e [shows](../mecanicas/shows.md) atualizadas; testes de balanceamento verdes.
- **Área:** gameplay · **Arquivos:** `src/data/venues.ts`, `src/data/activities.ts` (`ECONOMY`), `src/engine/shows.ts`.

#### F1-02 · Setlist × produção de músicas
- **Descrição:** Se F0-04 confirmar covers durante a campanha toda: escolher uma das alternativas mais simples — setlist que cresce com o repertório (2 → 3 → 4), ou cover com valor que cai a cada show repetido, ou acelerar a composição em dupla.
- **Motivação:** 🔬 Covers permanentes reduzem fãs e reputação de todos os shows e enfraquecem a ligação "compor → tocar".
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F0-04.
- **Critérios de conclusão:** em campanhas típicas, o último show antes da seletiva tem ≥ 50% de músicas próprias (métrica M7).
- **Área:** gameplay · **Arquivos:** `src/engine/shows.ts`, `src/data/venues.ts`.

#### F1-03 · Eventos de crise disparados pelo estado
- **Descrição:** 4–6 eventos que nascem de situações de gameplay e afetam **mais de um sistema**: esgotamento (estresse ≥ 85 por 2 semanas), aluguel atrasado (caixa muito negativo), briga antes do show (rivalidade alta + show marcado → afeta a nota), integrante pensando em sair (motivação baixa por semanas), química perfeita (sinergia alta compondo → bônus e cena). Usa o sistema de eventos existente (condições já suportam emoção, relação, recurso, atividade).
- **Motivação:** Integração entre sistemas é o maior diferencial possível do jogo (VISION, princípio 2). Hoje o estresse alto gera só um alerta e o caixa negativo quase nada (1.4).
- **Estado atual:** parcial · **Prioridade:** P0 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · ✅
- **Dependências:** nenhuma para escrever; ajuste fino após F0-04. Pode exigir uma condição nova ("há N semanas") — avaliar se uma flag de contagem basta.
- **Critérios de conclusão:** cada evento afeta ≥ 2 sistemas (emoção/relação + música/show/recurso); testes de disparo; aparecem em ≥ 30% das campanhas da estratégia "negligente" (E5) e raramente na "equilibrada".
- **Área:** gameplay, narrativa · **Arquivos:** `src/data/events.ts`, `src/engine/narrative.ts` (se precisar de condição nova).

#### F1-04 · Dar destino às flags sem consequência
- **Descrição:** Para cada uma das 11 flags sem leitura, decidir: ganhar consequência (evento, desfecho condicional, epílogo) **ou** ser removida. Prioridade para escolhas morais visíveis: `mentiu_caderno`, `escondeu_resenha`, `fez_jingle`, `bia_combinou`, `banda_sabe`. Adicionar teste que falha se uma flag gravada não for lida em nenhum lugar (ou estiver numa lista explícita de exceções).
- **Motivação:** "As escolhas narrativas têm consequências perceptíveis?" — hoje metade não tem (1.2).
- **Estado atual:** parcial · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** baixa · **Tamanho:** M · ✅
- **Dependências:** nenhuma (coordenar com F3-01 para não duplicar cenas).
- **Critérios de conclusão:** teste de flags verde; objetivo O4 atingido.
- **Área:** narrativa, testes · **Arquivos:** `src/data/events.ts`, `src/data/campaign.ts`, `src/engine/events.test.ts`.

#### F1-05 · Resumo semanal com hierarquia
- **Descrição:** Abrir o resumo com 2–3 **destaques** (música pronta, show, lançamento, evento de relação mais forte, alerta crítico) e recolher o restante em "detalhes". Destacar mudanças de relação da semana no painel de relações.
- **Motivação:** Até ~13 entradas com o mesmo peso (1.4); consequências se perdem na leitura.
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · ✅
- **Dependências:** nenhuma (F2-02 aproveita o mesmo trabalho).
- **Critérios de conclusão:** playtest relata que o resumo é lido; nenhum dado removido (apenas reorganizado); funciona no celular.
- **Área:** interface · **Arquivos:** `src/ui/components/WeekReportModal.tsx`, `src/engine/week.ts` (marcar importância das entradas), `src/ui/components/RelationsPanel.tsx`.

#### F1-06 · Conversa com memória
- **Descrição:** Retornos decrescentes ao repetir a mesma abordagem com a mesma pessoa em semanas seguidas, e falas que reconhecem a repetição ("De novo essa conversa?"). Registrar a última conversa por integrante.
- **Motivação:** 🔬 Hoje "ouvir" é alívio de estresse gratuito e repetível (1.4); conversas também são a forma mais barata de dar voz às personagens.
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Dependências:** F0-04 para calibrar; pode ser implementada antes.
- **Critérios de conclusão:** teste de retorno decrescente; nova versão do save com migração; métrica M5 (uso de descanso) não cai para zero.
- **Área:** gameplay, narrativa · **Arquivos:** `src/engine/talk.ts`, `src/data/talks.ts`, `src/engine/types.ts`, `src/engine/save.ts`.

#### F1-07 · Pressão real do caixa negativo
- **Descrição:** Definir uma consequência clara para dívida: a partir de um limite (ex.: abaixo de −R$ 300), um evento obrigatório "aluguel atrasado" com escolhas (show de emergência, trabalho extra coletivo, empréstimo com custo em relação). Pode ser um dos eventos de F1-03.
- **Motivação:** Hoje o caixa pode cair indefinidamente com −4 de motivação por semana (1.4).
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F1-03 (mesma infraestrutura), F0-04 (saber se alguém chega lá jogando normalmente).
- **Critérios de conclusão:** pergunta V1 de validação respondida após o ajuste; nenhuma campanha "equilibrada" passa pela crise.
- **Área:** gameplay.

#### F1-08 · Leitura antecipada das decisões
- **Descrição:** Indicações **qualitativas** antes de avançar: na composição, tendências ("mais apelo, menos originalidade"; "Lia vai gostar"); no plano, quem vai interagir e o tom provável (harmonia/atrito/faísca); no show, faixa provável de nota. Sem números exatos, para preservar a surpresa.
- **Motivação:** Princípio 3 da VISION ("se a jogadora não percebe, não existe"); reduz decisões no escuro sem virar planilha.
- **Estado atual:** parcial (previsão de caixa existe) · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · ✅
- **Dependências:** nenhuma; as funções puras do motor já permitem calcular sem efeitos colaterais.
- **Critérios de conclusão:** previsões testadas contra o resultado (a tendência indicada acerta na maioria dos casos); não expõem fórmulas.
- **Área:** interface, gameplay · **Arquivos:** `src/ui/components/ComposeModal.tsx`, `src/ui/components/PlanPanel.tsx`, `src/ui/components/ShowsPanel.tsx`, `src/engine/relations.ts`.

#### F1-09 · Primeira semana guiada
- **Descrição:** Onboarding leve: a cena *O cartaz* termina apontando o primeiro passo; dicas contextuais únicas (primeira música, primeiro show, primeiro evento) que podem ser desligadas.
- **Motivação:** Objetivo O6; hoje não há onboarding (1.6).
- **Estado atual:** inexistente · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Dependências:** F0-01 (saber onde as pessoas travam).
- **Critérios de conclusão:** teste V-ONB com uma pessoa nova termina a semana 3 sem ajuda externa.
- **Área:** interface.

---

### Fase 2 — Apresentação e imersão · *Próxima versão*

Objetivo: dar presença às cenas e aos momentos musicais com o menor custo de assets.

#### F2-01 · Expressão por fala nas cenas
- **Descrição:** Campo opcional de expressão em `DialogueLine` (ex.: `mood: 'rindo'`), aplicado ao retrato da personagem que fala; 2–3 expressões novas no SVG (rindo, emocionada, surpresa). Atualizar eventos existentes onde a emoção da fala é explícita.
- **Motivação:** Retratos hoje contradizem a cena (1.4). Alto impacto emocional, custo baixo.
- **Estado atual:** inexistente · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** baixa · **Tamanho:** M · ✅
- **Dependências:** nenhuma. Define a lista de expressões que F2-07 precisará desenhar.
- **Critérios de conclusão:** retrato da falante muda por fala; testes de dados validam que toda expressão usada existe; nenhuma fala de riso com retrato "cansada".
- **Área:** interface, narrativa · **Arquivos:** `src/engine/types.ts`, `src/ui/art/Portrait.tsx`, `src/ui/components/StoryModal.tsx`, `src/data/events.ts`.

#### F2-02 · Momento de palco e de lançamento
- **Descrição:** Uma tela curta (antes do resumo) para show e lançamento: casa, público, setlist, recepção, uma fala de cada integrante conforme o resultado, números principais. Reaproveita os dados que já existem em `ShowResult`/`ReleaseResult`.
- **Motivação:** São os clímaces da carreira e hoje dividem espaço com o aluguel (1.2).
- **Estado atual:** parcial · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · 🔗
- **Dependências:** F1-05 (hierarquia do resumo).
- **Critérios de conclusão:** aparece em todo show e lançamento; pode ser pulada; legível no celular.
- **Área:** interface · **Arquivos:** novo componente em `src/ui/components/`, `src/data/venues.ts` (falas por faixa), `src/ui/App.tsx`.

#### F2-03 · Identidade das músicas
- **Descrição:** Cada música ganha um **trecho de letra** escolhido de fragmentos escritos à mão (por tema × direção) e uma **capa** gerada em SVG a partir de gênero/direção/semente.
- **Motivação:** A música hoje é seis números (seção 2). Dá o que lembrar e mostrar.
- **Estado atual:** inexistente · **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** M · ✅
- **Dependências:** nenhuma.
- **Critérios de conclusão:** ≥ 3 fragmentos por combinação tema × direção (8 × 3 × 3 = 72 fragmentos mínimos — avaliar o custo de escrita antes de começar); capa determinística por música; save migra.
- **Área:** música, interface · **Arquivos:** `src/data/music.ts`, `src/engine/music.ts`, `src/ui/components/SongsPanel.tsx`.

#### F2-04 · Experimento de áudio procedural (com prazo fixo)
- **Descrição:** Prova de conceito com Web Audio API (nativa do navegador, sem assets): uma vinheta de poucos segundos por música, derivada de gênero, direção e atributos; botão de som desligado por padrão. **Se o resultado não for agradável dentro do prazo, descartar** e registrar a decisão.
- **Motivação:** O jogo sobre música não tem som (1.6). Áudio procedural evita custo de assets e liga o som aos sistemas. Risco real de ficar estranho — por isso é experimento.
- **Estado atual:** inexistente · **Prioridade:** P2 · **Impacto:** alto (se der certo) · **Complexidade:** alta · **Tamanho:** M (prazo fixo) · ✅
- **Dependências:** nenhuma.
- **Critérios de conclusão:** decisão registrada (seguir ou descartar) com base em playtest; se seguir, som respeita preferência de silêncio e não toca sem interação.
- **Área:** música, interface.

#### F2-05 · Painel de relações legível
- **Descrição:** Visualização das 4 integrantes com as 6 ligações (cor/espessura por tom), destaque para mudanças da semana; detalhes por toque.
- **Motivação:** 6 pares × 4 barras é denso e não mostra evolução (seção 2).
- **Estado atual:** precisa de refinamento · **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** M · 🔗
- **Dependências:** F1-05 (registro de mudanças da semana).
- **Critérios de conclusão:** playtest consegue dizer "qual par melhorou esta semana" sem abrir detalhes.
- **Área:** interface · **Arquivos:** `src/ui/components/RelationsPanel.tsx`.

#### F2-06 · Ajustes de layout pós-playtest
- **Descrição:** Corrigir o que F0-01 encontrar no celular e no PC (ordem dos painéis, rolagem, tamanhos).
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F0-01.
- **Critérios de conclusão:** nenhum bug de layout P0/P1 aberto.
- **Área:** interface · **Arquivos:** `src/ui/styles.css`.

#### F2-07 · Arte definitiva das personagens
- **Descrição:** Substituir os SVGs provisórios por arte própria (ou de artista com licença clara), mantendo a interface `Portrait` (`profile`, `mood`, `size`). Formato leve (SVG ou PNG otimizado) e uma imagem por expressão.
- **Motivação:** Personagens são o pilar 1; a arte provisória limita a conexão emocional.
- **Estado atual:** provisório · **Prioridade:** P2 · **Impacto:** alto · **Complexidade:** alta · **Tamanho:** XL · 🔗
- **Dependências:** F2-01 (lista final de expressões).
- **Critérios de conclusão:** todas as expressões cobertas; peso total dos assets compatível com o arquivo único (meta: < 2 MB adicionais); licença registrada.
- **Área:** interface · **Arquivos:** `src/ui/art/`.

---

### Fase 3 — Personagens e narrativa · *Próxima versão → Pode esperar*

Objetivo: transformar cenas soltas em **trajetórias**, com amizade e rivalidade tão bem cuidadas quanto o romance.

#### F3-01 · Arcos individuais com etapas
- **Descrição:** Um arco por integrante, ligado ao conflito declarado em [personagens](../design/personagens.md): Júlia (dividir o protagonismo), Lia (expor-se sem se perder), Bia (assumir compromisso), Nina (conviver com o imprevisto). Cada arco: 3–4 etapas com condições de gameplay, uma virada com escolha e uma **resolução que muda mecânica** (ex.: Júlia resolvida deixa de se ressentir quando não lidera; Nina resolvida descansa melhor). Reaproveitar os eventos existentes como etapas sempre que possível.
- **Motivação:** Objetivo O3; hoje há cenas, não arcos (1.2).
- **Estado atual:** parcial · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** L · ✅
- **Dependências:** F0-02 (não perder etapas finais); coordenar com F1-04.
- **Critérios de conclusão:** em ≥ 70% das campanhas da estratégia equilibrada, cada integrante atinge pelo menos a etapa de virada; a resolução tem efeito testado; epílogos refletem o estado do arco.
- **Área:** narrativa, gameplay · **Arquivos:** `src/data/events.ts` (sugestão: dividir em `src/data/events/*.ts` por arco), `src/data/campaign.ts`.

#### F3-02 · Arcos de amizade e rivalidade
- **Descrição:** Dois arcos não românticos com o mesmo cuidado do romance: Júlia & Lia (rivalidade → respeito, ou ruptura) e Bia & Nina (caos × metrônomo → parceria, ou afastamento). Resultados afetam composição/gravação/palco via relações e modificadores.
- **Motivação:** Princípio 6 da VISION; hoje o romance é o único arco estruturado (seção 2).
- **Estado atual:** parcial (eventos isolados) · **Prioridade:** P1 · **Impacto:** alto · **Complexidade:** média · **Tamanho:** L · ✅
- **Dependências:** F0-02; F3-03 para ritmo.
- **Critérios de conclusão:** cada arco tem pelo menos dois finais distintos com epílogo; ambos alcançáveis em validação.
- **Área:** narrativa.

#### F3-03 · Ritmo narrativo
- **Descrição:** Regras simples de cadência: semanas "calmas" garantidas (sem evento) quando a semana anterior teve evento pesado; arcos em andamento têm prioridade sobre eventos avulsos; limite de etapas de um mesmo arco em semanas seguidas. Medir antes de mudar.
- **Motivação:** 🔬 9 vagas para 19 eventos; arcos longos podem não fechar (seção 2).
- **Estado atual:** precisa de refinamento · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** S · 🔗
- **Dependências:** F0-04 (métrica M8 de eventos por campanha), F3-01, F3-02.
- **Critérios de conclusão:** métrica M8 dentro da meta; nenhum arco iniciado fica sem resolução ou epílogo.
- **Área:** narrativa, arquitetura · **Arquivos:** `src/engine/events.ts`.

#### F3-04 · Epílogos mais distintos
- **Descrição:** Epílogo da banda (além do resultado do festival) que combina união, arcos e caminho musical; epílogos individuais que refletem o estado do arco (F3-01).
- **Motivação:** "Existem finais suficientemente distintos?" — hoje o festival domina o final (seção 2).
- **Estado atual:** parcial · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F3-01, F3-02.
- **Critérios de conclusão:** métrica M9 (finais distintos entre campanhas) dentro da meta.
- **Área:** narrativa · **Arquivos:** `src/data/campaign.ts`, `src/engine/shows.ts` (`epilogue`).

#### F3-05 · Mais eventos de grupo ligados à música
- **Descrição:** Expandir de 15 para ~25 eventos principais, priorizando os que **usam sistemas** (briga na gravação altera a gravação; ensaio sem uma integrante; música de uma integrante sobre outra). Só depois de F3-01–F3-03.
- **Motivação:** Variedade de rejogabilidade, sem diluir a qualidade.
- **Estado atual:** implementado (15) · **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** L · 🔗
- **Dependências:** F3-03.
- **Critérios de conclusão:** cada evento novo passa pelos testes de dados e afeta ≥ 2 sistemas.
- **Área:** narrativa.

#### F3-06 · Segundo romance opcional
- **Descrição:** Avaliar um segundo arco romântico **somente** se os arcos individuais e de amizade estiverem prontos e o playtest mostrar interesse. Candidatas devem nascer das personagens, não da necessidade de ter mais romances.
- **Motivação:** Variedade; mas o risco é inclinar o jogo para dating sim (VISION).
- **Estado atual:** inexistente · **Prioridade:** P3 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** L · 🔗
- **Dependências:** F3-01, F3-02, evidência de playtest.
- **Critérios de conclusão:** mesmo padrão do arco atual (sinais dos dois lados, reciprocidade, amizade como final).
- **Área:** narrativa.

---

### Fase 4 — Carreira musical · *Pode esperar*

Objetivo: mais variedade de carreira **sem sistemas novos pesados** — preferir eventos e dados.

#### F4-01 · Oportunidades como eventos
- **Descrição:** Convites com prazo (rádio universitária, abrir show de outra banda, concurso de demos, festival menor) escritos como eventos com requisitos de fãs/reputação/músicas e efeitos em recursos e relações.
- **Motivação:** Progressão de carreira mais rica usando a infraestrutura narrativa existente (princípio 1 da VISION).
- **Estado atual:** inexistente · **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** M · ✅
- **Dependências:** F1-01 (economia estável).
- **Critérios de conclusão:** ≥ 4 oportunidades; cada uma cria um dilema real (ex.: aceitar exige cancelar o plano da semana).
- **Área:** gameplay, narrativa · **Arquivos:** `src/data/events.ts`.

#### F4-02 · Escolher o setlist e o foco do ensaio
- **Descrição:** Antes do show, escolher as músicas (e a de abertura); no ensaio, escolher qual música lapidar. Padrão automático continua disponível.
- **Motivação:** Mais agência sobre o palco; liga ensaio → show de forma explícita.
- **Estado atual:** automático · **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** M · 🔗
- **Dependências:** F1-02.
- **Critérios de conclusão:** escolha opcional; padrão automático não piora; testes.
- **Área:** gameplay, interface · **Arquivos:** `src/engine/shows.ts`, `src/engine/music.ts` (`rehearsalTarget`), `src/ui/components/ShowsPanel.tsx`.

#### F4-03 · Recompensar a experimentação de gênero
- **Descrição:** Se a validação confirmar que trocar de gênero só é punido, criar uma recompensa compensatória simples (ex.: casas e oportunidades que pedem gêneros específicos; reação positiva de quem ama o gênero novo).
- **Motivação:** 1.4 — continuidade desestimula variedade.
- **Estado atual:** precisa de refinamento · **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F0-04, F4-01.
- **Critérios de conclusão:** em validação, campanhas com 2+ gêneros chegam ao palco alternativo em proporção comparável às de gênero único.
- **Área:** música.

---

### Fase 5 — Rejogabilidade · *Pode esperar*

#### F5-01 · Começos de temporada diferentes
- **Descrição:** 3–4 cenários iniciais definidos em dados (ex.: banda endividada; Júlia e Lia brigadas; um single já lançado; uma integrante esgotada), escolhidos ao iniciar a campanha.
- **Motivação:** Uma segunda campanha precisa *começar* diferente, não só variar eventos (seção 2).
- **Estado atual:** inexistente · **Prioridade:** P2 · **Impacto:** alto · **Complexidade:** baixa · **Tamanho:** M · ✅
- **Dependências:** F1-01 (balanceamento base estável).
- **Critérios de conclusão:** cada cenário é vencível (validação) e produz eventos/arcos diferentes no começo.
- **Área:** gameplay, narrativa · **Arquivos:** `src/engine/state.ts`, novo arquivo de dados.

#### F5-02 · Registro de finais alcançados
- **Descrição:** Galeria local (no navegador) dos resultados de festival, epílogos e arcos já vistos, sem conquistas competitivas.
- **Motivação:** Mostra que existem outros caminhos e convida a jogar de novo.
- **Estado atual:** inexistente · **Prioridade:** P3 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Dependências:** F3-04.
- **Critérios de conclusão:** persiste entre campanhas; exportável junto com o save.
- **Área:** interface.

#### F5-03 · Ajuste de dificuldade
- **Descrição:** Duas ou três opções simples ao iniciar (aluguel, limiar do festival), sem sistema novo.
- **Estado atual:** inexistente · **Prioridade:** P3 · **Impacto:** baixo · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F6-02.
- **Área:** gameplay.

---

### Fase 6 — Polimento e versão 1.0

#### F6-01 · Acessibilidade
- **Descrição:** Contraste conforme WCAG AA, foco visível em todos os controles, navegação completa por teclado, rótulos para leitor de tela nas cartas e cenas, informação nunca só por cor, tamanho de texto ajustável.
- **Estado atual:** parcial (foco, `aria`, movimento reduzido) · **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** média · **Tamanho:** M · ✅
- **Critérios de conclusão:** checklist de acessibilidade documentado e cumprido.
- **Área:** interface.

#### F6-02 · Balanceamento final
- **Descrição:** Repetir a validação completa (F0-04) com todo o conteúdo final.
- **Estado atual:** — · **Prioridade:** P0 (para o 1.0) · **Impacto:** alto · **Complexidade:** média · **Tamanho:** M · 🔗
- **Dependências:** todas as tarefas de gameplay anteriores.
- **Critérios de conclusão:** objetivos O1, O2, O5 atingidos.
- **Área:** gameplay, testes.

#### F6-03 · Revisão de texto
- **Descrição:** Revisão completa de português, consistência de voz das personagens e de termos de interface.
- **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** M · ✅
- **Área:** narrativa, documentação.

#### F6-04 · Desempenho em aparelhos modestos
- **Descrição:** Medir carregamento e fluidez num celular de entrada; reduzir animações e peso se necessário.
- **Prioridade:** P2 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · 🔗
- **Dependências:** F2-07 (assets definitivos).
- **Área:** tecnologia.

#### F6-05 · Futuro da documentação
- **Descrição:** Antes de maio de 2027, migrar do Material for MkDocs (fim de vida) para o sucessor indicado pelo projeto ou para o tema padrão do MkDocs, mantendo build offline.
- **Prioridade:** P2 · **Impacto:** baixo · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Área:** documentação · **Arquivos:** `mkdocs.yml`, `requirements-docs.txt`.

#### F6-06 · Processo de versão
- **Descrição:** Tags de versão, notas de release no changelog, teste de migração para cada versão de save publicada, checagem automática de URLs externas no CI (reaproveitar `build-arquivo.mjs`).
- **Prioridade:** P1 · **Impacto:** médio · **Complexidade:** baixa · **Tamanho:** S · ✅
- **Área:** tecnologia · **Arquivos:** `.github/workflows/pages.yml`, `scripts/build-arquivo.mjs`.

---

## 6. O que não desenvolver agora

| Ideia | Por que não agora |
|---|---|
| **Novos sistemas de gerenciamento** (equipamentos, contratos, agenda detalhada, tipos de fã) | O núcleo atual ainda não foi validado; somariam complexidade sem resolver os problemas de 1.4. Contrário ao princípio 1. |
| **Minigame de ritmo / tocar ao vivo** | Muda o gênero do jogo, tem custo alto de produção e de acessibilidade, e não conversa com os sistemas de relação. |
| **Recrutamento ou troca de integrantes** | As quatro personagens são o produto; cada nova integrante multiplica texto (relações, eventos, epílogos). |
| **Mapa de cidades / turnês** | Escopo grande; as oportunidades como eventos (F4-01) entregam variedade de carreira por uma fração do custo. |
| **Mais romances antes dos arcos individuais e de amizade** | Inclinaria o jogo para dating sim e contrariaria o princípio 6. |
| **Executável (Electron/Tauri)** | O arquivo único e o GitHub Pages já cobrem PC e celular a custo zero; reavaliar só se houver demanda concreta. |
| **Backend, contas, ranking, sincronização em nuvem** | Viola os princípios de custo zero e offline; exportar/importar já resolve a troca de aparelho. |
| **Geração de texto por IA em tempo de execução** | Proibido pela visão (texto escrito à mão) e pela restrição de custo. |
| **Migração de stack** | A arquitetura atual (motor puro + dados + React) atende a todo o roadmap. |
| **Campanha contínua (temporada 2 herdando o estado)** | Atraente, mas multiplica estados a balancear. Ideia futura, depois do 1.0. |

---

## 7. Síntese

### As cinco tarefas mais importantes para começar
1. **F0-01 · Playtest manual completo** — nada foi visto jogando ainda.
2. **F0-03 · Ferramenta de validação versionada** (com aprovação) — sem ela, o balanceamento é chute.
3. **F0-02 · Não perder continuações no fim da temporada** — conteúdo escrito hoje se perde; correção pequena.
4. **F0-04 · Executar a validação** — responde se shows recompensam, se há estratégia dominante e se o dinheiro aperta.
5. **F1-03 · Eventos de crise disparados pelo estado** — o maior ganho de integração entre sistemas com a infraestrutura que já existe.

### As três funcionalidades que mais aumentariam a diversão
1. **Eventos de crise ligados ao estado (F1-03)** — o plano semanal passa a ter consequências que voltam como história, não só como números.
2. **Arcos individuais e de amizade com resolução mecânica (F3-01, F3-02)** — cada personagem vira uma trajetória; escolhas acumulam sentido.
3. **Momento de palco/lançamento + expressão por fala (F2-02, F2-01)** — dá peso emocional aos clímaces e às cenas, com custo baixo.

### Os três maiores riscos
1. **Balanceamento sem dados.** Várias hipóteses 🔬 (shows fracos, divulgar dominante, covers permanentes, conversa como descanso grátis) podem tornar a melhor estratégia óbvia — e isso só aparece medindo.
2. **Custo de conteúdo para uma pessoa.** Cada arco, evento e epílogo é texto escrito à mão, revisado e testado. Expandir rápido demais dilui a qualidade, que é o diferencial do jogo.
3. **Experiência real nunca verificada.** O jogo foi construído e testado sem ser visto: layout, legibilidade, ritmo e diversão ainda são desconhecidos.

### O que não desenvolver neste momento
Tudo da seção 6 — em especial **sistemas novos de gerenciamento**, **minigame de ritmo**, **novas integrantes** e **mais romances** — até que a Fase 0 confirme o que precisa mudar no núcleo.

### Definição de Bandmates 1.0
Bandmates 1.0 está pronto quando:
1. **Objetivos O1–O8** (seção 3) estão atingidos e documentados com dados de validação.
2. **Cada integrante tem um arco completo** e há **dois arcos de amizade/rivalidade**, além do romance opcional; nenhum conteúdo escrito fica inalcançável (teste de flags e de continuações).
3. **Uma pessoa que nunca jogou** completa uma campanha no celular e no PC sem ajuda.
4. **Pelo menos três estratégias** chegam ao palco alternativo, e duas campanhas seguidas terminam com finais perceptivelmente diferentes.
5. **Show e lançamento têm apresentação própria**, e as cenas têm expressão por fala.
6. **Nenhum bug P0/P1 aberto**; acessibilidade básica cumprida; licença definida.
7. **Custo zero e offline** continuam verificados automaticamente no CI.

---

## 8. Manutenção deste roadmap

- Revisar este documento **ao fim de cada fase** e depois de cada rodada de validação.
- Uma tarefa só é marcada como concluída quando **todos** os critérios de conclusão forem verificados — não basta estar documentada.
- Hipóteses 🔬 confirmadas ou descartadas devem ser anotadas aqui com link para os dados em [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md).
- Ideias novas entram primeiro no [BACKLOG.md](BACKLOG.md) e passam pelos princípios de [VISION.md](VISION.md) antes de virar tarefa.
