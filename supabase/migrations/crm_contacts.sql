-- CRM: Contacts table
create table crm_contacts (
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

alter table crm_contacts enable row level security;

create policy "Users can view their own contacts" on crm_contacts
  for select using (auth.uid() = user_id);

create policy "Users can create their own contacts" on crm_contacts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own contacts" on crm_contacts
  for update using (auth.uid() = user_id);

create policy "Users can delete their own contacts" on crm_contacts
  for delete using (auth.uid() = user_id);
