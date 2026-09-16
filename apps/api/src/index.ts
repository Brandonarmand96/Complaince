import { createApp } from './app.js';
import { ConfigurationError, loadEnvironment, type ApiEnvironment } from './config/environment.js';

const host = '127.0.0.1';
let environment: ApiEnvironment;
try {
  environment = loadEnvironment();
} catch (error) {
  console.error(error instanceof ConfigurationError ? error.message : 'API configuration could not be loaded.');
  process.exit(1);
}
const { port } = environment;

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
