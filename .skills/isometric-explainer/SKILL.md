---
name: isometric-explainer
description: Cria sites de explicação interativa no estilo "designed-to-scale" (diagramas isométricos em SVG, animados, que o leitor percorre passo a passo, com estética de papel creme, contornos escuros, pastéis e fonte monoespaçada). Use quando o usuário pedir um curso interativo, explorable explanation, scrollytelling, diagrama isométrico animado, site explicativo de arquitetura/system design, ou "um site nesse estilo".
compatibility: Requer Node.js 18+ para o script de validação e um servidor HTTP local (npx serve ou python -m http.server). O site gerado é estático, sem build.
metadata:
  version: "1.0"
---

# Isometric explainer

Gera um site estático em que cada lição é um diagrama isométrico SVG e cada passo muda o diagrama (nós aparecem, fios acendem, pacotes andam) enquanto um painel ao lado explica a ideia.

O template em `assets/template/` já funciona. O trabalho é quase todo escrever `src/course.js`.

## Fluxo

### 1. Entender o pedido

Antes de gerar qualquer coisa, confirme com o usuário (em uma única pergunta, com sugestões padrão):

- **Tema e público.** Exemplos: "filas de mensagens para devs júnior", "como funciona o Pix".
- **Idioma** do conteúdo. O padrão é pt-BR. Para outro idioma, preencha `course.ui` e `course.lang`.
- **Tamanho.** O padrão é de 3 a 5 lições, cada uma com 3 a 7 passos.
- **Pasta de destino.** O padrão é uma pasta nova com o nome do tema dentro do workspace.

Se o usuário já deu esses dados, não pergunte de novo.

### 2. Copiar o template

Copie `assets/template/` (relativo a esta skill) para a pasta de destino, sem apagar arquivos que já existam lá. A skill fica em `.kiro/skills/isometric-explainer/` no workspace ou em `~/.kiro/skills/isometric-explainer/`.

PowerShell:
```powershell
Copy-Item -Recurse "<skill>/assets/template/*" "<destino>"
```
bash:
```bash
cp -r "<skill>/assets/template/." "<destino>"
```

Depois troque `<title>` e `<meta name="description">` em `index.html`.

### 3. Roteiro antes do código

Escreva o roteiro e mostre ao usuário antes de montar as cenas. Para cada lição, liste um título e os passos, cada um com tag, título e uma frase do que muda no diagrama.

Siga o arco `setup → problem → solution/technique → tradeoff`. Leia `references/lesson-format.md` (seção "Como escrever boas lições").

### 4. Montar as cenas

Para cada lição:

1. Liste todos os nós, zonas e fios que vão aparecer em **qualquer** passo. A cena é declarada uma vez só.
2. Distribua os elementos na grade seguindo `references/isometric.md` (seção "Receitas de layout"). Coloque o fluxo principal em `+x`, as réplicas em `y` e os serviços laterais em `−y`, sem sobrepor blocos.
3. Escolha os tons pelo papel de cada elemento, conforme `references/style-guide.md`, e mantenha o mesmo significado em todas as lições.
4. Escreva os passos com `show`, `active`, `focus`, `packets` e `notes`. O formato completo está em `references/lesson-format.md`.

### 5. Validar

```bash
node "<skill>/scripts/check-course.mjs" "<destino>/src/course.js"
```

Corrija todos os `error`. Avalie cada `warn` e corrija, a não ser que haja um motivo para manter. O aviso `overlaps ... on screen` quer dizer que um rótulo ou balão cobre outro elemento naquele passo. A correção normal é afastar os nós (mais 1 a 1,5 unidade) ou mover o balão para outro nó.

Depois sirva o site (`npx serve "<destino>"` ou `python -m http.server -d "<destino>"`) e abra no navegador. Módulos ES não carregam via `file://`.

Confira:

- O console não mostra avisos `[scene]`.
- Cada passo muda algo visível no diagrama.
- Rótulos e balões não se sobrepõem.
- Os temas claro e escuro funcionam (botão ◐).
- A largura abaixo de 960px funciona.
- As setas ← → navegam entre passos e lições.

Se tiver um navegador headless disponível, tire screenshots de alguns passos para revisar o layout.

### 6. Publicar (se pedido)

O site é estático. Basta publicar a pasta como está, sem passo de build, em Vercel, Netlify, GitHub Pages ou Cloudflare Pages.

## Regras

- **Edite `course.js` primeiro.** Só mexa em `engine.js`, `scene.js` ou `iso.js` quando o conteúdo exigir algo que o formato não cobre, como um formato novo. Nesse caso siga `references/isometric.md` (seção "Estendendo") e mantenha as classes `face--*` e `tone-*`.
- **Use só os tokens do `styles.css`.** Não introduza cores, sombras com blur, gradientes ou outra fonte. O guia completo está em `references/style-guide.md`.
- **Use um único destaque**, `--rust`.
- **Mantenha a acessibilidade:** `aria-live` no texto do passo, navegação por teclado, `prefers-reduced-motion` e contraste nos dois temas.
- **Não use dependências.** O template não usa framework nem build. Só adicione um quando o usuário pedir.
- **Não copie o original.** O texto, as ilustrações e o código de designed-to-scale.vercel.app servem só como referência de estilo.
