-- Fix function search path security issue with CASCADE
drop function if exists public.update_updated_at_column() cascade;

create or replace function public.update_updated_at_column()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Recreate the trigger
create trigger update_agents_updated_at
  before update on public.agents
  for each row
  execute function public.update_updated_at_column();