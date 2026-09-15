import { configuracao } from './config.mjs';

export const escapar = (valor) => String(valor ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const temTexto = (valor) => typeof valor === 'string' && valor.trim().length > 0;
const titulos = { contato: 'Contato', vitrine: 'O que fazemos', feitos: 'Trabalhos',
  avisos: 'Recados', formulario: 'Envie uma mensagem', entrar: 'Vamos conversar' };

// Não modifica o caso: mantém a diferença entre desligado e habilitado vazio.
export function estadoBlocos(caso) {
  return Object.keys(titulos).map((bloco) => {
    const habilitado = caso.ordem.includes(bloco);
    const dados = caso[bloco];
    const util = bloco === 'entrar' || (bloco === 'contato'
      ? ['telefone', 'endereco', 'horario'].some((chave) => temTexto(dados?.[chave]))
      : bloco === 'formulario' ? dados?.campos?.some(temTexto)
      : dados?.some((item) => temTexto(typeof item === 'string' ? item : item.texto)));
    return { bloco, estado: !habilitado ? 'desligado' : util ? 'visivel' : 'habilitado-sem-conteudo' };
  });
}

export function documento(titulo, corpo, { ramo = 'neutro', tema = 'escuro', script = false } = {}) {
  return `<!doctype html>
<html lang="pt-BR" data-paleta="${escapar(ramo)}" data-tema="${escapar(tema)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(titulo)}</title><meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="estilos.css">
${script ? '<script src="carrossel.js" defer></script>' : ''}</head><body>${corpo}</body></html>\n`;
}

const entrar = (texto, classe = 'botao') => `<a class="${classe}" href="${escapar(configuracao.destinoEntrar)}">${texto}<span aria-hidden="true">↗</span></a>`;
const midia = () => '<div class="midia"><img src="midia.svg" width="640" height="480" alt="Ilustração neutra; fotografia não fornecida" loading="lazy"></div>';

function contato(caso) {
  const dados = caso.contato ?? {};
  const linhas = [
    ['telefone', 'Telefone', (v) => `<a class="telefone" href="tel:${escapar(v.replace(/[^+\d]/g, ''))}"><svg class="icone-telefone" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m7 3 3 5-2 2a15 15 0 0 0 6 6l2-2 5 3c-1 4-3 5-6 3C9 17 5 13 3 7 2 4 4 2 7 3Z"/></svg><span>${escapar(v)}</span></a>`],
    ['endereco', 'Endereço', (v) => `<span>${escapar(v)}</span>`],
    ['horario', 'Horário', (v) => `<span>${escapar(v)}</span>`],
  ].filter(([chave]) => temTexto(dados[chave]));
  return `<dl class="contatos" data-quantidade="${linhas.length}">${linhas.map(([chave, rotulo, exibir]) =>
    `<div class="contato-${chave}"><dt>${rotulo}</dt><dd>${exibir(dados[chave])}</dd></div>`).join('')}</dl>`;
}

function trabalhos(caso) {
  const itens = caso.feitos.filter((item) => temTexto(item.texto));
  return `<div class="galeria" data-quantidade="${itens.length}" data-galeria>
    <div class="galeria-meta"><h2 id="titulo-feitos">Trabalhos</h2><div class="galeria-status">
      <p class="posicao" aria-live="polite">${itens.length ? `1 de ${itens.length}` : `0 de ${itens.length}`}</p>
    </div></div>
    <div class="trilho" id="trabalhos-trilho" role="region" aria-label="Trabalhos do negócio"${itens.length > 1 ? ' tabindex="0"' : ''}>
    <ul class="cartoes">${itens.map((item, i) => `<li class="cartao${item.foto ? '' : ' sem-foto'}">
      <article>${item.foto ? midia() : ''}<div class="cartao-texto"><p>${escapar(item.texto)}</p>
      <span class="contador" aria-label="${i + 1} de ${itens.length}">${String(i + 1).padStart(2, '0')} / ${String(itens.length).padStart(2, '0')}</span></div></article></li>`).join('')}</ul>
    </div>${itens.length > 1 ? '<p class="dica">Deslize para ver os outros trabalhos <span aria-hidden="true">→</span></p>' : ''}</div>`;
}

const renderizadores = {
  contato,
  vitrine: (c) => `<ul class="vitrine">${c.vitrine.filter(temTexto).map((texto, i) =>
    `<li><span class="numero" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><p>${escapar(texto)}</p></li>`).join('')}</ul>`,
  feitos: trabalhos,
  avisos: (c) => `<div class="avisos">${c.avisos.filter((a) => temTexto(a.texto)).map((a) =>
    `<article class="aviso${a.foto ? ' com-foto' : ''}"><div class="aviso-texto">${temTexto(a.quando) ? `<p class="data">${escapar(a.quando)}</p>` : ''}<p>${escapar(a.texto)}</p></div>${a.foto ? midia() : ''}</article>`).join('')}</div>`,
  // Sem <form> nem campos com name: a prévia não possui qualquer via de envio,
  // inclusive Enter e navegação com JavaScript desativado.
  formulario: (c) => `<div class="formulario" role="group" aria-labelledby="titulo-formulario">
    <p class="destino">Sua mensagem vai para ${escapar(c.formulario.onde_cai)}.</p>
    <div class="campos">${c.formulario.campos.filter(temTexto).map((campo, i) => `<div class="campo"><label for="mensagem-${i}">${escapar(campo)}</label>${campo === 'o que você precisa'
      ? `<textarea id="mensagem-${i}" rows="4"></textarea>`
      : `<input id="mensagem-${i}" type="text" autocomplete="off">`}</div>`).join('')}</div>
    <button class="botao" type="button" disabled>Enviar<span aria-hidden="true">↗</span></button></div>`,
  entrar: () => `<div class="convite"><p>Fale pelo okmigo.</p>${entrar('Entrar no okmigo')}</div>`,
};

export function renderizarCaso(caso, { tema = 'escuro' } = {}) {
  const estados = estadoBlocos(caso);
  const visiveis = caso.ordem.filter((b) => estados.find((e) => e.bloco === b)?.estado === 'visivel');
  const n = caso.negocio;
  const navegaveis = visiveis.filter((b) => b !== 'entrar');
  const corpo = `<a class="pular" href="#conteudo">Pular para conteúdo</a>
    <header class="identidade"><div class="limite">
      <div class="linha-topo"><p class="assinatura">okmigo</p>${entrar('Entrar', 'botao entrar-topo')}</div>
      <div class="nome-negocio"><h1>${escapar(n.nome)}</h1><div class="metadados"><p class="handle">@${escapar(n.handle)}</p>${temTexto(n.cidade) ? `<p class="cidade">${escapar(n.cidade)}</p>` : ''}</div></div>
      ${navegaveis.length > 1 ? `<nav aria-label="Seções do negócio">${navegaveis.map((b) => `<a href="#${b}">${titulos[b]}</a>`).join('')}</nav>` : ''}
    </div></header>
    <main id="conteudo" tabindex="-1">${visiveis.map((bloco, i) => `<section id="${bloco}" class="secao${i % 2 ? ' tingida' : ''}" aria-labelledby="titulo-${bloco}">
      <div class="limite secao-grade">${bloco === 'feitos' ? '' : `<div class="secao-titulo"><h2 id="titulo-${bloco}">${titulos[bloco]}</h2></div>`}
      <div class="secao-corpo">${renderizadores[bloco](caso)}</div></div></section>`).join('')}</main>`;
  return documento(`${n.nome} — página do negócio`, corpo, { ramo: n.ramo, tema, script: true });
}
