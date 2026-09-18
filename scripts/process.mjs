import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function runNode(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit', ...options });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error('Command failed with ' + (signal ?? code))));
  });
}
export function npmArgs(args) {
  if (!process.env.npm_execpath) throw new Error('Run this command with npm from the repository root.');
  return [process.env.npm_execpath, ...args];
}
export const npm = (args, options) => runNode(npmArgs(args), options);

