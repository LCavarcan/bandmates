# Como executar

## Jeito mais fácil: um arquivo só

```powershell
npm run build:arquivo
```

O comando gera **`dist-arquivo/Bandmates.html`**, com o jogo inteiro (código, estilo e ícone) num único arquivo de cerca de 400 KB.

- **Abre com dois cliques**, direto do disco: não precisa de servidor, instalação nem internet.
- **Para compartilhar**, basta mandar o arquivo. Quem receber só precisa de um navegador (Edge, Chrome ou Firefox).
- O save fica no navegador. Se você mover o arquivo de pasta, o navegador pode tratá-lo como outro "site", com outro save. Use o backup (veja abaixo) para levar o progresso.

## Modo de desenvolvimento

**Pré-requisito (uma vez):** instalar o **Node.js LTS** ([nodejs.org](https://nodejs.org/)), que é gratuito.

```powershell
cd C:\Users\lcavarcan\Documents\Projetos\Meus\band_game
npm install      # só na primeira vez
npm run dev
```

Depois, abra **<http://localhost:5173>**. Para encerrar, pressione `Ctrl + C`.

## No celular

Com o celular e o PC **no mesmo Wi‑Fi**:

```powershell
npm run dev:rede
```

O terminal mostra uma linha **Network**, por exemplo `http://192.168.0.15:5173/`. Abra esse endereço no navegador do celular. Na primeira vez, o Firewall do Windows pergunta se o Node.js pode acessar a rede: escolha **Redes privadas**.

!!! warning "Use a rede de casa"
    Em redes corporativas, o firewall costuma bloquear. Além disso, não é recomendável expor um servidor de desenvolvimento nelas.

No celular, a interface usa uma coluna, uma barra fixa com o botão **Avançar** no rodapé e modais em tela cheia. As dicas que no PC aparecem ao passar o mouse aparecem na própria tela com um toque.

## Backup do save

O progresso é salvo automaticamente no navegador (`localStorage`), e nada sai do aparelho. Na tela de título:

- **⬇️ Exportar save** baixa um arquivo `.json` com a campanha atual;
- **⬆️ Importar save** carrega um arquivo exportado. Ele é validado antes: arquivos corrompidos ou de versões incompatíveis são recusados com uma mensagem.

Use o backup para levar a campanha do PC para o celular (ou para outro navegador) e para não perder nada ao limpar os dados do navegador.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o jogo em modo de desenvolvimento |
| `npm run dev:rede` | O mesmo, acessível por outros aparelhos da rede local |
| `npm test` | Roda os testes automatizados |
| `npm run typecheck` | Verifica os tipos do TypeScript |
| `npm run build` | Gera a versão otimizada em `dist/` (servida com `npm run preview`) |
| `npm run build:arquivo` | Gera `dist-arquivo/Bandmates.html`, o jogo num arquivo único |
| `npm run docs` | Gera esta documentação em `site/` |
