# Very small implementation tasks — local compliance platform

**This is the active implementation backlog.** It replaces the oversized implementation rows in `LOCAL_IMPLEMENTATION_PLAN.md`. Keep that document for the audit, architecture decisions, local substitutions and module coverage.

There are **942 unchecked tasks in 49 groups**. The size of the list reflects the complete 30-module prompt; it is not a suggestion to implement hundreds of changes in one turn.

## How to execute

- Start with T0001. A request to implement one task means one checkbox, not its whole group.
- Work in the displayed order. `After` is the conservative execution predecessor: earlier schema/API work is available before dependent UI. Independent groups may later be reordered after checking actual dependencies.
- Aim for 30–90 minutes of implementation per checkbox. Security/protocol tasks can take longer; this is a sizing target, not a time promise.
- If a row requires more than one independent behavior, split it into child IDs (for example T0042a/T0042b) before implementation. Preserve the original ID as the parent and check it only when its children pass.
- Each row has one deliverable and an observable completion check. Endpoint tasks include their focused authorization/validation test and OpenAPI entry; these are completion criteria for the endpoint.
- Do not separately add tests for trivial configuration or tests that only mirror code. Test meaningful state transitions, calculations, permissions and failure behavior.
- Mark a checkbox only after the change works. Keep a short completion note with files changed, verification and remaining limitations.
- Existing UI is reusable; port a component when the corresponding row calls for it. Do not rewrite all screens in a setup task.

## Scope retained

Use the supplied prompt's exact fields, enums, roles and workflows. Target React/Vite/Router, Express/TypeScript, Prisma/local PostgreSQL, local Redis/BullMQ, encrypted private local files and a local email inbox. The architecture decision resolves the prompt's Express/Nest inconsistency. Docker, reverse proxies, hosted services, deployment pipelines and production infrastructure remain deferred.

Local tests may use clearly labeled provider fixtures. They do not establish live provider correctness. Provider credentials and permitted framework source packs are real external prerequisites; unavailable ones must be recorded, not silently replaced by fabricated data.

## Group index

| Group | Scope | Task IDs | Count | Previous roadmap reference |
| --- | --- | --- | --- | --- |
| 01 | Local setup: one change at a time | T0001–T0037 | 37 | A01–A10 |
| 02 | Identity tables and login | T0038–T0066 | 29 | B01–B06 |
| 03 | Account recovery, invitations and MFA | T0067–T0092 | 26 | B04–B06 |
| 04 | Tenant and permission enforcement | T0093–T0110 | 18 | B07–B08, B11–B12 |
| 05 | Audit events, workflow primitives and history | T0111–T0139 | 29 | C01–C06 |
| 06 | Declare domain tables before their APIs | T0140–T0161 | 22 | D01–D08, domain model tasks |
| 07 | Organization and administration records | T0162–T0171 | 10 | B09–B10, B12 |
| 08 | Business units | T0172–T0181 | 10 | B09 |
| 09 | Departments | T0182–T0191 | 10 | B09 |
| 10 | Locations | T0192–T0201 | 10 | B09 |
| 11 | Framework catalog | T0202–T0211 | 10 | D01–D03 |
| 12 | Unified control records | T0212–T0221 | 10 | D04–D05 |
| 13 | Framework versions and mapping | T0222–T0258 | 37 | D01–D08 |
| 14 | Compliance program records | T0259–T0268 | 10 | D07–D08 |
| 15 | Risk register records | T0269–T0278 | 10 | F08–F10 |
| 16 | Asset inventory records | T0279–T0288 | 10 | G05 |
| 17 | Vendor register records | T0289–T0298 | 10 | G06–G09 |
| 18 | Finding records | T0299–T0308 | 10 | F01–F02 |
| 19 | Task records | T0309–T0318 | 10 | F03–F05 |
| 20 | Policy metadata records | T0319–T0328 | 10 | G01–G04 |
| 21 | Audit plan records | T0329–T0338 | 10 | H01–H04 |
| 22 | Roles, settings and scope editors | T0339–T0354 | 16 | B08–B12 |
| 23 | Program activation and stage actions | T0355–T0359 | 5 | D07–D08 |
| 24 | Secure file upload and download | T0360–T0379 | 20 | E01–E03 |
| 25 | Evidence records and review | T0380–T0404 | 25 | E04–E07 |
| 26 | Assessment questions and responses | T0405–T0434 | 30 | E08–E10 |
| 27 | Findings, remediation and CAPA actions | T0435–T0472 | 38 | F01–F07 |
| 28 | Risk scoring, treatment and acceptance | T0473–T0490 | 18 | F08–F10 |
| 29 | Policy content and acknowledgments | T0491–T0517 | 27 | G01–G04 |
| 30 | Asset relations and vendor due diligence | T0518–T0548 | 31 | G05–G10 |
| 31 | Audit workspace and temporary auditor access | T0549–T0569 | 21 | H01–H04 |
| 32 | Score calculations and dashboard widgets | T0570–T0594 | 25 | I01–I05 |
| 33 | Notifications and global search | T0595–T0616 | 22 | I06–I09 |
| 34 | Report pipeline and exports | T0617–T0640 | 24 | J01–J07 |
| 35 | One report template per task | T0641–T0655 | 15 | J03–J04 |
| 36 | One export endpoint per record type | T0656–T0679 | 24 | J05 |
| 37 | One import mapping per record type | T0680–T0685 | 6 | J07 |
| 38 | One notification event handler per task | T0686–T0698 | 13 | I06 |
| 39 | Integration and identity protocol foundations | T0699–T0718 | 20 | K01–K04 |
| 40 | Microsoft Entra ID SSO adapter | T0719–T0722 | 4 | K03 |
| 41 | Google Workspace SSO adapter | T0723–T0726 | 4 | K03 |
| 42 | Okta SSO adapter | T0727–T0730 | 4 | K03 |
| 43 | Auth0 SSO adapter | T0731–T0734 | 4 | K03 |
| 44 | Provider collection adapters: one concern per task | T0735–T0825 | 91 | K05–K07 |
| 45 | Security-system ingest adapters | T0826–T0840 | 15 | K08 |
| 46 | Automated evidence checks | T0841–T0864 | 24 | K09–K10 |
| 47 | Version history per entity | T0865–T0891 | 27 | C03, L03 |
| 48 | Public pages, local quality checks and handover | T0892–T0924 | 33 | L01–L10 |
| 49 | FinSecure demonstration: one scenario step per task | T0925–T0942 | 18 | L06–L07 |

## Task checklist

The source folders named below are planned locations, not claims that the backend already exists: `apps/web`, `apps/api`, `apps/worker`, and `packages/contracts`.

### 01. Local setup: one change at a time

