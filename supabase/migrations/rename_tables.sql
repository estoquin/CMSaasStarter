drop table if exists crm_contacts;
drop table if exists erp_products;

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  status text not null default 'lead',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table contacts enable row level security;

create policy "Users can view their own contacts" on contacts
  for select using (auth.uid() = user_id);

create policy "Users can create their own contacts" on contacts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own contacts" on contacts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own contacts" on contacts
  for delete using (auth.uid() = user_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  sku text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table products enable row level security;

create policy "Users can view their own products" on products
  for select using (auth.uid() = user_id);

create policy "Users can create their own products" on products
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own products" on products
  for update using (auth.uid() = user_id);

create policy "Users can delete their own products" on products
  for delete using (auth.uid() = user_id);
