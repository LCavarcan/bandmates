# Semana e atividades

Código: `src/engine/week.ts`. Dados e falas: `src/data/activities.ts`.

## Ordem de resolução

Ao clicar em **Avançar semana**, a simulação segue esta ordem:

1. **Validação do plano.** Compor sem música definida ou gravar sem música composta bloqueia o avanço (`planIssues`).
2. **Atividades individuais**, na ordem Júlia, Lia, Bia, Nina.
3. **Música:** composição concluída → gravação concluída → streaming das músicas já lançadas → lançamento marcado.
4. **Duplas:** cada par na mesma atividade interage (veja [Relações](relacoes.md)).
5. **Custos fixos:** aluguel. Se o caixa ficar negativo, todas perdem motivação.
6. **Alertas** de estresse e motivação.
7. A semana avança. Ao passar da semana 12, a temporada termina.

A simulação usa um gerador pseudoaleatório com semente salva no estado. Com a mesma semente e o mesmo plano, o resultado é sempre o mesmo.

## Fator de disposição

```
mf = (0.6 + motivação/250) × (1 − estresse/250)        // 0.36 .. 1.0
```

O fator é calculado **no início** da semana. Se o estresse estiver em **85 ou mais** (esgotada), `mf` cai pela metade em qualquer atividade, menos em Descansar.

**Retorno decrescente:** `escala(h) = max(0.25, 1 − h/120)`. Quanto maior a habilidade, menor o ganho.

Os ganhos de habilidade são arredondados, com `+rng(0..1)` somado antes do arredondamento para dar variação.

## Atividades

### 🥁 Ensaiar

- Técnica `+(3.5 + disciplina/40) × mf × escala × grupo`.
- Ritmo `+3 × mf × escala × grupo`.
- `grupo = 1` com 2 ou mais pessoas ensaiando; sozinha, `0.7`.
- Sociáveis (≥ 60) em grupo: Presença +1.
- Estresse `+6 + perfeccionismo/25`. Confiança +2.
- Impulsivas (≥ 60): Motivação +3 em grupo, −4 sozinhas.
- **Lapidação:** a [próxima música a ser gravada](musica.md#ensaio-e-lapidacao) ganha `(4 + técnica × 0.08) × mf`.

### ✍️ Compor

Exige uma música definida. Veja [Ciclo musical](musica.md#composicao).

- Composição `+(3 + criatividade/50) × mf × escala`. Estresse +4.
- Sensíveis (≥ 70): Confiança +4 se contribuíram com ≥ 20 de progresso, senão −3. As demais: +2.
- Ambiciosas (≥ 70): Motivação +2.

### 🎙️ Gravar

Custa **R$ 50 por integrante**. Veja [Ciclo musical](musica.md#gravacao).

- Técnica `+1.5 × escala` (+rng).
- Estresse `+7 + perfeccionismo/20`. Confiança +2.

### ☕ Descansar

| Perfil | Estresse | Motivação |
|---|---:|---:|
| Disciplinada (≥ 70), "não sabe parar" | −15 | +1 |
| Impulsiva (≥ 60) | −30 | +8 |
| Demais | −24 | +6 |

Confiança +1, ou +3 para sensíveis (≥ 70).

### 📣 Divulgar

Custa **R$ 40**.

- Fãs `round((6 + presença × 0.15 + sociabilidade × 0.08) × mf × (1 + 0.25 × min(lançadas, 4)) + rng(0..3))`.
- Reputação +1 se presença ≥ 60. Presença `+2 × mf × escala`.
- Estresse +5. Sociáveis (≥ 60): Motivação +4 e Confiança +2. Reservadas (< 40): Estresse +4 a mais e Motivação −3.
- Na semana de um lançamento, cada pessoa divulgando amplia os fãs do lançamento em +30%.

### 💼 Trabalho extra

- Ganha `R$ 110 + rng(0..30)`. Impulsivas têm 20% de chance de chegar atrasadas (−R$ 40).
- Estresse +10, ou +7 para disciplinadas.
- Motivação −5, ou −9 para ambiciosas.

## Alertas

| Condição | Alerta |
|---|---|
| estresse ≥ 85 | Esgotada: rende metade na próxima semana se não descansar |
| estresse ≥ 70 | Tensa |
| motivação ≤ 25 | Desanimada |
| caixa < 0 | Todas: Motivação −4, Estresse +4 |
