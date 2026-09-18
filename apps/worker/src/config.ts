import { connectionEnvironment, readEnvironment } from '@complyos/runtime/environment';
export function loadEnvironment() {
  return connectionEnvironment(readEnvironment(new URL('../.env', import.meta.url)));
}
