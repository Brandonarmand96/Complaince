# ComplyOS

Security compliance platform under construction. The React application, Express API and BullMQ worker run on this computer; PostgreSQL and Redis use connection URLs you supply. No WSL, Docker or local service installation is required.

## Windows prerequisites

- Node.js **22.12 or newer**, with npm available in PowerShell (`node --version`, `npm.cmd --version`).
- A PostgreSQL database and a Redis protocol endpoint (`redis://` or TLS `rediss://`) that supports BullMQ commands and persistent connections. HTTPS REST endpoints are not Redis protocol URLs.
- Microsoft Edge for the browser smoke tests on Windows. Alternatively install Playwright Chromium and set `PLAYWRIGHT_CHANNEL=chromium`.

## Configure and start

Run all commands from the repository root. Use `npm.cmd` if PowerShell blocks the `npm.ps1` shim.

1. Run `npm.cmd install`.
2. Copy each `apps/api/.env.example`, `apps/worker/.env.example` and `apps/web/.env.example` to `.env` in that same folder **only if it does not already exist**.
3. Fill `DATABASE_URL` and `REDIS_URL` in both server environments with the **same** provider URLs. Keep credentials out of the web environment. The web only needs `VITE_API_URL=http://127.0.0.1:4000`.
4. Run `npm.cmd run build` to build each workspace once. Neon/PostgreSQL uses the direct `pg` driver; there is no ORM generation step.
5. Run `npm.cmd run db:migrate` to apply the checked-in additive schema to your configured database. This never resets a database. Apply it to your development database, not a production system.
6. Run `npm.cmd start` to start the built API, worker and web preview. For source editing use `npm.cmd run dev` instead.

| Service | Local address / configuration |
| --- | --- |
| Web | http://127.0.0.1:5173 |
| API liveness | http://127.0.0.1:4000/health/live |
| Dependency readiness | http://127.0.0.1:4000/health/ready |
| API documentation | http://127.0.0.1:4000/api/docs |
| Worker | No listening port; consumes the configured Redis queue |
| PostgreSQL and Redis | Your URLs; nothing starts them locally |

The root start/dev commands stop their sibling processes if one exits. Stop the group with Ctrl+C. Shared packages build before development startup; restart `npm run dev` after editing shared runtime source. The API binds only to `127.0.0.1`; CORS permits `WEB_ORIGIN` (default `http://127.0.0.1:5173`). If changing the web port, update both CORS and the launch command. Keep API and worker `QUEUE_PREFIX` equal (default `complyos`).

Environment files are loaded relative to each server workspace; the legacy root `.env` is not read by application startup. Explicit process variables override workspace file values. Blank required URLs stop startup with a field name, without echoing the URL. TLS parameters from providers are preserved.

For Neon, copy the PostgreSQL connection string from the project's connection dialog and retain its TLS settings. The Node processes use `pg` directly with a bounded pool and parameterized SQL. Versioned SQL files live in `packages/runtime/migrations`; the migration runner records checksums and refuses edits to applied migrations. Existing foundation tables are preserved.

## Validate once after implementation

```powershell
npm.cmd run validate
```

This performs one ordered pass: builds → TypeScript → ESLint → Jest API tests → Vitest web tests → desktop/mobile browser tests. A failing command stops the pass with a nonzero exit code. Browser checks use an isolated web port (5179) and clearly mocked API responses, not your database. Screenshots and failure traces are under ignored `test-results/`.

Optional live integration tests use `.env.test` copied from `.env.test.example`. Supply `TEST_DATABASE_URL` for a disposable database named `complyos_test`, plus a **different** Redis database or instance in `TEST_REDIS_URL`. Hosted services and Redis database 0 on a separate instance are supported. The guard rejects configured application resources before any schema change. Tests use a unique queue prefix and delete only records from their run; no FLUSHDB, FLUSHALL or database reset is used.

With both test URLs present, `validate` also runs live retries/deduplication tests. Otherwise it explicitly reports them skipped. `npm.cmd run test:integration` refuses missing test URLs. Never substitute application URLs to get a green test.

Other commands (after the initial build): `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test`, and `npm.cmd run db:check` (read-only PostgreSQL connection check).

## Foundation behavior and limits

- `/health/live` checks the process; `/health/ready` returns 503 when PostgreSQL or Redis is unavailable. It does not claim the worker is running or that migrations have been applied.
- Unexpected errors return a safe error envelope and request ID. The same generated ID appears in structured request logs. Request bodies, headers and connection URLs are not logged.
- The Dashboard has a connection check, a sample job form with client/server validation, and the latest five jobs. Sample jobs are system diagnostics, not compliance records.
- Jobs persist before enqueueing. The worker reconciles up to 100 pending jobs every 10 seconds after a Redis outage. Failures retry at most three times, with 1s/2s exponential delays. A unique request key and a transactionally unique effect prevent duplicates. Reusing a key for a different payload returns 409. Completed/failed queue entries are retained for up to a day, capped at 1,000 of each; durable records remain in PostgreSQL.
- GET/POST `/api/v1/setup/jobs` are development-only and disabled with `NODE_ENV=production`. Identity, tenant boundaries and production deployment are later phases; this foundation is not a production authentication system.
- Lists use `page=1`, `limit=20` by default; page is 1–10,000 and limit is 1–100. Invalid values are rejected. Sort permits `createdAt`, `label`, `status`; direction permits `asc`, `desc`; status filters permit `QUEUED`, `RETRYING`, `COMPLETED`, `FAILED`.

See [the atomic backlog](docs/ATOMIC_IMPLEMENTATION_TASKS.md), [the original audit](docs/LOCAL_IMPLEMENTATION_PLAN.md) and [connection configuration](docs/CONNECTION_CONFIGURATION.md). The legacy Next.js prototype remains available with `npm.cmd run legacy:dev`; it is not the current implementation target.
