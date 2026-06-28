-- Fix RLS policies for habit tables: add explicit WITH CHECK clauses
-- FOR ALL + USING only does not reliably apply to INSERT in some PostgreSQL versions

drop policy if exists "org members can manage habits" on habits;
create policy "org members can manage habits"
  on habits for all
  using (organization_id = (select organization_id from organization_members where user_id = auth.uid()))
  with check (organization_id = (select organization_id from organization_members where user_id = auth.uid()));

drop policy if exists "org members can manage bundles" on habit_bundles;
create policy "org members can manage bundles"
  on habit_bundles for all
  using (organization_id = (select organization_id from organization_members where user_id = auth.uid()))
  with check (organization_id = (select organization_id from organization_members where user_id = auth.uid()));

drop policy if exists "org members can manage bundle items" on habit_bundle_items;
create policy "org members can manage bundle items"
  on habit_bundle_items for all
  using (bundle_id in (select id from habit_bundles where organization_id = (select organization_id from organization_members where user_id = auth.uid())))
  with check (bundle_id in (select id from habit_bundles where organization_id = (select organization_id from organization_members where user_id = auth.uid())));

drop policy if exists "org members can manage tracking records" on habit_tracking_records;
create policy "org members can manage tracking records"
  on habit_tracking_records for all
  using (organization_id = (select organization_id from organization_members where user_id = auth.uid()))
  with check (organization_id = (select organization_id from organization_members where user_id = auth.uid()));
