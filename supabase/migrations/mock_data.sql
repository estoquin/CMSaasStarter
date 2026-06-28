-- Mock Data Generator
-- Run this in Supabase SQL Editor after running the table migration scripts.
-- It inserts sample data for all CRM + ERP tables linked to your user account.

do $$
declare
  v_user_id uuid;
  v_contact_ids uuid[] := '{}';
  v_product_ids uuid[] := '{}';
  v_account_ids uuid[] := '{}';
  v_lead_ids uuid[] := '{}';
  v_opp_ids uuid[] := '{}';
  v_quote_ids uuid[] := '{}';
  v_id uuid;
begin
  -- Grab the first real user (change this WHERE to match your user)
  select id into v_user_id from auth.users limit 1;
  if v_user_id is null then
    raise exception 'No user found in auth.users. Create a user first.';
  end if;

  -- Clean existing data (order matters for FK constraints)
  delete from orders;
  delete from quotes;
  delete from opportunities;
  delete from leads;
  delete from accounts;
  delete from contacts;
  delete from products;

  ---------------------------------------------------------------------------
  -- CONTACTS (8)
  ---------------------------------------------------------------------------
  for v_id in select * from (values
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()),
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid())
  ) as t loop
    v_contact_ids := v_contact_ids || v_id;
  end loop;

  insert into contacts (id, user_id, name, email, phone, company, notes, status) values
    (v_contact_ids[1], v_user_id, 'Alice Johnson',  'alice@acme.com',     '555-0101', 'Acme Corp',       'Key decision maker',    'active'),
    (v_contact_ids[2], v_user_id, 'Bob Smith',      'bob@globex.com',     '555-0102', 'Globex Inc',      'Follow up in Q3',       'active'),
    (v_contact_ids[3], v_user_id, 'Carol White',    'carol@initech.com',  '555-0103', 'Initech',         'Met at conference',     'lead'),
    (v_contact_ids[4], v_user_id, 'Dave Brown',     'dave@umbrella.com',  '555-0104', 'Umbrella Corp',   'Cold outreach',         'lead'),
    (v_contact_ids[5], v_user_id, 'Eve Davis',      'eve@stark.com',      '555-0105', 'Stark Industries', 'VIP client',             'active'),
    (v_contact_ids[6], v_user_id, 'Frank Miller',   'frank@wayne.com',    '555-0106', 'Wayne Enterprises','Pending contract',      'active'),
    (v_contact_ids[7], v_user_id, 'Grace Wilson',   'grace@oscorp.com',   '555-0107', 'Oscorp',          'Technical contact',      'lead'),
    (v_contact_ids[8], v_user_id, 'Henry Taylor',   'henry@lexcorp.com',  '555-0108', 'LexCorp',         'Former client - re-engage','inactive');

  ---------------------------------------------------------------------------
  -- PRODUCTS (6)
  ---------------------------------------------------------------------------
  for v_id in select * from (values
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()),
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid())
  ) as t loop
    v_product_ids := v_product_ids || v_id;
  end loop;

  insert into products (id, user_id, name, sku, price, stock, description) values
    (v_product_ids[1], v_user_id, 'Widget Pro',     'WGT-001',  29.99,  150, 'High-quality aluminium widget'),
    (v_product_ids[2], v_user_id, 'Gadget X',       'GDG-002',  49.99,  200, 'Next-gen gadget with Bluetooth'),
    (v_product_ids[3], v_user_id, 'ToolKit Basic',  'TLK-003',  99.99,   75, 'Essential toolkit for beginners'),
    (v_product_ids[4], v_user_id, 'Cloud License',  'CLD-004', 499.00,  999, 'Annual cloud subscription license'),
    (v_product_ids[5], v_user_id, 'Support Tier 1', 'SPT-005', 199.00,  999, 'Priority support package'),
    (v_product_ids[6], v_user_id, 'Analytics Suite', 'ANL-006', 799.00,  50, 'Full analytics platform license');

  ---------------------------------------------------------------------------
  -- ACCOUNTS (5)
  ---------------------------------------------------------------------------
  for v_id in select * from (values
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()),
    (gen_random_uuid()), (gen_random_uuid())
  ) as t loop
    v_account_ids := v_account_ids || v_id;
  end loop;

  insert into accounts (id, user_id, name, email, phone, website, industry, status, notes) values
    (v_account_ids[1], v_user_id, 'Acme Corp',       'info@acme.com',      '555-1001', 'https://acme.com',      'Manufacturing',   'active',   'Strategic partner - manufacturing vertical'),
    (v_account_ids[2], v_user_id, 'Globex Inc',      'hello@globex.com',   '555-1002', 'https://globex.com',    'Technology',      'active',   'Enterprise technology client'),
    (v_account_ids[3], v_user_id, 'Initech',         'contact@initech.com','555-1003', 'https://initech.com',   'Finance',         'active',   'Finance sector - compliance focused'),
    (v_account_ids[4], v_user_id, 'Umbrella Corp',   'ops@umbrella.com',   '555-1004', 'https://umbrella.com',  'Pharmaceutical',  'inactive', 'On hold pending regulatory review'),
    (v_account_ids[5], v_user_id, 'Stark Industries', 'info@stark.com',    '555-1005', 'https://stark.com',     'Defense',         'active',   'High-value defense contractor');

  ---------------------------------------------------------------------------
  -- LEADS (6)
  ---------------------------------------------------------------------------
  for v_id in select * from (values
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()),
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid())
  ) as t loop
    v_lead_ids := v_lead_ids || v_id;
  end loop;

  insert into leads (id, user_id, name, email, phone, source, status, notes) values
    (v_lead_ids[1], v_user_id, 'Wayne Enterprises', 'procurement@wayne.com','555-2001', 'Referral',    'new',       'Referred by Alice Johnson'),
    (v_lead_ids[2], v_user_id, 'Oscorp',             'sales@oscorp.com',    '555-2002', 'Website',     'contacted', 'Filled out demo request form'),
    (v_lead_ids[3], v_user_id, 'LexCorp',            'bizdev@lexcorp.com',  '555-2003', 'Conference',  'qualified', 'Met at Tech Expo 2025 - interested in analytics'),
    (v_lead_ids[4], v_user_id, 'Massive Dynamic',    'info@massive.com',    '555-2004', 'LinkedIn',    'new',       'Engaged with recent blog post'),
    (v_lead_ids[5], v_user_id, 'CyberDyne Systems',  'contact@cyberdyne.com','555-2005','Cold Call',   'lost',      'Not interested - budget constraints'),
    (v_lead_ids[6], v_user_id, 'Soylent Corp',       'hello@soylent.com',   '555-2006', 'Referral',    'converted', 'Converted to account - signed contract');

  ---------------------------------------------------------------------------
  -- OPPORTUNITIES (8) — linked to accounts
  ---------------------------------------------------------------------------
  for v_id in select * from (values
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()),
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid())
  ) as t loop
    v_opp_ids := v_opp_ids || v_id;
  end loop;

  insert into opportunities (id, user_id, name, account_id, value, stage, probability, close_date, notes) values
    (v_opp_ids[1], v_user_id, 'Acme Widget Expansion',      v_account_ids[1], 45000.00,  'prospecting',   10,  '2025-09-30', 'Initial discussion about widget bulk order'),
    (v_opp_ids[2], v_user_id, 'Globex Cloud Migration',     v_account_ids[2], 120000.00, 'qualification', 25,  '2025-10-15', 'Cloud license + support bundle'),
    (v_opp_ids[3], v_user_id, 'Initech Compliance Suite',   v_account_ids[3], 85000.00,  'proposal',      50,  '2025-08-20', 'Proposal sent - awaiting feedback'),
    (v_opp_ids[4], v_user_id, 'Stark Analytics Platform',   v_account_ids[5], 250000.00, 'negotiation',   75,  '2025-07-31', 'Negotiating contract terms - legal review'),
    (v_opp_ids[5], v_user_id, 'Acme Support Renewal',       v_account_ids[1], 12000.00,  'closed_won',    100, '2025-06-15', 'Support tier 1 renewal - signed'),
    (v_opp_ids[6], v_user_id, 'Globex ToolKit Order',       v_account_ids[2], 9500.00,   'closed_won',    100, '2025-05-20', 'ToolKit Basic x 50 units - delivered'),
    (v_opp_ids[7], v_user_id, 'Umbrella Lab Equipment',     v_account_ids[4], 65000.00,  'closed_lost',   0,   null,        'Lost to competitor - pricing too high'),
    (v_opp_ids[8], v_user_id, 'Initech Analytics Suite',    v_account_ids[3], 95000.00,  'prospecting',   15,  '2025-11-01', 'New opportunity - upsell analytics');

  ---------------------------------------------------------------------------
  -- QUOTES (6) — linked to accounts & opportunities
  ---------------------------------------------------------------------------
  for v_id in select * from (values
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid()),
    (gen_random_uuid()), (gen_random_uuid()), (gen_random_uuid())
  ) as t loop
    v_quote_ids := v_quote_ids || v_id;
  end loop;

  insert into quotes (id, user_id, name, account_id, opportunity_id, total, status, valid_until, notes) values
    (v_quote_ids[1], v_user_id, 'Acme Widget Quote',         v_account_ids[1], v_opp_ids[1], 45000.00,  'draft',    '2025-08-30', 'Draft - awaiting product availability'),
    (v_quote_ids[2], v_user_id, 'Globex Cloud Bundle',       v_account_ids[2], v_opp_ids[2], 120000.00, 'sent',     '2025-09-15', 'Sent to Globex procurement team'),
    (v_quote_ids[3], v_user_id, 'Initech Compliance Quote',  v_account_ids[3], v_opp_ids[3], 85000.00,  'sent',     '2025-08-20', 'Sent with compliance addendum'),
    (v_quote_ids[4], v_user_id, 'Stark Analytics Quote',     v_account_ids[5], v_opp_ids[4], 250000.00, 'accepted', '2025-07-31', 'Accepted - legal finalizing'),
    (v_quote_ids[5], v_user_id, 'Acme Support Renewal Quote',v_account_ids[1], v_opp_ids[5], 12000.00,  'accepted', '2025-06-01', 'Renewal accepted and paid'),
    (v_quote_ids[6], v_user_id, 'Globex ToolKit Quote',      v_account_ids[2], v_opp_ids[6], 9500.00,   'accepted', '2025-05-01', 'Paid in full');

  ---------------------------------------------------------------------------
  -- ORDERS (5) — linked to accounts & quotes
  ---------------------------------------------------------------------------
  insert into orders (user_id, name, account_id, quote_id, total, status, order_date, notes) values
    (v_user_id, 'Acme Support Renewal Order', v_account_ids[1], v_quote_ids[5], 12000.00, 'delivered', '2025-06-01', 'Support active until 2026-06-01'),
    (v_user_id, 'Globex ToolKit Order',       v_account_ids[2], v_quote_ids[6], 9500.00,  'delivered', '2025-05-22', 'Shipped via FedEx - tracking #FX123456'),
    (v_user_id, 'Stark Analytics Order',      v_account_ids[5], v_quote_ids[4], 250000.00,'confirmed', '2025-07-15', 'License keys pending deployment'),
    (v_user_id, 'Initech Compliance Order',   v_account_ids[3], null,            85000.00, 'pending',   '2025-07-20', 'Pending payment - net 30 terms'),
    (v_user_id, 'Globex Cloud Order',         v_account_ids[2], v_quote_ids[2], 120000.00,'confirmed', '2025-07-10', 'Cloud migration scheduled for August');

  raise notice 'Mock data inserted successfully!';
end $$;
