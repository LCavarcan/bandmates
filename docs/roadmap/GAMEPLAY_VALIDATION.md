# Validação de gameplay — Bandmates

> Plano para responder, com dados, se o jogo é equilibrado e divertido. Alimenta as tarefas F0-04, F1-01, F1-02, F3-03 e F6-02 do [ROADMAP](ROADMAP.md).
>
> **Nenhum resultado abaixo foi medido ainda.** As hipóteses vêm de cálculos a partir das fórmulas do código (seção 1.3–1.4 do roadmap) e precisam ser confirmadas ou descartadas.

## 1. Como validar

Duas fontes, sempre combinadas:

| Fonte | Para quê | Como |
|---|---|---|
| **Partidas manuais** | Diversão, clareza, ritmo, momentos memoráveis, frustração | Diário de partida (seção 6), no PC e no celular |
| **Campanhas automáticas** | Balanceamento, estratégias dominantes, variância entre sementes | Ferramenta versionada da tarefa **F0-03** (bot com estratégias parametrizadas, ≥ 20 sementes por estratégia) |

**Regras de processo:**

- A ferramenta automática é **código revisado e commitado**, rodado com aprovação da desenvolvedora — não scripts descartáveis.
- Toda conclusão registra: data, versão (commit), número de sementes ou partidas e quem jogou.
- Um resultado só entra neste documento depois de executado. Hipóteses ficam marcadas com 🔬.
- O bot atual (`src/engine/bot.ts`) sempre escolhe a **primeira** opção dos eventos; as estratégias abaixo precisam variar isso.

## 2. Estratégias

Cada estratégia é um conjunto de regras simples, aplicáveis tanto por uma pessoa quanto pelo bot.

| ID | Estratégia | Regras principais | O que ela testa |
|---|---|---|---|
| **E1** | **Equilibrada** | Lia lidera; Júlia divulga em lançamentos; descanso com estresse ≥ 70; show a cada ~4 semanas; trabalho extra se caixa < R$ 150 | Linha de base (próxima do bot atual) |
| **E2** | **Foco em música** | Sempre há música em composição; grava assim que pode; lança com divulgação; shows só quando o caixa obriga | Composição tem profundidade? Compensa sem palco? |
| **E3** | **Foco em palco** | Show sempre que alguma casa estiver disponível; compõe só nas semanas livres | Shows são recompensadores? Covers pesam? |
| **E4** | **Foco em relações** | Agrupa pares de alta sinergia; evita pares em atrito; conversa "ouvir" com quem está pior; descansa cedo (estresse ≥ 55); escolhas de evento que favorecem relação | O jogo pune quem prioriza as pessoas? |
| **E5** | **Negligente** | Ignora estresse (nunca descansa); máxima produção | O estresse é relevante ou só um obstáculo? |
| **E6** | **Mercenária** | Máximo de trabalho extra; o mínimo de música para não travar | É possível vencer só com dinheiro? Dá para ficar sem dinheiro? |
| **E7** | **Experimentação** | Cada música num gênero e numa direção diferentes; líderes alternadas | Variar gêneros é viável ou só punido? |
| **E8** | **Repetição** | E1 com 20+ sementes, comparando entre si | Duas campanhas são diferentes? |
| **E-EV** | **Escolhas de evento** | E1 com política de evento: primeira opção / última / aleatória / "pró-relação" | As escolhas narrativas mudam o resultado? |

## 3. Métricas

| ID | Métrica | Como coletar |
|---|---|---|
| **M1** | Resultado do festival (faixa e pontuação) e componentes do júri | `state.festival` |
| **M2** | Caixa mínimo, caixa final, nº de semanas com caixa negativo | `state.money` por semana (`state.history`) |
| **M3** | Distribuição de atividades por semana-integrante (%) | `state.plan` antes de cada avanço |
| **M4** | Habilidades finais por integrante e diferença entre a maior e a menor | `state.members` |
| **M5** | Semanas com estresse ≥ 70 e ≥ 85; nº de descansos; nº de conversas "ouvir" | emoções por semana; plano; `talkedWeek` |
| **M6** | Retorno por semana-integrante de show, trabalho extra e divulgação (R$, fãs, reputação) | relatórios semanais (`WeekReport`) |
| **M7** | Músicas próprias × covers em cada show; músicas compostas, gravadas e lançadas por campanha | `state.shows[].covers`, `state.songs` |
| **M8** | Eventos vistos por campanha; continuações agendadas × exibidas; etapas de arco alcançadas; romance (juntas/amigas/não iniciado) | `state.eventLog`, `state.scheduled`, `state.flags` |
| **M9** | Diversidade entre campanhas: eventos em comum (Jaccard), combinação de epílogos distinta, faixa do festival | comparação entre sementes |
| **M10** | União final (sinergia média), pares em atrito no fim, relação que mais mudou | `state.relations` |
| **M-S** | Subjetivas (partidas manuais): diversão 1–5 por bloco de semanas, momentos memoráveis, momentos de tédio, confusões | diário de partida |

