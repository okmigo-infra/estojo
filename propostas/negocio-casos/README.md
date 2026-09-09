# Página pública de negócio — quatro casos

Proposta na branch `proposta-negocio-casos`, baseada no original `9c48e29`.
Um renderizador gera os quatro casos diretamente de
[`conteudo/pagina-do-negocio.json`](../../conteudo/pagina-do-negocio.json),
consumindo [`tokens/atual.json`](../../tokens/atual.json). HTML estático, CSS sem
framework, tema escuro inicial e JavaScript somente para controles de galeria.
Gerar a prévia exige apenas Node, sem pacotes npm. A validação com `validar.mjs`
exige Playwright e um navegador disponíveis. Nenhuma etapa depende das telas
antigas ou dos verificadores removidos.

## Gerar e abrir

Na raiz do repositório, um comando gera todas as páginas e recursos:

```powershell
node propostas/negocio-casos/gerar.mjs
```

Depois abra [a prévia](previa/index.html). No PowerShell:

```powershell
Invoke-Item .\propostas\negocio-casos\previa\index.html
```

Não precisa de servidor, instalação ou JavaScript para ler os casos. `previa/`
é saída ignorada pelo Git, incluindo capturas e variantes de validação. Não a
edite manualmente. A geração funciona também a partir de outro diretório.

## Casos e decisões

| Caso | Blocos públicos, na ordem |
|---|---|
| `recem-criada` | Contato (telefone) → convite ao produto |
| `um-bloco-so` | Contato (telefone, endereço e horário) |
| `cheia` | Contato → vitrine → trabalhos → avisos → convite |
| `avisos-primeiro-com-formulario` | Avisos → vitrine → formulário → contato → convite |

`casos[].ordem` decide habilitação e ordem. O renderizador não modifica os casos:
`estadoBlocos()` distingue desligado, habilitado sem conteúdo e visível. O índice
de revisão mostra essa distinção. Suprimir blocos vazios é uma interpretação de
interface permitida pelo README: a pessoa não recebe títulos vazios, instruções
administrativas, âncoras sem destino ou espaços reservados. Campos nulos de
contato e cidade ausente também não deixam rótulos. Fundos alternam somente
entre seções realmente apresentadas.

O cabeçalho sempre mantém Entrar (`regras_que_precisam_sobreviver[6]`). O bloco
`entrar` é independente e só aparece quando habilitado. Ambos leem o destino
de `config.mjs`: `acesso-produto.html`, que declara ser uma prévia e não recebe
credenciais. Não foi inventada uma rota de autenticação. Atalhos só aparecem
quando há mais de uma seção de conteúdo útil e respeitam a sequência pública.

No celular, identidade, contato e seções usam uma coluna. A partir de 600px,
endereço/horário podem dividir espaço e fotos de avisos ficam ao lado do texto.
A partir de 960px, título e corpo de cada seção formam duas colunas. A ordem
do DOM permanece igual; contato e formulário nunca são acoplados. Horário é o
texto do modelo, sem cálculo de “aberto agora”.

## Direção visual

A direção escolhida trata a página como uma publicação curta do negócio. O nome
usa tipografia editorial e é o primeiro elemento dominante; handle e cidade
formam uma linha de metadados logo abaixo. A assinatura okmigo ficou discreta e
Entrar permanece contornado no topo, distinguindo acesso ao produto de contato
com o negócio e dos links de seção.

Foram comparadas duas composições com Padaria Aurora e Serralheria, em 390 e
1440px. A escolhida usa nome editorial sobre o fundo da paleta e contato reunido
num painel de papel. A alternativa usava uma faixa tingida atrás da identidade e
telefone preenchido com o acento; ela aproximava a página de um cartão de
aplicativo e dava peso excessivo ao cabeçalho. Na escolhida, o telefone continua
claramente acionável pelo ícone, acento e sublinhado, enquanto endereço e horário
permanecem informações agrupadas. O cabeçalho da página cheia caiu de 312px para
238px em 390px; na recém-criada, de 215px para 185px.

Cada conteúdo ganhou composição própria: contato em painel compacto; vitrine em
lista numerada que vira duas colunas; trabalhos em uma galeria de largura
integral; avisos com data próxima do texto e mídia associada; formulário em duas
colunas somente quando há espaço; convite final mais leve. O cartão sem foto usa
tipografia e um traço do acento, sem simular mídia ausente.

### Galeria

