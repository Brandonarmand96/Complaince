# Project audit and local implementation backlog

> **Implementation checklist superseded:** Use [ATOMIC_IMPLEMENTATION_TASKS.md](ATOMIC_IMPLEMENTATION_TASKS.md) for individual, very small implementation tasks. The phase tables below are a roadmap and audit reference only; do not execute an entire row as one task.

Audit date: 15 September 2026

## 1. Outcome and scope

The repository is a mostly read-only compliance demonstration, not yet a functional compliance management application. Preserve its reusable React components, tables, cards, badges, charts, and navigation concepts. Build the missing backend, security boundaries, persistence workflows, and editing experiences before expanding dashboards.

This document answers the request for an audit and small, ordered implementation tasks. It does not implement application features. The supplied production-platform prompt is the requirements baseline, with deployment infrastructure deferred as requested. All 30 product modules remain in scope; the prompt's four development phases alone do not cover them all.

### Evidence and verification limits

- Inspected all application route files through source reads/searches, shared data access, configuration, package manifest, and the single SQL migration.
- Found 16 page files and 18 database table definitions. No Express/Nest backend, Prisma schema, application API routes, test suite, or reproducible seed script was found.
- No application insert/update/delete/upsert/RPC calls were found in `app/` or `lib/`. Search/filter/drawer interactions exist, but business record mutations are absent.
- `npm.cmd run typecheck` failed because `tsc` is unavailable; `npm.cmd run lint` failed because `next` is unavailable. Dependencies are not installed in this workspace. These are environment failures, not confirmed TypeScript or lint defects.
- Build, browser behavior, database contents, deployed policies, and external services were not verified. An existing `.next` directory is not proof of a working current build.
- `.env` exists; its secret values were not inspected or reproduced. No `.env.example` or README was found.
- `git status --short` reported that this directory is not a Git repository. No source-control baseline could be verified.

## 2. Main findings

| Priority | Finding and source | Consequence / required action |
| --- | --- | --- |
| Critical | Migration lines 405–411 grant anonymous/authenticated SELECT, INSERT, UPDATE, DELETE with unrestricted predicates. | If applied, any caller with access to that database API can operate across tenants. Remove this policy model and put all tenant operations behind authenticated authorization. RLS being enabled does not make these policies restrictive. |
| Critical | `lib/data.ts:3` hardcodes one organization; `fetchProgramDetail` at line 59 fetches by ID without organization scope. Mapping queries are also unscoped. | Browser filters are not an isolation boundary. Derive tenant context from a verified session and membership; check every linked record. |
| High | `package.json` uses Next.js 13 and Supabase; no required application backend exists. | The specified Vite/Router, Express, Prisma, JWT/Argon2, Redis/BullMQ stack must be introduced. |
| High | The `users` table has one organization and a role string. Memberships, separate permissions, sessions and authentication flows are absent. | Consulting/client organizations, custom roles, external access and support approvals cannot be enforced. |
| High | `app/reports/page.tsx:31` only sets a two-second timer. Excel/CSV buttons have no handlers. Evidence Download likewise has no handler. | Reports and file access are presentation placeholders. Implement actual jobs, artifacts and authorized downloads. |
| High | `app/settings/page.tsx` contains uncontrolled defaults and switches without persistence. | MFA, timeout and password settings displayed there do not enforce security. |
| High | `app/programs/page.tsx:35` scores every program using all organization controls. Program detail scores the nested control status instead of program implementation status. | Different programs can show misleading or inconsistent scores. Calculate by applicable requirements and program scope on the server. |
| High | `lib/data.ts:78–111` uses a different control scale, credits unapproved evidence, and hardcodes audit preparedness to 65. Dashboard trend data and assessment count are static. | Readiness is not an explainable assessment result. Implement tested formulas, actual inputs and historical snapshots. |
| High | Evidence has one control foreign key and metadata only; policies have no content/version entities; responses have a single unconstrained finding ID. | Required evidence reuse, policy history and multiple findings per response cannot be represented correctly. |
| High | Tenant-owned join tables lack organization IDs; owner/reviewer fields are text; linked records are not constrained to the same tenant. | Cross-tenant relationships, ambiguous ownership and inconsistent histories need schema-level correction. |
| Medium | Data helpers discard Supabase errors and return empty arrays; pervasive `any` obscures contracts. | Failed requests can look like empty business data. Add typed API contracts, error states, retry and validation. |
| Medium | `next.config.js` skips build-time lint; no test scripts exist. | Introduce explicit quality gates and independently verify workflows. |

