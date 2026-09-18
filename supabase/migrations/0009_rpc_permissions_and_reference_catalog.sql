-- Explicit RPC permissions and validated Giancar reference seeds.

revoke all on function public.get_workspace_bootstrap() from public, anon;
grant execute on function public.get_workspace_bootstrap() to authenticated;
revoke all on function public.get_dashboard_summary(uuid,timestamptz) from public, anon;
grant execute on function public.get_dashboard_summary(uuid,timestamptz) to authenticated;
revoke all on function public.get_catalog_page(uuid,text,text,integer) from public, anon;
grant execute on function public.get_catalog_page(uuid,text,text,integer) to authenticated;
revoke all on function public.get_customers_page(uuid,integer) from public, anon;
grant execute on function public.get_customers_page(uuid,integer) to authenticated;
revoke all on function public.get_vehicles_page(uuid,integer) from public, anon;
grant execute on function public.get_vehicles_page(uuid,integer) to authenticated;
revoke all on function public.get_inventory_page(uuid,integer) from public, anon;
grant execute on function public.get_inventory_page(uuid,integer) to authenticated;
revoke all on function public.get_quotes_page(uuid,integer) from public, anon;
grant execute on function public.get_quotes_page(uuid,integer) to authenticated;
revoke all on function public.get_orders_page(uuid,integer) from public, anon;
grant execute on function public.get_orders_page(uuid,integer) to authenticated;
revoke all on function public.get_reports_summary(uuid,integer) from public, anon;
grant execute on function public.get_reports_summary(uuid,integer) to authenticated;
revoke all on function public.get_conversations_page(uuid,uuid,integer) from public, anon;
grant execute on function public.get_conversations_page(uuid,uuid,integer) to authenticated;
revoke all on function public.get_quote_builder_data(uuid,integer) from public, anon;
grant execute on function public.get_quote_builder_data(uuid,integer) to authenticated;
revoke all on function public.search_reference_catalog(text,text,integer) from public, anon;
grant execute on function public.search_reference_catalog(text,text,integer) to authenticated;

insert into public.reference_catalog_items
(provider,external_code,name,category,manufacturer,original_code,application_text,applications,source_url,source_document,source_edition,active)
values
('giancar','14302','Pivô inferior LD/E (15mm)','Pivô','Giancar','60 510 360','Alfa Romeo 164 até 98','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','14303','Pivô superior LD/E (13mm)','Pivô','Giancar','823 498 170','Alfa Romeo 164 até 98','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','15020','Pivô inferior LD/E (19,6mm)','Pivô','Giancar','S08 399 356','Asia Motors Topic 93/99','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','15021','Pivô superior LD/E (17,7mm)','Pivô','Giancar','S08 399 354','Asia Motors Topic 93/99','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','20130 D - LD','Pivô inferior (14,8mm) LD','Pivô','Giancar',null,'Audi A1 10...; Q3 11...','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','20129 D - LE','Pivô inferior (14,8mm) LE','Pivô','Giancar',null,'Audi A1 10...; Q3 11...','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','20114 - LD','Pivô inferior (14,9mm) LD','Pivô','Giancar',null,'Audi A3 96/06','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','20115 - LE','Pivô inferior (14,9mm) LE','Pivô','Giancar',null,'Audi A3 96/06','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','46031','Bieleta central da barra estabilizadora suspensão dianteira','Bieleta','Giancar','5461 802 E000','Frontier 4x4 até 00','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','46032','Bieleta barra estabilizadora suspensão traseira','Bieleta','Giancar','5626 172 000','Frontier 4x2 03/07','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','NS 21012 A','Bieleta barra estabilizadora suspensão dianteira LD/E','Bieleta','Giancar','54618 9U 00 A','Grand Livina 06...; March 11...; Kicks 17...; Tiida 07/13; Versa 11/13','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','NS 21004 A','Bieleta barra estabilizadora suspensão dianteira LD/E','Bieleta','Giancar',null,'Pathfinder 91...','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','NS 21005 A','Bieleta barra estabilizadora suspensão traseira LD/E','Bieleta','Giancar',null,'Pathfinder 91...','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true),
('giancar','NS 21015 A','Bieleta barra estabilizadora suspensão dianteira LD/E','Bieleta','Giancar','54618 ET 00 A','Sentra 07... (B16/B17)','[]'::jsonb,'https://www.giancar.com.br/pdf/catalogo2020.pdf','Catálogo Linha Geral','2020',true)
on conflict(provider,external_code) do update set
  name=excluded.name,category=excluded.category,manufacturer=excluded.manufacturer,
  original_code=excluded.original_code,application_text=excluded.application_text,
  source_url=excluded.source_url,source_document=excluded.source_document,
  source_edition=excluded.source_edition,active=true;
