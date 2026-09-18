-- AutoParts CRM AI - schema inicial
-- PostgreSQL / Supabase
-- Segurança: todas as tabelas públicas têm RLS e grants explícitos.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- =========================================================
-- Helpers
-- =========================================================

create or replace function private.normalize_text(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(
    regexp_replace(
      translate(
        lower(coalesce(value, '')),
        'áàâãäéèêëíìîïóòôõöúùûüçñ',
        'aaaaaeeeeiiiiooooouuuucn'
      ),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Identidade / tenancy
-- =========================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  name text not null,
  slug text not null unique,
  legal_name text,
  document text,
  phone text,
  email text,
  timezone text not null default 'America/Sao_Paulo',
  currency text not null default 'BRL',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agent'
    check (role in ('owner','admin','manager','agent','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, user_id)
);

create index company_members_user_idx on public.company_members(user_id, company_id);
create index company_members_company_idx on public.company_members(company_id, role);

create or replace function private.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = (select auth.uid())
      and cm.active = true
  )
  or exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and c.owner_user_id = (select auth.uid())
      and c.active = true
  );
$$;

create or replace function private.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and c.owner_user_id = (select auth.uid())
      and c.active = true
  )
  or exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = (select auth.uid())
      and cm.role in ('owner','admin')
      and cm.active = true
  );
$$;

create or replace function private.has_company_role(p_company_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and c.owner_user_id = (select auth.uid())
      and 'owner' = any(p_roles)
      and c.active = true
  )
  or exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = (select auth.uid())
      and cm.role = any(p_roles)
      and cm.active = true
  );
$$;

revoke all on function private.is_company_member(uuid) from public;
revoke all on function private.is_company_admin(uuid) from public;
revoke all on function private.has_company_role(uuid, text[]) from public;
grant execute on function private.is_company_member(uuid) to authenticated;
grant execute on function private.is_company_admin(uuid) to authenticated;
grant execute on function private.has_company_role(uuid, text[]) to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- =========================================================
-- Clientes e veículos
-- =========================================================

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  phone text,
  whatsapp text,
  email text,
  document text,
  notes text,
  tags text[] not null default '{}',
  active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_vehicles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  brand text,
  model text,
  year integer check (year is null or year between 1900 and 2200),
  model_year integer check (model_year is null or model_year between 1900 and 2200),
  engine text,
  version text,
  transmission text,
  fuel text,
  plate text,
  chassis text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_company_idx on public.customers(company_id, active);
create index customers_phone_idx on public.customers(company_id, phone);
create index customer_vehicles_customer_idx on public.customer_vehicles(company_id, customer_id);
create index customer_vehicles_plate_idx on public.customer_vehicles(company_id, plate);

-- =========================================================
-- Catálogo
-- =========================================================

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  normalized_name text not null,
  parent_id uuid references public.product_categories(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id, normalized_name)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  sku text not null,
  name text not null,
  normalized_name text not null default '',
  category_id uuid references public.product_categories(id) on delete set null,
  manufacturer text,
  brand text,
  original_code text,
  barcode text,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  source text,
  source_external_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, sku)
);

create table public.product_aliases (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  category_id uuid references public.product_categories(id) on delete cascade,
  alias text not null,
  normalized_alias text not null default '',
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  check (product_id is not null or category_id is not null)
);

create table public.vehicle_applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  vehicle_brand text not null,
  vehicle_model text not null,
  normalized_brand text not null default '',
  normalized_model text not null default '',
  year_start integer,
  year_end integer,
  engine text,
  version text,
  transmission text,
  fuel text,
  side text check (side is null or side in ('left','right','both','center')),
  axle text check (axle is null or axle in ('front','rear','both')),
  position text,
  notes text,
  source text,
  source_external_id text,
  created_at timestamptz not null default now(),
  check (year_start is null or year_start between 1900 and 2200),
  check (year_end is null or year_end between 1900 and 2200),
  check (year_start is null or year_end is null or year_start <= year_end)
);

create table public.product_prices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  price_type text not null default 'retail',
  price numeric(12,2) not null check (price >= 0),
  cost numeric(12,2) check (cost is null or cost >= 0),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  check (valid_to is null or valid_to >= valid_from)
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id, code)
);

