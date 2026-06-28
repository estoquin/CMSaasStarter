-- Fix storage bucket permissions for menu-item-images
-- Scope INSERT/UPDATE/DELETE to user's own folder by path prefix

DROP POLICY IF EXISTS "Users can upload menu item images." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own menu item images." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own menu item images." ON storage.objects;

CREATE POLICY "Users can upload menu item images."
  ON storage.objects FOR insert
  WITH CHECK (
    bucket_id = 'menu-item-images'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own menu item images."
  ON storage.objects FOR update
  USING (
    bucket_id = 'menu-item-images'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own menu item images."
  ON storage.objects FOR delete
  USING (
    bucket_id = 'menu-item-images'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