## 3. Local architecture and explicit assumptions

The prompt conflicts with itself: its stack section requests Node/Express, while later sections request NestJS and NestJS EventEmitter. Use **Express with TypeScript**, Prisma, and the requested modular controller/service/repository/DTO/policy/event/test separation. Use an in-process domain-event dispatcher plus a transactional outbox. Record this interpretation in an architecture decision; do not build two backends.

| Concern | Local implementation |
| --- | --- |
| Frontend | React 18+, Vite, React Router v6, TanStack Query, React Hook Form/Zod, Zustand, Tailwind/Shadcn, Recharts, TipTap, Vitest. Port reusable components from Next.js. |
| Backend | Express/TypeScript, Prisma, class-validator DTOs, JWT/Argon2, OpenAPI, Jest. Modules organized by domain. |
| Database | PostgreSQL installed locally. Neon hosting is deferred. Keep PostgreSQL semantics, full-text search and migrations. |
| Sessions and jobs | Local Redis and BullMQ with an independently runnable worker. Document a Windows-compatible local service setup. |
| Files | Encrypted files in a configured private local directory, outside public assets. Storage interface supports a future S3 adapter. Short-lived signed API download grants still require current authorization. |
| Email and channels | Local SMTP capture inbox; configurable channel adapters and local HTTP fixtures for Slack/Teams/webhooks/SMS. Capture delivery failures visibly. |
| Integrations and SSO | Implement contracts and provider adapters; local protocol/provider fixtures permit credential-free testing. Real provider validation is tracked separately and requires provider accounts/configuration. |
| Malware scanning | Local scanner adapter and quarantine workflow. Test fixtures exercise pass/fail/error; a fake scan must never count as a verified real scan. |
| Secrets | Local ignored environment files, validated at startup; encrypted integration credentials with an external-to-database development key. Never browser-expose server secrets. |
| Tooling | Simple npm workspaces: `apps/web`, `apps/api`, `apps/worker`, `packages/contracts`. Defer Turborepo/Nx orchestration. |

Defer Docker/Compose, reverse proxies, cloud hosting, managed Neon, S3/MinIO service deployment, CI/CD deployment, staging, production TLS termination, centralized telemetry infrastructure, managed secrets, container scanning and production disaster recovery. Keep application security, authorization, file encryption, job reliability, logs and local backup/restore instructions. Loopback HTTP is a documented development exception; production cookie/TLS behavior must remain configurable.

Full framework text and exact editions need authoritative, permitted source material. Seed catalog metadata for all 12 named frameworks; import validated requirement packs with provenance and counts. Clearly label illustrative demo requirements. Do not claim a complete licensed framework from invented examples.

## 4. Rules for each implementation task

Tasks below are ordered. Finish the earlier phase's gate before advancing; within a phase, use the listed order unless dependencies are already satisfied. Aim for a focused change taking roughly half a day to two developer days; integration adapters and complex editors should be split into smaller subtasks using the repeatable checklist below. These are planning sizes, not delivery promises.

Every feature task includes its schema migration, DTO/API/service/repository changes, permission enforcement, UI, audit event and relevant tests where applicable. A list page alone is not completion. Include all fields, enumerations and transitions from the corresponding prompt module; listed task summaries do not replace that specification.

**Definition of done:** data survives reload/restart; invalid inputs and unauthorized access fail on the server; tenant links are validated; users see loading/empty/error/success states; conflicting writes do not silently overwrite; workflow invariants are tested; OpenAPI and local documentation are updated. Never mark a stub, timer, fixture or decorative button as completed functionality.

## 5. Ordered implementation tasks

### Phase A — Reproducible local foundation

