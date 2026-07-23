## Significado de cada métrica do Apache JMeter

| Métrica                       | O que significa                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Label**                     | Nome da requisição (HTTP Request) ou sampler executado durante o teste.                                                        |
| **# Samples**                 | Quantidade total de requisições realizadas para a operação testada.                                                            |
| **Average**                   | Tempo médio de resposta das requisições, normalmente expresso em milissegundos (ms).                                           |
| **Min**                       | Menor tempo de resposta registrado entre todas as requisições.                                                                 |
| **Max**                       | Maior tempo de resposta registrado durante o teste.                                                                            |
| **Std. Dev. (Desvio Padrão)** | Mede a variação dos tempos de resposta em relação à média. Quanto menor o valor, mais consistente é o desempenho da aplicação. |
| **Error %**                   | Percentual de requisições que falharam, seja por códigos de erro HTTP, timeouts, falhas de conexão ou assertions do JMeter.    |
| **Throughput**                | Quantidade média de requisições processadas pela aplicação por unidade de tempo (geralmente requisições por segundo).          |
| **Received KB/sec**           | Taxa média de dados recebidos da aplicação pelo cliente, em kilobytes por segundo.                                             |
| **Sent KB/sec**               | Taxa média de dados enviados pelo cliente para a aplicação, em kilobytes por segundo.                                          |
| **Avg. Bytes**                | Tamanho médio, em bytes, das respostas retornadas pela aplicação para cada requisição.                                         |
