# Backlog — Bandmates

> Tarefas menores e melhorias que **não** precisam entrar agora no [ROADMAP](ROADMAP.md). Um item sobe para o roadmap quando ganha evidência (playtest, [validação](GAMEPLAY_VALIDATION.md)) ou quando uma tarefa do roadmap passa a depender dele.
>
> **Prioridade:** P1 próximo a ser puxado · P2 desejável · P3 ideia. **Tamanho:** XS · S · M · L. Itens com ⚠️ têm ressalva de design: talvez não valham a pena.

## Gameplay

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-G01 | Aviso de esgotamento iminente ("Nina chega a 85 de estresse se ensaiar de novo") no plano da semana | P1 | XS | Estende a previsão de F1-08; cálculo já é determinístico |
| B-G02 | Retorno decrescente para divulgar várias semanas seguidas | P2 | S | Só se V7/V2 confirmarem que divulgar domina (ROADMAP F1-01) |
| B-G03 | Leve queda de fãs se a banda passar ~4 semanas sem show nem lançamento | P3 | S | ⚠️ Mais uma pressão; avaliar se não vira punição sem aviso |
| B-G04 | Variações do trabalho extra (aula, café, freela) com pequenos efeitos em habilidades | P3 | S | ⚠️ Dá cor, mas aumenta texto e números; preferir só falas novas (B-N01) |
| B-G05 | Predefinições de plano ("semana de composição", "semana de show") | P3 | XS | Reduz cliques; reavaliar após playtest |