| ID | Small task | Acceptance check |
| --- | --- | --- |
| A01 | Create the architecture decision, source inventory and requirement checklist, including the Express/Nest conflict and local substitutions. | Every prompt module and deferred infrastructure item has an explicit destination. |
| A02 | Establish a source-control baseline if desired, validate the lockfile/install, and record baseline build/lint/typecheck failures. | Existing files are preserved and failures are reproducible. |
| A03 | Create npm workspaces, shared TypeScript configuration and root dev/build/lint/typecheck/test commands. | Each workspace starts independently; root scripts report failure correctly. |
| A04 | Port the app shell and existing routes to Vite/React Router; retain reusable UI and localize font assets. | Existing screen routes load without Next imports or remote font requests. |
| A05 | Bootstrap Express, validated environment config, health endpoints, Pino request logs and request IDs. | API starts on loopback; invalid configuration fails clearly without leaking secrets. |
| A06 | Configure local PostgreSQL/Prisma migrations and deterministic seed/reset commands for an explicitly named development database. | A clean database can be created and reseeded without touching unrelated databases. |
| A07 | Configure Redis/BullMQ worker, JobRecord, retries, backoff and deduplication. | A job survives API restart and records a terminal failure after bounded retries. |
| A08 | Add typed API client, Query provider, form conventions and frontend error boundaries. | A sample query/mutation handles validation errors, cache refresh and service outage. |
| A09 | Add consistent API envelopes, pagination/filter/sort allowlists, DTO validation, OpenAPI, rate limits and idempotency middleware. | Invalid fields/sorts are rejected and a repeated create key does not duplicate records. |
| A10 | Add Vitest/Jest harnesses, isolated PostgreSQL integration tests and browser end-to-end harness. | One positive and one negative API/browser test run through documented commands. |

Gate: a clean local setup starts web, API, worker, database and Redis; health checks and baseline tests pass.

### Phase B — Identity, organizations and access

| ID | Small task | Acceptance check |
| --- | --- | --- |
| B01 | Model User, Organization, Membership, Role, Permission, RolePermission and UserRole; seed all ten required roles. | One user can belong to multiple organizations with distinct roles. |
| B02 | Implement registration, login, Argon2 hashing, access JWTs and rotating refresh cookies. | Wrong credentials fail; replayed refresh tokens revoke the affected token family. |
| B03 | Implement session revocation, logout, login history, devices, lockout, timeout and suspicious-login events. | Suspended users and revoked sessions immediately lose access; events are visible. |
| B04 | Implement email verification and one-use expiring password reset using local email. | Expired/reused tokens fail and password reset revokes existing sessions. |
| B05 | Implement invite, accept, resend, expiry, account activation and all user statuses. | An invitation grants only its intended organization and role. |
| B06 | Implement TOTP MFA, recovery codes, MFA reset approval, password policy and breach-check adapter. | Required MFA cannot be bypassed; recovery codes are single-use. |
| B07 | Implement tenant context and membership-checked organization switching; remove hardcoded ORG_ID/browser database access. | A user in tenant A cannot read/write tenant B by changing IDs, headers or body fields. |
| B08 | Implement permission policies combining role, ownership, department and record scope; custom-role editor. | Auditor, vendor, employee and executive restrictions hold through direct API calls. |
| B09 | Build organization profile, departments, business units, locations and structured compliance scope. | Save/reload works; related users/assets/locations belong to the same organization. |
| B10 | Persist and enforce organization settings: branding, locale, retention, security, scoring and approval preferences. | Settings change actual behavior and unauthorized changes fail. |
| B11 | Implement consulting/client relationships and organization switcher with explicit client grants. | Consulting membership alone does not expose every client's records. |
| B12 | Build platform administration: organization/account status, subscription records, template/library management, health and approved expiring support access. | Super administrator cannot download customer evidence without a valid approved grant. Local billing records require no payment processor. |

Gate: two-tenant tests cover lists, detail reads, writes, joins, files, jobs and exports; role/scope denial tests pass. Infrastructure deferral does not waive this gate.

### Phase C — Shared workflow and history foundations

