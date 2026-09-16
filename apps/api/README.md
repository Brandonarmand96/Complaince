# ComplyOS API

From the repository root:

```powershell
npm run dev --workspace @complyos/api
```

Or build and run the compiled API:

```powershell
npm run build --workspace @complyos/api
npm run start --workspace @complyos/api
```

The API binds to `127.0.0.1`. The default port is `4000`; set `PORT` in the process environment to use another port. Invalid port values stop startup with an error.

`GET http://127.0.0.1:4000/health/live` returns HTTP 200 with:

```json
{ "status": "ok", "service": "complyos-api" }
```

This endpoint checks process liveness only. Database readiness, authentication and business endpoints are separate implementation tasks.