### Retorno do playtest (04/11/2026, celular, 1 campanha)

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-G06 | **Campanha curta demais.** Depois da seletiva, continuar: preparação para as fases do festival, um concurso, outros festivais, até a banda ser reconhecida mundialmente — ou não | P1 | XL | ⚠️ Conflita com ROADMAP §6 ("campanha contínua… depois do 1.0"). Precisa de decisão da autora e, se aprovada, virar fase própria no roadmap |
| B-M06 ✅ | **Compatibilidade tema × gênero revelada só depois.** Esconder o ✦ na composição; mostrar a compatibilidade no fim da música e lembrar as combinações já descobertas | P1 | S | Hoje o ✦ aparece antes (`src/ui/components/ComposeModal.tsx`). Transforma a escolha em experimentação; conversa com F4-03. **Feito em 04/11/2026** (ver [música](../mecanicas/musica.md#generos)) |

## Narrativa

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-N01 | Dobrar as falas de atividade (hoje 2 por integrante e atividade em `src/data/activities.ts`) | P1 | M | Repetição é visível em 12 semanas; barato e de alto efeito |
| B-N02 | Mais falas de dupla por tom (hoje 1–2 em `src/data/pairs.ts`) | P2 | S | Mesmo motivo |
| B-N03 | Variar as falas de reação às escolhas musicais (`REACTIONS` em `src/data/music.ts`) | P2 | S | |
| B-N04 | Segunda chance do arco Lia & Nina se a Nina recuou (`nina_recuou`) | P2 | S | Parte de ROADMAP F1-04 |
| B-N05 | Cena curta de comemoração na primeira música aclamada ou hit | P2 | S | Pode ser absorvida por ROADMAP F2-02 |
| B-N06 | Conversas com duas ou três trocas em vez de uma resposta | P3 | M | ⚠️ Multiplica texto (4 integrantes × 3 abordagens × ramos) |

## Personagens

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-P01 | Tocar num traço mostra o que ele faz no jogo ("Perfeccionista: estressa mais ao ensaiar") | P1 | XS | Torna a personalidade legível; sem mudar regras |
| B-P02 | "O que ela quer agora" na carta, ligado à etapa do arco | P2 | S | Depende de ROADMAP F3-01 |
| B-P03 | "Por que ela está assim?" — últimas causas de mudança de humor ao tocar no humor | P2 | S | Usa `state.history`, hoje sem uso na interface |

## Música e carreira

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-M01 | Renomear uma música depois de pronta | P3 | XS | |
| B-M02 | Histórico de streaming por música (barra simples por semana) | P3 | S | |
| B-M03 | Covers com nomes fictícios no setlist exibido | P3 | XS | Dá textura ao show sem regra nova |
| B-M04 | Lançar duas músicas juntas como EP | P3 | M | ⚠️ Provavelmente desnecessário com 2–3 músicas por campanha |
| B-M05 | Marcar uma música como "favorita" para o setlist | P3 | XS | Depende de ROADMAP F4-02 |

## Interface

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-I01 | Números flutuantes (+3, −5) nos medidores quando mudam | P2 | S | Feedback barato; respeitar `prefers-reduced-motion` |
| B-I02 | Diário da temporada: tela com os resumos das semanas anteriores (`state.history`) | P1 | S | Dado já existe e é guardado; só falta exibir |
| B-I03 | "Como jogar" acessível pelo menu | P2 | S | Complementa ROADMAP F1-09 |
| B-I04 | Ordem dos painéis no celular (plano e metas antes de músicas e relações) | P2 | XS | Esperar ROADMAP F0-01 |
| B-I05 | Atalhos de teclado (1–6 para atividades, Enter para avançar) | P3 | S | |
| B-I06 | Modo claro | P3 | S | ⚠️ A identidade visual é noturna; baixo valor |

## Tecnologia

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-T01 | Dividir `src/data/events.ts` (1.371 linhas) em arquivos por arco/tema | P2 | S | Fazer junto com ROADMAP F3-01 |
| B-T02 | Tipar as migrações de save (hoje usam `any` em `src/engine/save.ts`) | P3 | S | |
| B-T03 | Atualizações automáticas de dependências e actions (Dependabot, gratuito) | P2 | XS | Revisar licença de cada atualização |
| B-T04 | Semente na URL (`?seed=`) para reproduzir bugs | P3 | XS | Só em modo de desenvolvimento |
| B-T05 | Vários slots de save locais | P3 | S | Exportar/importar já cobre o essencial |
| B-T06 | Teste automático que abre `Bandmates.html` num navegador headless no CI | P3 | M | ⚠️ Exige baixar um navegador no CI (gratuito, mas lento); avaliar depois de F0-01 |

## Testes e qualidade

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-Q01 | Teste: nenhum texto exibido mantém marcador não substituído (`{a}`, `{n}`, `{t}`…) | P1 | XS | |
| B-Q02 | Teste: toda escolha de evento está disponível em pelo menos um estado em que o evento dispara | P2 | S | Evita escolhas sempre trancadas |
| B-Q03 | Saves reais exportados de cada versão como fixtures de migração | P1 | S | Complementa ROADMAP F6-06 |
| B-Q04 | Teste: todo evento principal é alcançável a partir de algum estado construído | P2 | M | |
| B-Q05 | Teste de flags gravadas × lidas | — | — | Coberto por ROADMAP F1-04 |

## Documentação

| ID | Item | Prior. | Tam. | Notas |
|---|---|---|---|---|
| B-D01 | Guia de voz das personagens (como cada uma fala, exemplos e o que evitar) | P1 | S | Base para todo conteúdo novo |
| B-D02 | Capturas de tela na documentação | P2 | XS | Depois de ROADMAP F0-01 |
| B-D03 | Glossário (mf, sinergia, lapidação, união, entrosamento) | P3 | XS | |
| B-D04 | Atualizar [qualidade](../projeto/qualidade.md) após cada playtest | P1 | XS | Processo contínuo |

## Considerado e desaconselhado (por enquanto)

| Ideia | Motivo |
|---|---|
| Inventário de equipamentos e loja | Economia mais detalhada sem decisão nova; ver [VISION](VISION.md) "o que não pretende ser" |
| Tipos de fã (casual, fiel, crítico) | Uma terceira camada sobre fãs e reputação, sem mostrar valor antes |
| Minigame de ritmo | Muda o gênero do jogo; custo alto |
| Mais integrantes ou troca de formação | Multiplica relações, eventos e epílogos |
