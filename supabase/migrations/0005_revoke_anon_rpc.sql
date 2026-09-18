-- Remove explicit anonymous RPC execution grants left by earlier schema revisions.

revoke execute on function public.search_products(uuid, text, integer) from anon;
revoke execute on function public.get_available_stock(uuid, uuid, uuid) from anon;
revoke execute on function public.next_company_quote_number(uuid) from anon;
