// COMPLEXIDADE TEMPORAL

// O(1)

const nomes = ["mateus", "maria", "jose"]
console.log(nome[1]); // esta pegando diretamente o item, se o arr for maior ou menor nao faz diferença pois o tempo pra achar será o mesmo



// O(n)

const numeros = [1, 2, 3, 4, 5];

for (let i = 0; i< numeros.length; i++) {
    console.log(numeros[i]);
}; // vai percorrer todo o array, se for maior = mais itens para percorrer




// O(n²) --> sempre lembre de for dentro de for

for (let i = 0; i < numeros.length; i++) {
    for (let j = 0; j < numeros.length; j++) {
        console.log(numeros[i], numeros[j])
    };
}; // 5 itens = 25 iterações / 10 itens = 100 iterações .... sempre ao ²



// 0(log n) --> eliminar metade do problema a cada passo --_> o array deve estar obrigatoriamente ordenado

// procurar um livro no dicionário
// NÃO começa da página 1.

// abre no meio
// vê se a palavra vem antes ou depois
// elimina metade do livro

function buscaBinaria(arr, alvo) {
    let inicio = 0;
    let fim = arr.length - 1;

    while (inicio <= fim) {
        let meio = Math.floor((inicio + fim) / 2);

        if (arr[meio] === alvo) {
            return meio; // Alvo encontrado, retorna o índice
        }

        if (arr[meio] < alvo) {
            inicio = meio + 1; // Busca na metade direita
        } else {
            fim = meio - 1; // Busca na metade esquerda
        }
    }

    return -1; // Retorna -1 se o elemento não existir no array
}

const numeros = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log(buscaBinaria(numeros, 23));


// O(n log n)

function mergeSort(arr) {
  // Base case: arrays with 0 or 1 element are already sorted
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));  // Divide
  const right = mergeSort(arr.slice(mid));    // Divide

  return merge(left, right);                  // Conquer (Merge)
}

function merge(left, right) {
  let result = [], i = 0, j = 0;

  // Linear scan to combine two sorted arrays
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}

const data = [38, 27, 43, 3, 9, 82, 10];
console.log(mergeSort(data));


// COMPLEXIDADE ESPACIAL 

// O(1)

function soma(a, b) {
  return a + b;
} // sempre dois avalores ---> memória constante



// O(n)

function copiarArray(arr) {
  const novo = [];

  for (const item of arr) {
    novo.push(item);
  }

  return novo;
} // crescimento proporcional, mais items no array, maior o tamanho


// Você pode ter:

// Algoritmo rápido mas que usa muita memória

// ou

// Algoritmo lento mas econômico em memória

// Engenharia de software é equilibrar isso.


