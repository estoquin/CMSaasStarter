-- Add image_url column to menu_items
alter table menu_items add column image_url text;

-- Storage bucket for menu item images
insert into storage.buckets (id, name, public)
  values ('menu-item-images', 'menu-item-images', true);

-- Public read access
create policy "Menu item images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'menu-item-images');

-- Authenticated users can upload their own images
create policy "Users can upload menu item images."
  on storage.objects for insert
  with check (
    bucket_id = 'menu-item-images'
    and auth.role() = 'authenticated'
  );

-- Users can update their own images
create policy "Users can update their own menu item images."
  on storage.objects for update
  using (bucket_id = 'menu-item-images' and auth.role() = 'authenticated');

-- Users can delete their own images
create policy "Users can delete their own menu item images."
  on storage.objects for delete
  using (bucket_id = 'menu-item-images' and auth.role() = 'authenticated');
