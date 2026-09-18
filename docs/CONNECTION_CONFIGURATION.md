# Service connection configuration

ComplyOS runs its web, API and worker processes on your computer. PostgreSQL and Redis can be hosted elsewhere. No local database, Redis server, Docker or WSL setup is required.

## Supply your URLs

1. In `apps/api/.env`, fill in `DATABASE_URL` and `REDIS_URL` from your providers.
2. Use the same values in `apps/worker/.env` for the queue worker.
3. Set `VITE_API_URL=http://127.0.0.1:4000` in `apps/web/.env` for the local API.

The matching `.env.example` files are safe templates. Existing `.env` files must be preserved when setting up a checkout. All `.env` files are ignored by source control. Never put database or Redis credentials in the web environment: Vite variables are public browser configuration.

PostgreSQL accepts `postgres://` or `postgresql://` URLs with a database name. Preserve the provider's TLS settings such as `?sslmode=require`. Redis accepts `redis://` or TLS-enabled `rediss://` URLs; use the Redis protocol endpoint, not an HTTPS REST endpoint. Percent-encode special characters in usernames and passwords when assembling a URL yourself.

Blank required URLs fail configuration validation without echoing credentials. Providing a URL does not install or start the service. Configuration validation checks the URL format; successful connectivity must be verified separately after credentials are supplied.

## Integration test resources

Live integration tests need a separate, disposable PostgreSQL database named `complyos_test` and a separate Redis database or instance. They use explicit `TEST_DATABASE_URL` and `TEST_REDIS_URL` in the root `.env.test`, with no fallback to application credentials. The guard rejects the configured application resources. Hosted endpoints are supported, including providers that only support Redis database 0 when using a separate test instance. A unique queue prefix isolates each run. Do not point integration tests at production resources.

The remaining setup work and the final consolidated validation pass are tracked in `ATOMIC_IMPLEMENTATION_TASKS.md`. No live database or queue validation is claimed until test URLs are configured and those checks have run.
