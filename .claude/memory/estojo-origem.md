---
name: estojo-origem
description: O estojo é PÚBLICO e é conteúdo, não produto — quem o consome, como a casca se gera, o gate do CI (conferir.mjs) e o que nunca entra
metadata:
  type: project
---

**O que é**: o conteúdo das superfícies do okmigo (casos, regras, tokens) para
quem desenha DE FORA, sem acesso ao produto (`okmigo-infra/estojo`, público,
Apache-2.0 desde 27/09 — antes não tinha licença). Quem consome: designers
externos (pastas `alisson/`, `dlr-1337/`, `propostas/`). Nenhum código do
produto depende daqui.

**Como se publica**: merge na `main`. Não há deploy nem tag. A `casca/` e as
`saida/` são GERADAS e ignoradas pelo git (versionar saída de build é ter duas
fontes, e a segunda envelhece calada).

**O gate (OMINFRA-851, 27/09)**: `.github/workflows/conferir.yml` roda em toda
PR `node ferramentas/conferir.mjs` + a geração. O conferidor recusa JSON
quebrado, caso sem `nome`/`por_que`, link morto, credencial, e-mail fora de
`example.com` e celular fora de `ferramentas/ficticios.json`. Sabotado ao
nascer: JSON quebrado, token colado, celular real e link morto reprovam.

**Why:** repo público recebe proposta de fora; sem gate, token ou telefone de
gente real chegaria à main sem ninguém ver.

**How to apply:**
- ⛔ `ferramentas/tokens.mjs` lê o CÓDIGO do produto (`../tyego`) — é
  ferramenta de quem mantém, não roda no CI nem para quem desenha de fora.
- ⛔ `propostas/negocio-casos/validar.mjs` precisa do Playwright; fora do CI.
- ⛔ `pull_request`, nunca `pull_request_target` (o fork rodaria com segredo).
- Número inventado novo nos casos → declarar em `ferramentas/ficticios.json`.
