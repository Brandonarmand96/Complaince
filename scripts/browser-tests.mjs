import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { root, runNode } from './process.mjs';

const server = spawn(process.execPath, [
  'node_modules/vite/bin/vite.js',
  'apps/web',
  '--host', '127.0.0.1',
  '--port', '5179',
  '--strictPort',
], {
  cwd: root,
  stdio: ['ignore', 'inherit', 'inherit'],
  env: { ...process.env, VITE_API_URL: 'http://127.0.0.1:4119' },
  windowsHide: true,
});

async function stopServer() {
  if (!server.pid || server.exitCode !== null) return;
  server.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => server.once('exit', resolve)),
    delay(2_000),
  ]);
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error('Browser test web server exited before becoming ready.');
    try {
      const response = await fetch('http://127.0.0.1:5179');
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for Vite. */ }
    await delay(250);
  }
  if (!ready) throw new Error('Browser test web server was not ready within 15 seconds.');

  await runNode(['node_modules/@playwright/test/cli.js', 'test'], {
    env: { ...process.env, PLAYWRIGHT_EXTERNAL_SERVER: '1' },
  });
} finally {
  await stopServer();
}
