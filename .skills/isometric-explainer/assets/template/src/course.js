// Course content. This is the only file you normally edit.
// Format: see references/lesson-format.md in the isometric-explainer skill.

export const course = {
  title: 'Como a web funciona',
  lang: 'pt-BR',
  lessons: [
    {
      id: 'ciclo-da-requisicao',
      title: 'O caminho de uma requisição',
      scene: {
        zones: [{ id: 'dc', x: 3.5, y: 1, w: 9.5, d: 5, tone: 'green', label: 'Datacenter' }],
        nodes: [
          { id: 'user', x: 0, y: 3, h: 0.6, tone: 'violet', label: 'Você', sub: 'navegador', glyph: 'PC' },
          { id: 'dns', x: 0, y: -0.5, h: 0.8, tone: 'yellow', label: 'DNS', glyph: 'DNS' },
          { id: 'lb', x: 4.5, y: 3, h: 0.5, tone: 'blue', label: 'Balanceador', glyph: 'LB' },
          { id: 's1', x: 8.5, y: 1.5, h: 1.4, shape: 'server', tone: 'sand', label: 'App 1' },
          { id: 's2', x: 8.5, y: 4.5, h: 1.4, shape: 'server', tone: 'sand', label: 'App 2' },
          { id: 'db', x: 11.5, y: 3, h: 1.2, shape: 'cylinder', tone: 'orange', label: 'Banco' },
        ],
        wires: [
          { id: 'user-dns', from: 'user', to: 'dns', route: 'yx' },
          { id: 'user-lb', from: 'user', to: 'lb' },
          { id: 'lb-s1', from: 'lb', to: 's1' },
          { id: 'lb-s2', from: 'lb', to: 's2' },
          { id: 's1-db', from: 's1', to: 'db' },
          { id: 's2-db', from: 's2', to: 'db' },
        ],
      },
      steps: [
        {
          tag: 'setup',
          title: 'Você digita um endereço',
          body: '<p>Tudo começa no navegador. Você digita <code>loja.com</code> e aperta Enter.</p><p>O navegador ainda não sabe onde esse site mora. Ele só tem um nome.</p>',
          show: ['user'],
          notes: [{ at: 'user', text: 'loja.com' }],
        },
        {
          tag: 'technique',
          title: 'O DNS traduz o nome',
          body: '<p>O navegador pergunta ao <strong>DNS</strong> qual é o endereço IP de <code>loja.com</code>.</p><p>A resposta fica em cache por alguns minutos, então essa ida costuma acontecer uma vez só.</p>',
          show: ['user', 'dns', 'user-dns'],
          active: ['user-dns'],
          packets: [
            { wire: 'user-dns', label: 'loja.com?' },
            { wire: 'user-dns', reverse: true, delay: 1600, label: '203.0.113.7', tone: 'green' },
          ],
        },
        {
          tag: 'solution',
          title: 'O balanceador escolhe um servidor',
          body: '<p>Com o IP em mãos, a requisição chega ao <strong>balanceador de carga</strong>.</p><p>Ele repassa cada requisição para um servidor de aplicação disponível. Se um cair, o outro continua atendendo.</p>',
          show: ['user', 'dns', 'user-dns', 'dc', 'lb', 's1', 's2', 'user-lb', 'lb-s1', 'lb-s2'],
          active: ['user-lb', 'lb-s1'],
          focus: ['user', 'lb', 's1'],
          packets: [
            { wire: 'user-lb', label: 'GET /' },
            { wire: 'lb-s1', delay: 1400 },
          ],
        },
        {
          tag: 'technique',
          title: 'O servidor busca os dados',
          body: '<p>O servidor de aplicação não guarda os produtos. Ele consulta o <strong>banco de dados</strong>, que é a fonte da verdade.</p>',
          show: ['user', 'dns', 'user-dns', 'dc', 'lb', 's1', 's2', 'db', 'user-lb', 'lb-s1', 'lb-s2', 's1-db', 's2-db'],
          active: ['s1-db'],
          focus: ['s1', 'db'],
          packets: [
            { wire: 's1-db', label: 'SELECT' },
            { wire: 's1-db', reverse: true, delay: 1500, tone: 'green' },
          ],
        },
        {
          tag: 'tradeoff',
          title: 'A resposta faz o caminho de volta',
          body: '<p>A página volta pelo mesmo caminho até o navegador.</p><p>Cada salto adiciona alguns milissegundos. Por isso sistemas grandes tentam responder <strong>o mais perto possível</strong> do usuário.</p>',
          active: ['user-lb', 'lb-s1'],
          packets: [
            { wire: 'lb-s1', reverse: true, tone: 'green' },
            { wire: 'user-lb', reverse: true, delay: 1300, tone: 'green', label: '200 OK' },
          ],
          notes: [{ at: 'user', text: '≈ 120 ms', tone: 'green' }],
        },
      ],
    },
    {
      id: 'cache',
      title: 'Cache: lembrar em vez de recalcular',
      scene: {
        nodes: [
          { id: 'app', x: 0, y: 1, h: 1.4, shape: 'server', tone: 'sand', label: 'App' },
          { id: 'cache', x: 4, y: -2, h: 0.6, tone: 'red', label: 'Cache', sub: 'memória', glyph: 'RAM' },
          { id: 'db', x: 6, y: 3.5, h: 1.2, shape: 'cylinder', tone: 'orange', label: 'Banco', sub: 'disco' },
        ],
        wires: [
          { id: 'app-cache', from: 'app', to: 'cache', route: 'yx' },
          { id: 'app-db', from: 'app', to: 'db', route: 'xy' },
        ],
      },
      steps: [
        {
          tag: 'problem',
          title: 'O banco virou gargalo',
          body: '<p>Toda página pede a mesma lista de produtos. O banco responde a mesma pergunta milhares de vezes por segundo.</p>',
          show: ['app', 'db', 'app-db'],
          active: ['app-db'],
          packets: [
            { wire: 'app-db', duration: 2200 },
            { wire: 'app-db', reverse: true, delay: 2300, duration: 2200, tone: 'green' },
          ],
          notes: [{ at: 'db', text: '40 ms', tone: 'red' }],
        },
        {
          tag: 'solution',
          title: 'Guarde a resposta na memória',
          body: '<p>Um <strong>cache</strong> guarda o resultado recente em memória. Se a resposta já está lá, o banco nem é consultado.</p>',
          show: ['app', 'db', 'cache', 'app-db', 'app-cache'],
          active: ['app-cache'],
          focus: ['app', 'cache'],
          packets: [
            { wire: 'app-cache', duration: 700 },
            { wire: 'app-cache', reverse: true, delay: 800, duration: 700, tone: 'green', label: 'hit' },
          ],
          notes: [{ at: 'cache', text: '1 ms', tone: 'green' }],
        },
        {
          tag: 'tradeoff',
          title: 'O preço: dados velhos',
          body: '<p>Se um produto muda no banco, o cache continua servindo a versão antiga até expirar.</p><p>Escolher esse tempo de expiração (o <code>TTL</code>) é decidir quanto atraso você aceita.</p>',
          active: ['app-cache'],
          packets: [{ wire: 'app-cache', reverse: true, tone: 'yellow', label: 'preço antigo' }],
          notes: [{ at: 'db', text: 'preço novo', tone: 'yellow' }],
        },
      ],
    },
  ],
};