`regras_que_precisam_sobreviver[5]` descreve a pista parcial do próximo cartão.
A rodada visual posterior determinou páginas formadas apenas por cartões
inteiros: um até 659px, dois entre 660 e 919px e três a partir de 920px. Essa
decisão evita cortar imagem, título ou borda. Zero trabalhos elimina a seção;
um mostra cartão completo sem setas ou dica; vários usam scroll e snap nativos.
O último cartão pode ficar inteiro sem repetição ou ciclo.

O cabeçalho reúne “Trabalhos”, posição e setas. A posição usa “1 de 7” quando
um cartão está visível e “1–3 de 7” quando há uma faixa, e acompanha rolagem,
setas e redimensionamento. O trilho ocupa até 360px, 720px ou 1120px conforme a
faixa de largura, mantendo cartões moderados e intervalos de 16px.

Setas de 44×44 só aparecem quando há overflow. Quando elas existem, a instrução
textual de arraste é ocultada para evitar duas explicações concorrentes. A barra
horizontal fica visualmente oculta, mas rolagem, swipe e teclado continuam
nativos. `aria-disabled` anuncia os
extremos sem retirar o foco. Quando o overflow desaparece com foco nas setas,
ele passa à região. Se o foco já estiver no trilho, permanece nele. Nos dois
casos, o trilho recebe `tabindex=-1` enquanto mantém foco; ao sair, o atributo
é removido, evitando uma parada de Tab sem função. Os botões mantêm borda
contínua e o estado indisponível reduz a opacidade;
sem JS, a região continua alcançável por teclado e rolável. `scrollTo` usa
`behavior: 'auto'` e o trilho declara `scroll-behavior: auto`, sem animação.
Não há autoplay ou interceptação de gestos.

### Formulário e mídia

Usam-se os três campos de `formulario.campos`: nome, telefone ou e-mail e pedido.
`blocos.formulario` menciona quatro; essa divergência não autoriza inventar um.
Não há `required`, validação de negócio, endpoint, persistência ou sucesso.
A prévia usa campos rotulados num grupo, sem elemento `form` nem atributos
`name`, e botão Enviar nativamente desabilitado. Assim Enter não pode enviar,
inclusive sem JS. O aviso técnico fica no índice de revisão, fora da página.

`foto: true` usa uma ilustração geométrica neutra 4:3, com texto alternativo
que explicita a substituição. `foto: false` não recebe imagem. A ilustração não
representa um produto ou trabalho real; suas cores são apenas mídia neutra.
Na integração, substituir por arquivos e descrições reais mantendo proporção.

## Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `gerar.mjs` | Leitura das fontes, CSS dos tokens, quatro páginas, índice e destino de revisão |
| `renderizar.mjs` | Escape HTML, estados e renderizador compartilhado dos seis blocos |
| `config.mjs` | Destino único de Entrar |
| `estilos.css` | Layout, temas, foco e variantes de conteúdo |
| `carrossel.js` | Controles progressivos, extremos e preservação de foco |
| `midia.svg` | Ilustração neutra para posições com foto |
| `validar.mjs` | Verificação local opcional; requer Playwright e navegador, inclusive em ambiente externo |
| `.gitignore` | Exclusão da saída gerada |

## Validação local — 09/09/2026

364 verificações passaram em Chromium 151.0.7922.34, via Playwright 1.61.1,
com Node 24.18.0. A execução desta correção carregou Playwright de uma cópia
externa em `%TEMP%/estojo-validacao-isolada`, apontada por
`NEGOCIO_VALIDACAO_DIR`, e usou o navegador já instalado. A instalação por npm
descrita abaixo não foi repetida nesta rodada. Nenhuma dependência ou arquivo
do cliente foi alterado. Resultado detalhado:
[`validacao-chromium.json`](previa/evidencias/validacao-chromium.json).

- Quatro casos em 320, 390, 768 e 1440px, com capturas inspecionadas.
- Zero overflow horizontal da página e nenhum controle visível menor que 44×44.
- Telefone e âncoras conferidos por teclado; telefone preserva o destino `tel:`
  derivado do dado fornecido. Controles de galeria ocultam a instrução redundante
  e conservam a rolagem com a scrollbar visualmente oculta.
- Ordem e alternância corretas; formulário somente no caso habilitado. As listas
  esperadas dos quatro casos são explícitas no teste e independem de
  `estadoBlocos()` e do cálculo de visibilidade do renderizador.
