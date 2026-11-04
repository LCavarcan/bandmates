// Gera dist-arquivo/Bandmates.html: o jogo inteiro num único arquivo,
// que abre com dois cliques (file://), sem servidor e sem internet.
// Uso: npm run build:arquivo  (roda o build do Vite antes).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const outDir = join(root, 'dist-arquivo');
const read = (rel) => readFileSync(join(dist, rel), 'utf8');

let html = read('index.html');

// JS: módulo embutido. Módulos inline funcionam em file:// (o bloqueio é só para buscar arquivos .js).
html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/, (_, src) => {
  const js = read(src).replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});

// CSS embutido.
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/, (_, href) => `<style>${read(href)}</style>`);

// Ícone como data URI.
html = html.replace(/<link rel="icon" type="image\/svg\+xml" href="\.\/favicon\.svg" \/>/, () => {
  const svg = read('favicon.svg');
  return `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,${encodeURIComponent(svg)}" />`;
});

// Verificações: nenhum arquivo local pendente e nenhuma URL externa carregada.
const leftovers = html.match(/(src|href)="\.\/[^"]+"/g);
if (leftovers) {
  console.error('Referências locais não embutidas:', leftovers);
  process.exit(1);
}
// Namespaces de SVG/XML e links de documentação de erro do React são texto, não requisições.
const harmless = /^https?:\/\/(www\.w3\.org|react\.dev)\//;
const urls = [...new Set(html.match(/https?:\/\/[^\s"'`)<>\\]+/g) ?? [])].filter((u) => !harmless.test(u));
if (urls.length) {
  console.error('URLs externas encontradas no build:', urls);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const out = join(outDir, 'Bandmates.html');
writeFileSync(out, html);
console.log(`✓ ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB) — abre com dois cliques, funciona offline.`);