| ID | Small task | Acceptance check |
| --- | --- | --- |
| C01 | Build transaction-bound append-only AuditLog with actor/tenant/resource/diffs/IP/user agent/request ID; restrict DB write privileges. | Business mutation and log commit together; application credentials cannot edit/delete logs. |
| C02 | Add domain-event dispatcher and persistent outbox for all named prompt events. | Retried delivery does not duplicate downstream actions and crashes do not lose events. |
| C03 | Implement version snapshots and optimistic concurrency for supported entities. | Stale edits fail; restore creates a new version and preserves existing history. |
| C04 | Implement configurable workflow definitions, transitions, actors, deadlines and approval outcomes. | Invalid transitions and unauthorized/self-approval where prohibited are rejected. |
| C05 | Add threaded comments, mentions, reactions, attachments, visibility scopes and edit history. | Internal notes never appear in vendor/auditor API results, search or exports. |
| C06 | Build approvals inbox and activity history with resource permission checks. | Users only see and act on currently authorized pending items. |

Gate: feature modules can reuse real approval, event, history and collaboration services.

### Phase D — Frameworks, reusable controls and programs

| ID | Small task | Acceptance check |
| --- | --- | --- |
| D01 | Model Framework, Version, Domain and Requirement, global versus tenant-custom catalogs. | Published historical versions cannot be overwritten; tenant custom content remains private. |
| D02 | Add framework catalog/import validation and all 12 requested catalog entries. | Each entry reports edition, provenance, available requirement count and content completeness honestly. |
| D03 | Add custom framework/requirement editor and controlled version migration. | Programs can stay pinned to an older version; migration preserves past results. |
| D04 | Model UnifiedControl, scoped ControlImplementation and ControlOwner with all control metadata. | Ownership uses membership IDs; scope-specific implementation can be reused across programs. |
| D05 | Build control creation/editing/detail and lifecycle transitions, reviews, maturity and retesting. | Control owner submits; authorized reviewer approves; next review is scheduled. |
| D06 | Build mapping editor with all six mapping types, coverage, rationale, source and review approval. | One control maps to three frameworks without duplicating its implementation/evidence. |
| D07 | Build program creation and framework activation transaction. | Activation creates required scope/implementation/assessment/evidence-requirement links once, including on retry. |
| D08 | Build program scoping, ownership, dates, stages and detail views. | Program results include only relevant scope/version/requirements and support shared implementations. |

Gate: one approved control and its evidence can support ISO 27001, PCI DSS and NIST CSF simultaneously; framework-specific applicability remains independent.

### Phase E — Files, evidence and assessments

| ID | Small task | Acceptance check |
| --- | --- | --- |
| E01 | Build private local storage and File model: limits, extension/MIME/signature checks, safe filenames, hashes, duplicate detection and encryption. | Invalid uploads fail; files cannot be retrieved by guessing a disk/public URL. |
| E02 | Add quarantine and malware scanner worker with explicit pending/clean/infected/error states. | Unscanned, infected and scan-error files cannot be approved or downloaded normally. |
| E03 | Add signed download grants, current permission checks, access logs, preview restrictions, watermarking and retention actions. | Expired/revoked/cross-tenant links fail; supported preview formats apply restrictions. |
| E04 | Build evidence upload/metadata editor and immutable file versions. | Replacement preserves previous bytes, hash, owner and validity history. |
| E05 | Build evidence links to multiple controls, requirements, assessments, audits and business units plus assets/vendors. | Reuse does not copy files; unlinking one use preserves other links. |
| E06 | Build evidence requests and review with seven validation dimensions and reject/resubmit/archive flows. | Reviewer decisions include rationale and history; rejected evidence cannot count as approved. |
| E07 | Add evidence expiration, refresh schedules and reminders. | Time-based tests cover current, nearly expired and expired evidence without duplicate reminders. |
| E08 | Model assessment templates, sections, questions, instances and responses. | Support every specified assessment and response type with server validation. |
| E09 | Build assessment scope/assignment, response entry, attachments and submission workspace. | Assignees can edit their assigned responses until submitted; unrelated users cannot. |
| E10 | Add response review, N/A justification/approval, findings links and results approval. | N/A is excluded only after approval; one response can produce several findings. |

Gate: the requirement → control → evidence → assessment result chain is persisted and navigable, including rejection and resubmission paths.

### Phase F — Findings, tasks, CAPA and risk

