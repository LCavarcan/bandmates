# Eventos e conversas

Código: `src/engine/events.ts`, `src/engine/narrative.ts` e `src/engine/talk.ts`. Conteúdo: `src/data/events.ts` e `src/data/talks.ts`.

Os eventos são **cenas escritas à mão**, disparadas por condições do jogo. Cada escolha muda o estado, e algumas consequências só aparecem semanas depois. Nenhum texto é gerado automaticamente.

## Como um evento acontece

1. No fim de cada semana (exceto a última), o motor procura **um** evento. Os candidatos são as **continuações agendadas** que venceram (prioridade 9) e os eventos comuns **ainda não vistos** cuja condição de ativação é verdadeira. Vence a **maior prioridade**; em caso de empate, um sorteio com a semente do jogo. Uma continuação que perde volta na semana seguinte. *O cartaz* e a *Véspera* têm prioridade 10.
   - **Fim da temporada:** a semana 11 é da *Véspera* e a 12 não tem evento, então uma continuação que cairia depois da semana 10 é **antecipada para a semana 10**. Se mesmo assim ela não acontecer (foi agendada na própria semana 10 ou perdeu a disputa), ela **vira uma linha do epílogo**, escrita no campo `epilogue` da continuação. Nenhuma continuação agendada some sem ser vista.
2. O evento fica **pendente** e aparece logo depois do resumo da semana.
3. Enquanto houver um evento pendente, não é possível avançar a semana nem conversar.
4. Cada evento acontece **no máximo uma vez** por campanha.

As condições do tipo "fez a atividade" e "juntas" se referem à semana que **acabou de ser jogada**.

## Condições

As condições são dados, não código. Elas se combinam com `all`, `any` e `not`.

| Tipo | Verdadeira quando… |
|---|---|
| `week` | a semana está no intervalo `min`/`max` |
| `emotion` / `skill` | a emoção ou habilidade da integrante está no intervalo |
| `relation` | a dimensão da relação do par está no intervalo |
| `resource` | dinheiro, fãs ou reputação estão no intervalo |
| `flag` | a flag existe ou tem um valor (`equals`) |
| `did` | a integrante fez uma das atividades na semana |
| `together` | as duas fizeram a mesma atividade (dentre as listadas) |
| `draft` | há música em composição (opcionalmente com essa líder e progresso mínimo) |
| `released` | uma música foi lançada na semana (filtros: recepção, autora, "não liderada por") |
| `songs` | há pelo menos N músicas em um dos estados listados |
| `shows` | houve pelo menos N shows (opcionalmente com nota mínima), sem contar a seletiva |
| `unity` | a sinergia média dos 6 pares é pelo menos `min` |
| `chance` | sorteio com probabilidade `p` (só na ativação) |

## Efeitos

| Tipo | Faz |
|---|---|
| `emotion` / `skill` | Soma valor (limitado a 0–100) |
| `relation` | Soma às dimensões do par (limitado a −100..100) |
| `resource` | Soma dinheiro, fãs ou reputação |
| `flag` | Marca uma escolha para eventos futuros (invisível para a jogadora) |
| `draft` | Bônus na música em composição: qualidade, originalidade, apelo, coesão, identidade. É somado quando ela fica pronta |
| `modifier` | Multiplica o rendimento de uma integrante (ou da banda) numa atividade por N semanas |
| `schedule` | Agenda uma continuação para daqui a N semanas (invisível) |

Os **modificadores** multiplicam o fator de disposição (`mf`) na atividade, o que afeta ganhos de habilidade, progresso de composição e gravação, e fãs da divulgação. Eles aparecem no painel **Plano da semana**.

## Escolhas e desfechos

- Uma escolha pode exigir uma condição (`requires`). Se a condição não for atendida, a escolha aparece **trancada**, com o motivo (`requiresText`).
- Cada escolha tem uma lista de **desfechos**. Vale o primeiro cujo `when` é verdadeiro, então **o mesmo gesto pode dar certo ou errado** conforme o estado. O último desfecho nunca tem `when`: ele é o padrão.

## Eventos da campanha

!!! warning "Contém spoilers"

