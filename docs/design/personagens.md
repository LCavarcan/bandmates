# Personagens

Os dados estão em `src/data/members.ts`. Os retratos provisórios ficam em `src/ui/art/Portrait.tsx`.

Os traços vão de 0 a 100, e só os relevantes de cada personagem são definidos (o padrão é 0). As regras do motor usam limiares como "≥ 70".

## Júlia — vocal

> “Se é pra subir no palco, que seja pra ninguém esquecer.”

- **Quer:** ver a banda crescer e ser reconhecida por isso.
- **Teme:** trabalhar duro e continuar invisível.
- **Conflito:** precisa aprender a dividir o protagonismo.
- **Traços:** ambição 85, competitividade 80, sociabilidade 75, sensibilidade 40.
- **Gêneros:** pop 90 · indie 55 · punk 50 · alternativo 45.
- **Temas pessoais:** ambição (95).
- **No jogo:** adora a direção comercial e se ressente quando não lidera uma música (a rivalidade com a líder sobe). O trabalho extra a desanima mais que às outras.

## Lia — guitarra e composição

> “Tá tudo na letra. Só não me pede pra explicar.”

- **Quer:** ser compreendida sem precisar traduzir tudo o que sente.
- **Teme:** que rejeitem a música e, com ela, a ela mesma.
- **Conflito:** interpreta críticas como rejeição pessoal.
- **Traços:** criatividade 90, sensibilidade 80, perfeccionismo 50, sociabilidade 30.
- **Gêneros:** indie 92 · alternativo 80 · punk 45 · pop 35.
- **Temas pessoais:** amor não correspondido (90), saudade (85).
- **No jogo:** é a melhor compositora, mas a confiança dela oscila (ganha numa semana produtiva, perde numa travada). Detesta a direção comercial. Divulgar a cansa.

## Bia — bateria

> “Plano? A gente descobre no caminho.”

- **Quer:** que tocar continue divertido, mesmo quando virar coisa séria.
- **Teme:** decepcionar alguém que contava com ela.
- **Conflito:** evita responsabilidades e conversas desconfortáveis.
- **Traços:** sociabilidade 85, impulsividade 80, criatividade 65, disciplina 20.
- **Gêneros:** punk 92 · indie 65 · alternativo 60 · pop 55.
- **Temas pessoais:** amizade (90), liberdade (85), rebeldia (80).
- **No jogo:** descansa muito bem e se anima ensaiando em grupo (mas desanima sozinha). Às vezes chega atrasada no trabalho extra. Tem atrito com a perfeccionista Nina.

## Nina — baixo

> “De novo. Do compasso doze.”

- **Quer:** que as coisas saiam do jeito que foram combinadas.
- **Teme:** o imprevisível, principalmente quando vem de pessoas.
- **Conflito:** aprender a conviver com a imprevisibilidade.
- **Traços:** disciplina 90, perfeccionismo 85, sensibilidade 45, ambição 50, sociabilidade 30.
- **Gêneros:** alternativo 88 · indie 60 · pop 45 · punk 35.
- **Temas pessoais:** recomeço (75).
- **No jogo:** ganha mais técnica nos ensaios e se estressa mais. Descansa pela metade ("não sabe parar"). A direção experimental a deixa tensa.

!!! note "Romance"
    O arco romântico opcional do MVP é entre **Lia e Nina**. Veja [Romance](../mecanicas/romance.md).

## Relações iniciais

| Par | História | Afin. | Resp. | Conf. | Rival. |
|---|---|---:|---:|---:|---:|
| Júlia & Bia | Amigas de escola: confiança antiga, pouco respeito profissional | 35 | 10 | 25 | 5 |
| Júlia & Lia | A voz da banda e a autora das músicas: admiração desconfiada | 5 | 20 | 5 | 25 |
| Júlia & Nina | Respeito técnico, sem intimidade | 0 | 25 | 10 | 15 |
| Lia & Bia | Leveza, Bia tira Lia da concha | 25 | 15 | 15 | 0 |
| Lia & Nina | Silêncio confortável, respeito mútuo | 15 | 30 | 20 | 0 |
| Bia & Nina | O caos e o metrônomo | 5 | 5 | 0 | 10 |

## Expressões

O retrato muda conforme o estado emocional (`moodOf`, em `Portrait.tsx`). A primeira condição verdadeira vale:

| Condição | Expressão |
|---|---|
| estresse ≥ 75 | Tensa |
| motivação ≤ 30 | Desanimada |
| estresse ≥ 55 | Cansada |
| motivação ≥ 70 | Animada |
| caso contrário | Tranquila |

!!! tip "Trocar a arte"
    Para usar ilustrações definitivas, substitua o componente `Portrait` por imagens (uma por expressão), mantendo as props `profile`, `mood` e `size`. Nenhuma regra do jogo depende do desenho.
