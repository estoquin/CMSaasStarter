-- Organizations (top-level multi-tenant isolation)
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'standard' CHECK (role IN ('admin', 'standard')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Extend existing handle_new_user trigger to also create org + membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  org_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'avatar_url');

  INSERT INTO public.organizations (name, slug)
  VALUES (
    COALESCE(NEW.raw_user_meta_data ->> 'org_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'org_slug', regexp_replace(lower(NEW.email), '@.+$', ''))
  )
  RETURNING id INTO org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'admin');

  RETURN NEW;
END;
$$;
