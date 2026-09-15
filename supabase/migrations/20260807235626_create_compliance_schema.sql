/*
# Security Compliance Management Platform — Core Schema

This migration creates the foundational schema for a Security Compliance Management Platform
built around the core architectural principle: unified controls mapped to multiple compliance
frameworks simultaneously, connected to evidence, assessment results, findings, risks, and
remediation tasks.

## 1. New Tables

### Organization & Users
- `organizations` — tenant root: company profile (name, industry, country, etc.)
- `users` — platform users (denormalized from auth.users for profile display)
- `departments` — business units / departments within an organization

### Frameworks
- `frameworks` — compliance framework library (ISO 27001, PCI DSS, NIST CSF, etc.)
- `framework_requirements` — individual requirements/clauses within a framework version

### Unified Controls
- `controls` — the unified control library: one implemented control that can map to many frameworks
- `control_mappings` — links a unified control to one or more framework requirements (the key differentiator)

### Compliance Programs
- `programs` — a compliance program: an organization's adoption of a framework
- `program_controls` — per-program implementation status of each control

### Evidence
- `evidence` — evidence items linked to controls (metadata only — no file blobs in this demo)

### Assessments
- `assessments` — gap/readyiness assessments against a program
- `assessment_responses` — per-requirement responses within an assessment

### Findings & Remediation
- `findings` — audit findings raised from assessments or audits
- `risks` — risk register entries
- `tasks` — remediation / work tasks

### Policies
- `policies` — policy documents with lifecycle status

### Vendors & Assets
- `vendors` — third-party vendor register
- `assets` — asset inventory

## 2. Security
- RLS enabled on every table.
- This is a demo with a single seeded organization and no sign-in screen, so policies use
  `TO anon, authenticated` with `USING (true)` — the data is intentionally shared for the demo.
  In a production multi-tenant app these would be scoped to `organization_id` per the authenticated
  session.
*/

-- ============================================================
-- Organization & Users
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  country text,
  website text,
  logo_url text,
  employee_count int,
  time_zone text DEFAULT 'UTC',
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  head text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL,
  department text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Frameworks
-- ============================================================

CREATE TABLE IF NOT EXISTS frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text NOT NULL,
  publisher text,
  description text,
  effective_date date,
  requirements_count int DEFAULT 0,
  color text DEFAULT '#2563eb',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS framework_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  ref text NOT NULL,
  title text NOT NULL,
  domain text,
  description text,
  weight numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Unified Controls (the core differentiator)
-- ============================================================

CREATE TABLE IF NOT EXISTS controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  control_id text NOT NULL,
  title text NOT NULL,
  description text,
  objective text,
  type text,
  category text,
  frequency text,
  owner text,
  reviewer text,
  department text,
  status text NOT NULL DEFAULT 'Not started',
  maturity int DEFAULT 0,
  effectiveness int DEFAULT 0,
  implementation_guidance text,
  testing_procedure text,
  last_review_date date,
  next_review_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS control_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES framework_requirements(id) ON DELETE CASCADE,
  mapping_strength text DEFAULT 'Full',
  coverage_pct int DEFAULT 100,
  rationale text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Compliance Programs
-- ============================================================

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  framework_id uuid NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  owner text,
  scope text,
  stage text DEFAULT 'Planning',
  status text DEFAULT 'Active',
  target_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  implementation_status text DEFAULT 'Not started',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (program_id, control_id)
);

-- ============================================================
-- Evidence
-- ============================================================

CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  control_id uuid REFERENCES controls(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  evidence_type text,
  owner text,
  file_name text,
  file_size bigint,
  collection_date date,
  valid_from date,
  valid_until date,
  review_frequency_days int DEFAULT 365,
  approval_status text DEFAULT 'Pending review',
  confidentiality text DEFAULT 'Internal',
  version_number int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Assessments
-- ============================================================

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  assessor text,
  status text DEFAULT 'Created',
  score numeric,
  start_date date,
  due_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES framework_requirements(id) ON DELETE SET NULL,
  control_id uuid REFERENCES controls(id) ON DELETE SET NULL,
  response text,
  status text DEFAULT 'Not assessed',
  score numeric,
  reviewer_comment text,
  finding_id uuid,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Findings & Remediation
-- ============================================================

CREATE TABLE IF NOT EXISTS findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  control_id uuid REFERENCES controls(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  type text,
  severity text,
  root_cause text,
  owner text,
  auditor text,
  management_response text,
  corrective_action text,
  status text DEFAULT 'Open',
  due_date date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  risk_id text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  threat text,
  vulnerability text,
  owner text,
  likelihood int DEFAULT 3,
  impact int DEFAULT 3,
  inherent_risk int GENERATED ALWAYS AS (likelihood * impact) STORED,
  treatment text DEFAULT 'Mitigate',
  treatment_plan text,
  residual_likelihood int DEFAULT 2,
  residual_impact int DEFAULT 2,
  residual_risk int GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED,
  review_date date,
  status text DEFAULT 'Identified',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text,
  priority text DEFAULT 'Medium',
  owner text,
  related_object text,
  related_id uuid,
  status text DEFAULT 'Backlog',
  due_date date,
  progress int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Policies, Vendors, Assets
-- ============================================================

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  number text,
  category text,
  owner text,
  approver text,
  version text DEFAULT '1.0',
  status text DEFAULT 'Draft',
  effective_date date,
  review_date date,
  classification text DEFAULT 'Internal',
  acknowledgment_count int DEFAULT 0,
  total_acknowledgments_required int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  service_provided text,
  business_owner text,
  criticality text DEFAULT 'Medium',
  data_access text,
  systems_access text,
  risk_rating text DEFAULT 'Medium',
  contract_start date,
  contract_end date,
  security_review_date date,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  owner text,
  custodian text,
  department text,
  location text,
  ip_address text,
  hostname text,
  environment text,
  data_classification text DEFAULT 'Internal',
  criticality text DEFAULT 'Medium',
  lifecycle_status text DEFAULT 'Deployed',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_controls_organization ON controls(organization_id);
CREATE INDEX IF NOT EXISTS idx_control_mappings_control ON control_mappings(control_id);
CREATE INDEX IF NOT EXISTS idx_control_mappings_requirement ON control_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_program_controls_program ON program_controls(program_id);
CREATE INDEX IF NOT EXISTS idx_evidence_control ON evidence(control_id);
CREATE INDEX IF NOT EXISTS idx_findings_org ON findings(organization_id);
CREATE INDEX IF NOT EXISTS idx_risks_org ON risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org ON tasks(organization_id);

-- ============================================================
-- RLS — demo mode: shared data, no sign-in screen.
-- Production would scope by organization_id per authenticated session.
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Demo: all tables readable/writable by anon + authenticated.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'organizations','departments','users','frameworks','framework_requirements',
    'controls','control_mappings','programs','program_controls','evidence',
    'assessments','assessment_responses','findings','risks','tasks',
    'policies','vendors','assets'
  ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "demo_select" ON %I;', t);
    EXECUTE format('CREATE POLICY "demo_select" ON %I FOR SELECT TO anon, authenticated USING (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "demo_insert" ON %I;', t);
    EXECUTE format('CREATE POLICY "demo_insert" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "demo_update" ON %I;', t);
    EXECUTE format('CREATE POLICY "demo_update" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);', t);
    EXECUTE format('DROP POLICY IF EXISTS "demo_delete" ON %I;', t);
    EXECUTE format('CREATE POLICY "demo_delete" ON %I FOR DELETE TO anon, authenticated USING (true);', t);
  END LOOP;
END $$;
