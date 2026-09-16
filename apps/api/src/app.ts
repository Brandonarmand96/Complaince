import express from 'express';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  // Liveness only: database and other dependency checks belong to /health/ready.
  app.get('/health/live', (_request, response) => {
    response.status(200).json({ status: 'ok', service: 'complyos-api' });
  });

  return app;
}
