# Shows e festival

Código: `src/engine/shows.ts`. Dados: `src/data/venues.ts` e `src/data/campaign.ts`.

## Marcar um show

No painel **Shows**, escolha uma casa. O show ocupa a **semana da banda inteira**: as quatro ficam escaladas para "Show" e as atividades individuais ficam travadas até o show ser cancelado. Cada semana comporta no máximo um show.

| Casa | Lugares | Cachê ref. | Bilheteria/pessoa | Requisito | Gêneros preferidos | Fãs × | Rep. × | Intervalo |
|---|---:|---:|---:|---|---|---:|---:|---:|
| 🍺 Bar do Zé | 40 | R$ 150 | R$ 4 | — | punk, indie | 1.0 | 0.5 | 2 sem. |
| 🕯️ Porão Cultural Mangue | 90 | R$ 200 | R$ 5 | 60 fãs, rep. 8 | alternativo, indie | 1.1 | 1.2 | 2 sem. |
| 🎓 Calourada da Federal | 220 | R$ 250 | R$ 3 | 110 fãs | pop, punk | 1.3 | 0.6 | 3 sem. |
| 🌅 Casa Aurora | 160 | R$ 400 | R$ 6 | 180 fãs, rep. 20 | indie, alternativo, pop | 1.2 | 1.5 | 3 sem. |

"Intervalo" é quantas semanas a casa espera antes de chamar a banda de novo.

## Setlist

O setlist tem **4 músicas**: as melhores músicas próprias, ordenadas pela nota final (ou pela qualidade × 0,8, se ainda não foram gravadas). As vagas que sobram são **covers**.

```
valor da música própria = (nota ou qualidade × 0.8) × 0.6 + lapidação × 0.4
valor do cover           = 45
qualidade do setlist     = média dos 4 valores
```

**A lapidação (ensaios) entra direto no show.**

## Nota do show

```
desempenho  = média de (presença × 0.45 + técnica × 0.3 + ritmo × 0.25) × (0.6 + 0.4 × mf)
entrosamento = 1 + clamp(união da banda, −30, 30) / 200        // união = sinergia média dos 6 pares
encaixe     = 10 × (fração das músicas próprias em gêneros que a casa prefere)
Nota        = clamp(desempenho × entrosamento × 0.55 + setlist × 0.35 + encaixe + rng(−6..6))
```

| Faixa | Nota |
|---|---|
| Noite memorável | ≥ 75 |
| Bom show | ≥ 58 |
| Show morno | ≥ 42 |
| Desastre | < 42 |

## Resultado

```
público   = capacidade × clamp(0.25 + fãs / (capacidade × 2.5) + reputação / 150, 0.15, 1)
dinheiro  = cachê × (0.6 + nota / 250) + público × bilheteria por pessoa
fãs       = público × nota/100 × 0.4 × fator de fãs × (0.5 + 0.5 × fração própria)
reputação = round((nota − 50) / 8 × fator de reputação × (0.4 + 0.6 × fração própria))
```

- A **reputação pode cair** com shows ruins.
- Covers rendem menos fãs e menos reputação.

### Efeitos em quem toca

- Presença `+2 × mf × escala`.
- Estresse `+10 + perfeccionismo/20`, e +5 a mais para reservadas (sociabilidade < 40).
- Ambiciosas: Motivação +5. Muito sociáveis (≥ 80): Motivação +4.
- Toda a banda: Confiança +5 se a nota for ≥ 65, ou −5 se for < 45.
- As quatro passam a semana juntas, então cada par interage (veja [Relações](relacoes.md)).

## Seletiva do Festival Maré Alta

A **semana 12** é a seletiva. A banda fica escalada automaticamente para o palco do festival (300 lugares, sem cachê, fãs × 1,5, reputação × 2), e não é possível cancelar. Depois do show, o júri avalia:

| Componente | Valor | Peso |
|---|---|---:|
| Apresentação na seletiva | nota do show | 0,40 |
| Melhor música | maior nota final (ou qualidade × 0,8) | 0,20 |
| Público | `fãs / 3` (limitado a 100) | 0,15 |
| Reputação | `reputação × 2,5` (limitado a 100) | 0,15 |
| União da banda | `50 + união` (limitado a 0–100) | 0,10 |

Fãs e reputação já incluem o que a própria seletiva rendeu. Some **+3 por meta cumprida**.

| Resultado | Avaliação |
|---|---|
| **Selecionadas!** (palco principal) | ≥ 66 |
| **Palco alternativo** | ≥ 52 |
| **Não foi dessa vez** | < 52 |

### Metas

| Meta | Condição |
|---|---|
| Gravar 2 músicas | 2 músicas gravadas ou lançadas |
| Lançar uma música | 1 lançada |
| Fazer 3 shows | 3 shows (sem contar a seletiva) |
| Fazer um show com nota 60+ | — |
| Chegar a 150 fãs | — |
| Reputação 20 | — |
| Banda unida | união (sinergia média dos pares) ≥ 15 |

!!! tip "Balanceamento"
    Os testes garantem que uma estratégia razoável (o bot) chega pelo menos ao **palco alternativo** e que uma banda que só descansa **não passa**.

## Final

A tela final mostra o resultado do júri, as estatísticas da temporada, um **epílogo por integrante** e, se houver, o epílogo do arco entre Lia e Nina (veja [Romance](romance.md)). Os epílogos ficam em `EPILOGUES`, em `src/data/campaign.ts`: para cada integrante, vale o primeiro cuja condição for verdadeira.
