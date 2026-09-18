# AutoParts CRM AI

CRM web inteligente para atendimento e cotação de autopeças.

## Objetivo

Permitir que um cliente informe, em linguagem natural, qual peça automotiva procura e receba uma cotação correta. Quando faltarem dados para identificar a aplicação correta, o sistema deve perguntar apenas o necessário, como veículo, modelo, ano, motor, lado ou posição da peça.

## Escopo inicial

- CRM de clientes
- Cadastro de veículos
- Catálogo de autopeças
- Aplicações por veículo
- Preços e disponibilidade
- Conversas e histórico de atendimento
- Busca inteligente por peça
- Motor de desambiguação com IA
- Orçamentos
- Base preparada para WhatsApp
- Estrutura SaaS multiempresa

## Stack planejada

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- IA para interpretação das mensagens e coleta de dados faltantes

## Regra central da IA

A IA nunca deve inventar compatibilidade, código ou preço.

Fluxo esperado:

1. Interpretar a mensagem do cliente.
2. Identificar a peça provável.
3. Identificar os dados do veículo já informados.
4. Verificar se há informações suficientes para buscar uma aplicação exata.
5. Se faltar informação, perguntar somente o dado necessário.
6. Consultar catálogo e aplicação.
7. Consultar o preço cadastrado.
8. Responder ao cliente.
9. Registrar toda a interação no CRM.

Exemplo:

> Cliente: Quanto está a bandeja do Civic?

Resposta esperada:

> Para encontrar a bandeja correta, qual é o ano do seu Civic? Se souber, informe também se procura o lado esquerdo ou direito.

## Fontes de catálogo

A arquitetura será preparada para importação e normalização de catálogos automotivos, incluindo dados do catálogo Giancar.

## Status

Projeto em desenvolvimento.
