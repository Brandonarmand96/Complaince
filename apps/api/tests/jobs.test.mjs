import { describe, it, expect } from '@jest/globals';
import { nextHealthAttempt } from '@complyos/runtime/jobs';
describe('health job transitions', () => {
  it('retries twice, completes, and ignores duplicate delivery', () => {
    let record = { attempts: 0, status: 'QUEUED', failUntil: 2 };
    record = { ...record, ...nextHealthAttempt(record) };
    expect(record).toMatchObject({ attempts: 1, status: 'RETRYING' });
    record = { ...record, ...nextHealthAttempt(record) };
    record = { ...record, ...nextHealthAttempt(record) };
    record = { ...record, ...nextHealthAttempt(record) };
    expect(record).toMatchObject({ attempts: 3, status: 'COMPLETED', lastError: null });
  });
  it('stops at the third failure', () => {
    let record = { attempts: 0, status: 'QUEUED', failUntil: 3 };
    for (let i = 0; i < 4; i++) record = { ...record, ...nextHealthAttempt(record) };
    expect(record).toMatchObject({ attempts: 3, status: 'FAILED' });
  });
});

