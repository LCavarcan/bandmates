# Visão do produto — Bandmates

> Documento de referência para decisões de design. Quando uma ideia nova surgir, ela deve ser comparada com os pilares e princípios abaixo antes de entrar no [roadmap](ROADMAP.md) ou no [backlog](BACKLOG.md).

## O que é Bandmates

Bandmates é um jogo indie de **gerenciamento de banda com narrativa**, em português, que roda no navegador (PC e celular) e não custa nada para jogar, hospedar ou manter.

Você acompanha quatro integrantes — Júlia, Lia, Bia e Nina — durante uma temporada curta. A cada semana, escolhe o que cada uma faz (compor, ensaiar, gravar, divulgar, descansar, trabalhar, tocar), lida com o que acontece entre elas e tenta chegar à seletiva de um festival. No fim, o jogo conta o que aquela temporada fez com a banda e com cada pessoa.

## A experiência que queremos proporcionar

A jogadora deve terminar uma campanha com a sensação de que **conheceu quatro pessoas** — e de que **as decisões de carreira e as decisões humanas eram a mesma decisão**.

Os momentos-alvo:

- "Se eu colocar as duas para compor juntas, a música vai ficar melhor… ou elas vão brigar?"
- "A Nina está no limite. Descanso agora e perco a semana, ou arrisco o show?"
- "Eu escondi a resenha da Lia. Duas semanas depois, ela descobriu."
- "A gente não passou na seletiva, mas a Júlia aprendeu a dividir o palco."
- "Quero jogar de novo para ver o que acontece se eu apostar no punk."

## Pilares

1. **Pessoas, não planilhas.** Cada integrante tem voz, desejos, medos e contradições. Traços mudam números *e* mudam cenas. Nenhum traço é só bom ou só ruim.
2. **Carreira e vida pessoal são o mesmo sistema.** Relações afetam composição, gravação e palco; decisões de carreira afetam estresse, confiança e relações. Uma mecânica isolada vale menos do que uma que conversa com as outras.
3. **Escolhas com consequência — inclusive tardia.** O mesmo gesto pode dar certo ou errado conforme o momento. Consequências podem voltar semanas depois.
4. **Pouco atrito, muita decisão.** Poucos cliques por semana; cada clique deve significar alguma coisa. Profundidade vem da interação entre sistemas, não da quantidade de menus.
5. **Gratuito e aberto, de verdade.** Sem servidor, sem conta, sem anúncio, sem compra, sem telemetria. Funciona offline. Assets próprios ou de licença aberta.

## O que diferencia o jogo

- **Relações com quatro dimensões** (afinidade, respeito, confiança, rivalidade): rivalidade com respeito gera música mais original; amizade não garante parceria artística.
- **Música como objeto de escolhas artísticas** (gênero, tema, direção, líder) com reações das personagens às escolhas, antes mesmo de a música existir.
- **Narrativa escrita à mão**, orientada a dados, com escolhas trancadas por contexto e desfechos que dependem do estado.
- **Romance opcional, gradual e recíproco** (sáfico no MVP), que pode terminar em amizade — e a amizade é um final válido.
- **Temporada curta e rejogável**: 12 semanas, um objetivo claro, finais e epílogos que refletem o caminho.

## Princípios para decisões futuras

1. **Aprofundar antes de multiplicar.** Antes de criar um sistema novo, pergunte se dá para tornar um existente mais interessante.
2. **Toda mecânica nova precisa tocar pelo menos dois sistemas existentes.** (Ex.: uma briga que muda o estresse *e* a nota do próximo show *e* abre um evento.)
3. **Se a jogadora não percebe, não existe.** Toda consequência importante precisa de feedback visível — ou de uma cena.
4. **Dados antes de código.** Conteúdo novo (eventos, falas, casas de show, metas) deve ser possível de escrever em `src/data/` sem mexer no motor.
5. **Medir antes de balancear.** Ajustes de números partem de partidas jogadas e de métricas, não de intuição isolada (ver [GAMEPLAY_VALIDATION.md](GAMEPLAY_VALIDATION.md)).
6. **O romance nunca é o único caminho para desenvolver relações.** Amizade, rivalidade respeitosa e reconciliação precisam ter o mesmo cuidado narrativo.
7. **Uma pessoa mantém isto.** Cada funcionalidade é avaliada também pelo custo de manutenção (texto a escrever, testes, balanceamento, arte).
8. **Custo zero é requisito, não preferência.** Nenhuma dependência paga, nenhuma infraestrutura com limite que gere cobrança.

## O que Bandmates não pretende ser

- **Um simulador econômico detalhado.** Sem planilhas de contratos, impostos, royalties, inventário de equipamentos.
- **Um jogo de ritmo.** Não há minigame de tocar nota no tempo; a música é resultado das decisões, não da coordenação motora.
- **Um editor musical.** Não se compõe nota por nota.
- **Um dating sim.** O romance é uma das histórias possíveis, não o objetivo.
- **Um jogo online.** Sem multiplayer, ranking, contas ou servidor.
- **Um jogo gerado por IA.** Textos são escritos à mão; não há geração de diálogo em tempo de execução.
- **Um jogo infinito.** A temporada tem começo, meio e fim.
