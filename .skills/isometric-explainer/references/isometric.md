# Isometria: matemática e layout

## Projeção

Projeção isométrica com ângulos de 30°. Um ponto da grade `(x, y, z)` vira um ponto na tela assim:

```
sx = (x − y) · cos30° · UNIT
sy = (x + y) · sin30° · UNIT − z · UNIT
```

`UNIT = 32` px, definido em `src/iso.js`. Na tela:

- `+x` vai para **baixo-direita**
- `+y` vai para **baixo-esquerda**
- `+z` vai para **cima**

```
            (0,0)
           /     \
      +y  /       \  +x
         /         \
    (0,1)           (1,0)
         \         /
          \       /
           (1,1)        ← quanto maior x+y, mais "na frente"
```

## Faces visíveis de um bloco

Um bloco em `(x, y, z)` com tamanho `(w, d, h)` mostra três faces:

| Face | Cantos | Tom |
|---|---|---|
| topo | z+h: (x,y) (x+w,y) (x+w,y+d) (x,y+d) | cor base `--t` |
| esquerda (lado y+d) | (x,y+d) → (x+w,y+d), de z+h até z | base + 12% de sombra |
| direita (lado x+w) | (x+w,y) → (x+w,y+d), de z+h até z | base + 24% de sombra |

A luz vem de cima e da esquerda, e o escurecimento é feito com `color-mix` no CSS. Por isso um único tom funciona nos temas claro e escuro.

Num cilindro, um círculo de raio `r` no chão vira uma elipse com `rx = r·√2·cos30°·UNIT` e `ry = r·√2·sin30°·UNIT`.

## Ordem de desenho

O SVG não tem z-buffer. `scene.js` desenha nesta ordem:

1. zonas (piso)
2. fios (no chão, `z = 0`, então somem por baixo dos blocos)
3. nós ordenados por `x + w/2 + y + d/2`, de trás para frente
4. rótulos dos nós (camada própria, para um bloco da frente nunca cobrir o nome de outro)
5. balões (`notes`)
6. pacotes

Para a ordenação funcionar, **não sobreponha blocos**. Deixe pelo menos 1 unidade de folga entre vizinhos. O script `check-course.mjs` avisa quando há sobreposição.

## Receitas de layout

- **Fluxo principal** ao longo de `+x` (da esquerda-cima para a direita-baixo na tela): usuário → borda → app → dados. Espaçamento de 2,5 a 3 unidades.
- **Réplicas** (servidores, shards) lado a lado em `y`, com o mesmo `x`: `y: 2` e `y: 4.5`.
- **Serviços laterais** (DNS, CDN, fila, cache) deslocados em `−y` (`y` negativo), acima do fluxo principal na tela. Deixe pelo menos 1,5 unidade entre eles e o canto de trás de uma zona, onde fica o rótulo da zona.
- **Rótulos ficam abaixo do canto da frente** de cada nó. Se um nó está logo à frente de outro (mesmo `x`, `y` maior), dê 2,5 unidades de distância para os rótulos não encostarem.
- **Balões (`notes`)** sobem a partir do topo do nó. Evite nós com balão logo atrás de um nó alto.
- **Zonas** envolvem o grupo com 0,5 de margem em cada lado.
- **Alturas comunicam papel:** clientes e balanceadores são baixos (0,5–0,6), servidores altos (1,2–1,6), bancos médios (1–1,2).
- **Fios:** use `route: 'xy'` ou `'yx'` para trajetos em L que seguem a grade. `straight` gera uma diagonal, então use só quando ficar claro.
- O `viewBox` é calculado automaticamente pela caixa de todos os elementos da lição. Se a cena ficar muito comprida, prefira mais de uma lição a uma cena gigante.

## Estendendo

Para um formato novo (fila, nuvem, celular), adicione uma função em `iso.js` que retorne um `<g class="node tone-…" data-id="…">` com faces `face--top`, `face--left` e `face--right`. Depois trate o novo `shape` em `scene.js`. Mantendo essas classes, a forma nova herda tema, estados e transições sem CSS extra.
