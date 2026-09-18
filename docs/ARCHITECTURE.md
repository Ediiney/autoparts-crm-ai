# Arquitetura

## Camadas

```text
Cliente / Operador
       |
       v
Next.js Web / API Routes
       |
       +--> Auth / sessão Supabase
       |
       +--> Motor de intenção
       |      |
       |      +--> OpenAI (quando configurado)
       |      +--> fallback determinístico
       |
       +--> Motor de catálogo
       |      |
       |      +--> busca fuzzy
       |      +--> aplicação veicular
       |      +--> preço
       |      +--> estoque
       |
       +--> Workflow CRM
              |
              +--> conversa
              +--> mensagens
              +--> auditoria da IA
              +--> orçamento
       |
       v
Supabase / PostgreSQL
```

## Multiempresa

Toda entidade comercial usa `company_id`.

A autorização não depende de `user_metadata`. Membership e role ficam no banco:

- owner
- admin
- manager
- agent
- viewer

## Segurança

Funções de autorização ficam no schema privado `private`.

- `private.is_company_member`
- `private.is_company_admin`
- `private.has_company_role`

As funções são `security definer`, não ficam no schema exposto e têm EXECUTE revogado de PUBLIC.

## Catálogo

```text
catalog_sources
      |
catalog_imports
      |
catalog_import_rows

products
  |
  +--> product_aliases
  +--> vehicle_applications
  +--> product_prices
  +--> product_inventory
```

## IA

A IA não é fonte de verdade.

Ela somente transforma linguagem humana em uma estrutura:

```json
{
  "partName": "bandeja de suspensão",
  "vehicle": {
    "brand": "Honda",
    "model": "Civic",
    "year": 2008,
    "side": "left"
  },
  "confidence": 0.96,
  "missingFields": []
}
```

SKU, preço, estoque e aplicação sempre vêm do banco.

## Decisão

```text
mensagem
  |
extração
  |
faltam dados? ------ sim ---> perguntar
  |
 não
  v
busca catálogo
  |
nenhum confiável ---> atendimento humano
  |
múltiplos próximos -> perguntar detalhe discriminante
  |
match
  v
responder com dados reais
```
