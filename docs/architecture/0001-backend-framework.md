# ADR 0001: Express with TypeScript for the local API

- Status: Accepted
- Date: 2026-09-15
- Task: T0001

## Context

The supplied Security Compliance Management Platform prompt contains conflicting backend instructions:

- Its Backend Stack section explicitly specifies Node.js/Express with TypeScript.
- Its Architecture Implementation Requirements section specifies a NestJS module structure.
- Its event architecture specifies NestJS EventEmitter, and its development sequence includes NestJS.

The existing application uses Next.js and browser-side Supabase queries. The audit found no Express or NestJS application backend to preserve. The user has approved beginning the local implementation plan, which selects Express with TypeScript and defers deployment infrastructure.

## Decision

Build one modular **Express API in TypeScript**, located in the planned `apps/api` workspace. Treat the prompt's explicit backend-stack selection as the framework choice. Preserve the domain separation and responsibilities described in its NestJS-oriented sections using ordinary TypeScript modules and Express middleware.

Each domain owns its routes/controllers, services, repositories, DTOs, authorization policies, events and relevant tests. Add these components as their implementation tasks require them. Controllers handle HTTP input/output; services enforce business rules; repositories handle persistence. Construct dependencies explicitly at the application composition root.

Use Express middleware for authentication, tenant resolution, permission checks, request validation and error handling. Resource-level authorization also belongs in service/policy code so workers and other non-HTTP callers cannot bypass it.

Use the planned in-process domain-event dispatcher with a transactional outbox for durable delivery, and BullMQ for background processing. This fulfills the event responsibilities without depending on NestJS EventEmitter. These mechanisms are future implementation tasks, not implemented by this decision.

## Related stack choices retained

Project naming: **ComplyOS** is the user-approved product name. The root npm package is `complyos`; workspace packages use the `@complyos` scope (for example, `@complyos/web`).

- Prisma with local PostgreSQL for persistence.
- JWT access tokens, rotating refresh sessions and Argon2 password hashing.
- class-validator DTO validation, OpenAPI documentation and Jest backend tests.
- Local Redis and BullMQ with a separate worker workspace.
- React/Vite frontend calling the versioned `/api/v1` API.

Local operation retains authentication, authorization, tenant isolation and protected file access. Cloud hosting, reverse proxies, containers and deployment pipelines remain deferred as defined in the implementation plan.

## Alternatives considered

**NestJS:** Matches the later module examples and supplies framework conventions for dependency injection, guards and events. It conflicts with the explicit Express stack choice and would require revising the accepted plan. Its organizational concepts remain useful in the Express implementation.

**Continue using browser-side Supabase as the application backend:** Reuses the current demo's access pattern, but does not implement the requested Express API or the planned server-owned authorization and workflow layer.

## Consequences

- The API follows one framework convention across domains.
- Express requires us to implement and consistently apply module boundaries, dependency wiring, validation and authorization conventions.
- Existing React UI components can be ported incrementally; this decision does not require a simultaneous screen rewrite.
- Nest-specific guards, decorators and EventEmitter usage in the prompt are interpreted by responsibility rather than copied as framework dependencies.
- A future framework change requires a new decision record explaining why it supersedes this one.

## Verification

This record explicitly selects Express/TypeScript, identifies the conflicting NestJS instructions and explains their implementation equivalents. It matches the architecture choice in the local implementation plan. T0001 changes documentation only; no runtime behavior or dependency installation is claimed.
