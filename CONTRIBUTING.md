# Contribuir com o estojo

Obrigado por desenhar com a gente. Este repositório é **conteúdo**, não produto:
o que você muda aqui são os casos, as regras e os tokens que alimentam a casca.

## Antes de abrir a PR

    node ferramentas/conferir.mjs   # o mesmo gate que o CI roda
    npm run casca                   # e abra casca/index.html

O conferidor recusa:

- JSON quebrado em `conteudo/` ou `tokens/`, ou caso sem `nome`/`por_que`;
- link relativo de markdown para um arquivo que não existe (saída gerada e
  ignorada pelo `.gitignore` da pasta não conta);
- **qualquer coisa que pareça credencial**;
- **e-mail fora de `example.com`** e **celular que não esteja em
  `ferramentas/ficticios.json`** — o repositório é público, e dado de gente de
  verdade não entra. Se o número é inventado, declare lá.

## O que não vem para cá

Código do produto, print do produto com dado real, credencial, segredo. Se você
precisou de um deles para desenhar, abra uma issue dizendo o que faltava — quase
sempre falta um caso, não um acesso.

## Licença

Ao contribuir você concorda em licenciar a sua contribuição sob a
[Apache License 2.0](LICENSE), a mesma do repositório.
