# dlr-1337 — página @nome e barra de apps

Desenho a partir de `conteudo/pagina-do-negocio.json` e `conteudo/barra-de-apps.json`. Tema escuro. Tokens de `tokens/atual.json`. Sem JS, sem fonte nova, sem casca editada.

## Superfícies e casos

**página @nome** — `pagina-do-negocio/`

| arquivo | ramo | o que prova |
|---|---|---|
| `cheia.html` | forno | confortável; ordem contato · vitrine · feitos · avisos · entrar; form OFF; carrossel corta o próximo |
| `recem-criada.html` | forja | extremo: pública, telefone só, vitrine/feitos/avisos vazios e em pé |
| `um-bloco-so.html` | cuidado | só contato; nome longo; sem Entrar (a dona desligou) |
| `avisos-primeiro-com-formulario.html` | tinta | ordem avisos · vitrine · formulario · contato · entrar; form ON, 3 campos |

**barra de apps** — `barra-de-apps/` — uma peça, largo (≥720) e estreito (<720)

| arquivo | entradas | o que prova |
|---|---|---|
| `conta-nova.html` | 3 | coluna oca; Conversas / Feed / Tarefas |
| `socio-com-servicos.html` | 8 | 4 nossas + 4 serviços, um nome cada |
| `tudo-instalado.html` | 14 | 5 serviços, 26 telas, predio/rodas; densidade, não cor |

## O que estava errado

- No web, abaixo de 720px a barra some sem substituto. No app ela é gaveta.
- Página recém-criada não tinha forma: ou inventava conteúdo ou desabava.
- Um bloco só (nome longo, dona desligou o resto) não era caso.
- Catorze entradas não se resolvem com cor; serviço saía como dois apps.

## O que mudou

- **Lugar:** contato pode ser o primeiro bloco; avisos pode ser o primeiro; formulário só existe se a dona ligou. Entrar vive no topo quando está na ordem — no estreito as âncoras saem, o botão fica.
- **Hierarquia:** faixas na ordem da dona. Ritmo por `--tinte` e vão, não por traço `--grade`. Na faixa tingida, `--fraco` vira `--apoio`.
- **Vazio:** bloco ligado sem item continua faixa, com a palavra do casca. Não some, não vira «em breve».
- **Barra:** a mesma lista nos dois tamanhos. Estreito = largura da tela, item 44px, hint some. Largo = coluna 280px, hint fica. Procedência no ícone (balão / círculo / peça / losango). Grupo só quando há mais de um tipo.

## Tokens

- Página: conjunto `negocio`. Paleta do ramo do caso (forno, forja, cuidado, tinta), tema escuro. Moldura de componente em `--fraco`. `--grade` e `--linha` não molduram controle.
- Barra: conjunto `app` escuro. `--bg #131211`, `--text #EDEAE5`, `--accent #6EA8FE`. Hint do selecionado em `--muted`. Sem neutro de `paginas`.

## De fora, de propósito

Conversa, tarefas, vocabulário declarado.
