# Saves e migrações

Código: `src/engine/save.ts`.

## Formato

O save fica em `localStorage`, na chave `bandmates.save`:

```json
{
  "version": 4,
  "savedAt": "2026-11-04T12:00:00.000Z",
  "state": { "...": "GameState completo" }
}
```

O jogo salva automaticamente a cada mudança de estado. O armazenamento é acessado pela interface mínima `KeyValueStore`; nos testes, ela é substituída por um mapa em memória.

## Validação

Todo save carregado (do navegador ou de arquivo importado) passa por `isValidState`, que confere tipos, as quatro integrantes, os seis pares de relação e as listas obrigatórias. Um save inválido é recusado, e o jogo oferece começar de novo, em vez de quebrar.

## Backup em arquivo

Na tela de título, **Exportar save** baixa o mesmo JSON do `localStorage`, e **Importar save** o carrega, passando pela migração e pela validação. Veja `src/ui/saveFile.ts`.

## Se algo quebrar

`ErrorBoundary` (`src/ui/ErrorBoundary.tsx`) captura erros de renderização e oferece: tentar de novo, baixar o save bruto para investigar, ou apagar o save e recomeçar.

## Versões

| Versão | Mudança |
|---|---|
| 1 | Fase 1: músicas com qualidade, originalidade e lapidação |
| 2 | Fase 2: conceito (gênero, tema, direção, líder), apelo, coesão, identidade, gravação, lançamento, `pendingRelease` |
| 3 | Fase 3: `pendingEvent`, `eventLog`, `scheduled`, `modifiers`, `talkedWeek`, `draft.bonus` |
| 4 | Fase 4: `booking`, `shows`, `festival`. Um save que já estava na semana 12 entra na seletiva com a banda escalada |

## Como adicionar uma migração

1. Aumente `SAVE_VERSION` em `src/engine/state.ts`.
2. Em `MIGRATIONS`, em `save.ts`, adicione a entrada `[versão antiga]: (st) => { ...; st.version = nova; return st; }`.
3. Escreva um teste que carregue um save da versão antiga (veja "converte um save v1 para v2" em `music.test.ts`).

As migrações são aplicadas em cadeia (v1 → v2 → v3…). Um save de versão desconhecida é rejeitado, e a tela de título oferece uma nova campanha.
