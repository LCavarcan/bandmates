# Decisões

Registro curto das decisões de design e de técnica que não estavam especificadas.

## Fase 1

| Decisão | Motivo |
|---|---|
| Uma atividade por integrante por semana | É o mínimo de cliques que ainda gera decisões. Quem faz a mesma atividade passa a semana junta, e a relação muda |
| RNG com semente salva no estado | Testes reproduzíveis e bugs reproduzíveis |
| Aluguel de R$ 120 por semana | Dá sentido ao dinheiro antes dos shows existirem |
| Salvamento automático já na Fase 1 | É simples e evita perder progresso durante os testes |
| Fontes do sistema (Bahnschrift, Segoe UI) | Funciona offline, sem baixar nada |
| Retratos em SVG gerados em código | Arte original e substituível sem tocar na lógica |

## Fase 2

| Decisão | Motivo |
|---|---|
| Uma música em composição por vez | Mantém o foco e simplifica a interface |
| Compor/gravar sem alvo **bloqueia** o avanço (em vez de desperdiçar a semana) | É mais claro: a interface mostra o motivo e desabilita o botão |
| A líder pesa 1.0, as arranjadoras 0.6; sem a líder, todas 0.5 | Escolher a líder é uma decisão real, e ela precisa estar presente |
| Gravar é uma atividade semanal com custo | O fluxo da semana fica uniforme e cria um custo de oportunidade |
| O ensaio lapida a próxima faixa a ser gravada | Dá propósito ao ensaio no ciclo musical |
| Lançar é uma decisão (botão), resolvida no fim da semana | Permite combinar com divulgação na mesma semana |
| Streaming com decaimento de 0,85 por semana | Lançar cedo vale a pena; o catálogo acumula renda |
| Rivalidade com respeito aumenta a originalidade | "Pessoas que discordam podem produzir músicas excelentes" |
| Reações às escolhas aplicadas imediatamente | Feedback na hora: a jogadora vê quem gostou e quem não gostou antes de investir semanas |
| Bot de testes em vez de simulações avulsas | O balanceamento vira asserção versionada, não um número esquecido num terminal |
| MkDocs Material com `font: false` e plugin `offline`, sem Mermaid | A documentação também funciona offline e sem requisições externas |
| Shim `iframe-worker` copiado para `docs/assets/vendor/` (MIT) | O plugin `offline` o buscaria no unpkg.com |

## Fase 3

| Decisão | Motivo |
|---|---|
| Condições e efeitos como **objetos de dados**, não funções | Eventos legíveis, testáveis e serializáveis; quem escreve não precisa programar lógica |
| Escolhas com **desfechos condicionais** (`when`) | O mesmo gesto pode dar certo ou errado; as escolhas dependem de quem está envolvido e do momento |
| No máximo um evento por semana, sem eventos na última semana | Ritmo: a narrativa não engole a gestão |
| Evento pendente **bloqueia** o avanço | Garante que as escolhas sejam feitas; o save preserva o evento |
| Cada evento acontece uma vez | Cada campanha conta uma história diferente; nenhuma vê tudo |
| Continuações agendadas por escolhas (`schedule`) | Consequências que voltam semanas depois |
| A gestora é a "você" das cenas, sem atributos próprios | Mantém o foco nas integrantes; a relação com a gestora aparece nos efeitos e nas flags |
| Conversa: uma por semana, sem gastar atividade | Interação frequente e barata, que não compete com a carreira |
| Modificadores multiplicam o `mf` | Um único ponto de integração; afetam todos os resultados da atividade de forma previsível |
| Entrosamento na gravação limitado a ±15% | Relevante sem dominar a habilidade |
| Retratos da cena "congelados" ao abrir | A expressão não muda no meio da leitura quando a escolha altera as emoções |
| Flags plantadas para o romance (Lia e Nina), sem efeito ainda | O arco da Fase 4 começa a partir de escolhas já feitas, sem retrabalho |

## Fase 4

| Decisão | Motivo |
|---|---|
| Show ocupa a semana da banda inteira | Custo de oportunidade claro: dinheiro e fãs agora contra música depois |
| Setlist com covers quando faltam músicas | Permite fazer shows desde a semana 1 (renda), mas covers rendem pouca reputação |
| Lapidação dos ensaios entra no show | Dá ao ensaio um papel direto na carreira |
| Requisitos e intervalo por casa | Progressão (casas maiores exigem fãs e reputação) sem repetir o mesmo show toda semana |
| Seletiva automática na semana 12, sem cancelamento | Objetivo claro e inevitável |
| Avaliação do júri com 5 componentes + metas | Nenhum caminho único vence: apresentação, música, público, reputação e união pesam |
| Metas valem +3 cada | Progressão visível e marcos intermediários |
| Romance entre Lia e Nina | O par que já tinha a melhor base (silêncio confortável, respeito) e o contraste mais interessante (intuição × controle) |
| Reciprocidade testada no momento da declaração | "Não transforme uma relação em romance só porque um número passou de um limite": é preciso passar pelas cenas, e a resposta pode ser não |
| A amizade tem epílogo próprio | Final válido, não "fracasso" |
| Continuações e eventos disputam por prioridade | A *Véspera* (prioridade 10) nunca é atropelada; uma continuação que perde volta na semana seguinte |

## Fase 5

| Decisão | Motivo |
|---|---|
| Distribuir como **um único HTML** em vez de um `.exe` | Zero dependências novas, cerca de 400 KB, abre com dois cliques, funciona offline em qualquer sistema. Electron adicionaria cerca de 100 MB por cópia; Tauri exigiria a toolchain de Rust. Ambos continuam possíveis depois |
| Script próprio para embutir JS e CSS (sem plugin) | Poucas linhas, sem dependência; aproveita para conferir URLs externas |
| Breakpoint único para celular (700px) | Simples de manter; o layout de tablet já é coberto pelo breakpoint de 1100px |
| Barra de ação fixa no rodapé do celular | O botão de avançar fica sempre ao alcance do polegar, sem rolar até o painel do plano |
| Atividades bloqueadas **tocáveis**, mostrando o motivo | No toque não existe "passar o mouse": um botão só desabilitado não explica nada |
| Animações de `hover` só onde há mouse (`hover: hover`) | No toque, o efeito "gruda" depois de tocar |
| Validação estrutural de saves | Arquivos importados podem vir editados ou corrompidos; o melhor é recusar do que quebrar |
| `ErrorBoundary` com download do save bruto | Se algo quebrar, a jogadora não perde a campanha e pode mandar o arquivo para investigação |
| Testes de interface falham com `console.error` e `console.warn` | Aproxima o critério "sem erros no console" sem precisar de navegador |
| Publicação no GitHub Pages via Actions, com testes antes do deploy | Gratuito para repositório público, sem servidor próprio; um teste quebrado nunca vai ao ar |
| Commits com o e-mail noreply do GitHub antes de tornar o repositório público | O e-mail pessoal não fica exposto no histórico |
| Nenhuma alteração nos retratos | Mudanças visuais sem poder ver o resultado arriscam regressões; a arte definitiva deve substituir os SVGs |
