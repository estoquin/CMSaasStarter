-- Service Module: Tables

CREATE TABLE slas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  response_hours integer NOT NULL,
  resolution_hours integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE service_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  sla_id uuid NOT NULL REFERENCES slas(id),
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE service_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category text,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ticket_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE TABLE ticket_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  minutes integer NOT NULL,
  note text,
  logged_at timestamptz DEFAULT now()
);

CREATE TABLE service_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void')),
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- updated_at trigger for service_tickets
CREATE EXTENSION IF NOT EXISTS moddatetime;
CREATE TRIGGER service_tickets_updated_at
  BEFORE UPDATE ON service_tickets
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Views

CREATE OR REPLACE VIEW open_tickets AS
SELECT
  st.id,
  st.title,
  st.status,
  st.priority,
  st.category,
  st.opened_at,
  st.updated_at,
  a.name AS account_name,
  c.name AS contact_name,
  p.full_name AS assigned_agent,
  sl.name AS sla_name,
  sl.response_hours,
  sl.resolution_hours,
  EXTRACT(EPOCH FROM (now() - st.opened_at)) / 3600 AS hours_open
FROM service_tickets st
LEFT JOIN accounts a ON a.id = st.account_id
LEFT JOIN contacts c ON c.id = st.contact_id
LEFT JOIN ticket_assignments ta ON ta.ticket_id = st.id AND ta.is_active = true
LEFT JOIN profiles p ON p.id = ta.agent_id
LEFT JOIN service_contracts sc ON sc.account_id = st.account_id AND (sc.end_date IS NULL OR sc.end_date >= CURRENT_DATE)
LEFT JOIN slas sl ON sl.id = sc.sla_id
WHERE st.status NOT IN ('resolved', 'closed');

CREATE OR REPLACE VIEW ticket_summary AS
SELECT
  st.id,
  st.title,
  st.status,
  st.priority,
  st.category,
  st.description,
  st.opened_at,
  st.closed_at,
  st.updated_at,
  a.id AS account_id,
  a.name AS account_name,
  c.id AS contact_id,
  c.name AS contact_name,
  p.full_name AS assigned_agent,
  p.id AS agent_id,
  COALESCE(tl.total_minutes, 0) AS total_minutes_logged,
  si.status AS invoice_status,
  si.amount AS invoice_amount
FROM service_tickets st
LEFT JOIN accounts a ON a.id = st.account_id
LEFT JOIN contacts c ON c.id = st.contact_id
LEFT JOIN ticket_assignments ta ON ta.ticket_id = st.id AND ta.is_active = true
LEFT JOIN profiles p ON p.id = ta.agent_id
LEFT JOIN (
  SELECT ticket_id, SUM(minutes) AS total_minutes
  FROM ticket_time_logs
  GROUP BY ticket_id
) tl ON tl.ticket_id = st.id
LEFT JOIN service_invoices si ON si.ticket_id = st.id;

CREATE OR REPLACE VIEW agent_workload AS
SELECT
  p.id AS agent_id,
  p.full_name AS agent_name,
  COUNT(DISTINCT ta.ticket_id) AS open_tickets,
  COALESCE(SUM(tl.minutes), 0) AS minutes_logged_this_month
FROM profiles p
LEFT JOIN ticket_assignments ta ON ta.agent_id = p.id AND ta.is_active = true
LEFT JOIN ticket_time_logs tl ON tl.agent_id = p.id
  AND date_trunc('month', tl.logged_at) = date_trunc('month', now())
GROUP BY p.id, p.full_name;