| ID | Small task | Acceptance check |
| --- | --- | --- |
| F01 | Implement findings creation/detail, all types, severity, ownership, root cause and management response. | Findings link to assessment/audit/control/requirement and retain reviewed evidence references. |
| F02 | Enforce finding lifecycle and independent reviewer verification before closure. | A direct API request cannot close an unverified finding. |
| F03 | Build task create/edit, linked resources, assignees/collaborators, checklist, comments, attachments and progress. | Task changes persist and permissions follow both task and linked-resource scope. |
| F04 | Add parent/subtasks, blocking/approval dependencies and recurrence. | Dependency cycles are rejected; blocked work cannot bypass required approval. |
| F05 | Add task list, editable Kanban, calendar, timeline, My/Department/Overdue views. | Filters agree across views; timezone-aware overdue state is computed consistently. |
| F06 | Build CAPA records and containment/root-cause workspace supporting all four analysis methods. | One finding supports multiple corrective/preventive actions with separate owners. |
| F07 | Add CAPA plan approval, effectiveness tests, verification and closure approval. | Closing tasks alone cannot close CAPA without the required evidence/review. |
| F08 | Build full risk register, configurable likelihood/impact scales, asset/process/control links and heatmap. | Inherent/residual calculations are server-side and match configured thresholds. |
| F09 | Build risk assessment history and treatment plans, budget/resources/dates/success criteria. | Treatment progress links to controls/tasks/evidence and residual targets. |
| F10 | Build risk acceptance justification/approval/expiry and periodic review. | Risk creators cannot bypass designated acceptance authority; expired acceptance is surfaced. |

Gate: a failed assessment response can become a finding, risk and remediation task, then close only through authorized verification.

### Phase G — Policies, assets, vendors and employee work

| ID | Small task | Acceptance check |
| --- | --- | --- |
| G01 | Build policy metadata, TipTap content editor, templates and links to controls/risks/frameworks. | Sanitized content round-trips through the API; draft access is restricted. |
| G02 | Add policy review/comments/mentions, tracked changes, version comparison and publish/supersede/archive workflow. | Published history remains immutable; only authorized approved versions publish. |
| G03 | Add employee acknowledgments and re-acknowledgment for significant versions. | Acknowledgment stores exact policy version, statement, timestamp, IP and device. |
| G04 | Add policy PDF/Word exports and periodic review reminders. | Exported content matches the selected version and preserves readable formatting. |
| G05 | Build asset CRUD with every specified field/type, lifecycle and relationship graph. | Cross-tenant links fail and retired/disposed assets preserve historical references. |
| G06 | Build vendor CRUD, contacts, classification rules, dates, certifications and relationship links. | Risk tier is explainable from configured classification criteria. |
| G07 | Build vendor questionnaire templates/instances, document requests, scoring and reviewer feedback. | Answers/files/reviews are versioned and findings can create remediation. |
| G08 | Build restricted vendor portal and document library. | Vendor users see only their vendor's authorized questionnaires, documents and tasks. |
| G09 | Add contract/certificate/insurance/assessment/SLA review alerts. | Upcoming and overdue alerts use configured windows and deduplicate. |
| G10 | Build employee workspace for policies, assigned training/questionnaires and incident/risk submissions. | Employees can complete/report their work without gaining management permissions. |

Gate: governance records are actionable, versioned and connected to the compliance chain; external/employee views enforce visibility.

### Phase H — Audits

| ID | Small task | Acceptance check |
| --- | --- | --- |
| H01 | Build audit plan CRUD: all types, scope, objectives, criteria, team, auditees, schedule and dates. | Scope approval and team assignment enforce the requested lifecycle. |
| H02 | Build audit workspace, evidence requests, interview scheduling and test procedures. | Samples, examined evidence versions, test results, exceptions and conclusions persist. |
| H03 | Connect findings, management responses, report approval and closure tracking. | Audit conclusion/report history preserves the state actually reviewed. |
| H04 | Build external-auditor portal with selected-resource grants and automatic expiration. | Auditor can create only authorized audit comments/requests/findings; access expires without manual cleanup. |

Gate: a real audit runs from plan through tests, findings and approved report with restricted external access.

### Phase I — Scores, dashboards, reminders and search

