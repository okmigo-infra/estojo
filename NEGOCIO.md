# Página de negócio — proposta para revisão

## Original e proposta

O original reproduzia a produção: navegação oculta até 44rem, catálogo sem
intervalo entre lista e carrossel no estreito, Recados empilhados no desktop,
contato distribuído pela altura do formulário e confirmação junto dos campos.
Anunciava sete cartões, mas continha três. As bordas necessárias com `--grade`
mediam 2,83:1 sobre o fundo e 2,25:1 sobre a faixa tingida na paleta forno escura.

A proposta e seu refinamento em `telas/negocio.html` ainda não foram integrados ao produto:

- Atalhos visíveis em segunda linha até 74rem, preservando Entrar e a ordem de foco.
- Gap de 28px entre lista e carrossel empilhados; duas colunas a partir de 62rem,
  tanto no catálogo quanto em Recados. No refinamento, o Recado único com imagem
  usa imagem inteira e legenda lado a lado abaixo de 62rem; múltiplos mantêm
  os cartões verticais, rolagem e corte do próximo.
- Contato alinhado pelo conteúdo, com gaps de 28px; metadados de pelo menos 12px.
- Contadores de três cartões e instrução sem quantidade fictícia.
- Foco explícito e regiões de carrossel nomeadas, com parada de Tab apenas
  quando há overflow. A navegação acrescentada por script é progressiva.
- Título “Envie uma mensagem” e informação sobre dispensa de conta antes dos campos.

## Refinamento da interação

Não há proibição explícita de script nas instruções do repositório. Um script
local, sem dependências, acrescenta controles de 44×44px quando o conteúdo
efetivamente excede o trilho. Em Recados, a instrução “Deslize ou use as setas”
compartilha essa faixa, separada da rolagem por 14px; a margem negativa foi removida.

### Composição final do catálogo

Somente em `#tem`, “Em destaque” e os controles anterior/próximo compartilham
um cabeçalho discreto, 14px acima da galeria. Não há mais uma faixa de controles
abaixo dos cartões. A barra é ocultada apenas pela classe `com-controles`, aplicada pelo script quando há
overflow; o fallback declara `scrollbar-width:auto`, sem classe ou controles.
Rolagem, snap, teclado e toque continuam nativos. O cartão sem foto ganhou
texto de 18–22px, entrelinha 1,4 e padding de 22×20px, mantendo texto e contador.
No celular, cada cartão preserva a base de 78% e deixa parte do próximo visível
como indicação do gesto horizontal. A partir de 48rem, uma regra exclusiva de
`#tem` calcula cada cartão como metade do espaço real, descontando o intervalo
de 14px. Assim dois cartões de igual largura ficam completos, com ambas as
bordas visíveis, enquanto o terceiro permanece fora do trilho até a navegação.
No móvel, um espaço final calculado em `22% - 14px` permite alinhar também o
último cartão no início do trilho. Ao avançar, nenhum fragmento do cartão anterior
permanece à esquerda; o corte parcial existe somente à direita do cartão atual.
Como o `overflow` do Firefox recorta o pixel externo da borda no ponto exato de
alinhamento, o script marca o cartão alinhado após a rolagem e redesenha somente
essa borda com um traço interno de 1px. Isso não altera largura, gap ou destinos
de navegação e evita o aspecto aberto mostrado na revisão visual.

As setas são elementos separados dentro de botões de 44×44px. O botão declara
o papel de moldura e a seta declara o papel de ícone, para que ambos sejam
medidos. O catálogo usa `disabled` nativo nos extremos; o traço pontilhado e a
seta em `--apoio` continuam visíveis. Com um único cartão, o título permanece e
apenas os controles somem. O espaçador móvel também só existe quando há mais de
um cartão. Clique, Enter, rolagem nativa e toque preservam os mesmos destinos.

Capturas e gravações desta rodada: `%TEMP%/estojo-ux-setas-cabecalho`, comparadas
às capturas de `estojo-ux-catalogo-final`. O catálogo foi conferido em 320, 390,
768, 1024 e 1440px, no estado inicial e após navegar. Zero overflow horizontal da página;
as alturas de Recados da tabela permaneceram iguais. Cliques, Enter, tap emulado
e desaparecimento dos controles sem overflow foram exercitados. A região mantém
foco temporário com tabindex=-1, removido ao sair.

