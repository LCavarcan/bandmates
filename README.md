# Bandmates

Simulador de gerenciamento de banda com narrativa e relações. Feito com TypeScript, React e Vite.
Roda localmente e offline. Não precisa de conta e não tem nenhum custo.

**Versão 0.5.0:** MVP completo — Fases 1 a 5 concluídas (estrutura, ciclo musical, personagens e eventos, campanha com festival e romance opcional, polimento com layout para celular e distribuição em arquivo único).

## Jogar

**Arquivo único (mais fácil):** `npm run build:arquivo` gera `dist-arquivo/Bandmates.html`, que abre com dois cliques e funciona offline.

**No celular:** `npm run dev:rede` e abra no celular o endereço "Network" mostrado (mesmo Wi‑Fi).

## Modo de desenvolvimento no Windows

**Pré-requisito (apenas uma vez):** instalar o [Node.js LTS](https://nodejs.org/), que é gratuito.

```powershell
cd C:\Users\lcavarcan\Documents\Projetos\Meus\band_game
npm install      # só na primeira vez
npm run dev
```

Depois, abra **http://localhost:5173** no navegador. Para encerrar, pressione `Ctrl + C`.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o jogo |
| `npm test` | Roda os testes (Vitest) |
| `npm run dev:rede` | Inicia o jogo acessível pela rede local (celular) |
| `npm run build` | Checa os tipos e gera a versão otimizada em `dist/` |
| `npm run build:arquivo` | Gera `dist-arquivo/Bandmates.html` (arquivo único, offline) |
| `npm run docs` | Gera a documentação em `site/` (requer o ambiente Python, veja abaixo) |

## Documentação

A documentação completa de design, mecânicas, fórmulas, arquitetura e decisões fica em `docs/` e é gerada com MkDocs:

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-docs.txt   # só na primeira vez
npm run docs
```

Para ler, abra `site/index.html` no navegador. Funciona offline, direto do disco.

## Estrutura

```
src/engine/   motor do jogo (puro, sem React)
src/data/     conteúdo: personagens, atividades, música, falas
src/ui/       interface React e arte provisória em SVG
docs/         documentação (MkDocs)
```

## Licenças

Todas as dependências são gratuitas e de código aberto: React, Vite e Vitest (MIT), TypeScript (Apache-2.0), MkDocs (BSD) e Material for MkDocs (MIT). Não há APIs pagas, telemetria, servidores ou contas.
