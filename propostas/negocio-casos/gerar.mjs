import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { documento, escapar, estadoBlocos, renderizarCaso } from './renderizar.mjs';
import { configuracao } from './config.mjs';

const local = new URL('./', import.meta.url);
const saida = new URL('previa/', local);
const modelo = JSON.parse(await readFile(new URL('../../conteudo/pagina-do-negocio.json', local), 'utf8'));
const tokens = JSON.parse(await readFile(new URL('../../tokens/atual.json', local), 'utf8'));
await mkdir(saida, { recursive: true });
const declarar = (valores) => Object.entries(valores).map(([nome, valor]) => `  ${nome}: ${valor};`).join('\n');
const cores = Object.entries(tokens.negocio.paletas).flatMap(([nome, paleta]) =>
  ['escuro', 'claro'].map((tema) => `[data-paleta="${nome}"][data-tema="${tema}"] {\n${declarar(paleta[tema])}\n  color-scheme: ${tema === 'escuro' ? 'dark' : 'light'};\n}`));
await writeFile(new URL('tokens.css', saida), `/* Gerado de tokens/atual.json. Não editar. */\n:root {\n${declarar(tokens.negocio.medida)}\n}\n${cores.join('\n')}\n`);
for (const nome of ['estilos.css', 'carrossel.js', 'midia.svg']) await copyFile(new URL(nome, local), new URL(nome, saida));
for (const caso of modelo.casos) await writeFile(new URL(`${caso.nome}.html`, saida), renderizarCaso(caso));

const ordem = ['recem-criada', 'um-bloco-so', 'cheia', 'avisos-primeiro-com-formulario'];
const casos = ordem.map((nome) => modelo.casos.find((c) => c.nome === nome));
await writeFile(new URL('index.html', saida), documento('Revisão — página pública de negócio', `<main class="revisao limite">
  <p class="handle">Proposta / página pública de negócio</p><h1>Quatro casos.<br>Uma estrutura.</h1>
  <p>Prévias geradas do conteúdo de referência. Comece pelos casos com menos informação.</p>
  <ol class="casos-revisao">${casos.map((c) => `<li><a href="${c.nome}.html"><strong>${escapar(c.negocio.nome)}</strong><span>${escapar(c.nome)} ↗</span></a><p>${escapar(c.por_que)}</p>
    <details><summary>Blocos e ausências</summary><ul>${estadoBlocos(c).map((b) => `<li>${b.bloco}: ${b.estado}</li>`).join('')}</ul></details></li>`).join('')}</ol>
  <aside class="notas"><h2>Sobre esta prévia</h2><p>O formulário tem os três campos explícitos do caso; a descrição geral menciona quatro. É uma demonstração sem envio: o botão está desabilitado, os campos não enviam nem salvam dados. Estados e regras de negócio dependem da integração.</p>
  <p>Entrar leva a um destino demonstrativo. As ilustrações neutras ocupam somente posições marcadas com foto; não representam trabalhos reais. Blocos habilitados vazios não ocupam espaço público.</p>
  <p>O conteúdo está no HTML, mesmo sem JavaScript. A integração deve substituir destino e mídia, e rever a diretiva noindex da prévia.</p></aside></main>`));
await writeFile(new URL(configuracao.destinoEntrar, saida), documento('Acesso ao produto — prévia', `<main class="revisao limite"><p class="handle">Destino demonstrativo</p><h1>Você está em uma prévia.</h1><p>O modelo não fornece a URL de acesso ao okmigo. Este destino não autentica, não solicita credenciais e não cria conta.</p><p>A URL será configurada na integração com o produto.</p><a class="botao" href="index.html">Voltar aos quatro casos <span aria-hidden="true">←</span></a></main>`));
console.log(`Prévia gerada: ${fileURLToPath(new URL('index.html', saida))}`);
