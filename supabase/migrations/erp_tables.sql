-- Accounts
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  website text,
  industry text,
  status text not null default 'active',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table accounts enable row level security;
create policy "Users can view their own accounts" on accounts for select using (auth.uid() = user_id);
create policy "Users can create their own accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Users can update their own accounts" on accounts for update using (auth.uid() = user_id);
create policy "Users can delete their own accounts" on accounts for delete using (auth.uid() = user_id);

-- Leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'new',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table leads enable row level security;
create policy "Users can view their own leads" on leads for select using (auth.uid() = user_id);
create policy "Users can create their own leads" on leads for insert with check (auth.uid() = user_id);
create policy "Users can update their own leads" on leads for update using (auth.uid() = user_id);
create policy "Users can delete their own leads" on leads for delete using (auth.uid() = user_id);

-- Opportunities
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  account_id uuid references accounts on delete set null,
  value numeric(10,2) not null default 0,
  stage text not null default 'prospecting',
  probability integer not null default 0,
  close_date date,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table opportunities enable row level security;
create policy "Users can view their own opportunities" on opportunities for select using (auth.uid() = user_id);
create policy "Users can create their own opportunities" on opportunities for insert with check (auth.uid() = user_id);
create policy "Users can update their own opportunities" on opportunities for update using (auth.uid() = user_id);
create policy "Users can delete their own opportunities" on opportunities for delete using (auth.uid() = user_id);

-- Quotes
create table quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  account_id uuid references accounts on delete set null,
  opportunity_id uuid references opportunities on delete set null,
  total numeric(10,2) not null default 0,
  status text not null default 'draft',
  valid_until date,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table quotes enable row level security;
create policy "Users can view their own quotes" on quotes for select using (auth.uid() = user_id);
create policy "Users can create their own quotes" on quotes for insert with check (auth.uid() = user_id);
create policy "Users can update their own quotes" on quotes for update using (auth.uid() = user_id);
create policy "Users can delete their own quotes" on quotes for delete using (auth.uid() = user_id);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  account_id uuid references accounts on delete set null,
  quote_id uuid references quotes on delete set null,
  total numeric(10,2) not null default 0,
  status text not null default 'pending',
  order_date date default current_date,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table orders enable row level security;
create policy "Users can view their own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can create their own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Users can update their own orders" on orders for update using (auth.uid() = user_id);
create policy "Users can delete their own orders" on orders for delete using (auth.uid() = user_id);

-- Views: Sales Pipeline (aggregates opportunities by stage)
create view sales_pipeline as
select
  stage,
  count(*) as count,
  sum(value) as total_value
from opportunities
group by stage
order by stage;

-- View: Recent Orders
create view recent_orders as
select
  o.id,
  o.name,
  a.name as account_name,
  o.total,
  o.status,
  o.order_date,
  o.created_at
from orders o
left join accounts a on a.id = o.account_id
order by o.created_at desc
limit 20;
