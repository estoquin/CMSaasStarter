-- Cost Calculator: Burger Factory
-- Ingredients master list
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  unit text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table ingredients enable row level security;
create policy "Users can view their own ingredients" on ingredients for select using (auth.uid() = user_id);
create policy "Users can create their own ingredients" on ingredients for insert with check (auth.uid() = user_id);
create policy "Users can update their own ingredients" on ingredients for update using (auth.uid() = user_id);
create policy "Users can delete their own ingredients" on ingredients for delete using (auth.uid() = user_id);

-- Purchases: record every ingredient buy
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  ingredient_id uuid references ingredients on delete cascade not null,
  date date not null default current_date,
  quantity_bought numeric(10,2) not null check (quantity_bought > 0),
  total_paid numeric(10,2) not null check (total_paid >= 0),
  unit_cost numeric(10,4) generated always as (total_paid / quantity_bought) stored,
  created_at timestamp with time zone default now()
);
alter table purchases enable row level security;
create policy "Users can view their own purchases" on purchases for select using (auth.uid() = user_id);
create policy "Users can create their own purchases" on purchases for insert with check (auth.uid() = user_id);
create policy "Users can update their own purchases" on purchases for update using (auth.uid() = user_id);
create policy "Users can delete their own purchases" on purchases for delete using (auth.uid() = user_id);

-- Menu Items: the burger catalog (named menu_items to avoid conflict with erp products table)
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table menu_items enable row level security;
create policy "Users can view their own menu_items" on menu_items for select using (auth.uid() = user_id);
create policy "Users can create their own menu_items" on menu_items for insert with check (auth.uid() = user_id);
create policy "Users can update their own menu_items" on menu_items for update using (auth.uid() = user_id);
create policy "Users can delete their own menu_items" on menu_items for delete using (auth.uid() = user_id);

-- Menu Item Ingredients: recipe linking burgers to raw materials
create table menu_item_ingredients (
  menu_item_id uuid references menu_items on delete cascade not null,
  ingredient_id uuid references ingredients on delete cascade not null,
  quantity_needed numeric(10,2) not null check (quantity_needed > 0),
  primary key (menu_item_id, ingredient_id)
);
alter table menu_item_ingredients enable row level security;
create policy "Users can view" on menu_item_ingredients for select using (auth.uid() = (select user_id from menu_items where id = menu_item_id));
create policy "Users can insert" on menu_item_ingredients for insert with check (auth.uid() = (select user_id from menu_items where id = menu_item_id));
create policy "Users can update" on menu_item_ingredients for update using (auth.uid() = (select user_id from menu_items where id = menu_item_id));
create policy "Users can delete" on menu_item_ingredients for delete using (auth.uid() = (select user_id from menu_items where id = menu_item_id));

-- View: current cost per burger (latest purchase price per ingredient)
create view menu_item_costs as
with latest_prices as (
  select distinct on (ingredient_id)
    ingredient_id,
    unit_cost
  from purchases
  order by ingredient_id, date desc
)
select
  mi.id as menu_item_id,
  mi.name as menu_item_name,
  mi.user_id,
  coalesce(count(mii.ingredient_id)::integer, 0) as ingredient_count,
  coalesce(sum(mii.quantity_needed * lp.unit_cost), 0) as total_cost
from menu_items mi
left join menu_item_ingredients mii on mii.menu_item_id = mi.id
left join latest_prices lp on lp.ingredient_id = mii.ingredient_id
group by mi.id, mi.name, mi.user_id;
