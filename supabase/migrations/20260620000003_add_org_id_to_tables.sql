-- Add organization_id to all tenant-scoped tables (safe: skips missing tables)
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['accounts','contacts','leads','opportunities','quotes','orders','products','ingredients','purchases','menu_items','components','slas','service_contracts','service_tickets'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE', tbl);
    END IF;
  END LOOP;
END;
$$;