| Evento | Quem | Quando pode acontecer | Escolhas |
|---|---|---|---|
| **Quarenta minutos** | Bia, Nina | Semana ≥ 2; ensaiaram ou gravaram juntas; afinidade ≤ 25 | Acordo · deixar Nina desabafar (Bia +15% no ensaio) · mudar de assunto (agenda *De novo*) |
| ↳ *De novo* | Nina, Bia | 2 semanas depois de "mudar de assunto" | Ir atrás de Nina · conversa séria com Bia (depende do estresse dela) · juntar as duas (depende da afinidade) |
| **O refrão** | Júlia, Lia | Semana ≥ 2; música liderada pela Lia com ≥ 25% | Refrão da Lia (+originalidade) · da Júlia (+10 apelo) · reescrever juntas (exige respeito ≥ 20; com rivalidade ≥ 40 o resultado é tenso) |
| **O caderno** | Lia | Semana ≥ 3; confiança da Lia ≤ 50 ou estresse ≥ 50 | Fechar · avisar (agenda *Uma coisa que eu escrevi*) · ler (agenda *A página dobrada*; revela algo para a Fase 4) |
| ↳ *Uma coisa que eu escrevi* | Lia | 2 semanas depois | Ouvir (bônus de identidade) · sugerir mostrar à banda (depende da confiança) |
| ↳ *A página dobrada* | Lia | 3 semanas depois | Admitir (depende da confiança) · negar |
| **Duas da manhã** | Nina | Semana ≥ 2; estresse da Nina ≥ 60; ensaiou ou gravou | Mandar para casa · ficar e ouvir (+técnica) · chamar a Bia (depende da afinidade) |
| **Pastel do Seu Jorge** | Júlia, Lia, Bia | Semana ≥ 3; caixa ≤ R$ 300 | Aceitar (+R$ 400) · versão punk (+R$ 400; vira meme ou briga) · recusar |
| **"Meu som novo"** | Júlia, Lia | Semana ≥ 3; lançamento não liderado pela Júlia | Pedir que edite (depende da confiança dela) · deixar quieto (+fãs, +rivalidade) · repostar creditando todas |
| **A ligação** | Bia, Júlia | Semana ≥ 4; Bia desanimada ou estressada, ou caixa ≤ R$ 100 | Júlia conversa (depende da confiança entre elas) · montar um plano (Nina ajuda; Bia +10% por 3 semanas) · dar espaço |
| **Depois que todo mundo foi embora** | Lia, Nina | Semana ≥ 4; trabalharam juntas; afinidade ≥ 25 | Sair sem interromper · chamar para o bar · gravar aquilo (bônus na música) |
| **A resenha** | Lia | Lançamento da Lia com recepção morna ou boa | Mostrar com os comentários bons · "crítica faz parte" (Lia +20% ou −20% compondo, conforme a confiança) · esconder (agenda *Você sabia?*) |
| ↳ *Você sabia?* | Lia | 2 semanas depois | Admitir · "não queria te magoar" (depende da confiança) |
| **Ensaiar ou aparecer?** | Júlia, Nina | Semana ≥ 5; Júlia divulgou; rivalidade ≥ 15 | Lado da Júlia (+25% divulgação) · lado da Nina (+25% ensaio e gravação) · trocar de lugar (+respeito, +habilidades) |
| **O cartaz** | Todas | Semana 1 (sempre) | Apresenta a seletiva: com tudo · uma música boa primeiro · shows primeiro |
| **Depois do primeiro show** | Todas | No primeiro show | Comemorar (−R$ 40, −estresse) · avaliar (+10% no ensaio) · acalmar a Nina |
| **Véspera** | Todas | Semana 11 (prioridade máxima) | Discurso (+5% na seletiva) · ensaio de madrugada (+12%, +estresse) · dormir cedo (−estresse) |
| Arco Lia & Nina | Lia, Nina | Veja [Romance](romance.md) | *Ela sempre fez isso?* · *Apagão* · *Você acha que eu devia?* · ↳ *No telhado* · ↳ *As outras perceberam* |

São 15 eventos principais e 6 continuações. Como cada evento só acontece uma vez, há no máximo um por semana e cada um depende do estado, **nenhuma campanha vê todos**.

### Flags com efeito posterior

- **Romance:** `lia_sente_algo`, `lia_nina_momento`, `nina_curiosa`, `apagao_juntas`, `romance` (veja [Romance](romance.md)).
- **Epílogos:** `julia_dividiu`, `julia_protagonista`, `lia_confiou`, `bia_plano`, `nina_ignorada`, `trocaram_de_lugar`.
- **Reservadas para expansões:** `lia_segredo_compartilhado`, `mentiu_caderno`, `fez_jingle`, `banda_sabe`.

## Conversas

Uma vez por semana, você pode conversar com uma integrante pelo botão **💬 Conversar** na carta dela. Há três abordagens:

| Abordagem | Tende a… |
|---|---|
| 🫖 Perguntar como ela está | Aliviar o estresse (mais quando ela está mal) |
| 🌟 Elogiar o trabalho dela | Dar confiança (mais para quem está insegura) |
| 📋 Cobrar mais empenho | Motivar a ambiciosa e a disciplinada. Machuca a sensível insegura, a impulsiva estressada e a perfeccionista no limite |

A mesma abordagem rende coisas diferentes para cada personagem. Por exemplo, cobrar a Bia quando ela está tranquila rende uma promessa de foco (+15% por uma semana); cobrar a Lia com confiança abaixo de 60 a faz fechar o caderno.

## Escrevendo um evento novo

1. Adicione um objeto em `EVENTS`, em `src/data/events.ts`, usando os atalhos de `src/data/dsl.ts`:

    ```ts
    {
      id: 'meu_evento',
      title: 'Título',
      cast: ['julia', 'bia'],
      priority: 5,
      trigger: all(weekMin(3), relMin('bia', 'julia', 'afinidade', 40)),
      scene: [narr('Narração.'), say('bia', 'Fala da Bia.')],
      choices: [
        {
          id: 'a',
          label: 'Fazer tal coisa',
          outcomes: [
            { when: emotionMin('bia', 'estresse', 60), effects: [emo('bia', 'motivacao', -4)], result: [narr('Deu errado.')] },
            { effects: [emo('bia', 'motivacao', 5)], result: [narr('Deu certo.')] },
          ],
        },
        // pelo menos duas escolhas
      ],
    },
    ```

2. Rode `npm test`. Os testes de dados verificam ids únicos, o desfecho padrão, agendamentos válidos, se toda continuação tem `epilogue` e se todos os efeitos aplicam sem erro.
3. Atualize a tabela desta página.

!!! tip "Boas práticas"
    - Prefira **subtexto**: a personagem raramente diz o que sente com todas as letras.
    - Toda escolha deve ter um custo ou um risco. Evite a "opção certa" óbvia.
    - Use `when` para que **o mesmo gesto** tenha resultados diferentes conforme o estado.
    - Use `schedule` e `flag` para consequências que voltam depois.
