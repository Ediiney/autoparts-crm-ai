-- Runtime hardening and redundant index cleanup.
-- Mirrors production migration: runtime_hardening_and_index_cleanup.

drop index if exists public.products_sku_idx;

revoke all on function public.search_products(uuid, text, integer) from public;
grant execute on function public.search_products(uuid, text, integer) to authenticated;

revoke all on function public.get_available_stock(uuid, uuid, uuid) from public;
grant execute on function public.get_available_stock(uuid, uuid, uuid) to authenticated;

revoke all on function public.next_company_quote_number(uuid) from public;
grant execute on function public.next_company_quote_number(uuid) to authenticated;