| ID | Small task | Acceptance check |
| --- | --- | --- |
| I01 | Implement requirement scoring: weighted compliant/applicable weights, partial=0.5, approved N/A excluded. | Tests cover weights, unassessed requirements, all-N/A/zero denominator, partial mapping and duplicate mappings. |
| I02 | Implement separate implementation/effectiveness/freshness/remediation/readiness measures. | Evidence current=1, near expiry=.75, expired=.25, none=0; readiness uses 40/25/20/15 and actual audit preparedness. Unapproved evidence policy is explicit. |
| I03 | Add score explanations and immutable snapshots with formula version and underlying inputs. | Users can reproduce a score; framework migration/repeated evidence does not double-count compliance. |
| I04 | Build compliance manager, control owner, executive and auditor dashboards using scoped API aggregates. | Counts, trends, business-unit performance, aging and drilldowns reconcile to real data. |
| I05 | Build unified compliance calendar for assessments/reviews/audits/tasks/renewals. | Timezone, date filters and permissions match source records. |
| I06 | Build in-app notification inbox and all specified event templates. | Read/unread state persists and notifications link to authorized resources. |
| I07 | Add email, Slack, Teams, webhook and critical SMS channel adapters. | Local receivers capture deliveries, retries and failures; credentials stay server-side. |
| I08 | Add channel/frequency preferences, daily/weekly digest, quiet hours and escalation rules. | Time-controlled tests cover deferred delivery, urgent exceptions and increasing escalation. |
| I09 | Implement PostgreSQL full-text search across all ten requested entity types and all specified filters. | Search results/snippets exclude unauthorized records and internal comments. |

Gate: no hardcoded trends/counts/readiness remain; scores and reminders respond correctly to real workflow changes.

### Phase J — Reports and data movement

| ID | Small task | Acceptance check |
| --- | --- | --- |
| J01 | Build report request/history/status/download API with permission validation and BullMQ processing. | Jobs preserve requester/tenant/filter context and recheck access before artifact delivery. |
| J02 | Build shared branded report renderer: headings, charts/tables, signatures, page numbers and confidentiality. | Long tables and page breaks render correctly in a real generated PDF. |
| J03 | Add compliance/gap/evidence/control/readiness/statement-of-applicability templates, one template per subtask. | Each report reconciles with frozen source data and approved N/A decisions. |
| J04 | Add executive/risk-register/treatment/audit/findings/CAPA/vendor/policy/asset templates, one per subtask. | All requested report families generate real artifacts with filter/date coverage. |
| J05 | Add Excel and CSV exports for every required entity/report. | Exports respect tenant/field permissions and neutralize spreadsheet formula injection. |
| J06 | Build CSV/Excel/JSON import parsing, preview, column mapping and row-level validation. | Bad rows show actionable errors; upload/preview does not mutate business records. |
| J07 | Add confirmed background imports for frameworks/assets/risks/vendors/controls/users and result reports. | Repeated jobs are idempotent; partial-failure behavior and rollback policy are explicit. |

Gate: report buttons produce downloadable artifacts; imports require an explicit preview confirmation and report their actual outcome.

### Phase K — Identity providers, integrations and collection

Do not treat a generic adapter interface as completion of every named provider. Repeat provider subtasks and record separate local-contract-tested versus live-provider-validated status.

