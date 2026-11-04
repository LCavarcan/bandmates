# Testes

Os testes usam **Vitest** e rodam com:

```powershell
npm test
```

| Arquivo | Cobre |
|---|---|
| `src/engine/engine.test.ts` | Estado inicial, avanço de semana, determinismo, fim da campanha, atividades, relações, salvamento |
| `src/engine/music.test.ts` | Conceito e reações, composição, gravação, lançamento, streaming, caminhos diferentes, campanha completa, migração de save |
| `src/engine/events.test.ts` | Validade dos dados de eventos, disparo, bloqueio, não repetição, requisitos, desfechos condicionais, continuações, modificadores, bônus de música, conversas, entrosamento na gravação, migração v2→v3 |
| `src/engine/campaign.test.ts` | Agendamento e requisitos das casas, intervalo, resultado do show, covers, lapidação, união, seletiva automática, pesos e metas, **balanceamento do festival**, romance (reciprocidade, amizade, opcionalidade), epílogos, migração v3→v4 |
| `src/ui/ui.test.tsx` | Teste de fumaça: renderiza todas as telas (com `renderToString`) com estados reais de campanha. **Falha se o React registrar `console.error` ou `console.warn`**. Cobre a barra do celular, o aviso de toque nas atividades bloqueadas e o backup |

## O bot

`src/engine/bot.ts` joga uma campanha com regras simples:

1. Resolve qualquer evento pendente com a primeira escolha disponível. Na seletiva, só lança o que estiver pronto.
2. Marca um show na maior casa disponível quando o caixa está abaixo de R$ 150 ou a cada quatro semanas.
3. Descansa quem está com estresse ≥ 70.
4. Divulga na semana de lançamento.
5. A líder compõe.
6. Faz trabalho extra quando o caixa está abaixo de R$ 150.
7. Grava quando há música composta.
8. Ensaia nos demais casos.

O bot é usado para garantir que uma campanha completa é jogável, sem planos inválidos e com pelo menos um lançamento. O teste de fumaça da interface também o usa para gerar estados realistas.

## Balanceamento

As expectativas de balanceamento são escritas como **asserções nos testes**, por exemplo:

- "comercial rende mais fãs; original rende mais reputação";
- "a líder presente acelera a composição em mais de 50%";
- "ensaiar em grupo rende mais que sozinha";
- "jogar bem chega ao menos ao palco alternativo; uma banda que só descansa não passa".

Se uma mudança de fórmula quebrar uma dessas expectativas, o teste avisa.

## Verificação offline

`npm run build:arquivo` falha se o HTML final tiver uma URL externa (exceto namespaces de SVG e links de documentação do React, que são texto) ou um arquivo local não embutido.

## Antes de cada commit

```powershell
npm test
npm run build      # inclui a checagem de tipos (tsc)
npm run docs       # a documentação precisa gerar sem avisos
```
