# Checklist de qualidade

Critérios de aceitação do MVP e **como** cada um foi verificado. Os itens marcados como "não verificado" ainda precisam de uma pessoa jogando.

**Legenda:**
- ✅ **automatizado:** coberto por teste que roda em `npm test`;
- 🔧 **verificado no build:** checado por script ou compilação;
- 👀 **não verificado:** precisa de teste manual.

| Critério | Situação | Como |
|---|---|---|
| É possível iniciar uma campanha | ✅ | Estado inicial; tela de título renderiza com e sem save |
| Todas as ações disponíveis funcionam | ✅ | Testes de cada atividade, composição, gravação, lançamento, show, conversa e evento |
| O avanço de semana atualiza o estado corretamente | ✅ | Aluguel, recursos, histórico, imutabilidade, determinismo |
| As músicas produzem resultados coerentes | ✅ | Comercial dá mais apelo, experimental mais originalidade; o líder acelera; o bônus do evento entra no atributo |
| As relações afetam eventos e resultados | ✅ | Composição, gravação e show melhoram com sinergia; desfechos de eventos dependem da relação |
| Os recursos são calculados corretamente | ✅ | A estimativa de caixa cobre o real; custos de gravação e show conferidos |
| As escolhas narrativas têm consequências | ✅ | Efeitos, continuações agendadas, modificadores, epílogos por flag |
| O romance é realmente opcional | ✅ | O romance só acontece passando pela decisão da Lia; a amizade é um final; a campanha termina sem romance |
| O salvamento preserva a campanha | ✅ | Salvar e carregar dá um estado idêntico; migrações v1→v4 |
| Carregar uma campanha restaura os dados | ✅ | Idem, mais a validação estrutural de arquivos importados |
| Não existem erros no console | ✅ parcial | Os testes de interface falham se o React registrar `console.error` ou `console.warn`. Interações no navegador real: 👀 |
| Não existem botões sem funcionalidade | ✅ parcial | Todo botão chama uma ação do motor; os bloqueados mostram o motivo. Clique a clique: 👀 |
| O jogo funciona sem internet | 🔧 | `build:arquivo` falha se houver URL externa ou arquivo não embutido; fontes do sistema; sem CDN |
| Não existem dependências pagas ou cobranças ocultas | 🔧 | Licenças conferidas (MIT, Apache, BSD, ISC, MPL); nenhuma API, conta ou telemetria |
| Uma campanha completa é jogável | ✅ | O bot joga as 12 semanas várias vezes (seeds diferentes) sem plano inválido |
| O balanceamento do festival faz sentido | ✅ | Jogar bem chega ao menos ao palco alternativo; uma banda que só descansa não passa |
| Layout no celular | 👀 | CSS dedicado (≤ 700px), barra de ação, modais em tela cheia; não foi visto num aparelho |
| Arquivo único abre com dois cliques | 🔧 / 👀 | A estrutura foi conferida (módulo inline, sem imports relativos); não foi aberto num navegador |

## Como testar manualmente (roteiro curto)

1. `npm run build:arquivo` e abra `dist-arquivo/Bandmates.html` com dois cliques.
2. Comece uma campanha e resolva *O cartaz*.
3. Defina uma música, escale a líder para compor e avance algumas semanas.
4. Grave, lance com divulgação e marque um show no Bar do Zé.
5. Converse com cada integrante (uma por semana) e resolva os eventos.
6. Exporte o save, recarregue a página e importe o arquivo.
7. Jogue até a semana 12 e confira a seletiva e os epílogos.
8. Repita no celular com `npm run dev:rede`.
9. Mantenha o console do navegador aberto (F12) durante tudo.
