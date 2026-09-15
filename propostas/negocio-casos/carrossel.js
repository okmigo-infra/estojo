// Melhoria progressiva: conteúdo, toque, scrollbar e teclado são nativos.
document.querySelectorAll('[data-galeria]').forEach((galeria) => {
  const trilho = galeria.querySelector('.trilho');
  const lista = trilho.querySelector('.cartoes');
  const controles = document.createElement('div');
  controles.className = 'controles';
  controles.hidden = true;
  const botoes = [-1, 1].map((direcao) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.textContent = direcao < 0 ? '←' : '→';
    botao.setAttribute('aria-label', direcao < 0 ? 'Trabalho anterior' : 'Próximo trabalho');
    botao.setAttribute('aria-controls', trilho.id);
    botao.addEventListener('click', () => {
      if (botao.getAttribute('aria-disabled') === 'true') return;
      const atual = trilho.scrollLeft;
      const origem = lista.getBoundingClientRect().left + atual;
      const pontos = [...lista.children].map((c) => c.getBoundingClientRect().left - origem + atual);
      const alvo = direcao > 0 ? pontos.find((p) => p > atual + 2) ?? trilho.scrollWidth
        : pontos.reverse().find((p) => p < atual - 2) ?? 0;
      trilho.scrollTo({ left: alvo, behavior: 'auto' });
    });
    controles.append(botao);
    return botao;
  });
  const posicao = galeria.querySelector('.posicao');
  galeria.querySelector('.galeria-status').append(controles);
  function atualizar() {
    const quantidade = lista.children.length;
    galeria.dataset.quantidade = quantidade;
    const maximo = trilho.scrollWidth - trilho.clientWidth;
    const rola = maximo > 2;
    const caixa = trilho.getBoundingClientRect();
    const visiveis = [...lista.children].map((cartao, indice) => {
      const r = cartao.getBoundingClientRect();
      const larguraVisivel = Math.max(0, Math.min(r.right, caixa.right) - Math.max(r.left, caixa.left));
      return larguraVisivel >= r.width - 2 ? indice : -1;
    }).filter((indice) => indice >= 0);
    const primeiro = (visiveis[0] ?? 0) + 1;
    const ultimo = (visiveis.at(-1) ?? 0) + 1;
    posicao.textContent = primeiro === ultimo
      ? `${primeiro} de ${quantidade}` : `${primeiro}–${ultimo} de ${quantidade}`;
    if (!rola && controles.contains(document.activeElement)) {
      trilho.tabIndex = -1;
      trilho.focus({ preventScroll: true });
    }
    controles.hidden = !rola;
    galeria.classList.toggle('com-controles', rola);
    if (rola) trilho.tabIndex = 0;
    else if (document.activeElement === trilho) trilho.tabIndex = -1;
    else trilho.removeAttribute('tabindex');
    const dica = galeria.querySelector('.dica');
    if (dica) dica.hidden = !rola;
    botoes[0].setAttribute('aria-disabled', String(!rola || trilho.scrollLeft <= 2));
    botoes[1].setAttribute('aria-disabled', String(!rola || trilho.scrollLeft >= maximo - 2));
  }
  trilho.addEventListener('scroll', atualizar, { passive: true });
  trilho.addEventListener('blur', () => {
    if (trilho.scrollWidth - trilho.clientWidth <= 2) trilho.removeAttribute('tabindex');
  });
  const observador = new ResizeObserver(atualizar);
  observador.observe(trilho);
  new MutationObserver(atualizar).observe(lista, { childList: true });
  atualizar();
});