- Zero, um, dois e 12 trabalhos em 13 larguras, incluindo 599/600, 659/660,
  919/920 e 959/960px; inspeção adicional nas transições de uma, duas e três
  colunas de cartões.
- Casos sem JS nas quatro larguras; rolagem por teclado e Enter sem envio.
- Nomes/handles/textos longos, valores nulos, blocos desligados e reordenados,
  cartão sem foto; caracteres `< > & " '` preservados como texto, sem injeção.
- Foco visível, salto para conteúdo, Entrar, Enter nas setas, último cartão,
  controles ocultos sem overflow e toque emulado. Regressão confirmada antes da
  correção: trilho já focado conservava `tabindex=0` ao perder overflow. Agora os
  testes cobrem foco inicial no botão e no trilho, `tabindex=-1`, remoção ao sair
  por Tab e ausência de parada no retorno por Shift+Tab. Também verificam
  `behavior: 'auto'` na chamada de navegação e no CSS computado.
- Seis paletas × dois temas, em duas páginas e com fundos normais/tingidos
  invertidos: 48 combinações renderizadas. Texto mínimo 5,16:1; bordas de
  campos, botões de galeria/envio e cartões, mínimo 5,19:1.

As medidas de contraste usam cores computadas opacas. Não são a medição oficial
do cliente nem certificação integral de acessibilidade. O Firefox instalado
falhou ao criar a página com Node 24 (`Cannot read properties of undefined
(reading '_page')`); não há aprovação nesse navegador. Toque foi apenas emulado;
arraste em aparelho físico, zoom nativo e leitor de tela não foram exercitados.

| Capturas | 390px | 1440px |
|---|---|---|
| Recém-criada | [abrir](previa/evidencias/recem-criada-390.png) | [abrir](previa/evidencias/recem-criada-1440.png) |
| Um bloco | [abrir](previa/evidencias/um-bloco-so-390.png) | [abrir](previa/evidencias/um-bloco-so-1440.png) |
| Cheia | [abrir](previa/evidencias/cheia-390.png) | [abrir](previa/evidencias/cheia-1440.png) |
| Avisos e formulário | [abrir](previa/evidencias/avisos-primeiro-com-formulario-390.png) | [abrir](previa/evidencias/avisos-primeiro-com-formulario-1440.png) |

A geração continua sendo somente `node propostas/negocio-casos/gerar.mjs`.
Para preparar a **validação separadamente**, execute na raiz do repositório,
no PowerShell, com Node e npm disponíveis:

```powershell
$ambienteValidacao = Join-Path $env:TEMP 'estojo-validacao-isolada'
New-Item -ItemType Directory -Force -Path $ambienteValidacao | Out-Null
npm.cmd install --prefix $ambienteValidacao --no-save --package-lock=false playwright@1.61.1
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $ambienteValidacao 'navegadores'
node (Join-Path $ambienteValidacao 'node_modules\playwright\cli.js') install chromium
$env:NEGOCIO_VALIDACAO_DIR = $ambienteValidacao
$env:NEGOCIO_BROWSER = 'chromium'
Remove-Item Env:\NEGOCIO_BROWSER_PATH -ErrorAction SilentlyContinue
node propostas/negocio-casos/gerar.mjs
node propostas/negocio-casos/validar.mjs
```

Playwright e o navegador ficam no diretório externo, sem modificar `package.json`,
lockfile ou `node_modules` do cliente. `NEGOCIO_VALIDACAO_DIR` define a raiz onde
o validador resolve o pacote; `PLAYWRIGHT_BROWSERS_PATH` define o cache dos
navegadores. Nas próximas execuções, mantenha essas variáveis na sessão; não é
preciso reinstalar. A versão fixada do Playwright seleciona seu Chromium
correspondente, cuja versão pode diferir do executável usado no resultado acima.

Opcionalmente, `NEGOCIO_BROWSER_PATH` aceita o caminho completo de um navegador
já instalado. Sem `NEGOCIO_VALIDACAO_DIR`, o script usa a resolução local normal
do Node e exige Playwright previamente disponível; não instala nada sozinho.

## Integração pendente

Configurar a URL real de acesso; fornecer mídias e textos alternativos; definir
contrato, obrigatoriedade e estados reais do formulário. A marcação `noindex`
protege a prévia demonstrativa e deve ser revista ao integrar a página pública.
O HTML já contém o conteúdo; não depende de hidratação. A medição oficial de
aceitação permanece com o cliente. Não houve commit, push ou PR nesta etapa.