Roadmap reference: A01–A10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [x] | T0001 | Record the Express-versus-Nest decision in one architecture note. | Completed: [ADR 0001](architecture/0001-backend-framework.md) selects Express/TypeScript, identifies the conflicting NestJS requirements and documents implementation equivalents. Documentation reviewed against the local plan; no runtime change. | Start |
| [x] | T0002 | Create the root npm workspace manifest. | Completed: root package.json declares apps/* and packages/*; package-lock.json root metadata matches. Verified with npm pkg get workspaces and Node assertions for workspace/dependency consistency and private status. Existing source/scripts/dependencies preserved; child packages begin at T0003. | T0001 |
| [ ] | T0003 | Create apps/web/package.json with React, TypeScript and Vite. | The web workspace exposes a dev command. | T0002 |
| [ ] | T0004 | Add the Vite entry HTML and React root. | A placeholder renders at localhost. | T0003 |
| [ ] | T0005 | Copy the existing Tailwind theme and Shadcn configuration into apps/web. | A sample existing button keeps its current styling. | T0004 |
| [ ] | T0006 | Add React Router v6 and an empty authenticated shell route. | A direct URL reload resolves through Vite. | T0005 |
| [ ] | T0007 | Port the sidebar component and replace Next Link usage. | Each current navigation item uses React Router. | T0006 |
| [ ] | T0008 | Port the topbar and replace usePathname. | The title follows the current route. | T0007 |
| [ ] | T0009 | Port the existing shared badges and score ring. | The components render with explicit prop types. | T0008 |
| [ ] | T0010 | Create apps/api/package.json and TypeScript build configuration. | The empty API workspace compiles. | T0009 |
| [ ] | T0011 | Add Express startup and GET /health/live. | It returns 200 on the configured loopback port. | T0010 |
| [ ] | T0012 | Add API environment validation and .env.example. | Missing DATABASE_URL fails with a readable message and no secret output. | T0011 |
| [ ] | T0013 | Add the web environment example containing only its API URL. | The browser bundle receives no database or signing secret. | T0012 |
| [ ] | T0014 | Add Prisma configuration for local PostgreSQL. | Prisma connects to the explicitly named development database. | T0013 |
| [ ] | T0015 | Add GET /health/ready with a database check. | Database outage produces a non-ready response. | T0014 |
| [ ] | T0016 | Create packages/contracts with one shared error-response type. | Both web and API import it successfully. | T0015 |
| [ ] | T0017 | Add Pino request logging and generated request IDs. | A request returns the same ID that appears in its log. | T0016 |
| [ ] | T0018 | Add the shared Express error handler. | Unexpected errors return a consistent envelope without a stack trace. | T0017 |
| [ ] | T0019 | Add the class-validator request-validation helper. | Unknown and invalid fields produce field-level 400 errors. | T0018 |
| [ ] | T0020 | Add bounded pagination parsing. | Negative limits and oversized pages are rejected or clamped by the documented rule. | T0019 |
| [ ] | T0021 | Add sort/filter allowlist parsing. | Unrecognized sort columns never reach a query. | T0020 |
| [ ] | T0022 | Add OpenAPI serving at /api/docs. | The health endpoint appears in a readable document. | T0021 |
| [ ] | T0023 | Add the frontend fetch wrapper. | Non-2xx responses become typed errors rather than empty data. | T0022 |
| [ ] | T0024 | Add TanStack Query provider. | A sample health query reports success and failure. | T0023 |
| [ ] | T0025 | Add the React Hook Form/Zod field-error wrapper. | A sample invalid field shows its server/client error. | T0024 |
| [ ] | T0026 | Add Zustand for transient UI preferences only. | Sidebar preference does not duplicate server records. | T0025 |
| [ ] | T0027 | Add the frontend loading/error boundary component. | A failed query offers an actual retry action. | T0026 |
| [ ] | T0028 | Add local Redis configuration and connectivity check. | An unavailable Redis service has a readable diagnostic. | T0027 |
| [ ] | T0029 | Create the worker workspace and one BullMQ queue. | A manually enqueued health job is processed. | T0028 |
| [ ] | T0030 | Add job attempt/status persistence in JobRecord. | A failing health job records attempts and final failure. | T0029 |
| [ ] | T0031 | Add bounded retry/backoff and job deduplication. | Re-enqueuing the same health job key creates no duplicate effect. | T0030 |
| [ ] | T0032 | Add Vitest configuration for web. | One behavior test runs with the web test command. | T0031 |
| [ ] | T0033 | Add Jest configuration for API. | One request validation test runs with the API test command. | T0032 |
| [ ] | T0034 | Add a separate test-database environment guard. | Integration tests refuse the configured non-test database. | T0033 |
| [ ] | T0035 | Add a browser test runner and one shell smoke test. | The test opens the local web app and checks its heading. | T0034 |
| [ ] | T0036 | Add root dev/build/typecheck/lint/test scripts. | Each script exits nonzero when its workspace command fails. | T0035 |
| [ ] | T0037 | Write the local PostgreSQL/Redis/startup instructions. | The instructions identify ports, commands and Windows prerequisites. | T0036 |

### 02. Identity tables and login

Roadmap reference: B01–B06.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0038 | Add the User model and normalized unique email field. | Case variants cannot create duplicate identities. | T0037 |
| [ ] | T0039 | Add the Organization model. | Organizations receive independent IDs. | T0038 |
| [ ] | T0040 | Add OrganizationMembership with status and tenant-safe uniqueness. | One user can join two organizations once each. | T0039 |
| [ ] | T0041 | Add Role, Permission and RolePermission models. | Roles can share independent permission records. | T0040 |
| [ ] | T0042 | Add membership-to-role grants. | The same user can have different roles in different organizations. | T0041 |
| [ ] | T0043 | Seed the ten named roles and their permission matrix. | Every role from the prompt has explicit allowed actions. | T0042 |
| [ ] | T0044 | Add Argon2 password hash/verify helpers. | Stored credentials are hashes and invalid passwords fail verification. | T0043 |
| [ ] | T0045 | Add POST /auth/register. | A valid registration creates the identity and initial organization transactionally. | T0044 |
| [ ] | T0046 | Add POST /auth/login with generic credential errors. | Valid credentials authenticate; failures do not reveal whether an email exists. | T0045 |
| [ ] | T0047 | Add access-JWT issue/verify helpers. | Wrong issuer, audience, signature and expired tokens fail. | T0046 |
| [ ] | T0048 | Add refresh-token-family storage. | Only a hash of each refresh secret is stored. | T0047 |
| [ ] | T0049 | Add POST /auth/refresh with rotation. | Using an old refresh token revokes that token family. | T0048 |
| [ ] | T0050 | Add authenticated request middleware. | Protected handlers receive a verified user identity. | T0049 |
| [ ] | T0051 | Add POST /auth/logout. | The current refresh session is revoked. | T0050 |
| [ ] | T0052 | Add GET /auth/me. | The response contains allowed identity/membership fields only. | T0051 |
| [ ] | T0053 | Build the registration form. | Successful submission opens the correct next onboarding step. | T0052 |
| [ ] | T0054 | Build the login form. | It handles invalid credentials and successful login. | T0053 |
| [ ] | T0055 | Add client session bootstrap and expired-session handling. | Reload restores a valid session; an expired one returns to login. | T0054 |
| [ ] | T0056 | Add refresh-cookie development/production configuration. | HttpOnly and SameSite settings are explicit; secure transport is required outside local development. | T0055 |
| [ ] | T0057 | Add the Session model's device/IP/last-seen fields. | Session metadata is recorded without storing raw secrets. | T0056 |
| [ ] | T0058 | Add GET /auth/sessions. | A user sees only their sessions. | T0057 |
| [ ] | T0059 | Add DELETE /auth/sessions/:id. | Revoking another user's session is rejected. | T0058 |
| [ ] | T0060 | Build the active-session list with revoke action. | A revoked session disappears after server confirmation. | T0059 |
| [ ] | T0061 | Add failed-login counters and lockout expiry. | Repeated failed login blocks attempts until the defined reset condition. | T0060 |
| [ ] | T0062 | Add authentication route rate limiting. | Excessive attempts return 429. | T0061 |
| [ ] | T0063 | Add inactive/locked/suspended-account checks. | Existing tokens cannot bypass a changed account status. | T0062 |
| [ ] | T0064 | Add inactivity-timeout checks. | An idle session beyond the configured limit is rejected. | T0063 |
| [ ] | T0065 | Add LoginHistory records. | Successful and failed attempts record outcome and request context. | T0064 |
| [ ] | T0066 | Add a suspicious-login rule for a new device. | A matching login creates a security event without blocking every new device. | T0065 |

### 03. Account recovery, invitations and MFA

Roadmap reference: B04–B06.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0067 | Add an SMTP transport configured for a local capture inbox. | A test message appears locally without contacting a real recipient. | T0066 |
| [ ] | T0068 | Add one-use email-verification token storage. | Only a token hash and expiration are persisted. | T0067 |
| [ ] | T0069 | Add the email-verification request action. | The local inbox receives the activation URL. | T0068 |
| [ ] | T0070 | Add the email-verification consume action. | Expired and reused tokens fail. | T0069 |
| [ ] | T0071 | Build the verification-result page. | It shows success or a recoverable expired-token state. | T0070 |
| [ ] | T0072 | Add password-reset request action. | It returns the same public result for known and unknown emails. | T0071 |
| [ ] | T0073 | Add password-reset completion action. | A successful reset revokes previous sessions and consumes the token. | T0072 |
| [ ] | T0074 | Build reset-request form. | Valid input sends one request and displays the neutral confirmation. | T0073 |
| [ ] | T0075 | Build new-password form. | Token errors and password-policy errors appear inline. | T0074 |
| [ ] | T0076 | Add Invitation model with tenant, role grants, expiry and status. | An invite cannot refer to a role outside its organization. | T0075 |
| [ ] | T0077 | Add POST /invitations. | Only a permitted inviter can select allowed roles. | T0076 |
| [ ] | T0078 | Add invitation resend action. | Resending invalidates the prior token. | T0077 |
| [ ] | T0079 | Add invitation acceptance action. | The user joins only the invited organization with the intended grants. | T0078 |
| [ ] | T0080 | Build invite-user form. | It displays only roles the inviter can assign. | T0079 |
| [ ] | T0081 | Build invitation-acceptance page. | It handles existing and new identities without duplicate memberships. | T0080 |
| [ ] | T0082 | Add user-status transition action. | Invalid transitions among the specified statuses are rejected. | T0081 |
| [ ] | T0083 | Add encrypted TOTP secret storage and enrollment action. | Enrollment returns setup data without marking MFA active. | T0082 |
| [ ] | T0084 | Add TOTP enrollment confirmation. | MFA activates only after a valid code. | T0083 |
| [ ] | T0085 | Add MFA challenge after password login. | Protected access is unavailable before a successful challenge. | T0084 |
| [ ] | T0086 | Generate and store hashed recovery codes. | Each code works only once. | T0085 |
| [ ] | T0087 | Build MFA setup screen. | The user can confirm enrollment and save recovery codes. | T0086 |
| [ ] | T0088 | Build MFA challenge screen. | A valid TOTP or unused recovery code completes login. | T0087 |
| [ ] | T0089 | Add MFA reset-request endpoint. | It creates a pending request and grants no bypass by itself. | T0088 |
| [ ] | T0090 | Add MFA reset-approval endpoint. | Only the designated approver can reset enrollment; existing sessions are revoked. | T0089 |
| [ ] | T0091 | Enforce organization password-length/complexity settings. | Registration/reset reject passwords outside the effective policy. | T0090 |
| [ ] | T0092 | Add a password-breach-check interface and local fixture implementation. | Known-compromised fixture passwords fail; provider unavailability follows a documented policy. | T0091 |

### 04. Tenant and permission enforcement

Roadmap reference: B07–B08, B11–B12.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0093 | Resolve active organization from a verified session membership. | An arbitrary body organizationId never becomes tenant context. | T0092 |
| [ ] | T0094 | Add POST /auth/switch-organization. | Switching requires an active membership and updates the session context. | T0093 |
| [ ] | T0095 | Build the organization switcher. | Only authorized organizations appear. | T0094 |
| [ ] | T0096 | Add a tenant-scoped repository base helper. | A tenant query cannot be called without a tenant context. | T0095 |
| [ ] | T0097 | Add the permission-check helper. | Missing permissions return 403 before mutation. | T0096 |
| [ ] | T0098 | Add owner and department-scope policy helpers. | Permission alone cannot bypass record scope. | T0097 |
| [ ] | T0099 | Add explicit vendor/auditor field projection helpers. | Internal-only fields are absent, not merely hidden by the UI. | T0098 |
| [ ] | T0100 | Add a two-tenant ID-substitution integration test. | Tenant A cannot fetch or modify tenant B's sample record. | T0099 |
| [ ] | T0101 | Add ConsultingClientGrant model. | Parent organization membership does not imply client access. | T0100 |
| [ ] | T0102 | Add the client-access grant action. | Only authorized client grants allow organization switching. | T0101 |
| [ ] | T0103 | Add SupportAccessRequest model with resources and expiration. | A request confers no access by itself. | T0102 |
| [ ] | T0104 | Add support-access approval action. | Only the customer's designated approver grants access. | T0103 |
| [ ] | T0105 | Add support-access revocation action. | An existing support session loses the revoked resource access. | T0104 |
| [ ] | T0106 | Add support-grant expiry enforcement. | Expired grants fail even if a background cleanup has not run. | T0105 |
| [ ] | T0107 | Add platform administrator evidence denial policy. | Platform role without a valid support grant cannot read customer evidence. | T0106 |
| [ ] | T0108 | Add platform organization-disable action. | It requires platform authority and records the reason. | T0107 |
| [ ] | T0109 | Add subscription metadata model and local update endpoint. | Subscription records persist without requiring a payment provider. | T0108 |
| [ ] | T0110 | Add administrative approval guard. | Actions configured to require approval reject unapproved execution. | T0109 |

### 05. Audit events, workflow primitives and history

Roadmap reference: C01–C06.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0111 | Add AuditLog model with the prompt's fields. | Actor, tenant, diffs, request ID and timestamp are persisted. | T0110 |
| [ ] | T0112 | Add transaction-bound audit append helper. | A failed business transaction does not leave a success log. | T0111 |
| [ ] | T0113 | Restrict application database privileges on AuditLog. | Application credentials cannot update/delete existing entries. | T0112 |
| [ ] | T0114 | Add audit-log listing endpoint with authorized filters. | Organization and field restrictions hold on filtered results. | T0113 |
| [ ] | T0115 | Add outbox event model. | Events store tenant, resource, type, payload version and delivery state. | T0114 |
| [ ] | T0116 | Add transaction-bound domain-event publishing. | Business state and its event commit or roll back together. | T0115 |
| [ ] | T0117 | Add the outbox delivery worker. | An interrupted delivery is retried without dropping the event. | T0116 |
| [ ] | T0118 | Add consumer deduplication records. | A repeated event does not repeat a side effect. | T0117 |
| [ ] | T0119 | Register the eleven named domain-event types. | Payload validation covers every event listed in the prompt. | T0118 |
| [ ] | T0120 | Add optimistic-concurrency version checking. | A stale update returns a conflict instead of overwriting. | T0119 |
| [ ] | T0121 | Add entity-version snapshot storage. | Snapshots record actor, timestamp and change reason. | T0120 |
| [ ] | T0122 | Add version comparison utility. | It shows changed fields without exposing restricted fields. | T0121 |
| [ ] | T0123 | Add restore-as-new-version helper. | Restoring preserves every existing version. | T0122 |
| [ ] | T0124 | Add WorkflowDefinition model. | Triggers, conditions, actors, deadlines, escalation and outcomes can be stored. | T0123 |
| [ ] | T0125 | Add WorkflowInstance and action history models. | One instance is pinned to one workflow definition version. | T0124 |
| [ ] | T0126 | Add workflow condition evaluator. | Unsupported conditions fail validation rather than execute arbitrary code. | T0125 |
| [ ] | T0127 | Add workflow transition action. | Only the assigned/authorized actor can execute an allowed transition. | T0126 |
| [ ] | T0128 | Add workflow deadline job. | A missed deadline emits one escalation event. | T0127 |
| [ ] | T0129 | Add configurable workflow-definition edit endpoint. | Only authorized administrators can alter future workflow definitions. | T0128 |
| [ ] | T0130 | Build the workflow settings form for supported conditions/actors. | A saved configuration can be reopened; a full drag-and-drop builder stays later-phase. | T0129 |
| [ ] | T0131 | Add approvals-inbox endpoint. | It returns only pending actions the user may perform. | T0130 |
| [ ] | T0132 | Build approvals-inbox page. | Each row opens the correct review action. | T0131 |
| [ ] | T0133 | Add Comment model with reply parent and visibility. | Tenant and parent-resource scope are enforced. | T0132 |
| [ ] | T0134 | Add create-comment endpoint. | A caller cannot post on a resource they cannot access. | T0133 |
| [ ] | T0135 | Add edit-comment endpoint with immutable edit history. | Editing preserves the prior text and actor. | T0134 |
| [ ] | T0136 | Add comment-list projection for external users. | Internal notes and replies never leak through the API. | T0135 |
| [ ] | T0137 | Add mention parser with recipient access checks. | Unauthorized recipients receive no mention notification. | T0136 |
| [ ] | T0138 | Add comment-reaction endpoint. | Repeated same-user reactions follow the defined toggle rule. | T0137 |
| [ ] | T0139 | Build threaded comment list and composer. | Replies and visibility labels reflect server data. | T0138 |

### 06. Declare domain tables before their APIs

Roadmap reference: D01–D08, domain model tasks.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0140 | Add or complete Organization fields in Prisma: name, industry, registration, country, timezone, employee count, website and contacts. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0139 |
| [ ] | T0141 | Add or complete BusinessUnit fields in Prisma: name, type, parent unit and organization. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0140 |
| [ ] | T0142 | Add or complete Department fields in Prisma: name, business unit and head membership. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0141 |
| [ ] | T0143 | Add or complete Location fields in Prisma: name, address, country and timezone. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0142 |
| [ ] | T0144 | Add or complete Framework fields in Prisma: name, publisher, description and global/custom ownership. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0143 |
| [ ] | T0145 | Add or complete UnifiedControl fields in Prisma: reference, title, objective, type, category, guidance, test procedure and frequency. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0144 |
| [ ] | T0146 | Add or complete ComplianceProgram fields in Prisma: name, framework version, owner, scope, dates, assessment type, stage and status. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0145 |
| [ ] | T0147 | Add or complete Risk fields in Prisma: reference, title, category, threat, vulnerability, owner, process and review date. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0146 |
| [ ] | T0148 | Add or complete Asset fields in Prisma: type, owner, custodian, department, location, IP, hostname, serial, OS, environment, classification and criticality. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0147 |
| [ ] | T0149 | Add or complete Vendor fields in Prisma: service, business owner, contacts, countries, data/system access and contract dates. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0148 |
| [ ] | T0150 | Add or complete Finding fields in Prisma: type, title, description, severity, impact, owner, due date and management response. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0149 |
| [ ] | T0151 | Add or complete Task fields in Prisma: title, description, type, priority, owner, due date, progress and status. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0150 |
| [ ] | T0152 | Add or complete Policy fields in Prisma: number, title, category, author, owner, approver, classification and review dates. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0151 |
| [ ] | T0153 | Add or complete Audit fields in Prisma: title, type, scope, objectives, criteria, lead auditor, dates and status. | The migration preserves existing data and includes the prompt's remaining fields and enums for this record. | T0152 |
| [ ] | T0154 | Add structured program-scope membership tables. | Systems, applications, networks, units, processes, vendors and data types have explicit links. | T0153 |
| [ ] | T0155 | Add FrameworkVersion model with effective/retirement dates. | Each version belongs to a framework and cannot duplicate its version identifier. | T0154 |
| [ ] | T0156 | Add FrameworkDomain model. | Domains belong to a specific framework version. | T0155 |
| [ ] | T0157 | Add FrameworkRequirement model. | Requirements have version-scoped references, domain, description and weight. | T0156 |
| [ ] | T0158 | Add ControlImplementation model with tenant and implementation scope. | One implementation can be reused by compatible programs. | T0157 |
| [ ] | T0159 | Add ControlOwner assignment relation. | Primary/secondary/reviewer/approver roles reference tenant memberships. | T0158 |
| [ ] | T0160 | Add ControlRequirementMapping model. | It stores mapping type, coverage, rationale, provenance and approval status. | T0159 |
| [ ] | T0161 | Add program-to-implementation applicability relation. | Program applicability stays separate from reusable implementation status. | T0160 |

### 07. Organization and administration records

Roadmap reference: B09–B10, B12.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0162 | Add Organization DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0161 |
| [ ] | T0163 | Add GET /api/v1/organizations with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0162 |
| [ ] | T0164 | Add POST /api/v1/organizations. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0163 |
| [ ] | T0165 | Add GET /api/v1/organizations/:id. | Missing and unauthorized records are handled without exposing private data. | T0164 |
| [ ] | T0166 | Add PATCH /api/v1/organizations/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0165 |
| [ ] | T0167 | Add the typed organizations query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0166 |
| [ ] | T0168 | Build or port the organizations list using its API hook. | The list shows real pagination, loading, empty and error states. | T0167 |
| [ ] | T0169 | Build the organizations creation form. | Valid submission persists and validation errors remain next to fields. | T0168 |
| [ ] | T0170 | Build the organizations detail view. | A direct URL loads the selected record and permitted fields. | T0169 |
| [ ] | T0171 | Build the organizations edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0170 |

### 08. Business units

Roadmap reference: B09.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0172 | Add BusinessUnit DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0171 |
| [ ] | T0173 | Add GET /api/v1/business-units with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0172 |
| [ ] | T0174 | Add POST /api/v1/business-units. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0173 |
| [ ] | T0175 | Add GET /api/v1/business-units/:id. | Missing and unauthorized records are handled without exposing private data. | T0174 |
| [ ] | T0176 | Add PATCH /api/v1/business-units/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0175 |
| [ ] | T0177 | Add the typed business-units query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0176 |
| [ ] | T0178 | Build or port the business-units list using its API hook. | The list shows real pagination, loading, empty and error states. | T0177 |
| [ ] | T0179 | Build the business-units creation form. | Valid submission persists and validation errors remain next to fields. | T0178 |
| [ ] | T0180 | Build the business-units detail view. | A direct URL loads the selected record and permitted fields. | T0179 |
| [ ] | T0181 | Build the business-units edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0180 |

### 09. Departments

Roadmap reference: B09.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0182 | Add Department DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0181 |
| [ ] | T0183 | Add GET /api/v1/departments with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0182 |
| [ ] | T0184 | Add POST /api/v1/departments. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0183 |
| [ ] | T0185 | Add GET /api/v1/departments/:id. | Missing and unauthorized records are handled without exposing private data. | T0184 |
| [ ] | T0186 | Add PATCH /api/v1/departments/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0185 |
| [ ] | T0187 | Add the typed departments query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0186 |
| [ ] | T0188 | Build or port the departments list using its API hook. | The list shows real pagination, loading, empty and error states. | T0187 |
| [ ] | T0189 | Build the departments creation form. | Valid submission persists and validation errors remain next to fields. | T0188 |
| [ ] | T0190 | Build the departments detail view. | A direct URL loads the selected record and permitted fields. | T0189 |
| [ ] | T0191 | Build the departments edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0190 |

### 10. Locations

Roadmap reference: B09.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0192 | Add Location DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0191 |
| [ ] | T0193 | Add GET /api/v1/locations with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0192 |
| [ ] | T0194 | Add POST /api/v1/locations. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0193 |
| [ ] | T0195 | Add GET /api/v1/locations/:id. | Missing and unauthorized records are handled without exposing private data. | T0194 |
| [ ] | T0196 | Add PATCH /api/v1/locations/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0195 |
| [ ] | T0197 | Add the typed locations query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0196 |
| [ ] | T0198 | Build or port the locations list using its API hook. | The list shows real pagination, loading, empty and error states. | T0197 |
| [ ] | T0199 | Build the locations creation form. | Valid submission persists and validation errors remain next to fields. | T0198 |
| [ ] | T0200 | Build the locations detail view. | A direct URL loads the selected record and permitted fields. | T0199 |
| [ ] | T0201 | Build the locations edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0200 |

### 11. Framework catalog

Roadmap reference: D01–D03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0202 | Add Framework DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0201 |
| [ ] | T0203 | Add GET /api/v1/frameworks with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0202 |
| [ ] | T0204 | Add POST /api/v1/frameworks. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0203 |
| [ ] | T0205 | Add GET /api/v1/frameworks/:id. | Missing and unauthorized records are handled without exposing private data. | T0204 |
| [ ] | T0206 | Add PATCH /api/v1/frameworks/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0205 |
| [ ] | T0207 | Add the typed frameworks query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0206 |
| [ ] | T0208 | Build or port the frameworks list using its API hook. | The list shows real pagination, loading, empty and error states. | T0207 |
| [ ] | T0209 | Build the frameworks creation form. | Valid submission persists and validation errors remain next to fields. | T0208 |
| [ ] | T0210 | Build the frameworks detail view. | A direct URL loads the selected record and permitted fields. | T0209 |
| [ ] | T0211 | Build the frameworks edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0210 |

### 12. Unified control records

Roadmap reference: D04–D05.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0212 | Add UnifiedControl DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0211 |
| [ ] | T0213 | Add GET /api/v1/controls with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0212 |
| [ ] | T0214 | Add POST /api/v1/controls. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0213 |
| [ ] | T0215 | Add GET /api/v1/controls/:id. | Missing and unauthorized records are handled without exposing private data. | T0214 |
| [ ] | T0216 | Add PATCH /api/v1/controls/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0215 |
| [ ] | T0217 | Add the typed controls query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0216 |
| [ ] | T0218 | Build or port the controls list using its API hook. | The list shows real pagination, loading, empty and error states. | T0217 |
| [ ] | T0219 | Build the controls creation form. | Valid submission persists and validation errors remain next to fields. | T0218 |
| [ ] | T0220 | Build the controls detail view. | A direct URL loads the selected record and permitted fields. | T0219 |
| [ ] | T0221 | Build the controls edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0220 |

### 13. Framework versions and mapping

Roadmap reference: D01–D08.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0222 | Add framework-version create endpoint. | A new draft edition does not alter a published one. | T0221 |
| [ ] | T0223 | Add framework-requirement create endpoint. | Reference uniqueness and positive weights are enforced. | T0222 |
| [ ] | T0224 | Add framework-requirement edit endpoint. | Published version requirements cannot be overwritten. | T0223 |
| [ ] | T0225 | Add framework-version publish action. | The edition becomes immutable and its requirement count is verified. | T0224 |
| [ ] | T0226 | Build framework-version selector. | The user can view requirements for a particular edition. | T0225 |
| [ ] | T0227 | Build framework-requirement editor. | Draft requirements persist with domain and weight. | T0226 |
| [ ] | T0228 | Add one requirement-pack parser with provenance metadata. | Malformed packs fail with requirement-level errors. | T0227 |
| [ ] | T0229 | Add requirement-pack import action. | Import is transactional and preserves source/version/count. | T0228 |
| [ ] | T0230 | Seed catalog metadata for the 12 named frameworks. | Every requested framework is listed without claiming missing full content. | T0229 |
| [ ] | T0231 | Validate and import the ISO/IEC 27001:2022 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0230 |
| [ ] | T0232 | Validate and import the PCI DSS 4.0.1 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0231 |
| [ ] | T0233 | Validate and import the SOC 2 Trust Services Criteria requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0232 |
| [ ] | T0234 | Validate and import the NIST CSF 2.0 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0233 |
| [ ] | T0235 | Validate and import the CIS Controls v8 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0234 |
| [ ] | T0236 | Validate and import the GDPR requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0235 |
| [ ] | T0237 | Validate and import the HIPAA requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0236 |
| [ ] | T0238 | Validate and import the NIST SP 800-53 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0237 |
| [ ] | T0239 | Validate and import the NDPA requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0238 |
| [ ] | T0240 | Validate and import the COBIT requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0239 |
| [ ] | T0241 | Validate and import the ISO 22301 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0240 |
| [ ] | T0242 | Validate and import the ISO 27701 requirement pack. | Use permitted authoritative content; record exact edition/provenance/count and explicitly flag any unavailable content instead of inventing requirements. | T0241 |
| [ ] | T0243 | Add framework-migration preview endpoint. | It lists added/removed/changed requirement references. | T0242 |
| [ ] | T0244 | Add framework-migration apply action. | Existing assessments stay pinned to their original edition. | T0243 |
| [ ] | T0245 | Build framework-migration preview/confirm screen. | The displayed preview identifies the exact source and target edition. | T0244 |
| [ ] | T0246 | Add control-owner assignment endpoint. | Inactive or foreign-tenant memberships are rejected. | T0245 |
| [ ] | T0247 | Build control ownership editor. | Each supported ownership role can be saved separately. | T0246 |
| [ ] | T0248 | Add control implementation-notes endpoint. | Only scoped owners can update notes with concurrency protection. | T0247 |
| [ ] | T0249 | Add control submit-for-review action. | Submission creates the actual pending review. | T0248 |
| [ ] | T0250 | Add control approve/reject action. | The reviewer must be authorized and provide the required decision data. | T0249 |
| [ ] | T0251 | Add control operational-state transition action. | It requires the approved prerequisite state. | T0250 |
| [ ] | T0252 | Add control periodic-retest scheduler. | Due controls receive one review request per period. | T0251 |
| [ ] | T0253 | Build control review panel. | The panel shows evidence/notes and invokes the actual review decision. | T0252 |
| [ ] | T0254 | Add mapping-create endpoint. | One implementation can connect to multiple framework requirements without cloning. | T0253 |
| [ ] | T0255 | Add mapping-update endpoint. | Coverage is bounded 0–100 and all six mapping types are validated. | T0254 |
| [ ] | T0256 | Add mapping approval action. | Unapproved mapping cannot silently count as approved coverage. | T0255 |
| [ ] | T0257 | Build control-mapping add form. | The requirement picker identifies framework and edition. | T0256 |
| [ ] | T0258 | Build mapping-review panel. | The reviewer sees rationale, source and coverage before deciding. | T0257 |

### 14. Compliance program records

Roadmap reference: D07–D08.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0259 | Add ComplianceProgram DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0258 |
| [ ] | T0260 | Add GET /api/v1/programs with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0259 |
| [ ] | T0261 | Add POST /api/v1/programs. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0260 |
| [ ] | T0262 | Add GET /api/v1/programs/:id. | Missing and unauthorized records are handled without exposing private data. | T0261 |
| [ ] | T0263 | Add PATCH /api/v1/programs/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0262 |
| [ ] | T0264 | Add the typed programs query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0263 |
| [ ] | T0265 | Build or port the programs list using its API hook. | The list shows real pagination, loading, empty and error states. | T0264 |
| [ ] | T0266 | Build the programs creation form. | Valid submission persists and validation errors remain next to fields. | T0265 |
| [ ] | T0267 | Build the programs detail view. | A direct URL loads the selected record and permitted fields. | T0266 |
| [ ] | T0268 | Build the programs edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0267 |

### 15. Risk register records

Roadmap reference: F08–F10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0269 | Add Risk DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0268 |
| [ ] | T0270 | Add GET /api/v1/risks with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0269 |
| [ ] | T0271 | Add POST /api/v1/risks. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0270 |
| [ ] | T0272 | Add GET /api/v1/risks/:id. | Missing and unauthorized records are handled without exposing private data. | T0271 |
| [ ] | T0273 | Add PATCH /api/v1/risks/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0272 |
| [ ] | T0274 | Add the typed risks query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0273 |
| [ ] | T0275 | Build or port the risks list using its API hook. | The list shows real pagination, loading, empty and error states. | T0274 |
| [ ] | T0276 | Build the risks creation form. | Valid submission persists and validation errors remain next to fields. | T0275 |
| [ ] | T0277 | Build the risks detail view. | A direct URL loads the selected record and permitted fields. | T0276 |
| [ ] | T0278 | Build the risks edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0277 |

### 16. Asset inventory records

Roadmap reference: G05.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0279 | Add Asset DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0278 |
| [ ] | T0280 | Add GET /api/v1/assets with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0279 |
| [ ] | T0281 | Add POST /api/v1/assets. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0280 |
| [ ] | T0282 | Add GET /api/v1/assets/:id. | Missing and unauthorized records are handled without exposing private data. | T0281 |
| [ ] | T0283 | Add PATCH /api/v1/assets/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0282 |
| [ ] | T0284 | Add the typed assets query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0283 |
| [ ] | T0285 | Build or port the assets list using its API hook. | The list shows real pagination, loading, empty and error states. | T0284 |
| [ ] | T0286 | Build the assets creation form. | Valid submission persists and validation errors remain next to fields. | T0285 |
| [ ] | T0287 | Build the assets detail view. | A direct URL loads the selected record and permitted fields. | T0286 |
| [ ] | T0288 | Build the assets edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0287 |

### 17. Vendor register records

Roadmap reference: G06–G09.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0289 | Add Vendor DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0288 |
| [ ] | T0290 | Add GET /api/v1/vendors with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0289 |
| [ ] | T0291 | Add POST /api/v1/vendors. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0290 |
| [ ] | T0292 | Add GET /api/v1/vendors/:id. | Missing and unauthorized records are handled without exposing private data. | T0291 |
| [ ] | T0293 | Add PATCH /api/v1/vendors/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0292 |
| [ ] | T0294 | Add the typed vendors query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0293 |
| [ ] | T0295 | Build or port the vendors list using its API hook. | The list shows real pagination, loading, empty and error states. | T0294 |
| [ ] | T0296 | Build the vendors creation form. | Valid submission persists and validation errors remain next to fields. | T0295 |
| [ ] | T0297 | Build the vendors detail view. | A direct URL loads the selected record and permitted fields. | T0296 |
| [ ] | T0298 | Build the vendors edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0297 |

### 18. Finding records

Roadmap reference: F01–F02.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0299 | Add Finding DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0298 |
| [ ] | T0300 | Add GET /api/v1/findings with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0299 |
| [ ] | T0301 | Add POST /api/v1/findings. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0300 |
| [ ] | T0302 | Add GET /api/v1/findings/:id. | Missing and unauthorized records are handled without exposing private data. | T0301 |
| [ ] | T0303 | Add PATCH /api/v1/findings/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0302 |
| [ ] | T0304 | Add the typed findings query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0303 |
| [ ] | T0305 | Build or port the findings list using its API hook. | The list shows real pagination, loading, empty and error states. | T0304 |
| [ ] | T0306 | Build the findings creation form. | Valid submission persists and validation errors remain next to fields. | T0305 |
| [ ] | T0307 | Build the findings detail view. | A direct URL loads the selected record and permitted fields. | T0306 |
| [ ] | T0308 | Build the findings edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0307 |

### 19. Task records

Roadmap reference: F03–F05.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0309 | Add Task DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0308 |
| [ ] | T0310 | Add GET /api/v1/tasks with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0309 |
| [ ] | T0311 | Add POST /api/v1/tasks. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0310 |
| [ ] | T0312 | Add GET /api/v1/tasks/:id. | Missing and unauthorized records are handled without exposing private data. | T0311 |
| [ ] | T0313 | Add PATCH /api/v1/tasks/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0312 |
| [ ] | T0314 | Add the typed tasks query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0313 |
| [ ] | T0315 | Build or port the tasks list using its API hook. | The list shows real pagination, loading, empty and error states. | T0314 |
| [ ] | T0316 | Build the tasks creation form. | Valid submission persists and validation errors remain next to fields. | T0315 |
| [ ] | T0317 | Build the tasks detail view. | A direct URL loads the selected record and permitted fields. | T0316 |
| [ ] | T0318 | Build the tasks edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0317 |

### 20. Policy metadata records

Roadmap reference: G01–G04.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0319 | Add Policy DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0318 |
| [ ] | T0320 | Add GET /api/v1/policies with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0319 |
| [ ] | T0321 | Add POST /api/v1/policies. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0320 |
| [ ] | T0322 | Add GET /api/v1/policies/:id. | Missing and unauthorized records are handled without exposing private data. | T0321 |
| [ ] | T0323 | Add PATCH /api/v1/policies/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0322 |
| [ ] | T0324 | Add the typed policies query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0323 |
| [ ] | T0325 | Build or port the policies list using its API hook. | The list shows real pagination, loading, empty and error states. | T0324 |
| [ ] | T0326 | Build the policies creation form. | Valid submission persists and validation errors remain next to fields. | T0325 |
| [ ] | T0327 | Build the policies detail view. | A direct URL loads the selected record and permitted fields. | T0326 |
| [ ] | T0328 | Build the policies edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0327 |

### 21. Audit plan records

Roadmap reference: H01–H04.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0329 | Add Audit DTO validation. | Invalid enums, missing required fields and disallowed fields fail before persistence. | T0328 |
| [ ] | T0330 | Add GET /api/v1/audits with pagination. | Authorized results are scoped and bounded; tests cover an unauthorized caller. | T0329 |
| [ ] | T0331 | Add POST /api/v1/audits. | A valid record persists; invalid ownership/tenant links fail; the creation is audited. | T0330 |
| [ ] | T0332 | Add GET /api/v1/audits/:id. | Missing and unauthorized records are handled without exposing private data. | T0331 |
| [ ] | T0333 | Add PATCH /api/v1/audits/:id for ordinary editable fields. | Invalid/stale edits fail; lifecycle/approval fields cannot be changed through this general endpoint. | T0332 |
| [ ] | T0334 | Add the typed audits query/mutation hooks. | Create/edit invalidates the affected list/detail cache and preserves server errors. | T0333 |
| [ ] | T0335 | Build or port the audits list using its API hook. | The list shows real pagination, loading, empty and error states. | T0334 |
| [ ] | T0336 | Build the audits creation form. | Valid submission persists and validation errors remain next to fields. | T0335 |
| [ ] | T0337 | Build the audits detail view. | A direct URL loads the selected record and permitted fields. | T0336 |
| [ ] | T0338 | Build the audits edit form. | Reload shows the saved values; concurrency conflicts are visible. | T0337 |

### 22. Roles, settings and scope editors

Roadmap reference: B08–B12.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0339 | Add organization-role list endpoint. | Only roles assignable in the current organization appear. | T0338 |
| [ ] | T0340 | Add custom-role create endpoint. | Permission selections are limited by the creator's allowed delegation. | T0339 |
| [ ] | T0341 | Add custom-role permission-update endpoint. | Privilege escalation and editing protected platform roles fail. | T0340 |
| [ ] | T0342 | Build custom-role creation form. | It submits a role name and permitted permission selections. | T0341 |
| [ ] | T0343 | Build role-permission editor. | Saved grants change authorization without relying on hidden UI controls. | T0342 |
| [ ] | T0344 | Add membership-role assignment endpoint. | Assignments reference active membership and tenant-compatible roles. | T0343 |
| [ ] | T0345 | Build user-role assignment action. | The selected role persists and disallowed grants show an error. | T0344 |
| [ ] | T0346 | Port the user directory to a typed tenant API. | Invited and active users have real statuses rather than a hardcoded profile. | T0345 |
| [ ] | T0347 | Add organization profile logo attachment action. | Only an authorized validated image can become the logo. | T0346 |
| [ ] | T0348 | Add organization settings model and read endpoint. | Date/currency/retention/branding/security/notification settings have explicit defaults. | T0347 |
| [ ] | T0349 | Add organization settings update endpoint. | Unknown fields fail and policy changes are audited. | T0348 |
| [ ] | T0350 | Connect the existing settings form to saved settings. | Reload preserves updates; no switch falsely claims to enforce an absent feature. | T0349 |
| [ ] | T0351 | Build program-scope selector. | It lists only tenant-compatible scope records. | T0350 |
| [ ] | T0352 | Build platform organization/subscription table. | Platform users see administration fields without customer evidence. | T0351 |
| [ ] | T0353 | Build support-access request form. | Submitting creates a pending request with selected scope and expiry. | T0352 |
| [ ] | T0354 | Build customer support-access approval UI. | Approve/reject calls the real workflow and displays its effective expiration. | T0353 |

### 23. Program activation and stage actions

Roadmap reference: D07–D08.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0355 | Add framework-activation transaction. | It creates one program's required links without duplicating shared implementations. | T0354 |
| [ ] | T0356 | Add activation idempotency protection. | Retrying one activation request creates no duplicate program/control links. | T0355 |
| [ ] | T0357 | Build framework activation dialog. | It selects edition, scope and owner and calls the activation API. | T0356 |
| [ ] | T0358 | Add program-stage transition action. | Only the allowed next transitions succeed. | T0357 |
| [ ] | T0359 | Connect the program-stage tracker to actual transitions. | A stage change is persisted and audited. | T0358 |

### 24. Secure file upload and download

Roadmap reference: E01–E03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0360 | Add File model with hash, MIME, size, storage key, encryption version and scan state. | Original filename is metadata rather than a disk path. | T0359 |
| [ ] | T0361 | Add safe storage-key generator and root containment check. | Traversal and absolute-path input cannot escape the configured directory. | T0360 |
| [ ] | T0362 | Add upload-size and extension validation. | Oversized and forbidden files fail before durable storage. | T0361 |
| [ ] | T0363 | Add MIME/signature validation. | A renamed executable fails the accepted-type check. | T0362 |
| [ ] | T0364 | Add streaming SHA-256 hash computation. | The persisted hash matches the uploaded bytes. | T0363 |
| [ ] | T0365 | Add duplicate-file lookup scoped to the tenant. | The response cannot reveal that another tenant owns a matching file. | T0364 |
| [ ] | T0366 | Add encrypted local-file write adapter. | Disk bytes differ from uploaded plaintext and can be decrypted correctly. | T0365 |
| [ ] | T0367 | Add POST /files/upload. | Validated files enter quarantine with pending scan status. | T0366 |
| [ ] | T0368 | Add malware-scan job payload and enqueue action. | Every completed upload schedules one scan attempt. | T0367 |
| [ ] | T0369 | Add scanner adapter for a real local scanning service. | Clean, infected and scanner-error outcomes are distinguished. | T0368 |
| [ ] | T0370 | Add scan-result persistence. | Only a confirmed clean result clears quarantine. | T0369 |
| [ ] | T0371 | Add scan-error retry policy. | Repeated scanner errors remain quarantined after retry exhaustion. | T0370 |
| [ ] | T0372 | Add file-download authorization helper. | Tenant, record access, current membership and scan state are checked. | T0371 |
| [ ] | T0373 | Add short-lived signed download grant creation. | The token is bound to the file/version and intended access context. | T0372 |
| [ ] | T0374 | Add download endpoint consuming a grant. | Expired, revoked, tampered and cross-tenant grants fail. | T0373 |
| [ ] | T0375 | Add evidence/file download audit event. | The actor, file version and request context are recorded. | T0374 |
| [ ] | T0376 | Add preview-format allowlist. | Unsupported formats are offered only through allowed download behavior. | T0375 |
| [ ] | T0377 | Add watermark rendering for supported PDF/image previews. | The preview includes the configured user/organization watermark. | T0376 |
| [ ] | T0378 | Add retention eligibility calculation. | Linked, held or unexpired files are excluded according to the retention policy. | T0377 |
| [ ] | T0379 | Add authorized archive/purge job for eligible local files. | Deletion is logged and cannot remove files outside the storage root. | T0378 |

### 25. Evidence records and review

Roadmap reference: E04–E07.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0380 | Add Evidence metadata model. | All required dates, classification, source, owner and validity fields are present. | T0379 |
| [ ] | T0381 | Add EvidenceVersion relation to File. | A new file version cannot overwrite the old version's reference/hash. | T0380 |
| [ ] | T0382 | Add evidence-create endpoint using an uploaded file ID. | The file belongs to the tenant and is eligible for the requested state. | T0381 |
| [ ] | T0383 | Add evidence-metadata update endpoint. | Date ranges are validated and version history is recorded. | T0382 |
| [ ] | T0384 | Add paginated evidence-list endpoint. | Owner/type/status/expiration filters run on the server. | T0383 |
| [ ] | T0385 | Port evidence cards to typed API data. | An API failure renders an error, not an empty successful repository. | T0384 |
| [ ] | T0386 | Build evidence upload form. | It uploads a real file and shows upload/scan state. | T0385 |
| [ ] | T0387 | Build evidence metadata form. | Required metadata validation is visible and saved. | T0386 |
| [ ] | T0388 | Add evidence-to-control link table and create action. | A single evidence version supports multiple controls. | T0387 |
| [ ] | T0389 | Add evidence-to-requirement link table and create action. | Linked requirements retain edition identity. | T0388 |
| [ ] | T0390 | Add evidence-to-assessment/audit link relations. | Reviewed evidence version is preserved for historical results. | T0389 |
| [ ] | T0391 | Add evidence asset/vendor/business-unit links. | Every referenced record is checked for tenant compatibility. | T0390 |
| [ ] | T0392 | Build evidence link picker. | Users add multiple permitted uses without reuploading the file. | T0391 |
| [ ] | T0393 | Add evidence unlink action. | Removing one link preserves all other uses and file history. | T0392 |
| [ ] | T0394 | Add evidence submit-for-review action. | Missing required metadata or uncleared malware scan prevents submission. | T0393 |
| [ ] | T0395 | Add EvidenceReview model with seven validation dimensions. | The reviewed version and each assessment dimension are stored. | T0394 |
| [ ] | T0396 | Add evidence approve action. | Only the authorized reviewer can approve the submitted version. | T0395 |
| [ ] | T0397 | Add evidence reject action. | A required rejection reason is recorded and returned to the owner. | T0396 |
| [ ] | T0398 | Build evidence review form. | It submits a decision against the exact displayed version. | T0397 |
| [ ] | T0399 | Add evidence refresh/new-version action. | Existing approved history survives replacement. | T0398 |
| [ ] | T0400 | Connect the Download button to authorized grant/download APIs. | Clicking returns the actual allowed file rather than a timer. | T0399 |
| [ ] | T0401 | Add evidence expiration classifier. | Boundary-date tests cover current, nearly expired and expired. | T0400 |
| [ ] | T0402 | Add evidence-expiry reminder job. | Repeated runs do not create duplicate reminders for the same window. | T0401 |
| [ ] | T0403 | Add EvidenceRequest model and create endpoint. | Requests identify the assignee, related control and deadline. | T0402 |
| [ ] | T0404 | Build evidence-request response action. | The assignee can attach authorized evidence to fulfill the request. | T0403 |

### 26. Assessment questions and responses

Roadmap reference: E08–E10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0405 | Add AssessmentTemplate and section models. | Templates group questions in stable ordered sections. | T0404 |
| [ ] | T0406 | Add AssessmentQuestion model with response-type definitions. | All nine specified response types can be represented. | T0405 |
| [ ] | T0407 | Add assessment-template create endpoint. | An authorized manager can create an empty draft template. | T0406 |
| [ ] | T0408 | Add template-question create endpoint. | Each response type validates its own options/constraints. | T0407 |
| [ ] | T0409 | Build question editor. | Question text, requirement, evidence expectations and response type persist. | T0408 |
| [ ] | T0410 | Add Assessment model pinned to program/version/template snapshot. | Changing the template does not change an existing assessment. | T0409 |
| [ ] | T0411 | Add assessment-create endpoint. | Scope and assessment type are validated. | T0410 |
| [ ] | T0412 | Add assessment-list endpoint. | It is tenant scoped and paginated. | T0411 |
| [ ] | T0413 | Port assessment list to its API hook. | Opening an assessment navigates to a real detail route. | T0412 |
| [ ] | T0414 | Add assessment-assignee action. | Each question is assigned to an active eligible membership. | T0413 |
| [ ] | T0415 | Build question-assignment panel. | Assignees and due dates persist after reload. | T0414 |
| [ ] | T0416 | Add AssessmentResponse model. | Answers preserve question revision, status, submitter and attachments. | T0415 |
| [ ] | T0417 | Add response-save endpoint with discriminated validation. | Numeric/date/choice/file responses reject incompatible values. | T0416 |
| [ ] | T0418 | Build Yes/No response field. | Boolean answers persist without converting to ambiguous text. | T0417 |
| [ ] | T0419 | Build multiple-choice response field. | Only allowed options are submitted. | T0418 |
| [ ] | T0420 | Build free-text response field. | Length and required rules are enforced. | T0419 |
| [ ] | T0421 | Build numeric response field. | Bounds and precision are validated. | T0420 |
| [ ] | T0422 | Build date response field. | The saved value uses the documented date/time semantics. | T0421 |
| [ ] | T0423 | Build file-upload response field. | It links an authorized uploaded evidence/file reference. | T0422 |
| [ ] | T0424 | Build risk-rating response field. | Only configured scale values are accepted. | T0423 |
| [ ] | T0425 | Build maturity response field. | The supported maturity scale is labeled and validated. | T0424 |
| [ ] | T0426 | Build compliance-status response field. | Only supported assessment statuses are selectable. | T0425 |
| [ ] | T0427 | Add response-submit action. | The submitter must own the assignment and satisfy required inputs. | T0426 |
| [ ] | T0428 | Add reviewer response-decision action. | Only reviewers can set the reviewed result and comment. | T0427 |
| [ ] | T0429 | Add N/A request action requiring justification. | Requesting exclusion alone does not change the scoring denominator. | T0428 |
| [ ] | T0430 | Add N/A approve/reject action. | Only an approved request becomes an excluded requirement. | T0429 |
| [ ] | T0431 | Build assessment review workspace. | Submitted answers and exact evidence versions appear beside reviewer actions. | T0430 |
| [ ] | T0432 | Add assessment results-approval action. | Incomplete or unreviewed required responses block completion. | T0431 |
| [ ] | T0433 | Add response-to-many-findings relation. | One response may reference several independent findings. | T0432 |
| [ ] | T0434 | Build raise-finding-from-response action. | It prefills the response/control/requirement relation accurately. | T0433 |

### 27. Findings, remediation and CAPA actions

Roadmap reference: F01–F07.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0435 | Add finding assignment action. | The new owner is an active tenant membership and assignment is audited. | T0434 |
| [ ] | T0436 | Add finding investigation transition. | Only allowed source states enter investigation. | T0435 |
| [ ] | T0437 | Add finding corrective-plan submission action. | The proposed correction and root-cause data are retained. | T0436 |
| [ ] | T0438 | Add finding verification-request action. | Required remediation evidence must be attached. | T0437 |
| [ ] | T0439 | Add finding verify-and-close action. | An authorized independent reviewer must verify before closure. | T0438 |
| [ ] | T0440 | Build finding lifecycle action panel. | The UI exposes only server-allowed actions and displays failed prerequisites. | T0439 |
| [ ] | T0441 | Add task-to-resource links. | A related resource must belong to the same tenant and be visible to the actor. | T0440 |
| [ ] | T0442 | Add task collaborator relation and update action. | Only permitted active memberships may collaborate. | T0441 |
| [ ] | T0443 | Add task checklist item create action. | A new item belongs to the selected authorized task. | T0442 |
| [ ] | T0444 | Add task checklist toggle action. | Completion persists without overwriting concurrent items. | T0443 |
| [ ] | T0445 | Build task checklist component. | Adding/toggling items updates the real task. | T0444 |
| [ ] | T0446 | Add task attachment action. | Only authorized clean file references can be attached. | T0445 |
| [ ] | T0447 | Add task parent/subtask relation. | A task cannot become its own ancestor. | T0446 |
| [ ] | T0448 | Add blocking dependency action with cycle detection. | Circular blocking chains are rejected. | T0447 |
| [ ] | T0449 | Add task status-transition action. | Blocked/approval prerequisites cannot be bypassed by direct requests. | T0448 |
| [ ] | T0450 | Add recurring-task schedule model and next-occurrence calculation. | Timezone and duplicate-occurrence boundaries are tested. | T0449 |
| [ ] | T0451 | Add recurring-task creation worker. | Retry does not produce duplicate occurrences. | T0450 |
| [ ] | T0452 | Make the existing task Kanban move action persistent. | A failed move restores the original card state. | T0451 |
| [ ] | T0453 | Build My Tasks filter. | It uses the current identity, not a hardcoded owner. | T0452 |
| [ ] | T0454 | Build Department Tasks filter. | Only permitted departments' tasks are returned. | T0453 |
| [ ] | T0455 | Build overdue-task filter. | It excludes completed/cancelled tasks consistently. | T0454 |
| [ ] | T0456 | Build task calendar view. | Dates and source task links match the list. | T0455 |
| [ ] | T0457 | Build task timeline view. | Start/due spans and dependencies use real task data. | T0456 |
| [ ] | T0458 | Add CAPA model linked to finding. | Containment, root cause, correction, prevention, effectiveness and verification fields persist. | T0457 |
| [ ] | T0459 | Add CAPA create endpoint. | A related finding and owner must be authorized. | T0458 |
| [ ] | T0460 | Add containment update endpoint. | The immediate correction is versioned. | T0459 |
| [ ] | T0461 | Add Five Whys structured root-cause input. | All why/answer pairs survive save/reload. | T0460 |
| [ ] | T0462 | Add Fishbone structured root-cause input. | Cause categories and branches survive save/reload. | T0461 |
| [ ] | T0463 | Add fault-tree root-cause input. | Parent/child causes cannot form cycles. | T0462 |
| [ ] | T0464 | Add process-mapping root-cause input. | Steps and suspected failures survive save/reload. | T0463 |
| [ ] | T0465 | Add corrective/preventive action child records. | Each action has its own owner, deadline and status. | T0464 |
| [ ] | T0466 | Add CAPA plan-approval action. | Implementation cannot bypass required plan approval. | T0465 |
| [ ] | T0467 | Add CAPA action-completion endpoint. | Completion records the implementation evidence. | T0466 |
| [ ] | T0468 | Add CAPA effectiveness-review action. | Reviewer records criteria, method, result and supporting evidence. | T0467 |
| [ ] | T0469 | Add CAPA closure-approval action. | Failed/missing effectiveness review blocks closure. | T0468 |
| [ ] | T0470 | Build CAPA list page. | It queries real records with owner/status/due filters. | T0469 |
| [ ] | T0471 | Build CAPA detail and correction form. | It saves the selected CAPA's ordinary fields. | T0470 |
| [ ] | T0472 | Build CAPA approval/verification panel. | It invokes the actual transition endpoints. | T0471 |

### 28. Risk scoring, treatment and acceptance

Roadmap reference: F08–F10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0473 | Add organization risk-scale configuration schema. | Likelihood/impact labels and thresholds have validated ranges. | T0472 |
| [ ] | T0474 | Add risk likelihood-times-impact calculator. | All configured scale boundaries produce expected scores. | T0473 |
| [ ] | T0475 | Add risk inherent/residual score update action. | Scores are recomputed server-side from validated inputs. | T0474 |
| [ ] | T0476 | Add RiskControl relation and linking endpoint. | Linked controls are tenant-compatible. | T0475 |
| [ ] | T0477 | Add risk-to-asset relation and linking endpoint. | Linked assets are tenant-compatible. | T0476 |
| [ ] | T0478 | Add RiskAssessment history model and create action. | A reassessment preserves old likelihood/impact and reviewer data. | T0477 |
| [ ] | T0479 | Build risk score input panel. | The user sees calculated inherent and residual values. | T0478 |
| [ ] | T0480 | Connect the existing heatmap to configured scales. | Cell labels/counts match filtered server risk data. | T0479 |
| [ ] | T0481 | Add RiskTreatment model. | Option, owner, budget, resources, dates, criteria and residual target persist. | T0480 |
| [ ] | T0482 | Add treatment-create endpoint. | All four treatment options are supported. | T0481 |
| [ ] | T0483 | Add treatment-update endpoint. | Only authorized owners/managers can edit the plan. | T0482 |
| [ ] | T0484 | Build treatment plan form. | It saves actions, budget, dates and success criteria. | T0483 |
| [ ] | T0485 | Add treatment-to-task/evidence links. | Linked resources are scoped and remain traceable. | T0484 |
| [ ] | T0486 | Add RiskAcceptance request model and submit action. | A justification and expiration/review date are required. | T0485 |
| [ ] | T0487 | Add risk-acceptance approve/reject action. | The configured acceptance authority makes the decision. | T0486 |
| [ ] | T0488 | Build risk acceptance review panel. | It displays risk score, rationale and expiry before the decision. | T0487 |
| [ ] | T0489 | Add risk-acceptance expiration job. | Expired acceptance triggers review and ceases to appear current. | T0488 |
| [ ] | T0490 | Add risk-review reminder job. | One reminder is created per configured risk-review window. | T0489 |

### 29. Policy content and acknowledgments

Roadmap reference: G01–G04.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0491 | Add PolicyVersion content model. | Published versions retain immutable content and metadata. | T0490 |
| [ ] | T0492 | Add draft policy-content save endpoint. | Content schema is validated and concurrent edits are rejected. | T0491 |
| [ ] | T0493 | Add server-side rich-text sanitization. | Stored script/unsafe URL payloads cannot execute in policy rendering. | T0492 |
| [ ] | T0494 | Add TipTap to the policy editor route. | Basic rich text saves and reloads through the real API. | T0493 |
| [ ] | T0495 | Add policy-template create endpoint. | A reusable template is tenant/global scoped appropriately. | T0494 |
| [ ] | T0496 | Add policy create-from-template action. | It creates an independent editable draft. | T0495 |
| [ ] | T0497 | Add policy-to-control link endpoint. | Links require compatible tenant scope. | T0496 |
| [ ] | T0498 | Add policy risk/framework links. | Linked records are authorized and framework versions are explicit. | T0497 |
| [ ] | T0499 | Add policy submit-for-review action. | A draft becomes reviewable by the configured approver. | T0498 |
| [ ] | T0500 | Add policy revision-request action. | Reviewer comments return the document to a revision state. | T0499 |
| [ ] | T0501 | Add policy approval action. | Only the designated authorized approver can approve the version. | T0500 |
| [ ] | T0502 | Add policy publish action. | Unapproved versions cannot publish. | T0501 |
| [ ] | T0503 | Add policy supersede action. | The new published version identifies the prior one. | T0502 |
| [ ] | T0504 | Add policy archive action. | Archiving preserves published history and acknowledgments. | T0503 |
| [ ] | T0505 | Add policy version comparison endpoint. | It compares authorized versions without changing content. | T0504 |
| [ ] | T0506 | Build policy version comparison view. | Added/removed content is distinguishable. | T0505 |
| [ ] | T0507 | Add tracked-change records for policy edits. | Each proposed change records author, range/content and decision state. | T0506 |
| [ ] | T0508 | Build tracked-change accept/reject action. | Authorized editors can apply one change without silently accepting others. | T0507 |
| [ ] | T0509 | Attach scoped comment threads to policy versions. | Comments stay attached to the version reviewed. | T0508 |
| [ ] | T0510 | Add PolicyAcknowledgment model. | Version, employee, statement, timestamp, IP and device are stored. | T0509 |
| [ ] | T0511 | Add policy-acknowledge endpoint. | An employee can acknowledge only an accessible published version. | T0510 |
| [ ] | T0512 | Build employee policy-read/acknowledge page. | The statement confirms the exact displayed version. | T0511 |
| [ ] | T0513 | Add significant-change re-acknowledgment generation. | Existing acknowledgments do not satisfy a newly required version. | T0512 |
| [ ] | T0514 | Build acknowledgment progress table. | Required/completed counts reconcile with employee/version records. | T0513 |
| [ ] | T0515 | Add policy periodic-review job. | Due policies create the configured review request. | T0514 |
| [ ] | T0516 | Add policy PDF export endpoint. | It renders the requested authorized version. | T0515 |
| [ ] | T0517 | Add policy Word export endpoint. | The generated document contains the selected version's content. | T0516 |

### 30. Asset relations and vendor due diligence

Roadmap reference: G05–G10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0518 | Add asset lifecycle-transition action. | All requested lifecycle states follow explicit allowed transitions. | T0517 |
| [ ] | T0519 | Build asset lifecycle selector. | It invokes the transition API and shows invalid-transition errors. | T0518 |
| [ ] | T0520 | Add AssetRelationship model. | Relationship type and source/target asset IDs are explicit. | T0519 |
| [ ] | T0521 | Add asset relationship-create endpoint. | Cross-tenant and invalid self-links are rejected. | T0520 |
| [ ] | T0522 | Build asset relationship panel. | Hosted-on/located-in/connected-to relations show the correct endpoints. | T0521 |
| [ ] | T0523 | Add vendor classification rules and calculator. | Criticality is explainable from data, access and dependency inputs. | T0522 |
| [ ] | T0524 | Add vendor classification update action. | The stored tier includes the calculated reason and rule version. | T0523 |
| [ ] | T0525 | Add VendorQuestionnaireTemplate model. | Questions, evidence requests and scoring definitions are versioned. | T0524 |
| [ ] | T0526 | Add vendor-questionnaire template editor. | A custom questionnaire can be saved and reopened. | T0525 |
| [ ] | T0527 | Add VendorAssessment instance-create endpoint. | The instance preserves its template version and vendor. | T0526 |
| [ ] | T0528 | Add vendor response-save endpoint. | Only the invited vendor membership can answer its assigned questionnaire. | T0527 |
| [ ] | T0529 | Build vendor questionnaire response page. | Each answer persists to the real assessment. | T0528 |
| [ ] | T0530 | Add vendor document-request endpoint. | Requests identify document type, deadline and selected vendor. | T0529 |
| [ ] | T0531 | Add VendorDocument model and upload-link action. | Contracts/certificates/etc. use protected file records. | T0530 |
| [ ] | T0532 | Build vendor document list/upload panel. | Users see only the selected authorized vendor's documents. | T0531 |
| [ ] | T0533 | Add vendor assessment scoring function. | Scores derive from submitted responses and configured weights. | T0532 |
| [ ] | T0534 | Add vendor assessment reviewer-decision action. | Comments and score overrides preserve reviewer reasons. | T0533 |
| [ ] | T0535 | Add vendor finding/remediation-request action. | Requests link back to the assessment and vendor. | T0534 |
| [ ] | T0536 | Build restricted vendor portal shell. | No internal administration navigation or unauthorized data is returned. | T0535 |
| [ ] | T0537 | Add contract-expiration reminder. | The event references the affected contract and configured warning window. | T0536 |
| [ ] | T0538 | Add certificate-expiration reminder. | Expired certificates are not shown as current certification. | T0537 |
| [ ] | T0539 | Add insurance-expiration reminder. | One alert is created per expiration window. | T0538 |
| [ ] | T0540 | Add assessment-renewal reminder. | The due assessment request is linked to the vendor. | T0539 |
| [ ] | T0541 | Add SLA-review reminder. | The designated owner receives the scheduled review action. | T0540 |
| [ ] | T0542 | Add employee training-assignment model. | Employee, training item, due date and completion evidence are stored. | T0541 |
| [ ] | T0543 | Add training-completion endpoint. | Employees can complete only their own assignments. | T0542 |
| [ ] | T0544 | Build employee training list/completion action. | Completion remains visible after reload. | T0543 |
| [ ] | T0545 | Add employee compliance-questionnaire assignment relation. | Assigned questionnaires use the existing question/response engine. | T0544 |
| [ ] | T0546 | Build employee assigned-questionnaire list. | It excludes other employees' private assignments. | T0545 |
| [ ] | T0547 | Add employee incident/risk-submission endpoint. | Reports preserve reporter visibility and route to an authorized reviewer. | T0546 |
| [ ] | T0548 | Build employee incident/risk report form. | Submission creates a real reviewable record. | T0547 |

### 31. Audit workspace and temporary auditor access

Roadmap reference: H01–H04.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0549 | Add audit team/auditee membership relations. | Audit roles reference authorized members. | T0548 |
| [ ] | T0550 | Add audit team-assignment endpoint. | Assignment cannot reference a foreign tenant membership. | T0549 |
| [ ] | T0551 | Add audit scope-approval action. | Testing cannot bypass required scope approval. | T0550 |
| [ ] | T0552 | Add AuditRequest evidence-request model and endpoint. | Requests have owner, deadline and scoped control references. | T0551 |
| [ ] | T0553 | Build audit evidence-request panel. | Requested and received evidence are linked to the audit. | T0552 |
| [ ] | T0554 | Add audit interview schedule model and create endpoint. | Attendees, date/time and notes persist. | T0553 |
| [ ] | T0555 | Build audit interview scheduler. | Saved times use the organization's timezone correctly. | T0554 |
| [ ] | T0556 | Add AuditTest model. | Method, sample, evidence versions, interview notes, result, exception and conclusion persist. | T0555 |
| [ ] | T0557 | Add audit-test create endpoint. | Selected controls/evidence belong to the authorized scope. | T0556 |
| [ ] | T0558 | Add audit-test result update endpoint. | Results preserve concurrency/history and examiner identity. | T0557 |
| [ ] | T0559 | Build audit-test form. | An auditor can record samples, results and conclusions. | T0558 |
| [ ] | T0560 | Add raise-finding-from-audit-test action. | The finding retains test/control/evidence references. | T0559 |
| [ ] | T0561 | Add audit management-response endpoint. | Authorized auditees can respond without editing auditor conclusions. | T0560 |
| [ ] | T0562 | Build audit management-response form. | Responses persist beside the corresponding finding. | T0561 |
| [ ] | T0563 | Add audit report-approval action. | Only an authorized approver can approve the report revision. | T0562 |
| [ ] | T0564 | Add audit-close action. | Required report approval and tracked findings state are checked. | T0563 |
| [ ] | T0565 | Add AuditorAccessGrant model. | Selected controls/evidence, user, audit and expiry are explicit. | T0564 |
| [ ] | T0566 | Add auditor invitation/grant endpoint. | A broad auditor role alone does not grant unselected resources. | T0565 |
| [ ] | T0567 | Add auditor-grant expiration enforcement. | Access fails immediately after expiry without waiting for cleanup. | T0566 |
| [ ] | T0568 | Build external-auditor workspace shell. | It exposes only granted tests/requests/findings/evidence. | T0567 |
| [ ] | T0569 | Add external-auditor mutation denial test. | General control/policy/user edits fail while allowed audit actions succeed. | T0568 |

### 32. Score calculations and dashboard widgets

Roadmap reference: I01–I05.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0570 | Implement weighted requirement-compliance calculation. | Compliant=1, partial=.5 and noncompliant=0 are multiplied by requirement weights. | T0569 |
| [ ] | T0571 | Implement approved-N/A denominator exclusion. | Pending/rejected N/A stays applicable; an all-N/A result is explicitly represented. | T0570 |
| [ ] | T0572 | Implement control implementation-score calculation. | It uses program scope rather than all organization controls. | T0571 |
| [ ] | T0573 | Implement control-effectiveness calculation. | The score derives from recorded testing/review results. | T0572 |
| [ ] | T0574 | Implement evidence-freshness calculation. | Current=1, near expiry=.75, expired=.25, none=0; approval treatment is explicit. | T0573 |
| [ ] | T0575 | Implement remediation completion calculation. | Only the documented applicable task population contributes. | T0574 |
| [ ] | T0576 | Define and implement audit-preparedness calculation. | Every input is actual audit data; the hardcoded 65 is removed. | T0575 |
| [ ] | T0577 | Implement composite readiness calculation. | 40/25/20/15 weights are tested against known input values. | T0576 |
| [ ] | T0578 | Add mapping deduplication/coverage aggregation rule. | A requirement cannot earn duplicate credit from reused evidence or overlapping mappings. | T0577 |
| [ ] | T0579 | Add score-explanation API. | It returns weights, applicable denominator, source IDs and formula version. | T0578 |
| [ ] | T0580 | Add score snapshot model and event-triggered update. | Historical points retain their calculation version and input references. | T0579 |
| [ ] | T0581 | Build score explanation drawer. | Displayed totals can be reproduced from the visible inputs. | T0580 |
| [ ] | T0582 | Replace program-list score calculation. | Each program's displayed score matches its server result. | T0581 |
| [ ] | T0583 | Replace program-detail score calculation. | Implementation scope and applicability match the program list. | T0582 |
| [ ] | T0584 | Add dashboard aggregate endpoint for compliance managers. | It returns only permitted tenant data. | T0583 |
| [ ] | T0585 | Connect framework score widgets to aggregate API. | No framework's value is copied from organization-wide controls. | T0584 |
| [ ] | T0586 | Connect evidence-health widget. | Counts reconcile with the repository filters. | T0585 |
| [ ] | T0587 | Connect open findings/overdue remediation widgets. | Clicking a count opens the same population. | T0586 |
| [ ] | T0588 | Connect upcoming audits/high risks/policy-review/vendor-risk widgets. | Each number/link resolves to its real records. | T0587 |
| [ ] | T0589 | Replace static compliance trend chart. | It plots saved historical score snapshots. | T0588 |
| [ ] | T0590 | Build control-owner dashboard. | Assigned controls, requests, rejected evidence and tasks use authenticated ownership. | T0589 |
| [ ] | T0591 | Build executive dashboard. | Readiness, critical risks, major findings, unit performance and aging use scoped aggregates. | T0590 |
| [ ] | T0592 | Build auditor dashboard. | Assigned audits, pending requests/tests/findings/responses derive from audit access. | T0591 |
| [ ] | T0593 | Add calendar event aggregation endpoint. | Assessments, tasks, reviews, audits and renewals are deduplicated and authorized. | T0592 |
| [ ] | T0594 | Build compliance calendar. | Timezone-aware events open their source records. | T0593 |

### 33. Notifications and global search

Roadmap reference: I06–I09.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0595 | Add Notification model and tenant/user indexes. | Read/unread state and resource links can be queried by recipient. | T0594 |
| [ ] | T0596 | Add notification-create consumer. | Repeated event delivery creates only one intended notification. | T0595 |
| [ ] | T0597 | Add GET /notifications. | Only the current recipient's authorized notifications appear. | T0596 |
| [ ] | T0598 | Add mark-notification-read action. | A user cannot alter another recipient's item. | T0597 |
| [ ] | T0599 | Connect the notification bell count. | The badge reflects actual unread data. | T0598 |
| [ ] | T0600 | Build notification inbox page. | Paging, read state and links work. | T0599 |
| [ ] | T0601 | Add NotificationPreference model and update endpoint. | Channels, frequency, digest and quiet hours persist. | T0600 |
| [ ] | T0602 | Build notification-preference form. | Saved preferences are used by delivery logic. | T0601 |
| [ ] | T0603 | Add local-email notification adapter. | The rendered notification appears in the capture inbox. | T0602 |
| [ ] | T0604 | Add Slack notification adapter. | A local HTTP fixture verifies payload, errors and retries. | T0603 |
| [ ] | T0605 | Add Teams notification adapter. | A local HTTP fixture verifies payload, errors and retries. | T0604 |
| [ ] | T0606 | Add signed webhook notification adapter. | Signature and retry behavior are verified against a local receiver. | T0605 |
| [ ] | T0607 | Add critical-SMS notification adapter. | Only the configured critical category reaches the SMS transport fixture. | T0606 |
| [ ] | T0608 | Add daily-digest job. | Items are grouped once per recipient/local-day window. | T0607 |
| [ ] | T0609 | Add weekly-digest job. | Items are grouped once per configured week window. | T0608 |
| [ ] | T0610 | Add quiet-hours delivery calculator. | Boundary/timezone tests determine the next allowed delivery. | T0609 |
| [ ] | T0611 | Add escalation-rule evaluator. | Overdue items move through configured urgency/recipient stages once. | T0610 |
| [ ] | T0612 | Add PostgreSQL full-text index for searchable records. | Index updates reflect changes without exposing secrets. | T0611 |
| [ ] | T0613 | Add global search endpoint with resource authorization. | All ten specified record types can be queried; inaccessible hits/snippets are omitted. | T0612 |
| [ ] | T0614 | Add global search filters. | Framework/department/owner/status/date/risk/type/unit/category/tag filters compose correctly. | T0613 |
| [ ] | T0615 | Connect the topbar search input. | Submitting opens actual query results. | T0614 |
| [ ] | T0616 | Build global search result page. | Pagination, filters and record links operate on server results. | T0615 |

### 34. Report pipeline and exports

Roadmap reference: J01–J07.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0617 | Add Report model with requester, scope, filters, status and source snapshot. | A report request retains the inputs used to generate it. | T0616 |
| [ ] | T0618 | Add POST /reports. | Authorization is checked before an idempotent job is enqueued. | T0617 |
| [ ] | T0619 | Add report-render worker. | The worker reconstructs verified tenant context and records success/failure. | T0618 |
| [ ] | T0620 | Add report list/status endpoint. | Users see only authorized report jobs. | T0619 |
| [ ] | T0621 | Replace the report-generation timer with polling. | The UI shows actual queued/running/failed/completed state. | T0620 |
| [ ] | T0622 | Add shared HTML/PDF report layout. | Branding, headers, footers, page numbers and confidentiality render. | T0621 |
| [ ] | T0623 | Add table pagination to the PDF layout. | Long rows/tables remain readable across page breaks. | T0622 |
| [ ] | T0624 | Add report chart rendering. | Charts reflect the source snapshot and render in the PDF. | T0623 |
| [ ] | T0625 | Add approval-signature block. | Only recorded approvals are printed as signatures. | T0624 |
| [ ] | T0626 | Add report artifact download action. | Expired/revoked permissions prevent download even after generation. | T0625 |
| [ ] | T0627 | Connect the report Download button. | It retrieves the generated artifact through protected file access. | T0626 |
| [ ] | T0628 | Add CSV cell escaping/formula neutralization. | Dangerous spreadsheet cells cannot execute formulas when opened. | T0627 |
| [ ] | T0629 | Add Excel workbook export helper. | Dates/numbers/headers keep intended types and unsafe formulas are neutralized. | T0628 |
| [ ] | T0630 | Add CSV import parser with size/row limits. | Malformed encodings/rows return actionable parse errors. | T0629 |
| [ ] | T0631 | Add Excel import parser with sheet selection. | Only the selected sheet becomes preview data. | T0630 |
| [ ] | T0632 | Add JSON import parser with schema validation. | Invalid object structures fail before business writes. | T0631 |
| [ ] | T0633 | Add import column-mapping model. | The chosen source-to-target mapping can be reapplied to preview rows. | T0632 |
| [ ] | T0634 | Add import preview endpoint. | It returns normalized rows and row/column errors without inserting records. | T0633 |
| [ ] | T0635 | Build import upload/parser selection form. | A file opens a real preview. | T0634 |
| [ ] | T0636 | Build import column-mapping screen. | Changing a mapping refreshes validation results. | T0635 |
| [ ] | T0637 | Add explicit import-confirm endpoint. | Only the validated selected import becomes a background job. | T0636 |
| [ ] | T0638 | Add import worker transaction/batch policy. | Partial failures and retry behavior follow the documented atomicity policy. | T0637 |
| [ ] | T0639 | Add import result-report endpoint. | Created/skipped/failed counts and row errors match actual outcomes. | T0638 |
| [ ] | T0640 | Build import result summary. | Users can download the row-error report. | T0639 |

### 35. One report template per task

Roadmap reference: J03–J04.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0641 | Implement the Gap assessment report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0640 |
| [ ] | T0642 | Implement the Compliance status report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0641 |
| [ ] | T0643 | Implement the Executive summary report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0642 |
| [ ] | T0644 | Implement the Risk register report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0643 |
| [ ] | T0645 | Implement the Risk treatment report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0644 |
| [ ] | T0646 | Implement the Audit report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0645 |
| [ ] | T0647 | Implement the Findings report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0646 |
| [ ] | T0648 | Implement the CAPA report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0647 |
| [ ] | T0649 | Implement the Evidence inventory report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0648 |
| [ ] | T0650 | Implement the Control implementation report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0649 |
| [ ] | T0651 | Implement the Vendor risk report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0650 |
| [ ] | T0652 | Implement the Policy status report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0651 |
| [ ] | T0653 | Implement the Asset inventory report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0652 |
| [ ] | T0654 | Implement the Certification readiness report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0653 |
| [ ] | T0655 | Implement the Statement of applicability report template. | Generate a real PDF from a seeded snapshot; verify this report's fields, date/filter scope, totals, permissions and page breaks. | T0654 |

### 36. One export endpoint per record type

Roadmap reference: J05.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0656 | Add the risks CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0655 |
| [ ] | T0657 | Add the risks Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0656 |
| [ ] | T0658 | Connect the risks export menu. | Each format downloads the real authorized artifact. | T0657 |
| [ ] | T0659 | Add the controls CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0658 |
| [ ] | T0660 | Add the controls Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0659 |
| [ ] | T0661 | Connect the controls export menu. | Each format downloads the real authorized artifact. | T0660 |
| [ ] | T0662 | Add the assessment results CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0661 |
| [ ] | T0663 | Add the assessment results Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0662 |
| [ ] | T0664 | Connect the assessment results export menu. | Each format downloads the real authorized artifact. | T0663 |
| [ ] | T0665 | Add the findings CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0664 |
| [ ] | T0666 | Add the findings Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0665 |
| [ ] | T0667 | Connect the findings export menu. | Each format downloads the real authorized artifact. | T0666 |
| [ ] | T0668 | Add the tasks CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0667 |
| [ ] | T0669 | Add the tasks Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0668 |
| [ ] | T0670 | Connect the tasks export menu. | Each format downloads the real authorized artifact. | T0669 |
| [ ] | T0671 | Add the assets CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0670 |
| [ ] | T0672 | Add the assets Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0671 |
| [ ] | T0673 | Connect the assets export menu. | Each format downloads the real authorized artifact. | T0672 |
| [ ] | T0674 | Add the vendors CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0673 |
| [ ] | T0675 | Add the vendors Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0674 |
| [ ] | T0676 | Connect the vendors export menu. | Each format downloads the real authorized artifact. | T0675 |
| [ ] | T0677 | Add the evidence metadata CSV export endpoint. | Filtered permitted records export with safe cell escaping. | T0676 |
| [ ] | T0678 | Add the evidence metadata Excel export endpoint. | Filtered permitted records export with correct value types and safe cells. | T0677 |
| [ ] | T0679 | Connect the evidence metadata export menu. | Each format downloads the real authorized artifact. | T0678 |

### 37. One import mapping per record type

Roadmap reference: J07.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0680 | Add the framework templates import mapping/validation handler. | A valid row creates the intended record; invalid/duplicate/foreign-tenant references appear in the result report. | T0679 |
| [ ] | T0681 | Add the assets import mapping/validation handler. | A valid row creates the intended record; invalid/duplicate/foreign-tenant references appear in the result report. | T0680 |
| [ ] | T0682 | Add the risks import mapping/validation handler. | A valid row creates the intended record; invalid/duplicate/foreign-tenant references appear in the result report. | T0681 |
| [ ] | T0683 | Add the vendors import mapping/validation handler. | A valid row creates the intended record; invalid/duplicate/foreign-tenant references appear in the result report. | T0682 |
| [ ] | T0684 | Add the controls import mapping/validation handler. | A valid row creates the intended record; invalid/duplicate/foreign-tenant references appear in the result report. | T0683 |
| [ ] | T0685 | Add the users import mapping/validation handler. | A valid row creates the intended record; invalid/duplicate/foreign-tenant references appear in the result report. | T0684 |

### 38. One notification event handler per task

Roadmap reference: I06.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0686 | Implement the control assigned notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0685 |
| [ ] | T0687 | Implement the evidence requested notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0686 |
| [ ] | T0688 | Implement the evidence rejected notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0687 |
| [ ] | T0689 | Implement the evidence expiring notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0688 |
| [ ] | T0690 | Implement the task overdue notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0689 |
| [ ] | T0691 | Implement the assessment due notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0690 |
| [ ] | T0692 | Implement the audit scheduled notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0691 |
| [ ] | T0693 | Implement the finding raised notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0692 |
| [ ] | T0694 | Implement the capa overdue notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0693 |
| [ ] | T0695 | Implement the policy approval requested notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0694 |
| [ ] | T0696 | Implement the policy acknowledgment requested notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0695 |
| [ ] | T0697 | Implement the risk review due notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0696 |
| [ ] | T0698 | Implement the vendor certificate expiring notification handler. | The domain event produces the intended recipients/message/link once, respects preferences and leaks no restricted fields. | T0697 |

### 39. Integration and identity protocol foundations

Roadmap reference: K01–K04.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0699 | Add Integration and encrypted IntegrationCredential models. | Credential plaintext is never returned by ordinary API responses. | T0698 |
| [ ] | T0700 | Add integration-create endpoint. | Only permitted administrators can configure tenant integrations. | T0699 |
| [ ] | T0701 | Add integration credential-update endpoint. | The stored secret is encrypted and the action is audited. | T0700 |
| [ ] | T0702 | Add integration disconnect action. | Credentials are revoked/removed and new collections stop. | T0701 |
| [ ] | T0703 | Build integrations list page. | Each integration shows real configured/healthy/failed/disconnected status. | T0702 |
| [ ] | T0704 | Build integration configuration form. | Secret inputs are write-only and validation errors are visible. | T0703 |
| [ ] | T0705 | Add integration checkpoint/cursor storage. | A resumed collection continues without duplicate observations. | T0704 |
| [ ] | T0706 | Add integration retry/rate-limit utility. | Retry respects provider errors and bounded backoff. | T0705 |
| [ ] | T0707 | Add OIDC authorization-start endpoint. | State, nonce and redirect allowlist are enforced. | T0706 |
| [ ] | T0708 | Add OIDC callback endpoint. | Issuer/audience/signature/nonce/state and replay checks reject invalid responses. | T0707 |
| [ ] | T0709 | Add explicit identity-account linking action. | Matching an unverified email cannot take over an existing account. | T0708 |
| [ ] | T0710 | Add SAML service-provider metadata endpoint. | It exposes the configured local callback/entity identifiers. | T0709 |
| [ ] | T0711 | Add SAML assertion-consume endpoint. | Signature, audience, recipient, timing and replay rules are verified. | T0710 |
| [ ] | T0712 | Add local identity-provider fixture configuration. | OIDC and SAML success/failure cases can run without real provider accounts. | T0711 |
| [ ] | T0713 | Add scoped SCIM bearer-token verification. | Provisioning tokens are restricted to one organization. | T0712 |
| [ ] | T0714 | Add SCIM user-create action. | New users receive only configured tenant grants. | T0713 |
| [ ] | T0715 | Add SCIM user-update/deactivate action. | Deactivation revokes existing organization access. | T0714 |
| [ ] | T0716 | Add SCIM group membership synchronization. | Group mappings cannot grant permissions beyond the configured ceiling. | T0715 |
| [ ] | T0717 | Add SCIM list/pagination behavior. | Results comply with the documented supported SCIM subset. | T0716 |
| [ ] | T0718 | Build SSO/group-mapping settings form. | The organization can save allowed provider and role mappings. | T0717 |

### 40. Microsoft Entra ID SSO adapter

Roadmap reference: K03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0719 | Add Microsoft Entra ID SSO configuration validation. | Issuer/client/metadata/callback fields are validated for the supported protocol. | T0718 |
| [ ] | T0720 | Wire Microsoft Entra ID SSO into the shared login flow. | A local provider fixture successfully authenticates through this provider configuration. | T0719 |
| [ ] | T0721 | Add Microsoft Entra ID SSO negative fixture tests. | Wrong issuer, expired credentials, denied membership and unsafe linking fail. | T0720 |
| [ ] | T0722 | Document Microsoft Entra ID live setup and validation status. | Required provider-side configuration is explicit; fixture success is not labeled live verification. | T0721 |

### 41. Google Workspace SSO adapter

Roadmap reference: K03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0723 | Add Google Workspace SSO configuration validation. | Issuer/client/metadata/callback fields are validated for the supported protocol. | T0722 |
| [ ] | T0724 | Wire Google Workspace SSO into the shared login flow. | A local provider fixture successfully authenticates through this provider configuration. | T0723 |
| [ ] | T0725 | Add Google Workspace SSO negative fixture tests. | Wrong issuer, expired credentials, denied membership and unsafe linking fail. | T0724 |
| [ ] | T0726 | Document Google Workspace live setup and validation status. | Required provider-side configuration is explicit; fixture success is not labeled live verification. | T0725 |

### 42. Okta SSO adapter

Roadmap reference: K03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0727 | Add Okta SSO configuration validation. | Issuer/client/metadata/callback fields are validated for the supported protocol. | T0726 |
| [ ] | T0728 | Wire Okta SSO into the shared login flow. | A local provider fixture successfully authenticates through this provider configuration. | T0727 |
| [ ] | T0729 | Add Okta SSO negative fixture tests. | Wrong issuer, expired credentials, denied membership and unsafe linking fail. | T0728 |
| [ ] | T0730 | Document Okta live setup and validation status. | Required provider-side configuration is explicit; fixture success is not labeled live verification. | T0729 |

### 43. Auth0 SSO adapter

Roadmap reference: K03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0731 | Add Auth0 SSO configuration validation. | Issuer/client/metadata/callback fields are validated for the supported protocol. | T0730 |
| [ ] | T0732 | Wire Auth0 SSO into the shared login flow. | A local provider fixture successfully authenticates through this provider configuration. | T0731 |
| [ ] | T0733 | Add Auth0 SSO negative fixture tests. | Wrong issuer, expired credentials, denied membership and unsafe linking fail. | T0732 |
| [ ] | T0734 | Document Auth0 live setup and validation status. | Required provider-side configuration is explicit; fixture success is not labeled live verification. | T0733 |

### 44. Provider collection adapters: one concern per task

Roadmap reference: K05–K07.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0735 | Add Microsoft Entra ID authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0734 |
| [ ] | T0736 | Add the Microsoft Entra ID fetch operation for users. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0735 |
| [ ] | T0737 | Add the Microsoft Entra ID fetch operation for MFA. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0736 |
| [ ] | T0738 | Add the Microsoft Entra ID fetch operation for dormant/admin accounts. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0737 |
| [ ] | T0739 | Add the Microsoft Entra ID fetch operation for groups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0738 |
| [ ] | T0740 | Normalize Microsoft Entra ID observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0739 |
| [ ] | T0741 | Add Microsoft Entra ID reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0740 |
| [ ] | T0742 | Document Microsoft Entra ID permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0741 |
| [ ] | T0743 | Add Google Workspace authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0742 |
| [ ] | T0744 | Add the Google Workspace fetch operation for users. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0743 |
| [ ] | T0745 | Add the Google Workspace fetch operation for MFA. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0744 |
| [ ] | T0746 | Add the Google Workspace fetch operation for dormant/admin accounts. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0745 |
| [ ] | T0747 | Add the Google Workspace fetch operation for groups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0746 |
| [ ] | T0748 | Normalize Google Workspace observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0747 |
| [ ] | T0749 | Add Google Workspace reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0748 |
| [ ] | T0750 | Document Google Workspace permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0749 |
| [ ] | T0751 | Add Okta authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0750 |
| [ ] | T0752 | Add the Okta fetch operation for users. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0751 |
| [ ] | T0753 | Add the Okta fetch operation for MFA. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0752 |
| [ ] | T0754 | Add the Okta fetch operation for dormant/admin accounts. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0753 |
| [ ] | T0755 | Add the Okta fetch operation for groups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0754 |
| [ ] | T0756 | Normalize Okta observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0755 |
| [ ] | T0757 | Add Okta reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0756 |
| [ ] | T0758 | Document Okta permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0757 |
| [ ] | T0759 | Add AWS authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0758 |
| [ ] | T0760 | Add the AWS fetch operation for storage exposure. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0759 |
| [ ] | T0761 | Add the AWS fetch operation for encryption. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0760 |
| [ ] | T0762 | Add the AWS fetch operation for logging. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0761 |
| [ ] | T0763 | Add the AWS fetch operation for backups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0762 |
| [ ] | T0764 | Add the AWS fetch operation for security groups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0763 |
| [ ] | T0765 | Normalize AWS observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0764 |
| [ ] | T0766 | Add AWS reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0765 |
| [ ] | T0767 | Document AWS permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0766 |
| [ ] | T0768 | Add Microsoft Azure authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0767 |
| [ ] | T0769 | Add the Microsoft Azure fetch operation for storage exposure. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0768 |
| [ ] | T0770 | Add the Microsoft Azure fetch operation for encryption. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0769 |
| [ ] | T0771 | Add the Microsoft Azure fetch operation for logging. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0770 |
| [ ] | T0772 | Add the Microsoft Azure fetch operation for backups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0771 |
| [ ] | T0773 | Add the Microsoft Azure fetch operation for network rules. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0772 |
| [ ] | T0774 | Normalize Microsoft Azure observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0773 |
| [ ] | T0775 | Add Microsoft Azure reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0774 |
| [ ] | T0776 | Document Microsoft Azure permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0775 |
| [ ] | T0777 | Add Google Cloud authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0776 |
| [ ] | T0778 | Add the Google Cloud fetch operation for storage exposure. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0777 |
| [ ] | T0779 | Add the Google Cloud fetch operation for encryption. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0778 |
| [ ] | T0780 | Add the Google Cloud fetch operation for logging. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0779 |
| [ ] | T0781 | Add the Google Cloud fetch operation for backups. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0780 |
| [ ] | T0782 | Add the Google Cloud fetch operation for network rules. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0781 |
| [ ] | T0783 | Normalize Google Cloud observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0782 |
| [ ] | T0784 | Add Google Cloud reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0783 |
| [ ] | T0785 | Document Google Cloud permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0784 |
| [ ] | T0786 | Add GitHub authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0785 |
| [ ] | T0787 | Add the GitHub fetch operation for branch protection. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0786 |
| [ ] | T0788 | Add the GitHub fetch operation for reviews. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0787 |
| [ ] | T0789 | Add the GitHub fetch operation for vulnerabilities. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0788 |
| [ ] | T0790 | Add the GitHub fetch operation for security issues. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0789 |
| [ ] | T0791 | Add the GitHub fetch operation for deployment approvals. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0790 |
| [ ] | T0792 | Normalize GitHub observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0791 |
| [ ] | T0793 | Add GitHub reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0792 |
| [ ] | T0794 | Document GitHub permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0793 |
| [ ] | T0795 | Add GitLab authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0794 |
| [ ] | T0796 | Add the GitLab fetch operation for branch protection. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0795 |
| [ ] | T0797 | Add the GitLab fetch operation for reviews. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0796 |
| [ ] | T0798 | Add the GitLab fetch operation for vulnerabilities. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0797 |
| [ ] | T0799 | Add the GitLab fetch operation for issues. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0798 |
| [ ] | T0800 | Add the GitLab fetch operation for deployment approvals. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0799 |
| [ ] | T0801 | Normalize GitLab observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0800 |
| [ ] | T0802 | Add GitLab reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0801 |
| [ ] | T0803 | Document GitLab permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0802 |
| [ ] | T0804 | Add Bitbucket authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0803 |
| [ ] | T0805 | Add the Bitbucket fetch operation for branch restrictions. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0804 |
| [ ] | T0806 | Add the Bitbucket fetch operation for reviews. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0805 |
| [ ] | T0807 | Add the Bitbucket fetch operation for issues. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0806 |
| [ ] | T0808 | Add the Bitbucket fetch operation for deployment evidence. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0807 |
| [ ] | T0809 | Normalize Bitbucket observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0808 |
| [ ] | T0810 | Add Bitbucket reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0809 |
| [ ] | T0811 | Document Bitbucket permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0810 |
| [ ] | T0812 | Add Jira authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0811 |
| [ ] | T0813 | Add the Jira fetch operation for security issues. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0812 |
| [ ] | T0814 | Add the Jira fetch operation for change tickets. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0813 |
| [ ] | T0815 | Normalize Jira observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0814 |
| [ ] | T0816 | Add Jira reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0815 |
| [ ] | T0817 | Document Jira permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0816 |
| [ ] | T0818 | Add Azure DevOps authenticated client configuration. | Credentials are tenant-scoped, redacted and validated with fixtures. | T0817 |
| [ ] | T0819 | Add the Azure DevOps fetch operation for branch policies. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0818 |
| [ ] | T0820 | Add the Azure DevOps fetch operation for reviews. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0819 |
| [ ] | T0821 | Add the Azure DevOps fetch operation for security work items. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0820 |
| [ ] | T0822 | Add the Azure DevOps fetch operation for deployment approvals. | Fixture pages, rate limits, missing permissions and provider errors are handled for this observation type. | T0821 |
| [ ] | T0823 | Normalize Azure DevOps observations into the evidence-source contract. | Observed value, raw-source reference, timestamp and unknown/error states are preserved. | T0822 |
| [ ] | T0824 | Add Azure DevOps reconnect/cursor fixture tests. | Interrupted collection resumes without duplicating observations. | T0823 |
| [ ] | T0825 | Document Azure DevOps permissions and live validation procedure. | Required access scopes and unverified live behaviors are recorded. | T0824 |

### 45. Security-system ingest adapters

Roadmap reference: K08.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0826 | Define the SIEM ingest payload schema and local fixture. | Document the supported generic contract; name a vendor only when a vendor-specific adapter exists. | T0825 |
| [ ] | T0827 | Implement authenticated SIEM ingest endpoint. | Invalid payloads, wrong-tenant tokens and replayed messages are rejected. | T0826 |
| [ ] | T0828 | Normalize SIEM ingest records. | Source provenance, time and relevant control/check references persist. | T0827 |
| [ ] | T0829 | Define the EDR ingest payload schema and local fixture. | Document the supported generic contract; name a vendor only when a vendor-specific adapter exists. | T0828 |
| [ ] | T0830 | Implement authenticated EDR ingest endpoint. | Invalid payloads, wrong-tenant tokens and replayed messages are rejected. | T0829 |
| [ ] | T0831 | Normalize EDR ingest records. | Source provenance, time and relevant control/check references persist. | T0830 |
| [ ] | T0832 | Define the Vulnerability scanner ingest payload schema and local fixture. | Document the supported generic contract; name a vendor only when a vendor-specific adapter exists. | T0831 |
| [ ] | T0833 | Implement authenticated Vulnerability scanner ingest endpoint. | Invalid payloads, wrong-tenant tokens and replayed messages are rejected. | T0832 |
| [ ] | T0834 | Normalize Vulnerability scanner ingest records. | Source provenance, time and relevant control/check references persist. | T0833 |
| [ ] | T0835 | Define the Ticketing platform ingest payload schema and local fixture. | Document the supported generic contract; name a vendor only when a vendor-specific adapter exists. | T0834 |
| [ ] | T0836 | Implement authenticated Ticketing platform ingest endpoint. | Invalid payloads, wrong-tenant tokens and replayed messages are rejected. | T0835 |
| [ ] | T0837 | Normalize Ticketing platform ingest records. | Source provenance, time and relevant control/check references persist. | T0836 |
| [ ] | T0838 | Define the Security-awareness platform ingest payload schema and local fixture. | Document the supported generic contract; name a vendor only when a vendor-specific adapter exists. | T0837 |
| [ ] | T0839 | Implement authenticated Security-awareness platform ingest endpoint. | Invalid payloads, wrong-tenant tokens and replayed messages are rejected. | T0838 |
| [ ] | T0840 | Normalize Security-awareness platform ingest records. | Source provenance, time and relevant control/check references persist. | T0839 |

### 46. Automated evidence checks

Roadmap reference: K09–K10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0841 | Add automated-check definition/result models. | Each result stores integration, check, source, collection time, raw evidence, control and next run. | T0840 |
| [ ] | T0842 | Add scheduled check-run job. | Retrying an occurrence cannot duplicate the same observation. | T0841 |
| [ ] | T0843 | Add check-result-to-evidence creation action. | It produces a new evidence version with source provenance. | T0842 |
| [ ] | T0844 | Build automated-check results page. | Pass/fail/unknown/error are visibly distinct and link to raw authorized evidence. | T0843 |
| [ ] | T0845 | Implement the “Admin MFA enabled” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0844 |
| [ ] | T0846 | Add fixtures for the “Admin MFA enabled” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0845 |
| [ ] | T0847 | Implement the “Cloud storage not public” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0846 |
| [ ] | T0848 | Add fixtures for the “Cloud storage not public” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0847 |
| [ ] | T0849 | Implement the “Backups enabled” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0848 |
| [ ] | T0850 | Add fixtures for the “Backups enabled” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0849 |
| [ ] | T0851 | Implement the “Audit logs enabled” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0850 |
| [ ] | T0852 | Add fixtures for the “Audit logs enabled” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0851 |
| [ ] | T0853 | Implement the “Password policy met” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0852 |
| [ ] | T0854 | Add fixtures for the “Password policy met” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0853 |
| [ ] | T0855 | Implement the “Critical vulnerabilities resolved” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0854 |
| [ ] | T0856 | Add fixtures for the “Critical vulnerabilities resolved” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0855 |
| [ ] | T0857 | Implement the “GitHub branch protection enabled” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0856 |
| [ ] | T0858 | Add fixtures for the “GitHub branch protection enabled” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0857 |
| [ ] | T0859 | Implement the “Encryption enabled” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0858 |
| [ ] | T0860 | Add fixtures for the “Encryption enabled” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0859 |
| [ ] | T0861 | Implement the “No risky public security-group ports” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0860 |
| [ ] | T0862 | Add fixtures for the “No risky public security-group ports” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0861 |
| [ ] | T0863 | Implement the “Users reviewed recently” check evaluator. | Define required observations and explicit pass/fail/unknown rules; absence of data never becomes a pass. | T0862 |
| [ ] | T0864 | Add fixtures for the “Users reviewed recently” check. | Verify pass, fail, missing/stale source and provider-error outcomes. | T0863 |

### 47. Version history per entity

Roadmap reference: C03, L03.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0865 | Wire policies mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0864 |
| [ ] | T0866 | Add policies version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0865 |
| [ ] | T0867 | Add safe policies restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0866 |
| [ ] | T0868 | Wire controls mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0867 |
| [ ] | T0869 | Add controls version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0868 |
| [ ] | T0870 | Add safe controls restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0869 |
| [ ] | T0871 | Wire risks mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0870 |
| [ ] | T0872 | Add risks version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0871 |
| [ ] | T0873 | Add safe risks restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0872 |
| [ ] | T0874 | Wire assessments mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0873 |
| [ ] | T0875 | Add assessments version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0874 |
| [ ] | T0876 | Add safe assessments restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0875 |
| [ ] | T0877 | Wire frameworks mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0876 |
| [ ] | T0878 | Add frameworks version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0877 |
| [ ] | T0879 | Add safe frameworks restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0878 |
| [ ] | T0880 | Wire evidence metadata mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0879 |
| [ ] | T0881 | Add evidence metadata version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0880 |
| [ ] | T0882 | Add safe evidence metadata restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0881 |
| [ ] | T0883 | Wire findings mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0882 |
| [ ] | T0884 | Add findings version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0883 |
| [ ] | T0885 | Add safe findings restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0884 |
| [ ] | T0886 | Wire vendor assessments mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0885 |
| [ ] | T0887 | Add vendor assessments version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0886 |
| [ ] | T0888 | Add safe vendor assessments restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0887 |
| [ ] | T0889 | Wire reports mutations to version snapshots. | Actor, reason and prior values remain accessible after an edit. | T0888 |
| [ ] | T0890 | Add reports version-list/compare UI. | Only authorized historical fields appear; selected revisions compare correctly. | T0889 |
| [ ] | T0891 | Add safe reports restore action. | Restore creates a new draft/revision, preserves approvals/history and cannot bypass current validation. | T0890 |

### 48. Public pages, local quality checks and handover

Roadmap reference: L01–L10.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0892 | Create public layout without the authenticated sidebar. | Public routes render without tenant data. | T0891 |
| [ ] | T0893 | Build the landing page. | Calls to action link to real local registration/login/documentation routes. | T0892 |
| [ ] | T0894 | Build the pricing page from explicit local plan metadata. | It makes no claim that an unimplemented payment flow is active. | T0893 |
| [ ] | T0895 | Build the documentation page. | It links to local setup and available API documentation. | T0894 |
| [ ] | T0896 | Add user-profile update endpoint. | A user can update only allowed own-profile fields. | T0895 |
| [ ] | T0897 | Build user-profile form. | Changes persist and protected role/status fields cannot be edited. | T0896 |
| [ ] | T0898 | Add tags model and resource-tag actions. | Tags are scoped and available to authorized search filters. | T0897 |
| [ ] | T0899 | Attach comment file references through the file-security service. | Unauthorized or quarantined files cannot be attached. | T0898 |
| [ ] | T0900 | Add request idempotency storage for protected mutation routes. | Repeated same-key/same-body actions reuse a result; changed body conflicts. | T0899 |
| [ ] | T0901 | Configure CORS with the local web origin allowlist. | An unexpected origin receives no credentialed access. | T0900 |
| [ ] | T0902 | Add CSRF protection for cookie-authenticated mutations. | Forged cross-site mutations fail. | T0901 |
| [ ] | T0903 | Add security headers and content-security policy. | App assets/editor/previews work with the documented policy. | T0902 |
| [ ] | T0904 | Add sensitive-field log redaction. | Passwords, tokens, credentials and restricted content never appear in logs. | T0903 |
| [ ] | T0905 | Add local request/DB duration metrics. | Metrics expose counts and durations without tenant-sensitive payloads. | T0904 |
| [ ] | T0906 | Add worker failure/queue-length metrics. | Failed jobs and queue backlog appear in local diagnostics. | T0905 |
| [ ] | T0907 | Add trace IDs across API/outbox/worker/storage/provider operations. | A report or collection failure can be followed end to end. | T0906 |
| [ ] | T0908 | Add local platform-health view. | Authorized administrators can see actual service/job health. | T0907 |
| [ ] | T0909 | Replace the sidebar's hardcoded user name and role. | The display comes from the current authenticated membership. | T0908 |
| [ ] | T0910 | Remove the remaining browser Supabase data calls. | Runtime reads/writes use the protected API. | T0909 |
| [ ] | T0911 | Remove static dashboard counts and presentation-only actions. | Every enabled action is backed by implemented behavior. | T0910 |
| [ ] | T0912 | Check keyboard navigation and focus for dialogs/drawers. | Focus enters, remains usable and returns to the trigger. | T0911 |
| [ ] | T0913 | Check form labels and validation announcement. | A keyboard/screen-reader user can identify and correct invalid fields. | T0912 |
| [ ] | T0914 | Check mobile sidebar and tables. | Navigation and record actions remain reachable at narrow widths. | T0913 |
| [ ] | T0915 | Add local backup command documentation. | It names only the intended database and private file directory. | T0914 |
| [ ] | T0916 | Verify restore into a separate local test database/directory. | A restored evidence record can retrieve its matching file. | T0915 |
| [ ] | T0917 | Run dependency/security checks and record outcomes. | Confirmed issues are fixed or listed as explicit remaining blockers. | T0916 |
| [ ] | T0918 | Run a migration from an existing seeded database. | Previously created records and histories survive. | T0917 |
| [ ] | T0919 | Run a realistic-volume pagination/query check. | Large lists remain bounded and required filters use appropriate indexes. | T0918 |
| [ ] | T0920 | Write root README quick start. | A clean machine has a documented install/migrate/seed/dev sequence. | T0919 |
| [ ] | T0921 | Write environment-variable reference. | Each variable has purpose/default/example without real secrets. | T0920 |
| [ ] | T0922 | Write API/module architecture notes. | The core requirement/control/evidence/result/remediation relations are explained. | T0921 |
| [ ] | T0923 | Reconcile every prompt field/status/workflow against completed checkboxes. | Any missing item becomes a new atomic task before claiming completion. | T0922 |
| [ ] | T0924 | Record external-provider live validation separately from local fixtures. | Unverified real integrations remain explicitly unverified. | T0923 |

### 49. FinSecure demonstration: one scenario step per task

Roadmap reference: L06–L07.

| Done | ID | Implement this one change | Completion check | After |
| --- | --- | --- | --- | --- |
| [ ] | T0925 | Seed FinSecure profile and business units. | The fictional organization has the requested complete local profile. | T0924 |
| [ ] | T0926 | Seed a second organization and permission-test identities. | Tenant isolation can be tested without modifying FinSecure. | T0925 |
| [ ] | T0927 | Demonstrate team invitation and activation. | The captured invite link activates the intended membership. | T0926 |
| [ ] | T0928 | Demonstrate three-framework activation. | ISO 27001, PCI DSS and NIST CSF have separate pinned programs. | T0927 |
| [ ] | T0929 | Demonstrate one-control-to-three-framework mapping. | One implementation supports all three without duplicate evidence. | T0928 |
| [ ] | T0930 | Demonstrate assessment assignment and response review. | Question assignment, submission and N/A approval persist. | T0929 |
| [ ] | T0931 | Demonstrate real evidence upload/scan/review. | An actual local file is approved and downloadable with authorization. | T0930 |
| [ ] | T0932 | Demonstrate a missing-control risk. | Its inherent/residual scores match the configured scale. | T0931 |
| [ ] | T0933 | Demonstrate assigned remediation progress. | A task progresses through its allowed states. | T0932 |
| [ ] | T0934 | Demonstrate an audit test. | The test preserves samples, conclusions and examined evidence versions. | T0933 |
| [ ] | T0935 | Demonstrate a finding and management response. | The response is attributed to the authorized auditee. | T0934 |
| [ ] | T0936 | Demonstrate CAPA verification and closure. | An independent review is required and recorded. | T0935 |
| [ ] | T0937 | Demonstrate branded readiness report download. | A real generated PDF opens and reflects the selected snapshot. | T0936 |
| [ ] | T0938 | Demonstrate before/after score explanation. | Improvement follows actual approved changes rather than static chart values. | T0937 |
| [ ] | T0939 | Verify tenant B cannot access FinSecure detail/list/export/file routes. | ID substitution and broader filters are denied. | T0938 |
| [ ] | T0940 | Verify vendor and expired-auditor restrictions. | Unrelated/internal records are absent and expired grants fail. | T0939 |
| [ ] | T0941 | Verify unapproved platform support access is denied. | A platform administrator cannot fetch customer evidence without approval. | T0940 |
| [ ] | T0942 | Restart local services and replay key reads. | Records, jobs, report artifacts and version history survive. | T0941 |

## Start with these five changes

1. **T0001:** Record the Express-versus-Nest decision.
2. **T0002:** Create the root npm workspace manifest.
3. **T0003:** Create the web workspace manifest.
4. **T0004:** Add the Vite entry HTML and React root.
5. **T0005:** Copy the existing Tailwind/Shadcn configuration.

After T0005, only the local frontend foundation should be claimed complete. Authentication, database behavior and compliance features are later checkboxes.

Suggested execution request: “Implement T0001 only from docs/ATOMIC_IMPLEMENTATION_TASKS.md. Update its checkbox and record verification when finished.”
