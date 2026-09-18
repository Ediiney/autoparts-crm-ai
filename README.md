# AutoParts CRM AI

Aplicação web para atendimento, CRM, busca de autopeças, cotação e automação por IA.

## Objetivo

O cliente pode escrever mensagens como:

> "Quanto está a bandeja do Civic?"

O sistema:

1. identifica a peça;
2. extrai os dados do veículo;
3. detecta quais dados ainda faltam;
4. pergunta apenas o necessário;
5. pesquisa somente o catálogo cadastrado;
6. cruza aplicação do veículo;
7. consulta preço e estoque reais;
8. responde ao cliente;
9. registra a decisão da IA no CRM.

A IA **não pode inventar SKU, preço, estoque ou compatibilidade**.

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase / PostgreSQL
- Supabase Auth + RLS
- OpenAI Responses API como extrator opcional de intenção
- Busca fuzzy com PostgreSQL `pg_trgm`

## Principais módulos

- Multiempresa
- Usuários e perfis de acesso
- Clientes
- Veículos dos clientes
- Catálogo
- Aplicações por veículo
- Preços
- Estoque
- Conversas
- Histórico da IA
- Orçamentos
- Importação de catálogo
- Auditoria
- Estrutura para canais como WhatsApp

## Catálogo Giancar

Fontes configuradas para integração:

- https://www.giancar.com.br/catalogo
- https://www.giancar.com.br/pdf/catalogo2020.pdf
- https://www.giancar.com.br/pdf/oportunidades.pdf
- https://www.giancar.com.br/pdf/Cat%C3%A1logo2022completo.pdf

Os catálogos são tratados como fonte de identificação/aplicação. Preço e estoque são mantidos em tabelas separadas.

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Banco

Migration principal:

`supabase/migrations/0001_initial_schema.sql`

Ela cria RLS, isolamento multiempresa, busca fuzzy e as entidades do CRM.

## Endpoints implementados

- `GET /api/health`
- `POST /api/onboarding/company`
- `POST /api/chat`
- `POST /api/catalog/search`
- `POST /api/catalog/import`
- `POST /api/quotes`

Veja `docs/API.md`.

## Segurança

- nenhuma tabela de CRM é liberada para `anon`;
- RLS em todas as tabelas públicas;
- isolamento por `company_id`;
- catálogo só pode ser alterado por owner/admin/manager;
- chaves secretas nunca devem ser expostas no browser;
- webhook está modelado como server-only.

## Status

### Backend/core
Em desenvolvimento avançado.

### Interface
A próxima etapa do projeto será o redesenho visual completo do CRM.
