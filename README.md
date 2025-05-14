# VLA - Projeto Integrador 1: Sistema de Monitoramento de Foguete

Este é o repositório para o Projeto Integrador 1 do curso VLA, desenvolvendo um sistema de monitoramento e controle para foguetes.

## Descrição

O sistema consiste em uma API REST que permite o controle e monitoramento de foguetes, coletando dados de sensores como acelerômetro, altímetro e sensor de pressão de água. O sistema armazena esses dados e os disponibiliza através de dashboards para análise.

## Tecnologias Utilizadas

- Backend: [Especificar linguagem/framework]
- Banco de Dados: [Especificar banco de dados]
- Frontend: [Especificar tecnologias para dashboard]
- Protocolo: HTTP/JSON

## Requisitos Funcionais

- RF01: Permitir o comando de lançamento do foguete via API
- RF02: Receber e armazenar dados de aceleração do foguete
- RF03: Receber e armazenar dados de altitude
- RF04: Receber e armazenar dados de pressão da água
- RF05: Garantir que os dados possam ser posteriormente consultados para geração dos gráficos

## Requisitos Não Funcionais

- RNF01: A API deve aceitar requisições em JSON
- RNF02: A API deve ter suporte para HTTP
- RNF03: O sistema deve conseguir lidar com alta frequência de dados
- RNF04: Todos os dados recebidos devem ser persistidos com controle de tempo (timestamp obrigatório)
- RNF05: A API deve ser documentada
- RNF06: Cada lançamento deve gerar um ID de sessão para agrupar os dados
- RNF07: Os dashboards devem plotar:
  - Altitude vs Tempo
  - Velocidade vs Tempo (calculada a partir da aceleração)
  - Pressão da água vs Tempo
- RNF08: A API deve conseguir consumir os dados a partir de um cartão SD
- RNF09: Os dados devem ser persistidos e agrupados em variáveis de bancos de dados

## Endpoints da API

- `GET /lancar`: Libera o foguete para o lançamento
- `GET/POST /acelerometer`: Endpoint para dados de acelerômetro e giroscópio
- `GET/POST /altimeter`: Endpoint para dados do altímetro
- `GET/POST /water`: Endpoint para dados do sensor de pressão de água
- `GET /dashboard`: Endpoint para visualização dos gráficos com os dados armazenados

## Requisitos de Teste

### Requisitos de Teste Funcionais (RTF)
- RTF01: Testar comando de lançamento (GET /lancar)
- RTF02: Testar endpoint /acelerometer
- RTF03: Testar endpoint /altimeter
- RTF04: Testar endpoint /water
- RTF05: Testar consulta de dados para gráficos

### Requisitos de Teste Não Funcionais (RTNF)
- RTNF01: Testar aceitação de requisições JSON
- RTNF02: Testar respostas HTTP
- RTNF03: Testar estabilidade com alta frequência de dados
- RTNF04: Testar persistência de timestamp
- RTNF05: Testar geração e associação de ID de sessão
- RTNF06: Testar plotagem de gráficos no dashboard
- RTNF07: Testar recebimento de dados via cartão SD
- RTNF08: Testar persistência e agrupamento de dados

## Como Executar

[Adicione aqui as instruções de como executar o projeto]

## Contribuição

[Adicione aqui as instruções de como contribuir com o projeto]

## Licença

Este projeto está sob a licença [especifique a licença]. 