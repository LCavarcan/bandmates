# Changelog

## 0.5.1 — Publicação

- Jogo publicado no GitHub Pages: <https://lcavarcan.github.io/bandmates/>.
- O workflow de publicação roda os testes antes de cada deploy.

## 0.5.0 — Fase 5: persistência e polimento

### Novo

- **Layout para celular:** barra superior compacta, cartas em coluna única, barra de ação fixa no rodapé, modais em tela cheia, áreas de toque maiores.
- **Dicas no toque:** tocar numa atividade bloqueada mostra o motivo na carta; o botão de conversa indisponível explica por quê; as metas mostram a dica na tela.
- **Backup do save:** exportar e importar arquivo `.json` pela tela de título.
- **`Bandmates.html`:** o jogo num arquivo único (`npm run build:arquivo`), que abre com dois cliques e funciona offline.
- **`npm run dev:rede`** para jogar no celular pela rede local.
- **Proteção contra erros:** em vez de tela em branco, há opções para tentar de novo, baixar o save ou recomeçar.
- Página **Checklist de qualidade** na documentação.

### Corrigido

- Saves estruturalmente inválidos (por exemplo, um arquivo editado à mão) eram aceitos e podiam quebrar a interface. Agora são recusados.
- Chaves de React duplicadas possíveis nas mudanças de recursos de um mesmo evento.
- Voltar ao menu com um modal aberto deixava o estado do modal pendurado.
- Efeitos de `hover` "grudavam" em telas de toque.

## 0.4.0 — Fase 4: campanha

### Novo

- **Shows** em quatro casas, com requisitos de fãs e reputação, intervalo entre apresentações, gênero preferido, setlist (com covers quando faltam músicas), nota, público, cachê, fãs e reputação, que pode cair.
- **Seletiva do Festival Maré Alta** na semana 12: avaliação do júri em cinco componentes, mais metas.
- **Painel "Rumo ao Maré Alta"** com contagem regressiva e 7 metas.
- **Eventos de campanha:** *O cartaz* (semana 1), *Depois do primeiro show*, *Véspera* (semana 11).
- **Arco romântico opcional entre Lia e Nina** (5 eventos), com reciprocidade e a amizade como final possível.
- **Tela final** com o resultado do júri, as estatísticas, um epílogo por integrante e o epílogo do arco.
- Páginas de documentação: *Shows e festival* e *Romance*.

### Alterado

- Continuações e eventos comuns agora disputam por prioridade.
- O save passou para a **versão 4**, com migração.
- O bot de testes marca shows.

## 0.3.0 — Fase 3: personagens e relações

### Novo

- **Eventos narrativos** com cena em estilo visual novel (retratos, falas, escolhas):
    - 9 eventos principais e 4 continuações;
    - condições de ativação baseadas em semana, emoções, relações, recursos, atividades, músicas e escolhas anteriores;
    - escolhas trancadas com motivo, desfechos que dependem do estado e consequências que voltam semanas depois.
- **Conversa da semana:** perguntar, elogiar ou cobrar; cada integrante responde do seu jeito.
- **Modificadores temporários** de atividade, exibidos no plano da semana.
- **Bônus na música em composição** vindos de escolhas narrativas.
- **Entrosamento na gravação:** a química entre quem grava muda o desempenho.
- Página de documentação sobre eventos e conversas, com um guia para escrever eventos novos.

### Alterado

- O save passou para a **versão 3**, com migração automática da v1 e da v2.
- O bot de testes resolve eventos.

## 0.2.0 — Fase 2: ciclo musical

### Novo

- **Nova música:** escolha de título, gênero (4), tema (8), direção artística (3) e líder. As opções mostram quem adora cada gênero ou tema.
- **Reações imediatas** da banda às escolhas. Por exemplo, Lia detesta a direção comercial, e Júlia se ressente quando não lidera.
- **Composição com líder e arranjadoras.** Sem a líder, a música anda devagar.
- Novos atributos: **apelo comercial**, **coesão** e **identidade**.
- **Gravar:** nova atividade (R$ 50 por integrante) que gera a qualidade de gravação e a nota final. Com a banda inteira, a faixa ganha bônus.
- **Ensaio** passa a lapidar a próxima faixa a ser gravada.
- **Lançamento** com recepção (aclamada, hit local, boa, morna). A divulgação na mesma semana amplia o alcance.
- **Streaming** semanal com decaimento.
- **Identidade da banda** exibida no estúdio.
- O plano da semana mostra os problemas que bloqueiam o avanço, o lançamento marcado e a previsão de caixa com streaming.
- Documentação em MkDocs.

### Alterado

- O plano inicial não inclui mais compor (é preciso definir a música antes).
- Divulgar rende mais conforme o número de músicas **lançadas**, não mais compostas.
- O save passou para a **versão 2**, com migração automática da v1.

## 0.1.0 — Fase 1: estrutura funcional

- Estúdio com quatro integrantes, retratos SVG com expressões, calendário de 12 semanas e recursos.
- Atividades: ensaiar, compor, descansar, divulgar e trabalho extra.
- Relações em dupla com quatro dimensões.
- Resumo semanal com falas escritas à mão.
- Salvamento automático local, fim de temporada e testes.
