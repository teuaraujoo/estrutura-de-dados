### Tokenizacao 

### Mecanismo de atenção  

### Fine tuning 


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