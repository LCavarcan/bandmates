# Ciclo musical

Código: `src/engine/music.ts`. Dados: `src/data/music.ts`.

```
Nova música (conceito) → Compor (semanas) → Composta → Gravar → Gravada → Lançar → Lançada → streaming
```

O jogo não gera áudio. As músicas são objetos com atributos de 0 a 100, calculados a partir das escolhas e de quem participou.

## Conceito

Ao clicar em **Nova música**, a jogadora escolhe:

| Escolha | Opções |
|---|---|
| Título | Livre (até 40 caracteres), com sugestões |
| Gênero | Indie rock, Pop, Alternativo, Punk rock |
| Tema | Amor não correspondido, Cidade à noite, Amizade, Liberdade, Saudade, Ambição, Recomeço, Rebeldia |
| Direção | Comercial, Experimental, Emocional |
| Líder | Uma das quatro |

Só existe **uma música em composição por vez**.

### Gêneros

| Gênero | Habilidade-chave | Apelo | Originalidade | Temas que combinam |
|---|---|---:|---:|---|
| Indie rock | Composição | 0 | +4 | Cidade, Saudade, Amor |
| Pop | Presença | +15 | −6 | Amor, Amizade, Ambição |
| Alternativo | Técnica | −6 | +10 | Recomeço, Cidade, Saudade |
| Punk rock | Ritmo | −3 | +3 | Rebeldia, Liberdade, Amizade |

### Direções

| Direção | Apelo | Originalidade | Coesão | Identidade | Extra |
|---|---:|---:|---:|---:|---|
| Comercial | +20 | −10 | 0 | −5 | — |
| Experimental | −15 | +18 | −8 | 0 | — |
| Emocional | 0 | +5 | +5 | +10 | Qualidade + sensibilidade da líder × 0.08 |

Apelo por tema: amor +10, amizade +6, ambição +5, cidade +4, liberdade +2, saudade 0, recomeço 0, rebeldia −4.

### Reações da banda

Ao confirmar o conceito, cada integrante reage na hora, de acordo com seus traços e gostos:

| Regra | Efeito |
|---|---|
| Afinidade com o gênero ≥ 80 | Motivação +4 |
| Afinidade com o gênero ≤ 40 | Motivação −3 |
| Comercial + criatividade ≥ 80 | Motivação −5 (Lia) |
| Comercial + ambição ≥ 70 | Motivação +5 (Júlia) |
| Experimental + criatividade ≥ 60 | Motivação +4 |
| Experimental + ambição ≥ 70 (sem criatividade ≥ 60) | Motivação −3 |
| Experimental + perfeccionismo ≥ 80 | Estresse +4 (Nina) |
| Emocional + sensibilidade ≥ 70 | Motivação +4 |
| Ser a líder | Confiança +4; +3 a mais se o tema ressoa ≥ 85 com ela |
| Ambição e competitividade ≥ 70, não lidera, nem liderou nenhuma das 2 últimas músicas | Motivação −3; Rivalidade com a líder +3 (Júlia) |

## Composição

Cada integrante escalada para **Compor** contribui com progresso. A música fica pronta quando o progresso soma 100.

```
peso   = 1.0 (líder) | 0.6 (arranjadora, com a líder presente) | 0.5 (todas, sem a líder)
colab  = 1 + clamp(sinergia média com as outras compositoras, −30, 30) / 100
tensão = média de (rivalidade × 0.15) com parceiras de respeito ≥ 20

progresso    = (8 + composição × 0.25 + criatividade × 0.08) × mf × colab × peso
qualidade    = composição × 0.4 + habilidade-chave do gênero × 0.25 + técnica × 0.1
               + afinidade com o gênero × 0.15 + mf × 10
originalidade = criatividade × 0.5 + composição × 0.25 + rng(0..10) + tensão
```

A qualidade e a originalidade de cada semana entram numa **média ponderada pelo progresso**. Ao concluir:

