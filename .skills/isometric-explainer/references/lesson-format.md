# Formato do `course.js`

Todo o conteúdo do site fica em `src/course.js`. O motor (`engine.js`, `scene.js`, `iso.js`) não precisa ser editado para criar lições novas.

## Estrutura

```js
export const course = {
  title: 'Nome do curso',
  lang: 'pt-BR',            // vai para <html lang>
  ui: { next: 'Next →' },   // opcional: sobrescreve textos da interface (ver DEFAULT_UI em engine.js)
  tags: { myth: { label: 'Mito', tone: 'red' } }, // opcional: tags extras
  lessons: [ /* lição */ ],
};
```

### Lição

```js
{
  id: 'ciclo-da-requisicao',   // vira a URL: #/ciclo-da-requisicao/1
  title: 'O caminho de uma requisição',
  scene: { zones: [], nodes: [], wires: [] },
  steps: [ /* passo */ ],
}
```

A cena é declarada **uma vez por lição** com todos os elementos que vão aparecer em algum passo. Os passos só mudam o estado (visível, ativo, em foco). Assim o enquadramento não pula entre passos e os elementos entram com transição.

### Elementos da cena

Coordenadas em unidades da grade: `x` cresce para baixo-direita, `y` para baixo-esquerda, `z` para cima. Ver `isometric.md`.

| Elemento | Campos |
|---|---|
| node | `id`, `x`, `y`, `z?`=0, `w?`=1, `d?`=1, `h?`=1, `shape?` (`block` \| `server` \| `cylinder`), `tone?`, `label?`, `sub?`, `glyph?` |
| zone | `id`, `x`, `y`, `w`, `d`, `tone?`, `label?`. Piso tracejado que agrupa nós (datacenter, região, VPC). |
| wire | `id`, `from`, `to` (ids de nós), `route?` (`xy` \| `yx` \| `straight`) |

- `label` fica abaixo do nó, `sub` é uma segunda linha menor e `glyph` é um texto curto (até 4 caracteres) desenhado em cima da face superior.
- Tons: `sand`, `green`, `violet`, `orange`, `mint`, `blue`, `red`, `yellow`.
- Os ids precisam ser únicos dentro da lição, somando nós, fios e zonas.

### Passo

```js
{
  tag: 'problem',            // setup | problem | solution | technique | tradeoff
  title: 'O banco virou gargalo',
  body: '<p>HTML curto, escrito pelo autor.</p>',
  show: ['app', 'db', 'app-db'],   // ids visíveis. Se omitido, herda do passo anterior.
  active: ['app-db'],              // destaca nós (borda e leve elevação) e anima fios
  focus: ['app', 'db'],            // esmaece tudo que não está em focus nem em active
  packets: [                       // bolinhas que percorrem fios
    { wire: 'app-db', label: 'SELECT', duration: 1400 },
    { wire: 'app-db', reverse: true, delay: 1500, tone: 'green' },
  ],
  notes: [{ at: 'db', text: '40 ms', tone: 'red' }], // balões sobre nós
}
```

- Os pacotes de um passo compartilham o mesmo ciclo de repetição. Use `delay` para encadear: primeiro a ida, depois a volta, depois o próximo salto.
- `show` sempre é a lista completa do que aparece, não um acréscimo. Para acumular, repita os ids anteriores.
- `body` é inserido como HTML. Use `<p>`, `<strong>` e `<code>`. Nunca coloque ali conteúdo vindo de usuários.

## Como escrever boas lições

- **Um passo, uma ideia.** Se o texto precisa de "e também", divida em dois passos.
- **De 3 a 7 passos por lição.** Quando passar disso, divida em duas lições.
- **De 30 a 80 palavras por passo**, em 1 a 3 parágrafos curtos.
- **Arco narrativo:** `setup` (o mundo simples), depois `problem` (o que quebra), `solution` ou `technique` (o que resolve) e por fim `tradeoff` (o que custa). Toda lição termina com um trade-off honesto.
- **O diagrama conta a história.** Cada passo muda algo visível: um nó aparece, um fio acende ou um pacote anda. Um passo sem mudança visual é sinal de texto demais.
- **Comece pequeno.** O passo 1 mostra 1 ou 2 nós e a cena cresce aos poucos.
- **Números concretos** nos `notes` (`40 ms`, `3 réplicas`, `99,9%`) ajudam mais que adjetivos.
- Termos técnicos aparecem em `<strong>` na primeira vez e são explicados na mesma frase.
