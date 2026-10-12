### Tokenizacao 

### Mecanismo de atenção  

    - é uma técnica de inteligência artificial que permite a modelos de deep learning (aprendizado profundo) focar seletivamente nas partes mais importantes dos dados de entrada, ignorando informações menos relevantes

### Fine tuning 
    - é o processo de adaptar um modelo de inteligência artificial ou de aprendizado de máquina já treinado, usando um conjunto de dados menor e focado em uma tarefa específica.

## Sempre carregam

    ### AGENTS.MD (Documentação)
        - Arquitetura do projeto -> Consulta quando precisa
        - Decisões de design
        - Como o sistema funciona

    ### RULES.MD (Regras Globais)
        - Regras do projeto -> são sempre carregadas 
        - Estilo de código
        - convenções
        - restrições de segurança

## Carregam sobre demanda

    ### SKILLS 
        - Tarefas específicas
        - Instruções + Ferramentas
        - Executados no contexto principal 
    
    ### MCP 
        - Ferramentas externas
        - APIs, bancos de dados, slack, drive, trello, figma
        - descrições carregadas sob demanda 

    ### SUBAGENTS
        - Contexto isolado próprio
        - Modelos diferentes
        - Debugging, Testes
        - Retornam resumo ao pai

## System Prompt 

    - Todo modelo de IA possui um system prompt que roda antes de qualquer interacao, esses system prompt são padrões, regras para esse modelo que esta sendo usado.
  
    - é uma instrução inicial enviada a um modelo de inteligência artificial antes de qualquer interação com o usuário, com o objetivo de definir a persona, o tom de voz, as regras de comportamento e os limites do sistema

## Harness

    - Construção deliberada e contínua de mecanismos ao redor do modelo de linguagem, a fim de aumentar a confiança em seus resultados

    - Agente = Modelo (LLM) + Harness (Skills, Tools, MCPs, system prompts, hooks, memory, lógica de orquestração, Bundled Infrastructure)

    - Guias (Feedforward): Fornecem restrições contextuais e diretivas iniciais de comportamento antes da execução

    - Sensores (feedback): Monitoram estados e executam loops de feedback para autocorreção do agente
    
    - Grades de proteção: interceptam chamados e impõem limites determinísticos de segurança em tempo de execução 