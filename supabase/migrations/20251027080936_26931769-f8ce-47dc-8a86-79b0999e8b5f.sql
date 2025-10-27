-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Agents table for storing AI agents
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  model text not null,
  description text,
  capabilities text[] default '{}',
  is_active boolean default true,
  is_nft boolean default false,
  nft_token_id text,
  nft_contract_address text,
  performance_score integer default 0,
  total_tasks integer default 0,
  successful_tasks integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Agent tasks table
create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'failed')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  result text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Agent collaborations for multi-agent tasks
create table public.agent_collaborations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_ids uuid[] not null,
  status text default 'active' check (status in ('active', 'paused', 'completed')),
  workflow_type text default 'sequential' check (workflow_type in ('sequential', 'parallel', 'hierarchical')),
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- NFT marketplace listings
create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  seller_id uuid references auth.users(id) on delete cascade not null,
  price numeric(20, 8) not null,
  currency text default 'ETH',
  is_active boolean default true,
  views integer default 0,
  created_at timestamp with time zone default now(),
  sold_at timestamp with time zone
);

-- Analytics events for tracking
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_type text not null,
  event_data jsonb,
  agent_id uuid references public.agents(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.agents enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_collaborations enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.analytics_events enable row level security;

-- RLS Policies for agents
create policy "Users can view all agents"
  on public.agents for select
  using (true);

create policy "Users can create their own agents"
  on public.agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own agents"
  on public.agents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own agents"
  on public.agents for delete
  using (auth.uid() = user_id);

-- RLS Policies for agent_tasks
create policy "Users can view their own tasks"
  on public.agent_tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.agent_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.agent_tasks for update
  using (auth.uid() = user_id);

-- RLS Policies for collaborations
create policy "Users can view their own collaborations"
  on public.agent_collaborations for select
  using (auth.uid() = user_id);

create policy "Users can create collaborations"
  on public.agent_collaborations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their collaborations"
  on public.agent_collaborations for update
  using (auth.uid() = user_id);

-- RLS Policies for marketplace
create policy "Everyone can view active listings"
  on public.marketplace_listings for select
  using (is_active = true);

create policy "Sellers can create listings"
  on public.marketplace_listings for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update their listings"
  on public.marketplace_listings for update
  using (auth.uid() = seller_id);

-- RLS Policies for analytics
create policy "Users can view their own events"
  on public.analytics_events for select
  using (auth.uid() = user_id);

create policy "Users can create events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id or user_id is null);

-- Create indexes for better performance
create index idx_agents_user_id on public.agents(user_id);
create index idx_agents_is_nft on public.agents(is_nft);
create index idx_agent_tasks_agent_id on public.agent_tasks(agent_id);
create index idx_agent_tasks_user_id on public.agent_tasks(user_id);
create index idx_agent_tasks_status on public.agent_tasks(status);
create index idx_collaborations_user_id on public.agent_collaborations(user_id);
create index idx_marketplace_active on public.marketplace_listings(is_active);
create index idx_analytics_user_id on public.analytics_events(user_id);
create index idx_analytics_event_type on public.analytics_events(event_type);
create index idx_analytics_created_at on public.analytics_events(created_at);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for agents updated_at
create trigger update_agents_updated_at
  before update on public.agents
  for each row
  execute function public.update_updated_at_column();

-- Enable realtime for all tables
alter publication supabase_realtime add table public.agents;
alter publication supabase_realtime add table public.agent_tasks;
alter publication supabase_realtime add table public.agent_collaborations;
alter publication supabase_realtime add table public.marketplace_listings;
alter publication supabase_realtime add table public.analytics_events;