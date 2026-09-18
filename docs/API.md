# API

Todos os endpoints de negócio, exceto health, exigem sessão autenticada.

## GET /api/health

Retorna o estado básico da aplicação.

## POST /api/onboarding/company

Cria empresa, membership owner, configurações, estoque principal e fonte Giancar.

```json
{
  "name": "Auto Peças Exemplo"
}
```

## POST /api/chat

Workflow principal.

```json
{
  "companyId": "uuid",
  "customerId": "uuid opcional",
  "conversationId": "uuid opcional",
  "message": "quanto está a bandeja do civic 2008?"
}
```

Possíveis status:

- `needs_clarification`
- `not_found`
- `multiple_matches`
- `matched`

## POST /api/catalog/search

Busca técnica no catálogo.

```json
{
  "companyId": "uuid",
  "query": "bandeja de suspensão",
  "vehicle": {
    "brand": "Honda",
    "model": "Civic",
    "year": 2008,
    "side": "left"
  }
}
```

## POST /api/catalog/import

Importa até 500 itens normalizados por chamada.

```json
{
  "companyId": "uuid",
  "sourceId": "uuid opcional",
  "fileName": "catalogo.json",
  "items": [
    {
      "sku": "12345",
      "name": "Bandeja de suspensão",
      "category": "Bandeja",
      "originalCode": "ABC",
      "price": 199.9,
      "stock": 4,
      "applications": [
        {
          "brand": "Honda",
          "model": "Civic",
          "yearStart": 2007,
          "yearEnd": 2011,
          "side": "left",
          "axle": "front"
        }
      ]
    }
  ]
}
```

## POST /api/quotes

Cria orçamento com snapshot do preço informado.

```json
{
  "companyId": "uuid",
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 1,
      "unitPrice": 199.9
    }
  ]
}
```
