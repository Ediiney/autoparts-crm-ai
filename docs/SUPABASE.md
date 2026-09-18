# Supabase

## Projeto

- Nome: AutoParts CRM AI
- Project ref: `uuhvzgjwvqmjvukpwwbh`
- Região: `sa-east-1`
- URL pública: `https://uuhvzgjwvqmjvukpwwbh.supabase.co`
- Custo de criação/projeto informado pelo Supabase: `0 / mês`

## Ambiente

Configure localmente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uuhvzgjwvqmjvukpwwbh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<obter no Supabase>
SUPABASE_SECRET_KEY=<somente servidor, quando necessário>
```

Nunca versionar chaves secretas.

## Migrations aplicadas

1. `initial_secure_crm_schema`
2. `advisor_fixes`
3. `webhook_deny_policy`

## Segurança

- RLS habilitado em todas as tabelas públicas.
- Dados isolados por `company_id`.
- Catálogo editável apenas por owner/admin/manager.
- Webhooks bloqueados para clientes autenticados e tratados como server-only.
- Nenhum dado do CRM é exposto para `anon`.

## Tipos

Os tipos gerados pelo Supabase ficam em:

`src/types/database.ts`