create table public.product_inventory (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity numeric(14,3) not null default 0,
  reserved numeric(14,3) not null default 0,
  updated_at timestamptz not null default now(),
  unique(product_id, warehouse_id),
  check (quantity >= 0),
  check (reserved >= 0)
);

create table public.catalog_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  provider text not null,
  source_url text,
  source_type text not null default 'catalog',
  active boolean not null default true,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catalog_imports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_id uuid references public.catalog_sources(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','processing','completed','partial','failed')),
  file_name text,
  checksum text,
  total_rows integer not null default 0,
  processed_rows integer not null default 0,
  inserted_rows integer not null default 0,
  updated_rows integer not null default 0,
  error_rows integer not null default 0,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.catalog_import_rows (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  import_id uuid not null references public.catalog_imports(id) on delete cascade,
  row_number integer,
  status text not null default 'pending'
    check (status in ('pending','processed','ignored','error')),
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create index products_company_idx on public.products(company_id, active);
create index products_normalized_name_trgm_idx on public.products using gin(normalized_name gin_trgm_ops);
create index products_sku_idx on public.products(company_id, sku);
create index product_aliases_company_idx on public.product_aliases(company_id, product_id);
create index product_aliases_trgm_idx on public.product_aliases using gin(normalized_alias gin_trgm_ops);
create index applications_product_idx on public.vehicle_applications(company_id, product_id);
create index applications_vehicle_idx on public.vehicle_applications(company_id, normalized_brand, normalized_model, year_start, year_end);
create index product_prices_lookup_idx on public.product_prices(company_id, product_id, price_type, valid_from desc);
create index inventory_product_idx on public.product_inventory(company_id, product_id);
create index imports_company_idx on public.catalog_imports(company_id, created_at desc);

create or replace function private.normalize_product_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.normalized_name = private.normalize_text(new.name);
  return new;
end;
$$;

create trigger normalize_product_fields
before insert or update of name on public.products
for each row execute function private.normalize_product_fields();

create or replace function private.normalize_alias_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.normalized_alias = private.normalize_text(new.alias);
  return new;
end;
$$;

create trigger normalize_alias_fields
before insert or update of alias on public.product_aliases
for each row execute function private.normalize_alias_fields();

create or replace function private.normalize_application_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.normalized_brand = private.normalize_text(new.vehicle_brand);
  new.normalized_model = private.normalize_text(new.vehicle_model);
  return new;
end;
$$;

create trigger normalize_application_fields
before insert or update of vehicle_brand, vehicle_model on public.vehicle_applications
for each row execute function private.normalize_application_fields();

create or replace function public.search_products(
  p_company_id uuid,
  p_query text,
  p_limit integer default 20
)
returns table (
  product_id uuid,
  sku text,
  name text,
  score real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with normalized as (
    select private.normalize_text(p_query) as q
  )
  select
    p.id,
    p.sku,
    p.name,
    greatest(
      similarity(p.normalized_name, n.q),
      coalesce((
        select max(similarity(pa.normalized_alias, n.q))
        from public.product_aliases pa
        where pa.product_id = p.id
          and pa.company_id = p_company_id
      ), 0)
    )::real as score
  from public.products p
  cross join normalized n
  where p.company_id = p_company_id
    and p.active = true
    and (
      p.normalized_name % n.q
      or p.normalized_name like '%' || n.q || '%'
      or exists (
        select 1
        from public.product_aliases pa
        where pa.product_id = p.id
          and pa.company_id = p_company_id
          and (
            pa.normalized_alias % n.q
            or pa.normalized_alias like '%' || n.q || '%'
          )
      )
    )
  order by score desc, p.name
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

revoke all on function public.search_products(uuid, text, integer) from public;
grant execute on function public.search_products(uuid, text, integer) to authenticated;

-- =========================================================
-- CRM / conversas / IA
-- =========================================================

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  channel text not null default 'web'
    check (channel in ('web','whatsapp','instagram','manual','api')),
  external_conversation_id text,
  status text not null default 'open'
    check (status in ('open','waiting_customer','waiting_agent','resolved','cancelled')),
  assigned_to uuid references auth.users(id),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_type text not null
    check (sender_type in ('customer','ai','agent','system')),
  sender_user_id uuid references auth.users(id),
  content text not null,
  external_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.conversation_messages(id) on delete set null,
  raw_message text not null,
  part_name text,
  normalized_part_name text,
  vehicle jsonb not null default '{}'::jsonb,
  confidence numeric(5,4) not null default 0,
  missing_fields text[] not null default '{}',
  candidate_product_ids uuid[] not null default '{}',
  decision text not null
    check (decision in ('clarify','not_found','multiple_matches','matched','error')),
  model text,
  latency_ms integer,
  prompt_version text,
  raw_model_output jsonb,
  created_at timestamptz not null default now()
);

create index conversations_company_idx on public.conversations(company_id, status, last_message_at desc);
create index conversation_messages_conversation_idx on public.conversation_messages(company_id, conversation_id, created_at);
create index ai_interactions_conversation_idx on public.ai_interactions(company_id, conversation_id, created_at desc);

-- =========================================================
-- Orçamentos
-- =========================================================

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  number bigint generated always as identity,
  status text not null default 'draft'
    check (status in ('draft','sent','accepted','rejected','expired','cancelled')),
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (subtotal >= 0 and discount >= 0 and total >= 0)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid not null references public.products(id),
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create index quotes_company_idx on public.quotes(company_id, created_at desc);
create index quote_items_quote_idx on public.quote_items(company_id, quote_id);

-- =========================================================
-- Configuração e auditoria
-- =========================================================

create table public.company_settings (
  company_id uuid primary key references public.companies(id) on delete cascade,
  ai_enabled boolean not null default true,
  ai_auto_reply boolean not null default false,
  minimum_match_confidence numeric(5,4) not null default 0.85,
  currency text not null default 'BRL',
  default_price_type text not null default 'retail',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (minimum_match_confidence between 0 and 1)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  provider text not null,
  external_id text,
  event_type text,
  payload jsonb not null,
  status text not null default 'received'
    check (status in ('received','processed','ignored','failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider, external_id)
);

create index audit_logs_company_idx on public.audit_logs(company_id, created_at desc);
create index webhook_events_status_idx on public.webhook_events(provider, status, received_at);

-- =========================================================
-- updated_at triggers
-- =========================================================

create trigger profiles_updated_at before update on public.profiles
for each row execute function private.set_updated_at();

create trigger companies_updated_at before update on public.companies
for each row execute function private.set_updated_at();

create trigger company_members_updated_at before update on public.company_members
for each row execute function private.set_updated_at();

create trigger customers_updated_at before update on public.customers
for each row execute function private.set_updated_at();

create trigger customer_vehicles_updated_at before update on public.customer_vehicles
for each row execute function private.set_updated_at();

create trigger products_updated_at before update on public.products
for each row execute function private.set_updated_at();

create trigger product_inventory_updated_at before update on public.product_inventory
for each row execute function private.set_updated_at();

create trigger catalog_sources_updated_at before update on public.catalog_sources
for each row execute function private.set_updated_at();

create trigger conversations_updated_at before update on public.conversations
for each row execute function private.set_updated_at();

create trigger quotes_updated_at before update on public.quotes
for each row execute function private.set_updated_at();

create trigger company_settings_updated_at before update on public.company_settings
for each row execute function private.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.customers enable row level security;
alter table public.customer_vehicles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_aliases enable row level security;
alter table public.vehicle_applications enable row level security;
alter table public.product_prices enable row level security;
alter table public.warehouses enable row level security;
alter table public.product_inventory enable row level security;
alter table public.catalog_sources enable row level security;
alter table public.catalog_imports enable row level security;
alter table public.catalog_import_rows enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.company_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_events enable row level security;

create policy profiles_select_own on public.profiles
for select to authenticated
using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy companies_select_member on public.companies
for select to authenticated
using (private.is_company_member(id));

create policy companies_insert_owner on public.companies
for insert to authenticated
with check (owner_user_id = (select auth.uid()));

create policy companies_update_admin on public.companies
for update to authenticated
using (private.is_company_admin(id))
with check (private.is_company_admin(id));

create policy companies_delete_owner on public.companies
for delete to authenticated
using (owner_user_id = (select auth.uid()));

create policy company_members_select on public.company_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or private.is_company_admin(company_id)
);

create policy company_members_insert_admin on public.company_members
for insert to authenticated
with check (private.is_company_admin(company_id));

create policy company_members_update_admin on public.company_members
for update to authenticated
using (private.is_company_admin(company_id))
with check (private.is_company_admin(company_id));

create policy company_members_delete_admin on public.company_members
for delete to authenticated
using (private.is_company_admin(company_id));

-- padrão multi-tenant para tabelas com company_id
create policy customers_company_access on public.customers
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy customer_vehicles_company_access on public.customer_vehicles
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy product_categories_select on public.product_categories
for select to authenticated
using (private.is_company_member(company_id));
create policy product_categories_write on public.product_categories
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy products_select on public.products
for select to authenticated
using (private.is_company_member(company_id));
create policy products_write on public.products
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_aliases_select on public.product_aliases
for select to authenticated
using (private.is_company_member(company_id));
create policy product_aliases_write on public.product_aliases
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy vehicle_applications_select on public.vehicle_applications
for select to authenticated
using (private.is_company_member(company_id));
create policy vehicle_applications_write on public.vehicle_applications
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_prices_select on public.product_prices
for select to authenticated
using (private.is_company_member(company_id));
create policy product_prices_write on public.product_prices
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy warehouses_select on public.warehouses
for select to authenticated
using (private.is_company_member(company_id));
create policy warehouses_write on public.warehouses
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_inventory_select on public.product_inventory
for select to authenticated
using (private.is_company_member(company_id));
create policy product_inventory_write on public.product_inventory
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_sources_select on public.catalog_sources
for select to authenticated
using (private.is_company_member(company_id));
create policy catalog_sources_write on public.catalog_sources
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_imports_select on public.catalog_imports
for select to authenticated
using (private.is_company_member(company_id));
create policy catalog_imports_write on public.catalog_imports
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_import_rows_select on public.catalog_import_rows
for select to authenticated
using (private.is_company_member(company_id));
create policy catalog_import_rows_write on public.catalog_import_rows
for all to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy conversations_company_access on public.conversations
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy conversation_messages_company_access on public.conversation_messages
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy ai_interactions_company_access on public.ai_interactions
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy quotes_company_access on public.quotes
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy quote_items_company_access on public.quote_items
for all to authenticated
using (private.is_company_member(company_id))
with check (private.is_company_member(company_id));

create policy company_settings_select on public.company_settings
for select to authenticated
using (private.is_company_member(company_id));

create policy company_settings_write on public.company_settings
for all to authenticated
using (private.is_company_admin(company_id))
with check (private.is_company_admin(company_id));

create policy audit_logs_company_select on public.audit_logs
for select to authenticated
using (company_id is not null and private.is_company_member(company_id));

create policy audit_logs_company_insert on public.audit_logs
for insert to authenticated
with check (company_id is not null and private.is_company_member(company_id));

-- webhook_events é intencionalmente server-only; sem policy para authenticated.

-- =========================================================
-- Grants explícitos para Data API (padrão Supabase 2026)
-- =========================================================

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.company_members to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.customer_vehicles to authenticated;
grant select, insert, update, delete on public.product_categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.product_aliases to authenticated;
grant select, insert, update, delete on public.vehicle_applications to authenticated;
grant select, insert, update, delete on public.product_prices to authenticated;
grant select, insert, update, delete on public.warehouses to authenticated;
grant select, insert, update, delete on public.product_inventory to authenticated;
grant select, insert, update, delete on public.catalog_sources to authenticated;
grant select, insert, update, delete on public.catalog_imports to authenticated;
grant select, insert, update, delete on public.catalog_import_rows to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.conversation_messages to authenticated;
grant select, insert, update, delete on public.ai_interactions to authenticated;
grant select, insert, update, delete on public.quotes to authenticated;
grant select, insert, update, delete on public.quote_items to authenticated;
grant select, insert, update, delete on public.company_settings to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant usage, select on sequence public.quotes_number_seq to authenticated;
grant usage, select on sequence public.audit_logs_id_seq to authenticated;

revoke all on public.webhook_events from anon, authenticated;

-- Não concedemos acesso a anon para dados do CRM.
