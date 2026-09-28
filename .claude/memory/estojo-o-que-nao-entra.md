---
name: estojo-o-que-nao-entra
description: O estojo é PÚBLICO — o que ele é, o que ele não é, e a lista do que nunca entra (código do produto, dado real, print, credencial, saída gerada); onde o gate barra cada um e onde nada barra
metadata:
  type: project
---

**O que é**: o CONTEÚDO das superfícies do okmigo para quem desenha de fora,
sem acesso ao produto: os casos e as regras em `conteudo/*.json` (cinco
superfícies, contadas pelo `conferir/` do README), os tokens em `tokens/`, e as
propostas de quem desenha (`alisson/`, `dlr-1337/`, `propostas/`). Público no
GitHub, Apache-2.0 desde 27/09.

**O que NÃO é**:
- não é produto nem pedaço dele: nenhum código do okmigo depende daqui, e
  nada daqui sobe em cluster (não há deploy, tag nem ambiente);
- não é a fonte da verdade da tela: quem manda é o produto (`../tyego`) e o
  crivo (`cartao`). Aqui mora a PERGUNTA — o caso extremo e a regra que tem de
  sobreviver —, não a resposta;
- não é um conjunto de telas prontas: a primeira versão mandava telas, e o que
  voltou foram consertos (README, abertura).

**O que nunca entra, e quem barra**:

| o quê | quem barra |
|---|---|
| credencial, token, chave | `ferramentas/conferir.mjs`, no CI de toda PR |
| e-mail de gente de verdade | o mesmo: só `example.com` passa |
| celular de gente de verdade | o mesmo: só o que está em `ferramentas/ficticios.json` |
| print do produto (com dado real) | o `.gitignore` recusa `*.png`; ⚠️ JPG, WebP ou PDF **passam** — ninguém barra, é revisão de PR |
| código do produto, esquema do banco, endereço interno | ⚠️ **nada barra**: é revisão de PR |
| a `casca/` e as `saida/` geradas | o `.gitignore`: saída de build versionada é uma segunda fonte que envelhece calada |

**Why:** repo público recebe proposta de fora, e o que entra na `main` fica no
histórico do git para sempre, mesmo depois de apagado do arquivo. Um token ou
um telefone real que passe precisa ser REVOGADO, não só removido.

**How to apply:**
- Antes de propor, `node ferramentas/conferir.mjs` e `python3
  conferir/conferir_readme.py` (os dois do CI).
- Número inventado novo nos casos → declarar em `ferramentas/ficticios.json`.
- Imagem de referência: desenhar a reprodução estática, nunca a captura.
- Se alguém precisou de um acesso para desenhar, o que falta é um CASO aqui,
  não o acesso (README, «O que NÃO está aqui»).