| ID | Small task | Acceptance check |
| --- | --- | --- |
| K01 | Build Integration/Credential/JobRecord management, encrypted secrets, health, cursor/checkpoint and reconnect handling. | Secrets are redacted; disconnect revokes credentials and cancels future collections. |
| K02 | Implement OIDC and SAML login/linking with local identity-provider fixtures. | Validate issuer/audience/signature/state/nonce or SAML equivalents; reject replay and unsafe account linking. |
| K03 | Add Microsoft Entra ID, Google Workspace, Okta and Auth0 SSO configuration/adapters, one per subtask. | Each passes protocol fixtures and documents live setup and verification prerequisites. |
| K04 | Implement scoped SCIM provisioning/deprovisioning and group-to-role mapping. | Deprovisioning revokes access and group sync cannot elevate beyond allowed roles. |
| K05 | Implement Entra/Google/Okta identity collection adapters, one per provider. | Collect user/MFA/dormant/admin/group data with pagination, least-scope configuration and retry tests. |
| K06 | Implement AWS/Azure/GCP collection adapters, one per provider. | Normalize encryption, networking, logging, backups and public-resource observations. |
| K07 | Implement GitHub/GitLab/Bitbucket/Jira/Azure DevOps adapters, one per provider. | Collect applicable branch/review/vulnerability/security-ticket/deployment/change data with provenance. |
| K08 | Implement documented ingest/connectors for SIEM, EDR, vulnerability scanners, ticketing and awareness systems, one category per subtask. | Payload validation, authentication, pagination/webhook replay protection and normalized results are tested. Name concrete supported products before claiming product-specific support. |
| K09 | Build automation rule registry and all ten named check types, one check per subtask. | Each has explicit input, pass/fail/unknown semantics, related controls and test fixtures. |
| K10 | Schedule evidence collection and preserve raw data, source, integration, time, result and next collection. | Collection is idempotent and versioned; unavailable data produces unknown/error, never a false pass. |

Gate: the complete application works locally with clearly labeled fixture providers. Real external integrations remain unverified until credentialed provider tests pass; this is not the same as omitting their implementation.

### Phase L — Completion and handover

| ID | Small task | Acceptance check |
| --- | --- | --- |
| L01 | Complete landing/pricing/documentation/login/register/reset/invitation pages and user profile. | Public and authenticated layouts are separate; no public route exposes tenant data. |
| L02 | Reconcile every required navigation route and complete accessibility/responsive/error-state checks. | No dead buttons/routes; keyboard dialogs, labels and focus work; tables/forms remain usable on small screens. |
| L03 | Finish version compare/restore for policies, controls, risks, assessments, frameworks, evidence metadata, findings, vendor assessments and reports. | Every required type supports authorized historical viewing and safe new-version restore where applicable. |
| L04 | Harden CSRF/cookies/CORS/headers/output encoding, field masking, request limits and link validation. | Tests cover forged requests, stored script content, ID substitution and unauthorized field changes. |
| L05 | Add local metrics/tracing for API/DB/jobs/storage/providers and operational views. | Correlate a failed report/collection to request/job ID without logging secrets. |
| L06 | Build repeatable FinSecure seed with the three-framework demo and a second tenant plus external users. | Fresh setup reproduces the scenario; demo data uses relative dates and clearly marked sample content. |
| L07 | Automate the complete 13-step FinSecure scenario below and regression denials. | Pass from a clean database; every change is observable after restart. |
| L08 | Run dependency/security checks, migration tests, permission matrix, job failure recovery and realistic-volume checks. | Fix findings or explicitly record unresolved blockers; verify pagination and bounded queries. |
| L09 | Write local installation/runbook, environment reference, demo accounts, architecture/schema/API docs and backup/restore instructions. | A second developer can start and restore the app using only documentation. |
| L10 | Reconcile all prompt fields/statuses/workflows/providers/reports with the acceptance checklist. | No module marked complete with missing required behavior; infrastructure and live-provider limitations are explicit. |

## 6. All 30 modules mapped to the backlog

| Prompt module | Current state in supplied source | Implementation tasks |
| --- | --- | --- |
| 1 Organization | Partial schema, static settings | B09–B12 |
| 2 Users/access | Read-only directory; no identity enforcement | B01–B08, K02–K05 |
| 3 Frameworks | Read-only catalog; version string only | D01–D03 |
| 4 Unified controls | List/detail and partial schema | D04–D05 |
| 5 Mapping | Displayable join records | D06 |
| 6 Programs | List/detail; no creation; incorrect score scope | D07–D08, I01–I04 |
| 7 Gap assessment | Summary list and partial response schema | E08–E10 |
| 8 Evidence | Metadata cards/detail, no working upload/download | E01–E07 |
| 9 Risk | Register/heatmap/detail and basic generated scores | F08–F10 |
| 10 Audit | Missing | H01–H04 |
| 11 Findings | Read-only list/detail | F01–F02 |
| 12 CAPA | Missing; corrective-action text is not CAPA | F06–F07 |
| 13 Tasks | Read-only board | F03–F05 |
| 14 Policies | Read-only metadata cards | G01–G04 |
| 15 Assets | Read-only inventory | G05 |
| 16 Vendors | Read-only cards | G06–G09 |
| 17 Dashboards | One demo dashboard with static values | I04 |
| 18 Score engine | Incomplete client formulas/placeholders | I01–I03 |
| 19 Notifications | Decorative icon/settings | I06–I08 |
| 20 Audit logging | Missing | C01, L05 |
| 21 Version history | Scalar version fields only | C03, L03 |
| 22 Search | In-page filters; global input unwired | I09 |
| 23 Reports | Catalog and simulated generation | J01–J05 |
| 24 File security | Missing | E01–E03 |
| 25 Workflow engine | Missing | C04, C06 |
| 26 Collaboration | Missing | C05 |
| 27 Import/export | Missing | J05–J07 |
| 28 Integrations | Missing | K01–K08, I07 |
| 29 Automated collection | Missing | K09–K10 |
| 30 API architecture | Browser-to-Supabase queries only | A05, A09 and all domain feature tasks |

