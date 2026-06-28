-- ================================================================
-- CONSOLIDATED FIX: Apply all pending schema changes safely
-- Run this in Supabase SQL Editor (safe to run multiple times)
-- ================================================================

-- 1. ORGANIZATIONS (multi-tenant isolation)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'standard' CHECK (role IN ('admin', 'standard')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 2. ADD organization_id TO ALL EXISTING TABLES
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY['accounts','contacts','leads','opportunities','quotes','orders','products','ingredients','purchases','menu_items','components','slas','service_contracts','service_tickets','crm_contacts','erp_products'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE', tbl);
    END IF;
  END LOOP;
END;
$$;

-- 3. COMPONENTS TABLE (if not exists from cost_calculator_components.sql)
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  unit text NOT NULL,
  ingredient_id uuid REFERENCES ingredients ON DELETE RESTRICT NOT NULL,
  ingredient_qty_used numeric(10,2) NOT NULL CHECK (ingredient_qty_used > 0),
  yield_per_batch integer NOT NULL CHECK (yield_per_batch > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own components" ON components;
DROP POLICY IF EXISTS "Users can create their own components" ON components;
DROP POLICY IF EXISTS "Users can update their own components" ON components;
DROP POLICY IF EXISTS "Users can delete their own components" ON components;
CREATE POLICY "Users can view their own components" ON components FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own components" ON components FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own components" ON components FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own components" ON components FOR DELETE USING (auth.uid() = user_id);

-- 4. RECREATE menu_item_ingredients WITH POLYMORPHIC LINES (safe replace)
DROP TABLE IF EXISTS menu_item_ingredients CASCADE;
CREATE TABLE menu_item_ingredients (
  menu_item_id uuid REFERENCES menu_items ON DELETE CASCADE NOT NULL,
  line_type text NOT NULL CHECK (line_type IN ('ingredient', 'component')),
  ref_id uuid NOT NULL,
  quantity_needed numeric(10,2) NOT NULL CHECK (quantity_needed > 0),
  PRIMARY KEY (menu_item_id, line_type, ref_id)
);
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view" ON menu_item_ingredients;
DROP POLICY IF EXISTS "Users can insert" ON menu_item_ingredients;
DROP POLICY IF EXISTS "Users can update" ON menu_item_ingredients;
DROP POLICY IF EXISTS "Users can delete" ON menu_item_ingredients;
CREATE POLICY "Users can view" ON menu_item_ingredients FOR SELECT USING (auth.uid() = (SELECT user_id FROM menu_items WHERE id = menu_item_id));
CREATE POLICY "Users can insert" ON menu_item_ingredients FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM menu_items WHERE id = menu_item_id));
CREATE POLICY "Users can update" ON menu_item_ingredients FOR UPDATE USING (auth.uid() = (SELECT user_id FROM menu_items WHERE id = menu_item_id));
CREATE POLICY "Users can delete" ON menu_item_ingredients FOR DELETE USING (auth.uid() = (SELECT user_id FROM menu_items WHERE id = menu_item_id));

-- 5. RECREATE menu_item_costs VIEW WITH organization_id
DROP VIEW IF EXISTS menu_item_costs;
CREATE VIEW menu_item_costs AS
WITH latest_prices AS (
  SELECT DISTINCT ON (ingredient_id)
    ingredient_id, unit_cost
  FROM purchases
  ORDER BY ingredient_id, date DESC
),
component_unit_costs AS (
  SELECT
    c.id AS component_id,
    (lp.unit_cost * c.ingredient_qty_used) / c.yield_per_batch AS unit_cost
  FROM components c
  JOIN latest_prices lp ON lp.ingredient_id = c.ingredient_id
),
line_costs AS (
  SELECT
    mii.menu_item_id,
    CASE
      WHEN mii.line_type = 'ingredient' THEN mii.quantity_needed * COALESCE(lp.unit_cost, 0)
      WHEN mii.line_type = 'component' THEN mii.quantity_needed * COALESCE(cc.unit_cost, 0)
      ELSE 0
    END AS line_cost
  FROM menu_item_ingredients mii
  LEFT JOIN latest_prices lp ON lp.ingredient_id = mii.ref_id AND mii.line_type = 'ingredient'
  LEFT JOIN component_unit_costs cc ON cc.component_id = mii.ref_id AND mii.line_type = 'component'
)
SELECT
  mi.id AS menu_item_id,
  mi.name AS menu_item_name,
  mi.user_id,
  mi.organization_id,
  COALESCE((SELECT COUNT(*) FROM menu_item_ingredients WHERE menu_item_id = mi.id)::integer, 0) AS ingredient_count,
  COALESCE((SELECT SUM(line_cost) FROM line_costs WHERE menu_item_id = mi.id), 0) AS total_cost
FROM menu_items mi;

-- 6. SERVICE MODULE TABLES
CREATE TABLE IF NOT EXISTS slas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  response_hours integer NOT NULL,
  resolution_hours integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  sla_id uuid NOT NULL REFERENCES slas(id),
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','pending','resolved','closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  category text,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS ticket_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  minutes integer NOT NULL,
  note text,
  logged_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','void')),
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 7. SERVICE VIEWS
CREATE EXTENSION IF NOT EXISTS moddatetime;

DROP TRIGGER IF EXISTS service_tickets_updated_at ON service_tickets;
CREATE TRIGGER service_tickets_updated_at
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

DROP VIEW IF EXISTS open_tickets CASCADE;
CREATE VIEW open_tickets AS
SELECT
  st.id, st.title, st.status, st.priority, st.category,
  st.opened_at, st.updated_at, st.user_id,
  a.name AS account_name,
  c.name AS contact_name,
  p.full_name AS assigned_agent,
  sl.name AS sla_name, sl.response_hours, sl.resolution_hours,
  EXTRACT(EPOCH FROM (now() - st.opened_at)) / 3600 AS hours_open
FROM service_tickets st
LEFT JOIN accounts a ON a.id = st.account_id
LEFT JOIN contacts c ON c.id = st.contact_id
LEFT JOIN ticket_assignments ta ON ta.ticket_id = st.id AND ta.is_active = true
LEFT JOIN profiles p ON p.id = ta.agent_id
LEFT JOIN service_contracts sc ON sc.account_id = st.account_id AND (sc.end_date IS NULL OR sc.end_date >= CURRENT_DATE)
LEFT JOIN slas sl ON sl.id = sc.sla_id
WHERE st.status NOT IN ('resolved', 'closed');

DROP VIEW IF EXISTS ticket_summary CASCADE;
CREATE VIEW ticket_summary AS
SELECT
  st.id, st.title, st.status, st.priority, st.category,
  st.description, st.opened_at, st.closed_at, st.updated_at, st.user_id,
  a.id AS account_id, a.name AS account_name,
  c.id AS contact_id, c.name AS contact_name,
  p.full_name AS assigned_agent, p.id AS agent_id,
  COALESCE(tl.total_minutes, 0) AS total_minutes_logged,
  si.status AS invoice_status, si.amount AS invoice_amount
FROM service_tickets st
LEFT JOIN accounts a ON a.id = st.account_id
LEFT JOIN contacts c ON c.id = st.contact_id
LEFT JOIN ticket_assignments ta ON ta.ticket_id = st.id AND ta.is_active = true
LEFT JOIN profiles p ON p.id = ta.agent_id
LEFT JOIN (SELECT ticket_id, SUM(minutes) AS total_minutes FROM ticket_time_logs GROUP BY ticket_id) tl ON tl.ticket_id = st.id
LEFT JOIN service_invoices si ON si.ticket_id = st.id;

DROP VIEW IF EXISTS agent_workload CASCADE;
CREATE VIEW agent_workload AS
SELECT
  p.id AS agent_id, p.full_name AS agent_name,
  COUNT(DISTINCT ta.ticket_id) AS open_tickets,
  COALESCE(SUM(tl.minutes), 0) AS minutes_logged_this_month
FROM profiles p
LEFT JOIN ticket_assignments ta ON ta.agent_id = p.id AND ta.is_active = true
LEFT JOIN ticket_time_logs tl ON tl.agent_id = p.id AND date_trunc('month', tl.logged_at) = date_trunc('month', now())
GROUP BY p.id, p.full_name;

-- 8. EXISTING VIEWS (add organization_id where needed)
DROP VIEW IF EXISTS sales_pipeline CASCADE;
CREATE VIEW sales_pipeline AS
SELECT stage, COUNT(*) AS count, SUM(value) AS total_value
FROM opportunities
GROUP BY stage
ORDER BY stage;

DROP VIEW IF EXISTS recent_orders CASCADE;
CREATE VIEW recent_orders AS
SELECT o.id, o.name, a.name AS account_name, o.total, o.status, o.order_date, o.created_at
FROM orders o
LEFT JOIN accounts a ON a.id = o.account_id
ORDER BY o.created_at DESC LIMIT 20;

-- 9. ADD image_url TO menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url text;

-- 10. ADD account_id TO contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;

-- 11. STORAGE BUCKET for menu item images
INSERT INTO storage.buckets (id, name, public)
SELECT 'menu-item-images', 'menu-item-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'menu-item-images');
