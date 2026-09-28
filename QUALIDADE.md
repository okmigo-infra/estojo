# Qualidade — os gates deste repositório

Retrato de **28/09** (OMINFRA-836), lido dos workflows da `main` mais a PR que
trouxe este arquivo. ⚠️ Quem manda é o `.github/workflows/`: se este texto e os
workflows discordarem, vale o workflow, e este arquivo ficou atrasado — conserte
os dois no mesmo commit.

## O que reprova, e onde

`.github/workflows/conferir.yml`, na PR e no `push` da `main` (runner hospedado: o repo é público).

| gate | onde | reprova quando |
|---|---|---|
| conteúdo, tokens, links, segredo e dado real | «conteúdo, tokens, links, segredo e dado real» (`ferramentas/conferir.mjs`) | JSON de conteúdo inválido, token de cor fora da régua, link quebrado, algo com cara de segredo ou dado real |
| a casca | «a casca se gera do conteúdo» | `npm run casca` não gera o `casca/index.html` |
| a página do negócio | «a página do negócio (Alisson) se gera» | o gerador falha |

## Exceções — o que se pode furar, e como

- **Dado fictício**: o que parece dado real e é inventado se declara em `ferramentas/ficticios.json`.

## Cadência e dono das dependências

- **Dependabot** toda segunda, 06:00 (`.github/dependabot.yml`): github-actions (não há dependência de npm: o `package.json` não declara nenhuma).
  Dono de toda PR dele: **Victor**. ⛔ A PR de `github-actions` muda
  Dono de toda PR dele: **Victor**.
- **Alertas do GitHub** (Dependabot alerts): LIGADOS (repo público; medido em
  28/09). As PRs automáticas de segurança seguem desligadas.

## O que NÃO é gate (ainda)

- **As propostas** (`propostas/`, `dlr-1337/`): o CI só gera a do Alisson; as outras
  não são conferidas.
- **Branch protection**: o repo é PÚBLICO e poderia tê-la, e em 28/09 não tem
  nenhuma. A proposta está no relatório do OMINFRA-835; aplicar é gesto do dono.
