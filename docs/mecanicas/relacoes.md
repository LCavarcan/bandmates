# Relações

Código: `src/engine/relations.ts`. Falas: `src/data/pairs.ts`.

Cada par de integrantes tem uma relação independente, com quatro dimensões de **−100 a +100**:

| Dimensão | Significa |
|---|---|
| Afinidade | Gostar da companhia |
| Respeito | Admirar o trabalho |
| Confiança | Contar com a outra |
| Rivalidade | Competir (não é o oposto de afinidade) |

A interface mostra barras e um rótulo, não os números.

## Sinergia

```
sinergia = (afinidade + respeito + confiança) / 3 − rivalidade / 2
```

A sinergia é usada na colaboração da composição (velocidade e coesão) e nas interações.

## Interações em dupla

Integrantes que fazem **a mesma atividade** passam a semana juntas. As regras são avaliadas em ordem, e vale a primeira que se aplicar:

| # | Situação | Tom | Mudança |
|---|---|---|---|
| 1 | Descansando juntas, rivalidade ≥ 40 | faísca | afinidade +2, rivalidade +1 |
| 1 | Descansando juntas, afinidade < −10 | atrito | afinidade +1 |
| 1 | Descansando juntas (demais casos) | harmonia | afinidade +4, confiança +2 |
| 2 | Perfeccionista (≥ 70) × impulsiva (≥ 60) ensaiando, compondo ou gravando, com respeito ≥ 35 | faísca | respeito +3, rivalidade +1 |
| 2 | O mesmo, com respeito < 35 | atrito | afinidade −3, confiança −1, respeito +1 |
| 3 | Duas criativas (≥ 60) compondo | faísca | respeito +3, rivalidade +2 |
| 4 | Ambas competitivas, ou uma competitiva com rivalidade ≥ 20 | faísca | rivalidade +3, respeito +2 |
| 5 | Sinergia ≥ 15 | harmonia | afinidade +3, confiança +2, respeito +1 |
| 6 | Sinergia < −10 | atrito | afinidade −1, rivalidade +1 |
| 7 | Demais casos | neutro | afinidade, respeito e confiança +1 |

!!! example "Bia e Nina"
    Ensaiando juntas, começam em atrito, porque o respeito entre elas é de apenas 5. Se o respeito chegar a 35, o atrito vira aprendizado ("faísca").

## Efeitos nas músicas

- **Velocidade de composição:** `colab = 1 + sinergia/100` (limitado a ±30%).
- **Originalidade:** uma rivalidade com respeito ≥ 20 soma `rivalidade × 0.15`. Pessoas que discordam podem fazer música excelente.
- **Coesão:** depende da sinergia média entre as autoras.
- **Gravação:** o entrosamento entre quem grava junto altera o desempenho em até ±15%.
- **Eventos:** muitas condições de ativação e muitos desfechos dependem das dimensões da relação. Por exemplo, *Duas da manhã* termina bem ou mal conforme a afinidade entre Bia e Nina.

## Rótulos

`describeRelation` escolhe o primeiro que se aplicar:

| Rótulo | Condição |
|---|---|
| Rivais que se admiram | rivalidade ≥ 40 e respeito ≥ 35 |
| Rivalidade acesa | rivalidade ≥ 40 |
| Amizade sólida | afinidade ≥ 50 e confiança ≥ 40 |
| Atrito | afinidade ≤ −20 |
| Respeito profissional | respeito ≥ 40 e afinidade < 20 |
| Afinidade crescendo | afinidade ≥ 30 |
| Competição velada | rivalidade ≥ 20 |
| Ainda se conhecendo | confiança ≤ 5 e afinidade ≤ 10 |
| Colegas de banda | caso contrário |

!!! note "Próxima fase"
    Na Fase 4, entra o arco romântico opcional, que depende de escolhas, flags plantadas pelos eventos e reciprocidade, não só de números.
