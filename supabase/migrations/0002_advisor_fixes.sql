-- Advisor fixes: RLS policy overlap + foreign key indexes

drop policy if exists catalog_import_rows_write on public.catalog_import_rows;
create policy catalog_import_rows_insert on public.catalog_import_rows
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_import_rows_update on public.catalog_import_rows
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_import_rows_delete on public.catalog_import_rows
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists catalog_imports_write on public.catalog_imports;
create policy catalog_imports_insert on public.catalog_imports
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_imports_update on public.catalog_imports
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_imports_delete on public.catalog_imports
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists catalog_sources_write on public.catalog_sources;
create policy catalog_sources_insert on public.catalog_sources
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_sources_update on public.catalog_sources
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy catalog_sources_delete on public.catalog_sources
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists company_settings_write on public.company_settings;
create policy company_settings_insert on public.company_settings
for insert to authenticated
with check (private.is_company_admin(company_id));

create policy company_settings_update on public.company_settings
for update to authenticated
using (private.is_company_admin(company_id))
with check (private.is_company_admin(company_id));

create policy company_settings_delete on public.company_settings
for delete to authenticated
using (private.is_company_admin(company_id));

drop policy if exists product_aliases_write on public.product_aliases;
create policy product_aliases_insert on public.product_aliases
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_aliases_update on public.product_aliases
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_aliases_delete on public.product_aliases
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists product_categories_write on public.product_categories;
create policy product_categories_insert on public.product_categories
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_categories_update on public.product_categories
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_categories_delete on public.product_categories
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists product_inventory_write on public.product_inventory;
create policy product_inventory_insert on public.product_inventory
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_inventory_update on public.product_inventory
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_inventory_delete on public.product_inventory
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists product_prices_write on public.product_prices;
create policy product_prices_insert on public.product_prices
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_prices_update on public.product_prices
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy product_prices_delete on public.product_prices
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists products_write on public.products;
create policy products_insert on public.products
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy products_update on public.products
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy products_delete on public.products
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists vehicle_applications_write on public.vehicle_applications;
create policy vehicle_applications_insert on public.vehicle_applications
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy vehicle_applications_update on public.vehicle_applications
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy vehicle_applications_delete on public.vehicle_applications
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

drop policy if exists warehouses_write on public.warehouses;
create policy warehouses_insert on public.warehouses
for insert to authenticated
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy warehouses_update on public.warehouses
for update to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']))
with check (private.has_company_role(company_id, array['owner','admin','manager']));

create policy warehouses_delete on public.warehouses
for delete to authenticated
using (private.has_company_role(company_id, array['owner','admin','manager']));

do $$
declare
  r record;
  idx_name text;
begin
  for r in
    select
      n.nspname as schema_name,
      t.relname as table_name,
      c.conname,
      string_agg(quote_ident(a.attname), ', ' order by u.ordinality) as columns_sql
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    join unnest(c.conkey) with ordinality u(attnum, ordinality) on true
    join pg_attribute a on a.attrelid = t.oid and a.attnum = u.attnum
    where c.contype = 'f'
      and n.nspname = 'public'
      and c.conname = any(array['ai_interactions_conversation_id_fkey','ai_interactions_message_id_fkey','audit_logs_user_id_fkey','catalog_import_rows_company_id_fkey','catalog_import_rows_import_id_fkey','catalog_imports_created_by_fkey','catalog_imports_source_id_fkey','catalog_sources_company_id_fkey','companies_owner_user_id_fkey','conversation_messages_conversation_id_fkey','conversation_messages_sender_user_id_fkey','conversations_assigned_to_fkey','conversations_customer_id_fkey','customer_vehicles_customer_id_fkey','customers_created_by_fkey','product_aliases_category_id_fkey','product_aliases_product_id_fkey','product_categories_parent_id_fkey','product_inventory_warehouse_id_fkey','product_prices_product_id_fkey','products_category_id_fkey','quote_items_product_id_fkey','quote_items_quote_id_fkey','quotes_conversation_id_fkey','quotes_created_by_fkey','quotes_customer_id_fkey','vehicle_applications_product_id_fkey','webhook_events_company_id_fkey']::text[])
    group by n.nspname, t.relname, c.conname
  loop
    idx_name := left('idx_fk_' || r.conname, 63);
    execute format(
      'create index if not exists %I on %I.%I (%s)',
      idx_name,
      r.schema_name,
      r.table_name,
      r.columns_sql
    );
  end loop;
end $$;