## 7. Database and domain design checklist

Implement the prompt's complete model list incrementally in the owning feature tasks. Additional required supporting models include sessions/refresh tokens, invites/MFA recovery, support/external grants, framework migration records, workflow definitions/instances/actions, outbox events, score snapshots and import runs/rows.

- Every tenant-owned entity, including join/version/comment/job records, carries `organizationId`. Global framework/template catalogs are explicitly separate and have restricted write permissions.
- Use composite tenant-safe foreign keys or equivalent database-enforced constraints for tenant relations, with server checks as well. UUIDs alone are not access control.
- User has many memberships, membership has role grants, and ownership references a membership rather than a display name.
- Separate framework version/requirement, unified definition, scoped implementation and program applicability. Reuse one implementation when scope matches; allow separate implementations for genuinely different scope.
- Evidence versions have many-to-many links rather than a single `control_id`. Reports/audits retain the exact reviewed versions.
- Assessment response has zero-to-many findings via a proper relation. Finding has many corrective/preventive actions; risk/control, policy/control and asset/risk relations are explicit.
- Scope all background jobs, downloads, imports, exports, notifications and search. Never trust an organization ID just because it came from a queued payload.
- Use typed enums/validated transitions, uniqueness constraints, timestamps, concurrency versions and appropriate indexes. Preserve historical compliance records instead of cascading destructive deletion through approved artifacts.

## 8. Final demonstration acceptance test

Run this with actual UI/API persistence, not seeded screenshots:

1. Create FinSecure Technologies Ltd. with complete profile and business units.
2. Invite and activate the compliance team with distinct permissions.
3. Activate ISO 27001, PCI DSS and NIST CSF programs with versioned scope.
4. Map one unified access-review control to all three framework requirement sets.
5. Conduct an assessment: assign questions, submit responses and review justified N/A.
6. Upload a real file, scan it, complete metadata, link it and approve its evidence.
7. Create and score a risk for a failed/missing control.
8. Assign remediation tasks and track dependency-aware progress.
9. Plan an audit and record samples, evidence and test conclusions.
10. Raise a finding and collect the owner's management response.
11. Complete CAPA, verify effectiveness independently and approve closure.
12. Generate and download a branded readiness PDF and Excel/CSV data.
13. Show before/after scores with their actual inputs and calculation explanations.

Additionally prove that tenant B, an unrelated vendor, an expired auditor and an unapproved support administrator cannot access FinSecure evidence. Restart the local services and confirm state/history survive.

## 9. Recommended execution

Start with **A01–A10**, then identity/security, then frameworks → evidence → assessments → remediation. Treat the end of Phase F as the first useful compliance workflow milestone; it is not full prompt completion. Complete governance/audits/reporting/integrations and the final acceptance gates afterward.

For any repeated provider/report/check task, split it into: contract and fixtures → implementation → user configuration/error states → permission/failure tests → documentation and validation status. This keeps individual changes small while preserving the full requested scope.

Suggested next implementation instruction: “Implement Phase A of docs/LOCAL_IMPLEMENTATION_PLAN.md. Preserve reusable components, use the documented local stack, record validation results, and do not mark later feature tasks complete.”
