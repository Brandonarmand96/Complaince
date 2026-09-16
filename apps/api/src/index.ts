import { createApp } from './app.js';

const host = '127.0.0.1';
const portInput = process.env.PORT ?? '4000';
const port = Number(portInput);

if (!/^\d+$/.test(portInput) || !Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('API configuration error: PORT must be an integer between 1 and 65535.');
  process.exit(1);
}

const server = createApp().listen(port, host, () => {
  console.info(`ComplyOS API listening at http://${host}:${port}`);
});

server.on('error', (error: NodeJS.ErrnoException) => {
  console.error(`API startup failed (${error.code ?? 'UNKNOWN'}). Check the configured port.`);
  process.exitCode = 1;
});

function shutdown() {
  server.close((error) => {
    if (error) {
      console.error('API shutdown failed.');
      process.exitCode = 1;
    }
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
