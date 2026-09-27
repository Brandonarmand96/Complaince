import { compareSnapshots, domainEventTypes, validateDomainEvent } from '@complyos/runtime/governance';
import { evaluateConditions, parseMentionIds } from '@complyos/runtime/workflows';

describe('governance primitives', () => {
  test('registers and validates the eleven supported domain events', () => {
    expect(domainEventTypes).toHaveLength(11);
    for (const type of domainEventTypes) expect(() => validateDomainEvent(type, { id: 'resource' })).not.toThrow();
    expect(() => validateDomainEvent('EXECUTE_ARBITRARY_CODE', {})).toThrow(/Unsupported/);
    expect(() => validateDomainEvent(domainEventTypes[0], null)).toThrow(/Unsupported/);
  });

  test('compares snapshots without exposing restricted fields', () => {
    expect(compareSnapshots({ status: 'NEW', secret: 'a' }, { status: 'DONE', secret: 'b' }, ['secret']))
      .toEqual([{ field: 'status', before: 'NEW', after: 'DONE' }]);
  });

  test('evaluates only allowlisted declarative workflow operators', () => {
    const record = { status: 'OPEN', severity: 'HIGH', ownerId: 'member' };
    expect(evaluateConditions([{ field: 'status', operator: 'eq', value: 'OPEN' }, { field: 'severity', operator: 'in', value: ['HIGH', 'CRITICAL'] }], record)).toBe(true);
    expect(() => evaluateConditions([{ field: 'status', operator: 'eval', value: 'process.exit()' }], record)).toThrow(/Unsupported/);
  });

  test('extracts structured mentions and ignores plain at-sign text', () => {
    expect(parseMentionIds('Ask @[A User](11111111-1111-1111-1111-111111111111), not person@example.com.'))
      .toEqual(['11111111-1111-1111-1111-111111111111']);
  });
});
