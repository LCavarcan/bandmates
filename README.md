# Bandmates

Simulador de gerenciamento de banda com narrativa e relações. Feito com TypeScript, React e Vite.
Roda localmente e offline. Não precisa de conta e não tem nenhum custo.

## Como jogar no Windows

**Pré-requisito (apenas uma vez):** instalar o [Node.js LTS](https://nodejs.org/), que é gratuito. Depois de instalar as dependências, o jogo não usa mais a internet.

1. Abra o **PowerShell** ou o **Prompt de Comando** na pasta do projeto:
   ```
   cd C:\Users\lcavarcan\Documents\Projetos\Meus\band_game
   ```
2. Instale as dependências (apenas na primeira vez):
   ```
   npm install
   ```
3. Inicie o jogo:
   ```
   npm run dev
   ```
4. Abra no navegador o endereço exibido: **http://localhost:5173**

Para encerrar, pressione `Ctrl + C` no terminal.

### Versão otimizada (build)

```
npm run build
npm run preview
```

Depois, abra o endereço exibido (normalmente http://localhost:4173).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o jogo em modo de desenvolvimento |
| `npm test` | Roda os testes automatizados (Vitest) |
| `npm run typecheck` | Verifica os tipos do TypeScript |
| `npm run build` | Gera a versão otimizada em `dist/` |

## Como jogar

- Cada semana, escolha uma atividade para cada integrante: **Ensaiar**, **Compor**, **Descansar**, **Divulgar** ou **Trabalho extra**.
- Integrantes que fazem a mesma atividade passam a semana juntas, e a relação entre elas muda conforme a personalidade de cada uma.
- **Avançar semana** aplica as consequências e mostra o resumo da semana.
- O progresso é salvo automaticamente no navegador (`localStorage`). Os dados não saem do computador.

## Estrutura

```
src/
  engine/     motor do jogo (sem React): tipos, semana, relações, salvamento, RNG
  data/       conteúdo: integrantes, atividades, falas, títulos de músicas
  ui/         interface React
    art/      retratos e cenário provisórios em SVG (substituíveis)
    components/
docs/FORMULAS.md   fórmulas de balanceamento
```

- **Motor e interface separados:** `advanceWeek(state)` é uma função pura que devolve o novo estado e o relatório da semana.
- **Determinismo:** o RNG tem semente salva no estado, o que facilita testes e reprodução de bugs.
- **Saves versionados:** `SAVE_VERSION` em `engine/state.ts`. Migrações de saves antigos ficam em `engine/save.ts`.
- **Arte substituível:** para trocar um retrato, basta trocar `ui/art/Portrait.tsx`, mantendo as props `profile` e `mood`.

## Dependências e licenças

Todas as dependências são gratuitas e de código aberto: React (MIT), Vite (MIT), Vitest (MIT) e TypeScript (Apache-2.0). Não há APIs pagas, telemetria, servidores ou contas.