## 4. Perguntas de validação

Cada pergunta indica cenários, métricas, a hipótese atual (se houver) e o critério de resposta satisfatória.

### V1 · É possível completar uma campanha sem ficar sem dinheiro?
- **Cenários:** E1, E2, E4, E7. **Métricas:** M2.
- **Hipótese 🔬:** sim, mas a pressão pode ser fraca, porque caixa negativo custa só −4 de motivação por semana e nenhum gasto é bloqueado.
- **Satisfatório se:** E1 e E4 terminam sem caixa negativo em ≥ 80% das sementes; E2 passa por aperto real (caixa < R$ 100 em algum momento) em ≥ 50% — o dinheiro precisa ser uma tensão, não um muro.

### V2 · Existe uma estratégia claramente superior?
- **Cenários:** E1–E7. **Métricas:** M1, M3.
- **Hipótese 🔬:** "Lia lidera indie emocional + Júlia divulga" pode dominar.
- **Satisfatório se:** a diferença de pontuação média do festival entre a melhor e a terceira melhor estratégia é < 10 pontos, e nenhuma atividade passa de ~40% das semanas-integrante nas campanhas vencedoras.

### V3 · Dá para vencer a seletiva com estratégias diferentes?
- **Cenários:** E1, E2, E3, E4, E7. **Métricas:** M1.
- **Satisfatório se:** pelo menos **três** estratégias chegam a "Palco alternativo" ou melhor em ≥ 50% das sementes, e pelo menos **duas** alcançam "Selecionadas!" em alguma semente.

### V4 · O jogo pune quem prioriza as relações?
- **Cenários:** E4 × E1. **Métricas:** M1, M10, M8.
- **Satisfatório se:** E4 fica a ≤ 8 pontos de E1 no festival e tem união e arcos visivelmente melhores. Se E4 perder muito, o pilar "carreira e vida pessoal são o mesmo sistema" está falhando.

### V5 · As integrantes desenvolvem habilidades de forma equilibrada?
- **Cenários:** E1, E2, E3. **Métricas:** M4.
- **Observar:** se alguma integrante quase não evolui (ex.: a Lia nunca ganha presença; a Bia nunca compõe) por falta de motivo para fazer outras atividades.
- **Satisfatório se:** toda integrante ganha pelo menos +8 na sua menor habilidade em E1, e as estratégias de foco produzem perfis diferentes.

### V6 · O estresse é uma mecânica relevante ou só um obstáculo?
- **Cenários:** E5 × E1; E1 com e sem conversa "ouvir". **Métricas:** M5, M1.
- **Hipótese 🔬:** a conversa "ouvir" semanal pode substituir parte do descanso.
- **Satisfatório se:** E5 termina pior que E1 por causa do estresse (esgotamentos, eventos de crise depois de F1-03), mas descansar continua sendo uma *escolha* com custo, não uma regra fixa; o descanso é usado em E1 pelo menos uma vez por integrante.

### V7 · Os shows são recompensadores?
- **Cenários:** E3 × E2; shows isolados por casa. **Métricas:** M6, M7, M1.
- **Hipótese 🔬:** no Bar do Zé, com covers, um show rende ~R$ 208, ~2 fãs e ~0 de reputação, ocupando as 4 integrantes — menos que 4 trabalhos extras (R$ 440–560) e menos fãs que uma divulgação da Júlia (~20). Casas maiores devem compensar.
- **Satisfatório se:** um show tem retorno por semana-integrante comparável ao da melhor alternativa, considerando dinheiro + fãs + reputação + metas, e o show é o caminho mais eficiente para fãs **em algum momento** da campanha.

