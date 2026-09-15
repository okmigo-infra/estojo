// Validação local da proposta. Usa Playwright já disponível no ambiente;
// não é a régua oficial do cliente e não instala dependências.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { renderizarCaso } from './renderizar.mjs';

// Permite resolver Playwright num ambiente externo, sem instalar no repositório.
const carregar = createRequire(process.env.NEGOCIO_VALIDACAO_DIR
  ? pathToFileURL(resolve(process.env.NEGOCIO_VALIDACAO_DIR, 'package.json')) : import.meta.url);
const { chromium, firefox } = carregar('playwright');
// Expectativas independentes, extraídas dos quatro casos do JSON e da decisão
// de não apresentar blocos habilitados sem conteúdo útil.
const blocosEsperados = {
  'recem-criada': ['contato', 'entrar'],
  'um-bloco-so': ['contato'],
  'cheia': ['contato', 'vitrine', 'feitos', 'avisos', 'entrar'],
  'avisos-primeiro-com-formulario': ['avisos', 'vitrine', 'formulario', 'contato', 'entrar'],
};

const local = new URL('./', import.meta.url);
const previa = new URL('previa/', local);
const evidencias = new URL('evidencias/', previa);
await mkdir(evidencias, { recursive: true });
const modelo = JSON.parse(await readFile(new URL('../../conteudo/pagina-do-negocio.json', local), 'utf8'));
const tokens = JSON.parse(await readFile(new URL('../../tokens/atual.json', local), 'utf8'));
const motor = process.env.NEGOCIO_BROWSER || 'chromium';
const navegador = await (motor === 'firefox' ? firefox : chromium).launch({
  headless: true,
  ...(process.env.NEGOCIO_BROWSER_PATH ? { executablePath: process.env.NEGOCIO_BROWSER_PATH } : {}),
});
const relatorio = { motor, versao: navegador.version(), paginas: [], galerias: [], contraste: [], verificacoes: [], limitacoes: ['Toque emulado; sem aparelho físico.', 'Zoom nativo e leitor de tela não exercitados.', 'Contraste local por cores computadas opacas; não é a medição oficial do cliente.'] };
const verificar = (condicao, mensagem) => { assert.ok(condicao, mensagem); relatorio.verificacoes.push(mensagem); };
const caminho = (nome) => new URL(nome, previa).href;
const pagina = await navegador.newPage({ viewport: { width: 390, height: 844 } });
const erros = [];
pagina.on('pageerror', (e) => erros.push(e.message));

async function medidas(p) {
  return p.evaluate(() => {
    const visivel = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      blocos: [...document.querySelectorAll('main > section')].map((s) => s.id),
      tingidos: [...document.querySelectorAll('main > section')].map((s) => s.classList.contains('tingida')),
      alvosPequenos: [...document.querySelectorAll('a,button,input,textarea')].filter(visivel).filter((e) => {
        const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44;
      }).map((e) => e.outerHTML.slice(0, 140)),
      fotos: document.querySelectorAll('.midia img').length,
      campos: document.querySelectorAll('.campo input,.campo textarea').length,
    };
  });
}

async function galeria(p) {
  return p.evaluate(() => {
    const t = document.querySelector('.trilho');
    if (!t) return null;
    const r = t.getBoundingClientRect();
    const itens = [...t.querySelectorAll('.cartao')].map((c) => {
      const b = c.getBoundingClientRect();
      return { largura: b.width, visivel: Math.max(0, Math.min(b.right, r.right) - Math.max(b.left, r.left)) };
    });
    return { largura: r.width, maximo: t.scrollWidth - t.clientWidth, scroll: t.scrollLeft,
      posicao: document.querySelector('.posicao')?.textContent, itens };
  });
}

