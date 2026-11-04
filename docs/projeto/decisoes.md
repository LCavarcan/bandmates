# Decisões

Registro curto das decisões de design e de técnica que não estavam especificadas.

## Fase 1

| Decisão | Motivo |
|---|---|
| Uma atividade por integrante por semana | É o mínimo de cliques que ainda gera decisões. Quem faz a mesma atividade passa a semana junta, e a relação muda |
| RNG com semente salva no estado | Testes reproduzíveis e bugs reproduzíveis |
| Aluguel de R$ 120 por semana | Dá sentido ao dinheiro antes dos shows existirem |
| Salvamento automático já na Fase 1 | É simples e evita perder progresso durante os testes |
| Fontes do sistema (Bahnschrift, Segoe UI) | Funciona offline, sem baixar nada |
| Retratos em SVG gerados em código | Arte original e substituível sem tocar na lógica |

## Fase 2

| Decisão | Motivo |
|---|---|
| Uma música em composição por vez | Mantém o foco e simplifica a interface |
| Compor/gravar sem alvo **bloqueia** o avanço (em vez de desperdiçar a semana) | É mais claro: a interface mostra o motivo e desabilita o botão |
| A líder pesa 1.0, as arranjadoras 0.6; sem a líder, todas 0.5 | Escolher a líder é uma decisão real, e ela precisa estar presente |
| Gravar é uma atividade semanal com custo | O fluxo da semana fica uniforme e cria um custo de oportunidade |
| O ensaio lapida a próxima faixa a ser gravada | Dá propósito ao ensaio no ciclo musical |
| Lançar é uma decisão (botão), resolvida no fim da semana | Permite combinar com divulgação na mesma semana |
| Streaming com decaimento de 0,85 por semana | Lançar cedo vale a pena; o catálogo acumula renda |
| Rivalidade com respeito aumenta a originalidade | "Pessoas que discordam podem produzir músicas excelentes" |
| Reações às escolhas aplicadas imediatamente | Feedback na hora: a jogadora vê quem gostou e quem não gostou antes de investir semanas |
| Bot de testes em vez de simulações avulsas | O balanceamento vira asserção versionada, não um número esquecido num terminal |
| MkDocs Material com `font: false` e plugin `offline`, sem Mermaid | A documentação também funciona offline e sem requisições externas |
| Shim `iframe-worker` copiado para `docs/assets/vendor/` (MIT) | O plugin `offline` o buscaria no unpkg.com |

## Fase 3

| Decisão | Motivo |
|---|---|
| Condições e efeitos como **objetos de dados**, não funções | Eventos legíveis, testáveis e serializáveis; quem escreve não precisa programar lógica |
| Escolhas com **desfechos condicionais** (`when`) | O mesmo gesto pode dar certo ou errado; as escolhas dependem de quem está envolvido e do momento |
| No máximo um evento por semana, sem eventos na última semana | Ritmo: a narrativa não engole a gestão |
| Evento pendente **bloqueia** o avanço | Garante que as escolhas sejam feitas; o save preserva o evento |
| Cada evento acontece uma vez | Cada campanha conta uma história diferente; nenhuma vê tudo |
| Continuações agendadas por escolhas (`schedule`) | Consequências que voltam semanas depois |
| A gestora é a "você" das cenas, sem atributos próprios | Mantém o foco nas integrantes; a relação com a gestora aparece nos efeitos e nas flags |
| Conversa: uma por semana, sem gastar atividade | Interação frequente e barata, que não compete com a carreira |
| Modificadores multiplicam o `mf` | Um único ponto de integração; afetam todos os resultados da atividade de forma previsível |
| Entrosamento na gravação limitado a ±15% | Relevante sem dominar a habilidade |
| Retratos da cena "congelados" ao abrir | A expressão não muda no meio da leitura quando a escolha altera as emoções |
| Flags plantadas para o romance (Lia e Nina), sem efeito ainda | O arco da Fase 4 começa a partir de escolhas já feitas, sem retrabalho |
