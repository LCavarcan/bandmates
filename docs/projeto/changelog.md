# Changelog

## 0.3.0 — Fase 3: personagens e relações

### Novo

- **Eventos narrativos** com cena em estilo visual novel (retratos, falas, escolhas):
    - 9 eventos principais e 4 continuações;
    - condições de ativação baseadas em semana, emoções, relações, recursos, atividades, músicas e escolhas anteriores;
    - escolhas trancadas com motivo, desfechos que dependem do estado e consequências que voltam semanas depois.
- **Conversa da semana:** perguntar, elogiar ou cobrar; cada integrante responde do seu jeito.
- **Modificadores temporários** de atividade, exibidos no plano da semana.
- **Bônus na música em composição** vindos de escolhas narrativas.
- **Entrosamento na gravação:** a química entre quem grava muda o desempenho.
- Página de documentação sobre eventos e conversas, com um guia para escrever eventos novos.

### Alterado

- O save passou para a **versão 3**, com migração automática da v1 e da v2.
- O bot de testes resolve eventos.

## 0.2.0 — Fase 2: ciclo musical

### Novo

- **Nova música:** escolha de título, gênero (4), tema (8), direção artística (3) e líder. As opções mostram quem adora cada gênero ou tema.
- **Reações imediatas** da banda às escolhas. Por exemplo, Lia detesta a direção comercial, e Júlia se ressente quando não lidera.
- **Composição com líder e arranjadoras.** Sem a líder, a música anda devagar.
- Novos atributos: **apelo comercial**, **coesão** e **identidade**.
- **Gravar:** nova atividade (R$ 50 por integrante) que gera a qualidade de gravação e a nota final. Com a banda inteira, a faixa ganha bônus.
- **Ensaio** passa a lapidar a próxima faixa a ser gravada.
- **Lançamento** com recepção (aclamada, hit local, boa, morna). A divulgação na mesma semana amplia o alcance.
- **Streaming** semanal com decaimento.
- **Identidade da banda** exibida no estúdio.
- O plano da semana mostra os problemas que bloqueiam o avanço, o lançamento marcado e a previsão de caixa com streaming.
- Documentação em MkDocs.

### Alterado

- O plano inicial não inclui mais compor (é preciso definir a música antes).
- Divulgar rende mais conforme o número de músicas **lançadas**, não mais compostas.
- O save passou para a **versão 2**, com migração automática da v1.

## 0.1.0 — Fase 1: estrutura funcional

- Estúdio com quatro integrantes, retratos SVG com expressões, calendário de 12 semanas e recursos.
- Atividades: ensaiar, compor, descansar, divulgar e trabalho extra.
- Relações em dupla com quatro dimensões.
- Resumo semanal com falas escritas à mão.
- Salvamento automático local, fim de temporada e testes.
