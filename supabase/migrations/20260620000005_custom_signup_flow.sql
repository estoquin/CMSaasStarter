-- Add approved column to organizations (new orgs start unapproved)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;
-- Ensure default is false even if column already existed
ALTER TABLE organizations ALTER COLUMN approved SET DEFAULT false;
-- Set existing orgs (mock data) as approved so they keep working
UPDATE organizations SET approved = true WHERE approved IS NULL;

-- Replace trigger to handle two flows:
--   1. org_slug provided → join existing org (must be approved), user as admin if first member
--   2. No org_slug → create new org (pending approval), no member added
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  org_id uuid;
  org_name text;
  org_slug_val text;
  member_count integer;
  is_approved boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url');

  org_slug_val := NEW.raw_user_meta_data ->> 'org_slug';

  -- If org_slug provided, try to join existing org
  IF org_slug_val IS NOT NULL AND org_slug_val != '' THEN
    SELECT id, approved INTO org_id, is_approved FROM public.organizations WHERE slug = org_slug_val;
    IF org_id IS NOT NULL THEN
      -- Only add member if org is approved
      IF is_approved THEN
        SELECT COUNT(*) INTO member_count FROM public.organization_members WHERE organization_id = org_id;
        IF member_count = 0 THEN
          INSERT INTO public.organization_members (organization_id, user_id, role)
          VALUES (org_id, NEW.id, 'admin');
        ELSE
          INSERT INTO public.organization_members (organization_id, user_id, role)
          VALUES (org_id, NEW.id, 'standard');
        END IF;
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  -- Create a new org (pending approval, no member added yet)
  org_name := COALESCE(NEW.raw_user_meta_data ->> 'org_name', NEW.email);
  INSERT INTO public.organizations (name, slug, approved)
  VALUES (
    org_name,
    COALESCE(
      NULLIF(regexp_replace(lower(org_name), '[^a-z0-9]+', '-', 'g'), ''),
      regexp_replace(lower(NEW.email), '@.+$', '')
    ) || '-' || substr(NEW.id::text, 1, 8),
    false
  )
  RETURNING id INTO org_id;

  RETURN NEW;
END;
$$;
