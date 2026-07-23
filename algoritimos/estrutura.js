// FILA (FIFO --> First in First Out)

class Queue {
    items = []

    enqueue(value) {
        this.items.push(value);
    }

    dequeue() {
        return this.items.shift();
    }
}

const fila = new Queue();

fila.enqueue(10);
fila.enqueue(20);
fila.enqueue(30);

console.log(fila)
console.log(fila.dequeue());
console.log(fila)

// LINKED LIST

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }

    // Adiciona no final
    add(value) {
        const newNode = new Node(value);

        // Se lista vazia
        if (!this.head) {
            this.head = newNode;
            return;
        }

        // Percorre até último node
        let current = this.head;

        while (current.next) {
            current = current.next;
        }

        current.next = newNode;
    }

    // Imprime lista
    print() {
        let current = this.head;

        while (current) {
            console.log(current.value);
            current = current.next;
        }
    }
}

const list = new LinkedList();

list.add(10);
list.add(20);
list.add(30);

list.print();

// BINARY SEACRH 

function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (arr[mid] === target) {
            return mid;
        }

        if (target < arr[mid]) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    return -1;
}

const numeros = [2, 5, 7, 10, 15, 20, 30];

console.log(binarySearch(numeros, 15));

// BINARY SEARCH Tree
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const newNode = new TreeNode(value);
        console.log(newNode)
        // Se árvore vazia
        if (!this.root) {
            this.root = newNode;
            return;
        }

        let current = this.root;

        while (true) {
            // Vai pra esquerda
            if (value < current.value) {
                if (!current.left) {
                    current.left = newNode;
                    return;
                }

                current = current.left;
            }

            // Vai pra direita
            else {
                if (!current.right) {
                    current.right = newNode;
                    return;
                }

                current = current.right;
            }
        }
    }

    search(value) {
        let current = this.root;

        while (current) {
            // Encontrou
            if (current.value === value) {
                return true;
            }

            // Vai esquerda
            if (value < current.value) {
                current = current.left;
            }

            // Vai direita
            else {
                current = current.right;
            }
        }

        return false;
    }
}

const tree = new BinarySearchTree();

tree.insert(10);
tree.insert(5);
tree.insert(20);
tree.insert(7);
tree.insert(30);

console.log(tree.search(7)); // true
console.log(tree.search(99)); // false
console.log(tree.root)

//   10
//  /  \
// 5    20
//  \     \
//   7     30