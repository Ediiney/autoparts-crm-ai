# Deploy na Vercel

## Deploy oficial em um clique

Use:

https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEdiiney%2Fautoparts-crm-ai&project-name=autoparts-crm-ai&repository-name=autoparts-crm-ai

O fluxo cria um projeto Vercel usando o repositório:

`Ediiney/autoparts-crm-ai`

Nome sugerido:

`autoparts-crm-ai`

## Primeira prévia

A interface visual pode ser publicada sem variáveis do Supabase. O proxy entra em modo de prévia e não bloqueia o carregamento das telas.

## Produção conectada ao Supabase

Depois, configure na Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uuhvzgjwvqmjvukpwwbh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
OPENAI_API_KEY=<server only>
OPENAI_MODEL=<modelo escolhido>
NEXT_PUBLIC_APP_URL=<URL de produção da Vercel>
```

Não versionar chaves secretas.
