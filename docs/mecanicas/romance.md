# Romance (opcional)

!!! warning "Contém spoilers"

O MVP tem **um** arco romântico, entre **Lia e Nina**. Os princípios do arco:

- **Opcional.** A campanha termina perfeitamente bem sem ele.
- **Gradual.** São vários eventos ao longo de semanas, cada um com condições próprias.
- **Recíproco.** Os dois lados precisam demonstrar interesse. Uma declaração só dá certo se a relação estiver madura.
- **Nunca automático.** Nenhum número, sozinho, transforma a relação em romance. É preciso passar pelas cenas e pelas escolhas.
- **A amizade é um final válido.** Ela tem epílogo próprio.

## Fluxo

```
Sinais de Lia ─┐                       ┌─► "Fale"   ─► No telhado (1 sem.) ─┐
(O caderno: ler)│                       │                                    ├─► recíproco? ─► juntas ─► As outras perceberam
Momento a sós  ─┼─► Ela sempre fez isso?─► Apagão ─► Você acha que eu devia? ├─► "Espere" ─► No telhado (3 sem.) ─┘          └► não ─► amigas
(Depois que…)   │   (sinal da Nina)       (vulnerab.) │
                                                     └─► "Melhor não misturar" ─► amigas
```

| Etapa | Evento | Condição | O que importa |
|---|---|---|---|
| Sinais da Lia | *O caderno* (ler) · *Depois que todo mundo foi embora* | Veja [Eventos](eventos.md) | Flags `lia_sente_algo` e `lia_nina_momento` |
| Sinal da Nina | **Ela sempre fez isso?** | Semana ≥ 4, afinidade ≥ 30, e um momento a sós ou trabalho juntas | Flag `nina_curiosa` (o interesse dela). "Pergunta pra ela" faz a Nina recuar |
| Vulnerabilidade | **Apagão** | Semana ≥ 5, `nina_curiosa`, confiança ≥ 25 | Deixar as duas a sós dá confiança, afinidade e a flag `apagao_juntas` |
| Decisão | **Você acha que eu devia?** | Semana ≥ 6, `nina_curiosa`, um sinal da Lia (ou o apagão), afinidade ≥ 40 | **Fale** (1 semana) · **Espere** (3 semanas) · **Melhor não misturar** (→ amigas) |
| Declaração | **No telhado** | Agendado pela decisão | **Recíproco** se afinidade ≥ 45, confiança ≥ 35 e estresse da Nina ≤ 80 |
| Consequência | **As outras perceberam** | 2 semanas depois, se ficaram juntas | Como a banda lida com isso |

## Resultados

| Flag `romance` | Significa | Efeitos |
|---|---|---|
| `juntas` | Lia e Nina estão juntas | Afinidade +10, confiança +8 a 10; Lia compõe +15% por 3 semanas ("Lia inspirada"); epílogos especiais |
| `amigas` | A declaração não foi correspondida, ou a jogadora sugeriu a amizade | Confiança da Lia cai; a relação segue, e há um epílogo de amizade |
| (ausente) | O arco não aconteceu, ou ficou no meio | Se houve um momento a sós, um epílogo sugere "talvez na próxima temporada" |

## Por que a gestora não "escolhe" o romance

A jogadora nunca decide **por** elas. Ela cria oportunidades (agendar as duas juntas, deixá-las a sós no apagão), aconselha (fale, espere, não misture) e lida com as consequências na banda. A resposta da Nina depende da relação construída ao longo da campanha.

## Adicionando outros arcos

Outros pares podem ganhar arcos no mesmo formato: um evento com o sinal de cada lado, um de vulnerabilidade, a decisão, a declaração com teste de reciprocidade (`when`) e a consequência na banda. Basta usar uma flag por arco (por exemplo, `romance_julia_bia`) e adicionar os epílogos.
