-- Add user_id to service_tickets for multi-tenant isolation
DROP VIEW IF EXISTS open_tickets CASCADE;
DROP VIEW IF EXISTS ticket_summary CASCADE;

ALTER TABLE service_tickets ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE OR REPLACE VIEW open_tickets AS
SELECT
  st.id,
  st.title,
  st.status,
  st.priority,
  st.category,
  st.opened_at,
  st.updated_at,
  st.user_id,
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
  st.user_id,
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
