# Economia

Constantes: `ECONOMY` e `ACTIVITIES[*].cost`, em `src/data/activities.ts`.

## Recursos

| Recurso | Início | Para que serve |
|---|---:|---|
| 💰 Dinheiro | R$ 600 | Pagar aluguel, divulgação e gravação. Abaixo de zero, afeta o moral |
| 💜 Fãs | 30 | Crescem com divulgação, lançamentos e streaming |
| ⭐ Reputação (0–100) | 5 | Multiplica os fãs dos lançamentos; vem de músicas originais e com identidade |

## Fluxo de caixa

| Entrada / saída | Valor |
|---|---|
| Aluguel do estúdio (toda semana) | −R$ 120 |
| Divulgar (por integrante) | −R$ 40 |
| Gravar (por integrante) | −R$ 50 |
| Trabalho extra (por integrante) | +R$ 110 a 140 (−R$ 40 se atrasar) |
| Streaming | Veja [Ciclo musical](musica.md#streaming) |

O painel **Plano da semana** mostra a previsão de caixa, com aluguel, custos, trabalho extra e o streaming da semana, que é determinístico.

## Tensão de design

Sem renda, o caixa inicial dura cerca de quatro semanas. Isso cria a decisão de **quem vai pagar as contas**: tirar alguém da música para o trabalho extra custa motivação e estresse, e afeta mais a ambiciosa Júlia. O streaming alivia, mas só depois de compor, gravar e lançar.

Na Fase 4, os **shows** vão virar a principal fonte de dinheiro.
