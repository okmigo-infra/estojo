// O conferidor do estojo (OMINFRA-851) — roda no CI de toda PR e de todo push.
//
// ⭐ O repositório é PÚBLICO e recebe proposta de fora. Sem este gate, um JSON
// quebrado, um link morto, um token colado por engano ou o telefone de alguém
// de verdade chegariam à main sem ninguém ver. Node puro, sem dependência:
// quem desenha roda `node ferramentas/conferir.mjs` antes de abrir a PR.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const erros = [];
const erro = (onde, msg) => erros.push(`${onde}: ${msg}`);

function* arquivos(dir) {
  for (const nome of readdirSync(dir)) {
    if (['.git', 'node_modules', 'casca', 'saida'].includes(nome)) continue;
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) yield* arquivos(p); else yield p;
  }
}

// 1 · o conteúdo das superfícies tem a forma que a casca espera
const OBRIGATORIAS = ['superficie', 'o_que_faz', 'quem_abre', 'regras_que_precisam_sobreviver', 'casos'];
for (const nome of readdirSync(join(RAIZ, 'conteudo')).filter((n) => n.endsWith('.json'))) {
  const onde = `conteudo/${nome}`;
  let d;
  try { d = JSON.parse(readFileSync(join(RAIZ, 'conteudo', nome), 'utf8')); }
  catch (e) { erro(onde, `JSON inválido — ${e.message}`); continue; }
  for (const k of OBRIGATORIAS) if (!(k in d)) erro(onde, `falta a chave «${k}»`);
  if (typeof d.superficie !== 'string' || !d.superficie.trim()) erro(onde, '«superficie» tem de ser o título da tela');
  if (!Array.isArray(d.casos) || d.casos.length === 0) { erro(onde, '«casos» tem de ser uma lista com pelo menos um caso'); continue; }
  const vistos = new Set();
  d.casos.forEach((c, i) => {
    if (typeof c?.nome !== 'string' || !c.nome.trim()) erro(onde, `caso ${i + 1} sem «nome»`);
    if (typeof c?.por_que !== 'string' || !c.por_que.trim()) erro(onde, `caso «${c?.nome ?? i + 1}» sem «por_que» — o caso existe para ensinar alguma coisa`);
    if (vistos.has(c?.nome)) erro(onde, `caso «${c.nome}» repetido`);
    vistos.add(c?.nome);
  });
}

// 2 · os tokens se leem
for (const nome of readdirSync(join(RAIZ, 'tokens')).filter((n) => n.endsWith('.json'))) {
  try { JSON.parse(readFileSync(join(RAIZ, 'tokens', nome), 'utf8')); }
  catch (e) { erro(`tokens/${nome}`, `JSON inválido — ${e.message}`); }
}

// 3 · link relativo de markdown aponta para o que existe
for (const p of arquivos(RAIZ)) {
  if (!p.endsWith('.md')) continue;
  const texto = readFileSync(p, 'utf8');
  for (const [, alvo] of texto.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(alvo)) continue;
    const caminho = resolve(dirname(p), alvo.split('#')[0]);
    // saída GERADA (ignorada pelo .gitignore da pasta) não existe antes do build
    const ign = join(dirname(p), '.gitignore');
    const gerados = existsSync(ign) ? readFileSync(ign, 'utf8').split('\n').map((l) => l.trim().replace(/^\//, '').replace(/\/$/, '')).filter((l) => l && !l.startsWith('#')) : [];
    if (gerados.some((g) => alvo === g || alvo.startsWith(g + '/'))) continue;
    if (!existsSync(caminho)) erro(relative(RAIZ, p), `link para «${alvo}», que não existe`);
  }
}

// 4 · nada de credencial, e nada de dado de gente real
const { telefones, dominios_de_email } = JSON.parse(readFileSync(join(RAIZ, 'ferramentas', 'ficticios.json'), 'utf8'));
const SEGREDO = /(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{20,}|xox[bp]-[A-Za-z0-9-]+|-----BEGIN [A-Z ]*PRIVATE KEY|AIza[0-9A-Za-z_-]{30,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})/;
const EMAIL = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[a-z]{2,})/g;
const CELULAR = /\(?\b[1-9]{2}\)? ?9[0-9]{4}-?[0-9]{4}\b/g;
for (const p of arquivos(RAIZ)) {
  if (/\.(png|jpe?g|gif|webp|ico|woff2?)$/i.test(p) || p.endsWith('ficticios.json') || basename(p) === 'LICENSE') continue;
  const onde = relative(RAIZ, p);
  const texto = readFileSync(p, 'utf8');
  if (SEGREDO.test(texto)) erro(onde, 'parece conter uma CREDENCIAL — tire antes de publicar');
  for (const [, dominio] of texto.matchAll(EMAIL)) {
    if (!dominios_de_email.includes(dominio.toLowerCase())) erro(onde, `e-mail em «${dominio}» — use example.com`);
  }
  for (const [numero] of texto.matchAll(CELULAR)) {
    if (!telefones.includes(numero)) erro(onde, `celular «${numero}» fora de ferramentas/ficticios.json — se for inventado, declare lá`);
  }
}

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s):\n  ` + erros.join('\n  '));
  process.exit(1);
}
console.log('✓ conteúdo, tokens, links e a ausência de segredo e de dado real conferidos');
