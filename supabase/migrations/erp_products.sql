create table erp_products (
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

alter table erp_products enable row level security;

create policy "Users can view their own products" on erp_products
  for select using (auth.uid() = user_id);

create policy "Users can create their own products" on erp_products
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own products" on erp_products
  for update using (auth.uid() = user_id);

create policy "Users can delete their own products" on erp_products
  for delete using (auth.uid() = user_id);
