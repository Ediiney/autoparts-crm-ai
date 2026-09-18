-- Explicit deny policy for server-only webhook table.
-- Grants for anon/authenticated remain revoked; this is defense in depth and silences the RLS advisor.

create policy webhook_events_deny_authenticated
on public.webhook_events
as restrictive
for all
to authenticated
using (false)
with check (false);
