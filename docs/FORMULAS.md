# Fórmulas de simulação — Bandmates

Todas as regras estão em `src/engine/week.ts` e `src/engine/relations.ts`.
Constantes de economia ficam em `src/data/activities.ts` (`ECONOMY`).
A simulação usa um gerador pseudoaleatório com semente salva no estado: mesma semente e mesmo plano dão o mesmo resultado.

## Fator de disposição (mf)

```
mf = (0.6 + motivação/250) × (1 − estresse/250)        // 0.36 .. 1.0
```

Se o estresse estiver em **85 ou mais** no início da semana (esgotada), `mf` cai pela metade em qualquer atividade, menos em Descansar.

**Retorno decrescente:** `escala(h) = max(0.25, 1 − h/120)`. Quanto maior a habilidade, menor o ganho.

Ganhos de habilidade são arredondados. Um `+rng(0..1)` é somado antes do arredondamento para dar variação.

## Atividades

| Atividade | Efeitos |
|---|---|
| **Ensaiar** | Técnica `+(3.5 + disciplina/40) × mf × escala × grupo`; Ritmo `+3 × mf × escala × grupo`; grupo = 1 se ≥2 ensaiam, senão 0.7. Sociáveis (≥60) ganham +1 de Presença em grupo. Estresse `+6 + perfeccionismo/25`; Confiança +2. Impulsivas: Motivação +3 em grupo, −4 sozinhas. A música mais recente ganha lapidação `(4 + técnica × 0.08) × mf`. |
| **Compor** | Contribuição `(8 + composição × 0.25 + criatividade × 0.08) × mf × colab`. Com parceiras: `colab = 1 + clamp(sinergia média, −30, 30)/100`. Qualidade da contribuição `composição × 0.7 + técnica × 0.15 + mf × 15`. Originalidade `criatividade × 0.55 + composição × 0.3 + rng(0..10) + tensão`, em que `tensão = rivalidade × 0.15` quando o respeito é ≥ 20, ou seja, discordância com respeito gera originalidade. Ao chegar a 100% de progresso, a música nasce com a média ponderada das contribuições. Composição `+(3 + criatividade/50) × mf × escala`. Estresse +4. Sensíveis (≥70): Confiança +4 se contribuíram ≥20, senão −3. As demais: +2. Ambiciosas: Motivação +2. |
| **Descansar** | Padrão: Estresse −24, Motivação +6. Disciplinadas (≥70): −15 / +1 ("não sabem parar"). Impulsivas (≥60): −30 / +8. Confiança +1, ou +3 para sensíveis. |
| **Divulgar** | Custa R$ 40. Fãs `round((6 + presença × 0.15 + sociabilidade × 0.08) × mf × (1 + 0.25 × min(músicas, 4)) + rng(0..3))`. Reputação +1 se presença ≥ 60. Presença `+2 × mf × escala`. Estresse +5. Sociáveis: Motivação +4, Confiança +2. Reservadas (<40): Estresse +4 a mais, Motivação −3. |
| **Trabalho extra** | Ganha `R$ 110 + rng(0..30)`. Impulsivas têm 20% de chance de chegar atrasadas (−R$ 40). Estresse +10, ou +7 para disciplinadas. Motivação −5, ou −9 para ambiciosas. |

## Semana

- Aluguel e contas: **−R$ 120**.
- Caixa negativo ao fim da semana: todas perdem 4 de Motivação e ganham 4 de Estresse.
- Alertas: estresse ≥ 70 (tensa), ≥ 85 (esgotada), motivação ≤ 25 (desanimada).

## Relações (duplas na mesma atividade)

`sinergia = (afinidade + respeito + confiança)/3 − rivalidade/2`

As regras são avaliadas em ordem; vale a primeira que se aplicar:

1. **Descansar juntas:** rivalidade ≥ 40 → faísca (afinidade +2, rivalidade +1); afinidade < −10 → atrito (afinidade +1); senão harmonia (afinidade +4, confiança +2).
2. **Perfeccionista (≥70) × impulsiva (≥60) ensaiando ou compondo:** com respeito ≥ 35 vira aprendizado (respeito +3, rivalidade +1); sem isso, atrito (afinidade −3, confiança −1, respeito +1).
3. **Duas criativas (≥60) compondo:** faísca (respeito +3, rivalidade +2).
4. **Ambas competitivas**, ou uma competitiva com rivalidade ≥ 20: faísca (rivalidade +3, respeito +2).
5. **Sinergia ≥ 15:** harmonia (afinidade +3, confiança +2, respeito +1).
6. **Sinergia < −10:** atrito (afinidade −1, rivalidade +1).
7. **Senão:** neutro (+1 em afinidade, respeito e confiança).

Os rótulos exibidos na interface ("Rivais que se admiram", "Amizade sólida"…) estão em `describeRelation`.
