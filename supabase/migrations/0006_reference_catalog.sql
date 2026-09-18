-- Global reference catalog used to prefill company products.
-- Initial source: Giancar public general catalog.

create table if not exists public.reference_catalog_items (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_code text not null,
  name text not null,
  normalized_name text not null default '',
  category text,
  manufacturer text,
  original_code text,
  application_text text,
  applications jsonb not null default '[]'::jsonb,
  source_url text not null,
  source_document text,
  source_edition text,
  active boolean not null default true,
  synced_at timestamptz not null default now(),
  unique(provider, external_code)
);

create index if not exists reference_catalog_provider_code_idx on public.reference_catalog_items(provider, external_code);
create index if not exists reference_catalog_original_code_idx on public.reference_catalog_items(provider, original_code);
create index if not exists reference_catalog_name_trgm_idx on public.reference_catalog_items using gin(normalized_name extensions.gin_trgm_ops);

create or replace function private.normalize_reference_catalog_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.normalized_name = private.normalize_text(concat_ws(' ', new.external_code, new.name, new.original_code, new.application_text));
  new.synced_at = now();
  return new;
end;
$$;

drop trigger if exists normalize_reference_catalog_fields on public.reference_catalog_items;
create trigger normalize_reference_catalog_fields
before insert or update of external_code, name, original_code, application_text
on public.reference_catalog_items
for each row execute function private.normalize_reference_catalog_fields();

alter table public.reference_catalog_items enable row level security;
drop policy if exists reference_catalog_items_select_authenticated on public.reference_catalog_items;
create policy reference_catalog_items_select_authenticated on public.reference_catalog_items
for select to authenticated using (active = true);

grant select on public.reference_catalog_items to authenticated;
revoke all on public.reference_catalog_items from anon;

create or replace function public.search_reference_catalog(p_query text,p_provider text default 'giancar',p_limit integer default 12)
returns table(id uuid,provider text,external_code text,name text,category text,manufacturer text,original_code text,application_text text,applications jsonb,source_url text,score real)
language sql stable security invoker set search_path = '' as $$
  with q as (select private.normalize_text(p_query) as value)
  select r.id,r.provider,r.external_code,r.name,r.category,r.manufacturer,r.original_code,r.application_text,r.applications,r.source_url,
    greatest(
      extensions.similarity(r.normalized_name,q.value),
      case when lower(r.external_code)=lower(trim(p_query)) then 1 else 0 end,
      case when lower(coalesce(r.original_code,''))=lower(trim(p_query)) then 0.98 else 0 end
    )::real
  from public.reference_catalog_items r cross join q
  where r.active=true
    and r.provider=coalesce(nullif(trim(p_provider),''),'giancar')
    and (
      r.normalized_name like '%'||q.value||'%'
      or extensions.similarity(r.normalized_name,q.value)>=0.16
      or lower(r.external_code) like '%'||lower(trim(p_query))||'%'
      or lower(coalesce(r.original_code,'')) like '%'||lower(trim(p_query))||'%'
    )
  order by score desc,r.name
  limit least(greatest(coalesce(p_limit,12),1),30);
$$;

revoke all on function public.search_reference_catalog(text,text,integer) from public,anon;
grant execute on function public.search_reference_catalog(text,text,integer) to authenticated;

-- Seed values are maintained from the public Giancar general catalog.
-- Production data also records source_url/source_document/source_edition for traceability.