```
Qualidade     = média ponderada (+ sensibilidade da líder × 0.08 se Emocional)
Originalidade = média ponderada + gênero + direção
Apelo         = 15 + gênero + tema + direção + Qualidade × 0.25
                + presença da líder × 0.1 + sociabilidade da líder × 0.05
Coesão        = 55 + (sinergia média entre as autoras × 0.4, ou +5 se for uma só)
                + (afinidade média das autoras com o gênero − 55) × 0.4
                + direção + 8 se o tema combina com o gênero
Identidade    = 35 + ressonância da líder com o tema × 0.25
                + afinidade da líder com o gênero × 0.15 + direção + continuidade
continuidade  = 12 na primeira música; depois,
                15 × (fração das músicas anteriores do mesmo gênero)
                + 10 × (fração com a mesma direção)
```

**Bônus de eventos:** escolhas em eventos (por exemplo, *O refrão*) podem somar ajustes à música em composição. Eles entram em cada atributo no momento em que ela fica pronta.

Todos os atributos são limitados a 0–100. Os temas pessoais e as afinidades com gêneros de cada personagem estão em [Personagens](../design/personagens.md).

!!! example "Caminhos diferentes"
    - **Lia, indie, saudade, emocional:** alta qualidade, originalidade e identidade, apelo modesto. Rende reputação.
    - **Júlia, pop, ambição, comercial:** alto apelo e muitos fãs. Lia perde motivação, e a originalidade é baixa.
    - **Nina, alternativo, recomeço, experimental:** muito original; Nina fica tensa e o alcance é pequeno.
    - Compor em dupla acelera, mas a química da dupla muda a coesão. Uma rivalidade com respeito aumenta a originalidade.

## Ensaio e lapidação

O ensaio lapida a **próxima música a ser gravada**, ou seja, a mais antiga com estado *Composta*. Se não houver nenhuma, lapida a mais recente com lapidação abaixo de 100. Cada pessoa ensaiando soma `(4 + técnica × 0.08) × mf`.

## Gravação

Exige uma música *Composta*. Cada integrante escalada para **Gravar** custa R$ 50 e contribui:

```
entrosamento = 1 + clamp(sinergia média com quem grava junto, −30, 30) / 200   // ±15%
progresso    = (18 + técnica × 0.2 + ritmo × 0.1) × mf
desempenho   = (técnica × 0.45 + ritmo × 0.35 + presença × 0.2) × (0.7 + 0.3 × mf) × entrosamento
```

Gravar com quem você não se dá bem soa pior.

Ao chegar a 100 de progresso:

```
Gravação   = desempenho médio × 0.75 + lapidação × 0.25 + 5 se as quatro gravaram
Nota final = Qualidade × 0.25 + Gravação × 0.3 + Coesão × 0.15
             + Originalidade × 0.15 + Identidade × 0.15
```

Com as quatro gravando, a faixa costuma ficar pronta em uma semana; em dupla, em duas ou três.

## Lançamento

Uma música *Gravada* pode ser marcada com **🚀 Lançar nesta semana**. O lançamento acontece no fim da semana:

```
promotoras = integrantes em Divulgar nesta semana
Fãs        = round(nota/100 × (12 + Apelo × 0.7) × (1 + 0.3 × promotoras) × (1 + reputação/80))
Reputação  = round(nota/100 × (Originalidade × 0.07 + Identidade × 0.05))
             + 3 se Aclamada, ou + 2 se nota ≥ 75
```

### Recepção

A primeira condição verdadeira vale:

| Recepção | Condição |
|---|---|
| Aclamada | nota ≥ 72 e originalidade ≥ 65 |
| Hit local | apelo ≥ 65 e nota ≥ 55 |
| Boa | nota ≥ 50 |
| Morna | caso contrário |

- Autoras: Confiança +4 se a recepção não for morna, senão −4.
- Toda a banda: Motivação +3 se a recepção não for morna, senão −2.

## Streaming

A partir da semana **seguinte** ao lançamento, cada música rende:

```
decaimento = 0.85 ^ (semanas desde o lançamento − 1)
Dinheiro   = round((10 + Apelo × 0.8 + fãs do lançamento × 0.3) × nota/100 × decaimento)
Fãs        = round(fãs do lançamento × 0.2 × decaimento)
```

**Lançar cedo rende mais semanas de streaming. Lançar com divulgação rende mais fãs, e os fãs do lançamento aumentam o streaming.**

## Identidade da banda

Aparece no topo do estúdio. É formada pelo gênero mais frequente e pela direção mais frequente entre as músicas da banda, por exemplo "Indie rock confessional", "Pop radiofônico" ou "Alternativo experimental".
