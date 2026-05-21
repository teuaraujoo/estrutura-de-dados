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