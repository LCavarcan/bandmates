# Testes

Os testes usam **Vitest** e rodam com:

```powershell
npm test
```

| Arquivo | Cobre |
|---|---|
| `src/engine/engine.test.ts` | Estado inicial, avanço de semana, determinismo, fim da campanha, atividades, relações, salvamento |
| `src/engine/music.test.ts` | Conceito e reações, composição, gravação, lançamento, streaming, caminhos diferentes, campanha completa, migração de save |
| `src/ui/ui.test.tsx` | Teste de fumaça: renderiza todas as telas (com `renderToString`) com estados reais de campanha |

## O bot

`src/engine/bot.ts` joga uma campanha com regras simples:

1. Descansa quem está com estresse ≥ 70.
2. Divulga na semana de lançamento.
3. A líder compõe.
4. Faz trabalho extra quando o caixa está abaixo de R$ 150.
5. Grava quando há música composta.
6. Ensaia nos demais casos.

O bot é usado para garantir que uma campanha completa é jogável, sem planos inválidos e com pelo menos um lançamento. O teste de fumaça da interface também o usa para gerar estados realistas.

## Balanceamento

As expectativas de balanceamento são escritas como **asserções nos testes**, por exemplo:

- "comercial rende mais fãs; original rende mais reputação";
- "a líder presente acelera a composição em mais de 50%";
- "ensaiar em grupo rende mais que sozinha".

Se uma mudança de fórmula quebrar uma dessas expectativas, o teste avisa.

## Antes de cada commit

```powershell
npm test
npm run build      # inclui a checagem de tipos (tsc)
npm run docs       # a documentação precisa gerar sem avisos
```