### V8 · A composição tem profundidade suficiente?
- **Cenários:** E2, E7; partidas manuais. **Métricas:** M7, M1; M-S.
- **Hipótese 🔬:** com ~2–3 músicas por campanha, há poucas decisões de composição por partida; e a continuidade de identidade desestimula trocar de gênero.
- **Satisfatório se:** a jogadora faz ≥ 3 escolhas de composição por campanha; E7 não fica mais de 10 pontos atrás de E2; no diário, a jogadora consegue explicar *por que* escolheu um gênero/direção.

### V9 · Uma segunda campanha é diferente?
- **Cenários:** E8; duas partidas manuais seguidas. **Métricas:** M9, M8.
- **Satisfatório se:** entre duas sementes, menos de 60% dos eventos coincidem; os epílogos diferem em pelo menos 2 integrantes; na partida manual, a jogadora relata pelo menos uma situação nova relevante.

### V10 · As escolhas narrativas têm consequências perceptíveis?
- **Cenários:** E-EV. **Métricas:** M8, M10, M1; M-S.
- **Hipótese 🔬:** metade das flags gravadas não é lida (ROADMAP 1.2); continuações tardias podem se perder (ROADMAP F0-02).
- **Satisfatório se:** mudar a política de escolhas muda pelo menos um epílogo e uma relação final de forma consistente; toda continuação agendada é exibida; na partida manual, a jogadora identifica pelo menos duas consequências que voltaram depois.

### V-ONB · Uma pessoa nova consegue jogar sem ajuda?
- **Cenário:** alguém que nunca jogou, sem ler a documentação, no celular.
- **Satisfatório se:** chega à semana 3 sem pedir ajuda, entende o objetivo (seletiva) e consegue explicar o que a última escolha mudou.

## 5. Problemas a observar

Durante qualquer partida, registrar no diário:

- **Rotina:** semanas em que o plano não muda e "Avançar" vira reflexo.
- **Decisão óbvia:** escolhas em que sempre se faz a mesma coisa.
- **Punição sem aviso:** um resultado ruim que a jogadora não conseguiu prever nem entender.
- **Informação perdida:** algo importante que só aparece no resumo e some.
- **Texto que contradiz a imagem:** fala alegre com retrato abatido, e vice-versa.
- **Conteúdo inalcançável:** evento ou epílogo que nunca aparece em várias partidas.
- **Celular:** rolagem excessiva, botão fora de alcance, texto cortado, modal que não fecha.
- **Ritmo:** semanas seguidas sem nada acontecendo, ou eventos demais em sequência.
- **Repetição de falas:** mesma fala de atividade vista muitas vezes (cada atividade tem só 2 falas por integrante).

## 6. Diário de partida

Copiar este modelo para cada partida manual.

```markdown
### Partida — AAAA-MM-DD · versão <commit> · <PC | celular> · <quem jogou>

Estratégia pretendida: <E1…E7 ou livre>
Resultado: <faixa do festival> (<pontuação>) · romance: <juntas/amigas/não iniciado>

| Semanas | Diversão (1–5) | O que aconteceu de marcante | Onde travou ou entediou |
|---|---|---|---|
| 1–3 | | | |
| 4–6 | | | |
| 7–9 | | | |
| 10–12 | | | |

Consequências que voltaram depois:
Decisões que pareceram óbvias:
Bugs (com passo a passo):
Confusões de interface:
Uma coisa que eu mudaria:
```

## 7. Critérios para considerar o gameplay satisfatório

O gameplay do MVP está validado quando, na mesma versão:

1. **V1–V10 têm resposta** sustentada por dados (automáticos e manuais), registrada na seção 8.
2. **V2, V3 e V4 são satisfatórias** — sem estratégia dominante, com caminhos variados e sem punição para quem cuida das relações.
3. **V7 é satisfatória** — shows têm papel claro na carreira.
4. **V10 é satisfatória** — escolhas têm consequências visíveis, e nenhuma continuação se perde.
5. **Diversão média ≥ 3,5** nos diários, sem bloco de semanas abaixo de 3 em mais de uma partida.
6. **V-ONB é satisfatória** com pelo menos uma pessoa.

Se um critério falhar, a correção entra como tarefa no [ROADMAP](ROADMAP.md) (Fase 1) antes de qualquer expansão de conteúdo.

## 8. Resultados

> Preencher somente com dados executados. Uma linha por rodada de validação.

| Data | Versão | Fonte (manual/automática) | Sementes ou partidas | Perguntas respondidas | Conclusão | Link para os dados |
|---|---|---|---|---|---|---|
| — | — | — | — | — | *Ainda não executado* | — |
