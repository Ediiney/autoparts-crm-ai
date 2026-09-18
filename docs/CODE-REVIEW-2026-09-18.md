# AutoParts CRM — Code Review de estabilização

Data: 2026-09-18

## Escopo

Revisão técnica do frontend Next.js, navegação do CRM, autenticação Supabase, RLS/RPCs, consultas de catálogo/importação, GitHub Actions e deploy Vercel.

## Correções aplicadas

### Navegação e renderização

- Contexto de usuário, empresa e workspace deduplicado por renderização com `React.cache`.
- Autenticação server-side migrada de `auth.getUser()` para `auth.getClaims()` nos helpers centrais.
- Layout do CRM reutiliza o principal autenticado em vez de repetir chamadas.
- Adicionada loading boundary em `(crm)/loading.tsx` para navegação parcial do App Router.
- Troca de filial usa `router.refresh()` em transição; foi removido `window.location.reload()`.
- Adicionada error boundary em `(crm)/error.tsx`.

### Catálogo e importação

- Busca de catálogo reduzida de quatro leituras paralelas para três.
- Estoque passa a ser filtrado pela filial diretamente na consulta.
- Preços consultam somente filial atual + preço geral quando aplicável.
- Aplicações veiculares são agrupadas por produto em memória, evitando filtro repetitivo O(produtos × aplicações).
- Importação de catálogo foi convertida de persistência linha-a-linha para pré-carregamento e operações em lote.
- Categorias e produtos existentes são carregados em lote.
- Logs de linhas, aplicações, preços e estoque são persistidos em lotes.

### Supabase

- Corrigido bootstrap RLS do primeiro proprietário da empresa.
- Removido índice redundante `products_sku_idx`; a constraint única `products_company_id_sku_key` já cobre `(company_id, sku)`.
- Execução anônima removida das RPCs:
  - `search_products`
  - `get_available_stock`
  - `next_company_quote_number`
- Acesso autenticado às RPCs foi preservado.
- Advisors não apontam RLS ausente. O aviso de segurança restante é Leaked Password Protection desabilitado.
- Avisos de índices não utilizados foram mantidos para observação; base com pouco tráfego não fornece evidência suficiente para remoção segura.

### CI / Vercel

- GitHub Actions atualizado para `actions/checkout@v7` e `actions/setup-node@v7`.
- CI e Vercel fixados em Node 24.
- Pipeline valida `npm ci`, ESLint, TypeScript e build Next.js.
- Deploys antigos com falha continuam no histórico, mas não representam necessariamente o estado atual da branch `main`.

### Interface pública

- Home refeita com CSS Module e hero full-bleed, reduzindo espaço vazio.
- Login e Cadastro usam um shell compartilhado.
- Estilos públicos foram isolados do CSS global do CRM para reduzir colisões entre V1/V2.

## Pontos ainda abertos

### Dependências

Há atualizações disponíveis para Next.js, React, OpenAI SDK, Lucide e ESLint. Atualizações major/minor devem ser feitas em um PR/commit isolado com lockfile atualizado e testes de regressão; não foram misturadas ao pacote de estabilização.

### Migrações

O histórico inicial do projeto possui alterações de schema V2 que foram aplicadas diretamente durante a evolução do produto. Antes de criar ambientes staging/preview independentes, é recomendado reconciliar o schema de produção com uma baseline/migração reproduzível.

### Imagens

Duas páginas do catálogo ainda usam `<img>` e geram warnings do Next.js. Migrar para `next/image` exige definir a política de hosts/CDN das imagens do catálogo.

### Auth

O advisor do Supabase ainda recomenda habilitar proteção contra senhas comprometidas no Auth.

## Regra para próximos ciclos

Nenhuma feature deve ser considerada pronta sem:

1. lint;
2. typecheck;
3. build;
4. deploy READY;
5. verificação de runtime;
6. advisor de segurança quando houver alteração de banco/RLS.