Em 768, 1024, 1280 e 1440px, as medições confirmaram dois cartões completos,
de larguras iguais, gap de 14px, borda direita visível e terceiro cartão com
zero pixels expostos. Após avançar, o primeiro fica totalmente fora e o segundo
e o cartão sem foto aparecem completos. Textos longos não criaram overflow.

O espaço entre o fim do carrossel e Recados ficou em 32px no móvel, 36,8px em
1024px e 46px em 1440px. No tema escuro verificado, a seta indisponível mediu
6,85:1 e a disponível 14,97:1; a moldura preserva `--borda-necessaria`.
Os três verificadores retornaram 0 usando Node 22.23.2. Com o Node 24.18.0 local,
o Firefox do Playwright falhou antes de criar a página; nenhuma regra foi mudada
para contornar essa incompatibilidade do ambiente.

No contexto explicitamente sem JavaScript, não foram criados controles e o
teclado rolou 287px. O Firefox automatizado reportou scrollbar-width computado
como none mesmo quando apenas a regra auto era aplicável: a declaração de
fallback está preservada, mas a exibição física da barra neste ambiente não
foi confirmada. Não se confunde esse resultado com uma captura comprovando barra visível.

O deslocamento usa as posições reais dos cartões. Scroll, ResizeObserver e
mudanças na lista atualizam a disponibilidade. Os botões usam aria-disabled,
sem sair inesperadamente da ordem de foco ao chegar às extremidades. Se o
overflow desaparece enquanto um botão tem foco, o foco passa à região com
tabindex=-1, removido ao sair dela. Não há parada de Tab ociosa sem overflow.

A rolagem é instantânea, sem animação, autoplay ou interceptação de toque;
não depende da preferência de movimento. Sem JavaScript não são criados
controles nem instruções; a rolagem nativa continua disponível. O acesso pelo
teclado sem script foi confirmado no Firefox, que focaliza trilhos roláveis.

Escolhemos a composição compacta do Recado único após comparar 320 e 390px:
a imagem mantém proporção 4:3, sem corte adicional, e a legenda mantém fonte
e data. Fotos com detalhes pequenos ainda merecem revisão com conteúdo real;
o estojo contém imagens ilustrativas. O desktop mantém duas colunas.

## Bordas e estados

O alias local proposto `--borda-necessaria: var(--apoio)` delimita listas e
cartões com 1px e campos com 2px. Os separadores editoriais de 2px e as divisões
internas das imagens preservam `--grade`; as linhas internas preservam `--linha`.
Assim os controles têm mais peso que os cartões, sem substituir os fundos ou
as cores derivadas. A inspeção visual incluiu fundo normal e tingido, claro e escuro.

`tokens/atual.json`, o extrator e as regras de `--grade` e `--tinte` não mudaram.
As nove exceções de borda dos elementos corrigidos foram removidas da página;
as exceções das outras telas permanecem. A integração do alias é uma proposta,
não uma alteração já realizada em `paletas.py` ou no produto.

O preenchimento permanece no contato. A confirmação está num mostruário
identificado após o rodapé, seguindo a convenção de estados visíveis do estojo.
Ambos permanecem no DOM e na medição. Enviar continua sem envio implementado;
nada faz a confirmação aparecer como resultado do clique. A explicação da
reprodução fica exclusivamente no mostruário, fora do fluxo público.

## Execução dos verificadores

`verificar/executar.mjs` enumera os HTMLs usando Node e invoca os verificadores
originais com argumentos separados, sem expansão pelo shell. O conjunto mantém
a interrupção no primeiro código diferente de zero; cada execução individual
propaga seu código. Erro de uso ou ausência de telas retorna 2; falha ao iniciar
ou interrupção do processo retorna 1. Nenhuma régua ou dependência foi alterada.
No PowerShell com bloqueio de scripts, usar `npm.cmd run verificar`.

## Validação local — Firefox, 2026-09-08

Capturas originais preservadas em `%TEMP%/estojo-ux-original`; novas capturas,
logs e medições da primeira proposta em `%TEMP%/estojo-ux-proposta`.
O refinamento usa `%TEMP%/estojo-ux-refinamento`, sem sobrescrever as capturas
anteriores. Não são arquivos para integrar.

