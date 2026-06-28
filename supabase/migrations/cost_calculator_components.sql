-- Cost Calculator v2: Components layer + polymorphic recipe lines
-- Run AFTER cost_calculator.sql

-- 1. Components table: internally produced items made from raw ingredients
create table components (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  unit text not null,
  ingredient_id uuid references ingredients on delete restrict not null,
  ingredient_qty_used numeric(10,2) not null check (ingredient_qty_used > 0),
  yield_per_batch integer not null check (yield_per_batch > 0),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table components enable row level security;
create policy "Users can view their own components" on components for select using (auth.uid() = user_id);
create policy "Users can create their own components" on components for insert with check (auth.uid() = user_id);
create policy "Users can update their own components" on components for update using (auth.uid() = user_id);
create policy "Users can delete their own components" on components for delete using (auth.uid() = user_id);

-- 2. Rebuild menu_item_ingredients with polymorphic line_type + ref_id
drop table if exists menu_item_ingredients;
create table menu_item_ingredients (
  menu_item_id uuid references menu_items on delete cascade not null,
  line_type text not null check (line_type in ('ingredient', 'component')),
  ref_id uuid not null,
  quantity_needed numeric(10,2) not null check (quantity_needed > 0),
  primary key (menu_item_id, line_type, ref_id)
);
alter table menu_item_ingredients enable row level security;
create policy "Users can view" on menu_item_ingredients for select using (auth.uid() = (select user_id from menu_items where id = menu_item_id));
create policy "Users can insert" on menu_item_ingredients for insert with check (auth.uid() = (select user_id from menu_items where id = menu_item_id));
create policy "Users can update" on menu_item_ingredients for update using (auth.uid() = (select user_id from menu_items where id = menu_item_id));
create policy "Users can delete" on menu_item_ingredients for delete using (auth.uid() = (select user_id from menu_items where id = menu_item_id));

-- 3. Update cost view to handle both ingredient and component lines
drop view if exists menu_item_costs;
create view menu_item_costs as
with latest_prices as (
  select distinct on (ingredient_id)
    ingredient_id,
    unit_cost
  from purchases
  order by ingredient_id, date desc
),
component_unit_costs as (
  select
    c.id as component_id,
    (lp.unit_cost * c.ingredient_qty_used) / c.yield_per_batch as unit_cost
  from components c
  join latest_prices lp on lp.ingredient_id = c.ingredient_id
),
line_costs as (
  select
    mii.menu_item_id,
    case
      when mii.line_type = 'ingredient' then mii.quantity_needed * coalesce(lp.unit_cost, 0)
      when mii.line_type = 'component' then mii.quantity_needed * coalesce(cc.unit_cost, 0)
      else 0
    end as line_cost
  from menu_item_ingredients mii
  left join latest_prices lp on lp.ingredient_id = mii.ref_id and mii.line_type = 'ingredient'
  left join component_unit_costs cc on cc.component_id = mii.ref_id and mii.line_type = 'component'
)
select
  mi.id as menu_item_id,
  mi.name as menu_item_name,
  mi.user_id,
  mi.organization_id,
  coalesce((select count(*) from menu_item_ingredients where menu_item_id = mi.id)::integer, 0) as ingredient_count,
  coalesce((select sum(line_cost) from line_costs where menu_item_id = mi.id), 0) as total_cost
from menu_items mi;
