# Guia visual

O estilo junta **diagramas isométricos** em SVG, uma **explorable explanation** em passos e uma estética de **papel e tinta**: fundo creme, contornos escuros, tons pastel, sombras duras sem desfoque e fonte monoespaçada.

Ele foi inspirado em designed-to-scale.vercel.app (Dilum Sanjaya). Use como referência de estilo, mas não copie o texto, as ilustrações nem o código daquele site.

## Cores

Os tokens estão em `styles.css`. Sempre use as variáveis, nunca hex soltos no componente.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--paper` | `#f4ebe0` | `#211e1a` | fundo da página |
| `--sheet` | `#f9f2e8` | `#28241f` | área do diagrama (com grade de pontos) |
| `--card` | `#f8f0e6` | `#26231e` | painéis, botões, balões |
| `--line` / `--line-strong` | `#ddd3c5` / `#c6bbac` | `#342f28` / `#4f473d` | divisórias, fios inativos |
| `--edge` | `#46413b` | `#c6bfb7` | todo contorno de forma |
| `--ink` / `--ink-2` / `--muted` | `#1d1b18` / `#34302b` / `#6f6961` | `#efe6d6` / `#ddd3c2` / `#a3998b` | texto |
| `--rust` | `#d0683a` | `#d0683a` | **único** destaque: estado ativo, pacotes, botão principal |
| `--drop` | `= --ink` | `#050403` | sombra dura |

Tons das formas (`tone-*`): `sand`, `green`, `violet`, `orange`, `mint`, `blue`, `red`, `yellow`. São pastéis no tema claro e versões escuras e dessaturadas no escuro.

Sugestão de significado, mantida igual em todas as lições:

- `violet`: clientes e usuários
- `blue`: rede e borda (balanceador, gateway, CDN)
- `sand`: computação (servidores de aplicação)
- `orange`: armazenamento persistente
- `red`: memória e cache
- `yellow`: serviços de apoio (DNS, configuração)
- `green`: zonas, sucesso e respostas
- `mint`: filas e mensageria

## Tipografia

- **JetBrains Mono** em tudo, com pesos de 400 a 800.
- Corpo com 13px e line-height 1,65. Título da lição com 19px/800 e título do passo com 15px/700.
- Metadados e chips com 10,5px, MAIÚSCULAS e `letter-spacing: .08em`.
- Rótulos no diagrama com 11,5px/700 e sub-rótulos com 10px em `--muted`.

## Formas e superfícies

- Contorno de **1,5px** em `--edge`, com `stroke-linejoin: round`.
- **Sombra dura** deslocada, sem blur: `2px 2px 0 var(--drop)` em botões e `3px 3px 0` em painéis.
- Raios: 6px em chips, 9px em botões e 14px em painéis.
- O botão pressionado se desloca 2px e perde a sombra, como se fosse apertado contra o papel.
- A área do diagrama tem grade de pontos (`radial-gradient`, a cada 22px).

## Movimento

- Os elementos entram vindo de cima (`translateY(-16px)` até 0) com fade de 0,45s e easing `cubic-bezier(.2,.8,.2,1)`.
- Um nó ativo sobe 4px e ganha contorno `--rust`.
- Um fio ativo ganha um tracejado ferrugem que corre no sentido do fluxo.
- Pacotes andam com ease-in-out e aparecem e somem nas pontas.
- Com `prefers-reduced-motion`, nada se anima e os pacotes ficam parados no meio do fio.

## Layout

- No desktop, o painel de texto (320–420px) fica à esquerda e o diagrama ocupa o resto, cada um num cartão.
- Abaixo de 960px, o diagrama fica em cima (52vh) e o texto embaixo.
- A navegação funciona por botões, pontos de passo, setas do teclado (← → e j/k) e swipe no diagrama.
- A URL reflete o passo (`#/licao/3`), então dá para compartilhar um link para um passo específico.

## O que evitar

- Gradientes, sombras com blur, glassmorphism e neon.
- Mais de uma cor de destaque. Só `--rust` chama atenção.
- Perspectiva real, 3D com WebGL ou rotação de câmera. A isometria é fixa.
- Ícones genéricos em cima das formas. Prefira `glyph` com 2 a 4 letras (`LB`, `DB`, `RAM`).
- Texto longo dentro do diagrama. Explicações vão no painel, e o diagrama só leva rótulos e números.
