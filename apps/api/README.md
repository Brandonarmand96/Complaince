# ComplyOS API

From the repository root:

First copy `apps/api/.env.example` to `apps/api/.env` if that file does not already exist, and replace the example database credentials. `.env` files are ignored by source control; the example contains no real secrets.

```powershell
npm run dev --workspace @complyos/api
```

Or build and run the compiled API:

```powershell
npm run build --workspace @complyos/api
npm run start --workspace @complyos/api
```

The API binds to `127.0.0.1`. It loads `apps/api/.env` independently of the working directory; it does not read the legacy root `.env`. Process environment variables override file values. A file is optional when all required values are provided by the process environment.

| Variable | Required | Default | Validation |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development` | `development`, `test` or `production` |
| `PORT` | No | `4000` | Integer from 1 to 65535 |
| `DATABASE_URL` | Yes | None | `postgres://` or `postgresql://` URL with a host and database name |

Invalid configuration stops startup before opening a port. Error messages name the field and rule without echoing supplied values. Database URL validation does not establish a connection; Prisma connectivity belongs to T0014.

Run configuration validation checks with `npm run test:config --workspace @complyos/api`.

`GET http://127.0.0.1:4000/health/live` returns HTTP 200 with:

```json
{ "status": "ok", "service": "complyos-api" }
```

This endpoint checks process liveness only. Database readiness, authentication and business endpoints are separate implementation tasks.
