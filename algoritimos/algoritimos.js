// Leia um valor inteiro. A seguir, calcule o menor número de notas possíveis (cédulas) no qual o valor pode ser decomposto. As notas consideradas são de 100, 50, 20, 10, 5, 2 e 1. A seguir mostre o valor lido e a relação de notas necessárias.

(function numeroNotas(x) {
    const cedulas = [100, 50, 20, 10, 5, 2, 1];
    let valor = x;

    const y = cedulas.map((cedula) => {

        const divisao = valor / cedula;
        const qtd = Math.floor(divisao);
        const j = valor % cedula;
        valor = j;

        const organizacao = { cedula: cedula, qtd: qtd }

        return organizacao;
    });

    return y.map(itens => {
        console.log(`${itens.qtd} nota(s) de ${itens.cedula}`);
    });

})(576);