| Medida | Original | Primeira proposta | Refinamento final |
|---|---:|---:|---:|
| Gap catálogo empilhado, 320/390/768px | 0px | 28px | 28px |
| Altura de Recados, 320px, um cartão | 668,82px | 722,30px | 534,83px |
| Altura de Recados, 390px, um cartão | 684,97px | 739,50px | 532,20px |
| Altura de Recados, 768px, um cartão | 679,73px | 685,73px | 598,13px |
| Altura de Recados, 1440px, um cartão | 728,68px | 526,08px | 526,08px |
| Atalhos visíveis, 390px | 0 | 3 | 3 |
| Overflow horizontal da página, quatro larguras | 0px | 0px | 0px |

O refinamento reduz a altura de Recados no celular sem reduzir fontes ou ocultar
conteúdo. A primeira proposta havia aumentado a altura pelo cartão único maior.
O catálogo mostra 63px do segundo cartão em 390px e 47,6px em 320px.

Os três comandos (`verificar`, `contraste`, `alvo`) retornaram 0:

- Contraste: 53 combinações, zero falhas novas, uma conhecida e duas não medidas.
- Alvo: 63 elementos, zero falhas novas, 12 conhecidas, 11 entre 24 e 44px.
- Negócio: zero exceções de contraste; 15 elementos contabilizados, nenhum alvo
  visível abaixo de 44px. O total inclui dois botões ocultos de Recados sem
  overflow; não significa 15 alvos visíveis. São 13 visíveis na amostra em 390px.

Foram capturadas as quatro larguras 320/390/768/1440px. Variantes temporárias
incluíram três Recados, cartão sem foto, textos longos e seções reordenadas com
alternância de fundo atualizada. Nenhuma apresentou overflow da página.
Tab, Shift+Tab, Enter na âncora, foco visível e rolagem do catálogo por teclado
foram exercitados. A âncora Falar chega com aproximadamente 14px de margem.

No refinamento, cliques, Enter, setas do teclado e taps emulados funcionaram
nas quatro larguras. Foram conferidos extremos, rolagem manual, redimensionamento
após rolar, remoção de cartões até cessar overflow, preservação de foco, múltiplos
Recados e textos longos. Sem JavaScript, ArrowRight rolou o catálogo 287px no
Firefox. Toque físico e gesto de arraste num aparelho real não foram testados.

As seis paletas nos dois temas foram efetivamente renderizadas e capturadas
em 390px. Além do cálculo sobre os tokens, as cores computadas das molduras e
fundos ancestrais foram verificadas nas 12 combinações: mínimo de 5,19:1.
Isso é validação das bordas, não auditoria completa de cada texto nas 12 versões.
Os novos controles também foram renderizados em fundo normal e tingido nas
12 combinações, com contraste mínimo de texto de 14,60:1, bordas de 5,19:1
e caixas >=44×44px.
Essa medição suplementar inclui as bordas dos botões, que o verificador padrão
não mede automaticamente quando o elemento é classificado como texto.
As imagens de demonstração mantêm suas cores literais, como fotografias fariam.

Ampliação foi exercitada com CSS zoom de 200% e com viewport de 720px para
reflow equivalente à metade de 1440px. Não substitui validar o zoom nativo de
200% num navegador interativo; esse é um limite desta execução automatizada.

Os verificadores originais continuam limitados a 390px/tema escuro, cores
computadas e caixas DOM. Não certificam acessibilidade completa, leitor de tela,
placeholder, foco, conteúdo de imagens ou translucidez empilhada. Contraste
deduplica combinações; o total de alvos inclui elementos ocultos. A verificação
de exceções de alvo corrigidas tem uma filtragem prévia que exige revisão manual.
Nenhuma dessas limitações foi contornada alterando as regras.

## Rascunho de PR

Melhora a página pública de negócio com atalhos no celular, separação entre
lista e carrossel, Recados em duas colunas no desktop e contato agrupado.
Acrescenta controles progressivos ao carrossel, composição compacta para Recado
único no celular e uma introdução à alternativa de contato por mensagem.
Corrige molduras necessárias com alias local, preserva tokens extraídos e
separa a confirmação demonstrativa. Enumera as telas via Node para executar
os dois verificadores no Windows sem depender do glob do shell.

Validação: três comandos com saída 0, capturas em quatro larguras, variantes
de conteúdo e 12 paletas/temas renderizados. Permanecem defeitos conhecidos
nas outras telas e dois contrastes não medidos; integração no produto pendente.
