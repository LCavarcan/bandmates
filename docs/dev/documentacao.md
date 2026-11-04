# Documentação

Esta documentação usa **MkDocs** com o tema **Material for MkDocs**, ambos gratuitos e de código aberto (licenças BSD e MIT). A configuração fica em `mkdocs.yml`, e as páginas, em `docs/`.

## Instalar (uma vez)

O MkDocs roda num ambiente virtual Python dentro do projeto (`.venv`, ignorado pelo Git):

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-docs.txt
```

## Gerar

```powershell
npm run docs
```

O comando executa `mkdocs build --strict`, que falha se houver um link quebrado ou uma página fora da navegação. O site é gerado em `site/`. Para lê-lo, abra `site/index.html` no navegador; graças ao plugin `offline`, funciona direto do disco, sem servidor.

Para editar com recarga automática, use `.venv\Scripts\mkdocs serve` e abra <http://127.0.0.1:8000>.

## Offline e custo zero

- `font: false`: usa as fontes do sistema, sem requisições ao Google Fonts.
- Plugin `offline`: a busca e a navegação funcionam via `file://`.
- Sem Mermaid: o tema o carregaria de um CDN externo.

## Convenções

- Cada sistema implementado atualiza a página de mecânica correspondente **no mesmo commit**.
- As fórmulas da documentação devem corresponder ao código. Se houver divergência, vale o código, e a documentação deve ser corrigida.
- Decisões de design não especificadas vão para [Decisões](../projeto/decisoes.md).
- Cada fase concluída entra no [Changelog](../projeto/changelog.md).
