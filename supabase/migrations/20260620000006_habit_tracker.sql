-- Habit Tracker Module

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists habit_bundles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  start_date date default current_date,
  end_date date,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists habit_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid references habit_bundles(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  sort_order integer default 0,
  unique(bundle_id, habit_id)
);

create table if not exists habit_tracking_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  bundle_id uuid references habit_bundles(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  tracked_date date not null default current_date,
  completed boolean default false,
  notes text,
  created_at timestamptz default now(),
  unique(bundle_id, habit_id, tracked_date)
);

-- RLS
alter table habits enable row level security;
alter table habit_bundles enable row level security;
alter table habit_bundle_items enable row level security;
alter table habit_tracking_records enable row level security;

do $$ begin
  drop policy if exists "org members can manage habits" on habits;
  create policy "org members can manage habits"
    on habits for all
    using (organization_id = (select organization_id from organization_members where user_id = auth.uid()));
end $$;

do $$ begin
  drop policy if exists "org members can manage bundles" on habit_bundles;
  create policy "org members can manage bundles"
    on habit_bundles for all
    using (organization_id = (select organization_id from organization_members where user_id = auth.uid()));
end $$;

do $$ begin
  drop policy if exists "org members can manage bundle items" on habit_bundle_items;
  create policy "org members can manage bundle items"
    on habit_bundle_items for all
    using (bundle_id in (select id from habit_bundles where organization_id = (select organization_id from organization_members where user_id = auth.uid())));
end $$;

do $$ begin
  drop policy if exists "org members can manage tracking records" on habit_tracking_records;
  create policy "org members can manage tracking records"
    on habit_tracking_records for all
    using (organization_id = (select organization_id from organization_members where user_id = auth.uid()));
end $$;
