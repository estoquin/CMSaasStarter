-- Fix existing orgs created by handle_new_user() before the member-insert fix.
-- For each org with no members, find the likely creator from auth.users
-- by matching the slug pattern, and insert them as admin.
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT o.id, u.id, 'admin'
FROM public.organizations o
CROSS JOIN auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = o.id)
  AND o.slug LIKE '%' || substr(u.id::text, 1, 8)
  AND o.slug = (
    COALESCE(
      NULLIF(regexp_replace(lower(o.name), '[^a-z0-9]+', '-', 'g'), ''),
      regexp_replace(lower(u.email), '@.+$', '')
    ) || '-' || substr(u.id::text, 1, 8)
  )
ON CONFLICT (organization_id, user_id) DO NOTHING;
