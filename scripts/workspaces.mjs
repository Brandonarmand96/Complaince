import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { npm, npmArgs, root, runNode } from './process.mjs';
const packages = ['contracts', 'runtime', 'api', 'worker', 'web'];
const workspace = (task, name) => npm(['run', task, '--workspace', '@complyos/' + name]);
async function build() {
  for (const name of packages) await workspace('build', name);
}
async function tests() {
  await workspace('test', 'api');
  await workspace('test', 'web');
  await runNode(['scripts/browser-tests.mjs']);
}
async function concurrent(mode) {
  const children = [];
  let stopping = false;
  const stop = (exitCode) => {
    if (stopping) return;
    stopping = true;
    process.exitCode = exitCode;
    for (const child of children) {
      if (!child.pid || child.exitCode !== null) continue;
      if (process.platform === 'win32') spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
      else child.kill('SIGTERM');
    }
  };
  for (const name of ['api', 'worker', 'web']) {
    const task = name === 'web' && mode === 'start' ? 'preview' : mode;
    const args = ['run', task, '--workspace', '@complyos/' + name];
    if (name === 'web') args.push('--', '--port', '5173', '--strictPort');
    const child = spawn(process.execPath, npmArgs(args), { cwd: root, stdio: 'inherit', windowsHide: true });
    children.push(child);
    child.once('error', () => stop(1));
    child.once('exit', (code) => { if (!stopping) stop(code === 0 ? 0 : 1); });
  }
  process.once('SIGINT', () => stop(0));
  process.once('SIGTERM', () => stop(0));
}
try {
  const command = process.argv[2];
  if (command === 'build') await build();
  else if (['typecheck', 'lint'].includes(command)) for (const name of packages) await workspace(command, name);
  else if (command === 'test') await tests();
  else if (command === 'validate') {
    await build();
    for (const task of ['typecheck', 'lint']) for (const name of packages) await workspace(task, name);
    await tests();
    const testEnv = { ...(existsSync('.env.test') ? parseEnv(readFileSync('.env.test', 'utf8')) : {}), ...process.env };
    if (testEnv.TEST_DATABASE_URL && testEnv.TEST_REDIS_URL) await runNode(['scripts/integration.mjs']);
    else console.log('SKIPPED live integration: supply TEST_DATABASE_URL and TEST_REDIS_URL in .env.test. No application data was touched.');
  } else if (command === 'dev') {
      for (const name of ['contracts', 'runtime']) await workspace('build', name);
    await concurrent('dev');
  } else if (command === 'start') await concurrent('start');
  else throw new Error('Unknown workspace command.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