try {
  for (const caso of modelo.casos) {
    for (const largura of [320, 390, 768, 1440]) {
      await pagina.setViewportSize({ width: largura, height: 900 });
      await pagina.goto(caminho(`${caso.nome}.html`));
      await pagina.locator('h1').waitFor();
      const m = await medidas(pagina);
      const esperados = blocosEsperados[caso.nome];
      assert.ok(esperados, `Caso sem expectativa explícita: ${caso.nome}`);
      assert.deepEqual(m.blocos, esperados);
      assert.deepEqual(m.tingidos, esperados.map((_, i) => Boolean(i % 2)));
      verificar(m.overflow <= 0, `${caso.nome}/${largura}: sem overflow horizontal`);
      verificar(m.alvosPequenos.length === 0, `${caso.nome}/${largura}: controles >=44×44: ${m.alvosPequenos.join(',')}`);
      verificar(m.campos === (caso.ordem.includes('formulario') ? 3 : 0), `${caso.nome}/${largura}: formulário condicional`);
      verificar(m.fotos === (caso.nome === 'cheia' ? 7 : 0), `${caso.nome}/${largura}: mídia somente nas posições fornecidas`);
      relatorio.paginas.push({ caso: caso.nome, largura, ...m });
      await pagina.screenshot({ path: fileURLToPath(new URL(`${caso.nome}-${largura}.png`, evidencias)), fullPage: true });
      if (caso.nome === 'cheia') {
        const g = await galeria(pagina);
        const porPagina = largura >= 920 ? 3 : largura >= 660 ? 2 : 1;
        const apresentados = g.itens.filter((i) => i.visivel > 2);
        verificar(apresentados.length === porPagina, `galeria/${largura}: ${porPagina} cartão(ões) visível(is)`);
        verificar(apresentados.every((i) => i.visivel >= i.largura - 1), `galeria/${largura}: nenhum cartão parcialmente visível`);
        verificar(g.posicao === (porPagina === 1 ? '1 de 7' : `1–${porPagina} de 7`), `galeria/${largura}: indicador inicial ${g.posicao}`);
        await pagina.getByRole('button', { name: 'Próximo trabalho' }).click();
        await pagina.waitForTimeout(80);
        const depoisDeAvancar = await galeria(pagina);
        const fimDaFaixa = Math.min(7, porPagina + 1);
        verificar(depoisDeAvancar.posicao === (porPagina === 1 ? '2 de 7' : `2–${fimDaFaixa} de 7`), `galeria/${largura}: indicador acompanha a seta`);
        for (let i = 0; i < 9; i++) {
          const proximo = pagina.getByRole('button', { name: 'Próximo trabalho' });
          if (await proximo.getAttribute('aria-disabled') === 'true') break;
          await proximo.click(); await pagina.waitForTimeout(80);
        }
        const fim = await galeria(pagina);
        verificar(fim.itens.at(-1).visivel >= fim.itens.at(-1).largura - 1, `galeria/${largura}: último cartão inteiro`);
        verificar(await pagina.getByRole('button', { name: 'Próximo trabalho' }).getAttribute('aria-disabled') === 'true', `galeria/${largura}: extremo anunciado`);
        relatorio.galerias.push({ caso: 'cheia', largura, inicio: g, fim });
      }
    }
  }

  const cheia = modelo.casos.find((c) => c.nome === 'cheia');
  for (const quantidade of [0, 1, 2, 12]) {
    const caso = structuredClone(cheia);
    caso.feitos = Array.from({ length: quantidade }, (_, i) => ({ ...cheia.feitos[i % cheia.feitos.length] }));
    await writeFile(new URL('variante.html', previa), renderizarCaso(caso));
    for (const largura of [320, 390, 599, 600, 659, 660, 768, 919, 920, 959, 960, 1024, 1440]) {
      await pagina.setViewportSize({ width: largura, height: 900 });
      await pagina.goto(caminho('variante.html'));
      const m = await medidas(pagina);
      verificar(m.overflow <= 0, `${quantidade} trabalhos/${largura}: sem overflow`);
      const g = await galeria(pagina);
      if (!quantidade) verificar(g === null, `zero/${largura}: bloco ausente`);
      else if (quantidade === 1) verificar(g.maximo <= 2 && await pagina.locator('.controles').isHidden(), `um/${largura}: sem rolagem ou setas`);
      else {
        const apresentados = g.itens.filter((i) => i.visivel > 2);
        verificar(apresentados.every((i) => i.visivel >= i.largura - 1), `${quantidade}/${largura}: nenhum corte parcial`);
        verificar(g.itens[0].largura <= 370, `${quantidade}/${largura}: cartão sem largura excessiva`);
      }
      if ([1, 2, 12].includes(quantidade) && [390, 600, 660, 919, 920, 960, 1440].includes(largura)) {
        await pagina.locator('#feitos').screenshot({ path: fileURLToPath(new URL(`galeria-${quantidade}-${largura}.png`, evidencias)) });
        relatorio.galerias.push({ quantidade, largura, inicio: g });
      }
    }
  }

  const extremos = structuredClone(cheia);
  const ataque = '<img src=x onerror="window.__injetado=1"> & " aspas \' fim';
  extremos.negocio.nome = 'Consultório de Fisioterapia e Reabilitação '.repeat(5) + ataque;
  extremos.negocio.handle = 'handle_sem_espacos_'.repeat(15) + ataque;
  extremos.negocio.cidade = null;
  extremos.contato = { telefone: null, endereco: null, horario: null };
  extremos.ordem = ['avisos', 'feitos', 'vitrine', 'contato'];
  extremos.vitrine = [ataque.repeat(6)];
  extremos.feitos = [{ texto: ataque.repeat(6), foto: false }, { texto: 'Texto comprido '.repeat(30), foto: true }];
  extremos.avisos = [{ texto: ataque, quando: ataque, foto: false }];
  await writeFile(new URL('extremos.html', previa), renderizarCaso(extremos));
  for (const largura of [320, 390, 768, 1440]) {
    await pagina.setViewportSize({ width: largura, height: 900 });
    await pagina.goto(caminho('extremos.html'));
    const m = await medidas(pagina);
    verificar(m.overflow <= 0, `textos longos/${largura}: sem overflow`);
    assert.deepEqual(m.blocos, ['avisos', 'feitos', 'vitrine']);
    verificar(await pagina.locator('h1').textContent() === extremos.negocio.nome, `escape/${largura}: texto íntegro`);
    verificar(await pagina.locator('[onerror]').count() === 0 && !await pagina.evaluate(() => window.__injetado), `escape/${largura}: nenhuma injeção`);
  }

  const semJs = await navegador.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const sem = await semJs.newPage();
  for (const caso of modelo.casos) for (const largura of [320, 390, 768, 1440]) {
    await sem.setViewportSize({ width: largura, height: 900 });
    await sem.goto(caminho(`${caso.nome}.html`));
    verificar(await sem.locator('h1').textContent() === caso.negocio.nome, `${caso.nome}/${largura}: HTML disponível sem JS`);
    verificar((await medidas(sem)).overflow <= 0, `${caso.nome}/${largura}: sem overflow sem JS`);
    verificar(await sem.locator('.controles').count() === 0, `${caso.nome}/${largura}: sem controles artificiais sem JS`);
    if (caso.nome === 'cheia') {
      verificar(await sem.locator('.dica').isVisible(), `Sem JS/${largura}: instrução de rolagem preservada`);
      await sem.locator('.trilho').focus();
      await sem.keyboard.press('ArrowRight'); await sem.waitForTimeout(200);
      verificar((await galeria(sem)).scroll > 0, 'Sem JS: teclado rola galeria');
    }
    if (caso.formulario) {
      await sem.locator('input').first().fill('Teste local');
      await sem.keyboard.press('Enter');
      verificar(sem.url().endsWith(`${caso.nome}.html`) && await sem.locator('form').count() === 0, 'Sem JS: Enter não envia formulário');
    }
  }
  await semJs.close();

  await pagina.setViewportSize({ width: 390, height: 844 });
  await pagina.goto(caminho('cheia.html'));
  await pagina.keyboard.press('Tab');
  verificar(await pagina.evaluate(() => document.activeElement.classList.contains('pular')), 'Tab inicia no salto para conteúdo');
  await pagina.keyboard.press('Tab');
  verificar(await pagina.evaluate(() => document.activeElement.classList.contains('entrar-topo')), 'Tab alcança Entrar');
  verificar(await pagina.locator('.entrar-topo').evaluate((e) => getComputedStyle(e).outlineStyle !== 'none'), 'Foco de teclado possui contorno');
  await pagina.locator('nav a[href="#contato"]').focus();
  await pagina.keyboard.press('Enter');
  verificar(pagina.url().endsWith('#contato') && await pagina.locator('#contato').evaluate((e) => Math.abs(e.getBoundingClientRect().top - 16) < 2), 'Âncora Contato navega por teclado com margem visível');
  await pagina.locator('.telefone').focus();
  verificar(await pagina.locator('.telefone').evaluate((e) => document.activeElement === e && getComputedStyle(e).outlineStyle !== 'none' && e.getAttribute('href') === 'tel:11999990000'), 'Telefone tem foco visível e destino tel fornecido');
  verificar(await pagina.locator('.dica').isHidden() && await pagina.locator('.controles').isVisible(), 'Com controles, instrução redundante é ocultada');
  verificar(await pagina.locator('.trilho').evaluate((e) => getComputedStyle(e).scrollbarWidth === 'none'), 'Scrollbar horizontal fica visualmente oculta');
  verificar(await pagina.locator('.controles button').first().evaluate((e) => getComputedStyle(e).borderStyle === 'solid'), 'Botões usam borda contínua');
  verificar(await pagina.locator('.controles button').first().evaluate((e) => Number(getComputedStyle(e).opacity) < 1), 'Extremo desativado é indicado por opacidade');

  await pagina.setViewportSize({ width: 1440, height: 900 });
  await pagina.waitForFunction(() => document.querySelector('.posicao')?.textContent === '1–3 de 7');
  verificar((await galeria(pagina)).posicao === '1–3 de 7', 'Indicador atualiza ao redimensionar de celular para desktop');
  await pagina.setViewportSize({ width: 390, height: 844 });
  await pagina.waitForFunction(() => document.querySelector('.posicao')?.textContent === '1 de 7');
  verificar((await galeria(pagina)).posicao === '1 de 7', 'Indicador atualiza ao redimensionar de desktop para celular');
  await pagina.locator('.trilho').evaluate((e) => {
    const original = e.scrollTo;
    e.scrollTo = function (opcoes) {
      this.dataset.comportamentoTestado = opcoes.behavior;
      return original.call(this, opcoes);
    };
  });
  await pagina.getByRole('button', { name: 'Próximo trabalho' }).focus();
  await pagina.keyboard.press('Enter'); await pagina.waitForTimeout(120);
  verificar((await galeria(pagina)).scroll > 0, 'Enter aciona próximo trabalho');
  verificar(await pagina.locator('.trilho').getAttribute('data-comportamento-testado') === 'auto', 'Navegação chama scrollTo com behavior auto');
  verificar(await pagina.locator('.trilho').evaluate((e) => getComputedStyle(e).scrollBehavior === 'auto'), 'Trilho usa scroll-behavior auto');
  for (const origem of ['botao', 'trilho']) {
    await pagina.goto(caminho('cheia.html'));
    const trilho = pagina.locator('.trilho');
    await (origem === 'botao' ? pagina.getByRole('button', { name: 'Próximo trabalho' }) : trilho).focus();
    await pagina.locator('.cartoes').evaluate((lista) => { while (lista.children.length > 1) lista.lastElementChild.remove(); });
    await pagina.waitForFunction(() => document.querySelector('.controles').hidden);
    verificar(await trilho.evaluate((e) => e.scrollWidth - e.clientWidth <= 2), `${origem}: overflow desapareceu`);
    verificar(await trilho.evaluate((e) => document.activeElement === e), `${origem}: foco preservado no trilho`);
    verificar(await trilho.getAttribute('tabindex') === '-1', `${origem}: trilho focado sem overflow tem tabindex=-1`);
    await pagina.keyboard.press('Tab');
    verificar(await trilho.evaluate((e) => document.activeElement !== e && !e.hasAttribute('tabindex')), `${origem}: ao sair, tabindex removido`);
    await pagina.keyboard.press('Shift+Tab');
    verificar(await trilho.evaluate((e) => document.activeElement !== e), `${origem}: retorno por Tab não para no trilho sem overflow`);
  }

  const toque = await navegador.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const touch = await toque.newPage();
  await touch.goto(caminho('cheia.html'));
  await touch.getByRole('button', { name: 'Próximo trabalho' }).tap(); await touch.waitForTimeout(120);
  verificar((await galeria(touch)).scroll > 0, 'Toque emulado aciona próximo trabalho');
  await toque.close();

  // Inspeção de todos os textos visíveis e bordas de controles nas 12 combinações.
  // A mídia neutra é decorativa; não participa da medição de texto.
  for (const paleta of Object.keys(tokens.negocio.paletas)) for (const tema of ['escuro', 'claro']) {
    for (const nome of ['cheia', 'avisos-primeiro-com-formulario']) for (const fundos of ['originais', 'invertidos']) {
      await pagina.goto(caminho(`${nome}.html`));
      await pagina.evaluate(({ paleta, tema, fundos }) => {
        document.documentElement.dataset.paleta = paleta;
        document.documentElement.dataset.tema = tema;
        if (fundos === 'invertidos') document.querySelectorAll('main > section').forEach((s) => s.classList.toggle('tingida'));
      }, { paleta, tema, fundos });
      const medicao = await pagina.evaluate(() => {
        const rgb = (s) => s.match(/[\d.]+/g)?.map(Number);
        const luz = (c) => c.slice(0, 3).map((v) => v / 255).map((v) => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
        const razao = (a, b) => { const l = [luz(a), luz(b)].sort((x, y) => y - x); return (l[0] + .05) / (l[1] + .05); };
        const fundo = (e) => { for (; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c?.length === 3 || c?.[3] === 1) return c; } throw Error('Fundo não opaco'); };
        const textos = [], bordas = [];
        for (const e of document.querySelectorAll('body *')) {
          const r = e.getBoundingClientRect(), s = getComputedStyle(e);
          if (!r.width || !r.height || s.visibility === 'hidden') continue;
          if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) textos.push({ elemento: e.tagName + '.' + e.className, razao: razao(rgb(s.color), fundo(e)) });
          if (e.matches('input,textarea,button,.cartao,a.botao')) bordas.push({ elemento: e.tagName + '.' + e.className, razao: razao(rgb(s.borderTopColor), fundo(e.parentElement)) });
        }
        return { textoMinimo: Math.min(...textos.map((x) => x.razao)), bordaMinima: Math.min(...bordas.map((x) => x.razao)), falhas: [...textos.filter((x) => x.razao < 4.5), ...bordas.filter((x) => x.razao < 3)] };
      });
      relatorio.contraste.push({ paleta, tema, caso: nome, fundos, ...medicao });
      verificar(medicao.falhas.length === 0, `Contraste ${paleta}/${tema}/${nome}/${fundos}: ${JSON.stringify(medicao.falhas)}`);
    }
  }
  verificar(erros.length === 0, `Nenhum erro JavaScript: ${erros.join(', ')}`);
  console.log(`${relatorio.verificacoes.length} verificações passaram; capturas em ${fileURLToPath(evidencias)}`);
} finally {
  await writeFile(new URL(`validacao-${motor}.json`, evidencias), JSON.stringify(relatorio, null, 2));
  await navegador.close();
}
