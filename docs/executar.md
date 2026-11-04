# Como executar

## Pré-requisitos

- **Node.js LTS** ([nodejs.org](https://nodejs.org/)), gratuito. Ele só é necessário para rodar o projeto; o jogo em si não usa a internet.
- Opcional, apenas para gerar esta documentação: **Python 3**.

## Jogar no Windows

No PowerShell ou no Prompt de Comando:

```powershell
cd C:\Users\lcavarcan\Documents\Projetos\Meus\band_game
npm install      # só na primeira vez
npm run dev
```

Depois, abra **<http://localhost:5173>** no navegador. Para encerrar, pressione `Ctrl + C` no terminal.

### Versão otimizada

```powershell
npm run build
npm run preview
```

Depois, abra o endereço exibido (normalmente <http://localhost:4173>).

!!! info "Por que não dá para abrir o `index.html` direto?"
    Os navegadores bloqueiam módulos JavaScript abertos via `file://`. Por isso o jogo precisa de um servidor local (`npm run dev` ou `npm run preview`). Um executável para Windows, que dispensa esse passo, está planejado para a Fase 5.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o jogo em modo de desenvolvimento |
| `npm test` | Roda os testes automatizados |
| `npm run typecheck` | Verifica os tipos do TypeScript |
| `npm run build` | Gera a versão otimizada em `dist/` |
| `npm run docs` | Gera esta documentação em `site/` |

## Salvamento

O progresso é salvo automaticamente no `localStorage` do navegador. Nada sai do computador. Cada navegador (e cada perfil) tem o seu próprio save.
