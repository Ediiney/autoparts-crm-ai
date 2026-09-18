-- Collapse membership/company/branch bootstrap into one authenticated RPC.

create or replace function public.get_workspace_bootstrap()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'company',jsonb_build_object(
      'id',c.id,'name',c.name,'slug',c.slug,'timezone',c.timezone,
      'currency',c.currency,'business_type',c.business_type
    ),
    'membership',jsonb_build_object('role',cm.role,'branch_id',cm.branch_id),
    'branches',coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',b.id,'name',b.name,'code',b.code,'timezone',b.timezone,
        'city',b.city,'state',b.state,'is_headquarters',b.is_headquarters,'active',b.active
      ) order by b.is_headquarters desc,b.name)
      from public.branches b
      where b.company_id=c.id and b.active=true
    ),'[]'::jsonb)
  )
  from public.company_members cm
  join public.companies c on c.id=cm.company_id
  where cm.user_id=(select auth.uid()) and cm.active=true and c.active=true
  order by case when cm.role='owner' then 0 else 1 end,cm.created_at
  limit 1;
$$;

revoke all on function public.get_workspace_bootstrap() from public,anon;
grant execute on function public.get_workspace_bootstrap() to authenticated;
