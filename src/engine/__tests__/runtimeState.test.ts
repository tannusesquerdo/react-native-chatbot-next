import { describe, expect, it } from 'vitest';
import { applyUpdateStep, createEndPayload, toRenderedMap } from '../runtimeState';

describe('runtimeState', () => {
  it('maps rendered steps by id', () => {
    const steps = [
      { id: '1', message: 'Hello' },
      { id: '2', message: 'World' },
    ];

    const map = toRenderedMap(steps);
    expect(map['1']?.message).toBe('Hello');
    expect(map['2']?.message).toBe('World');
  });

  it('applyUpdateStep removes target id entries', () => {
    const steps = [
      { id: '1', message: 'First' },
      { id: '2', message: 'Second' },
      { id: '1', message: 'First-again' },
    ];

    const updated = applyUpdateStep(steps, '1');
    expect(updated).toHaveLength(1);
    expect(updated[0]?.id).toBe('2');
  });

  it('createEndPayload keeps rendered order and values', () => {
    const rendered = [
      { id: '1', message: 'Welcome' },
      { id: '2-value', message: 'john', value: 'john' },
    ];
    const values = ['john'];

    const payload = createEndPayload(rendered, values);
    expect(payload.renderedSteps[0]?.id).toBe('1');
    expect(payload.renderedSteps[1]?.id).toBe('2-value');
    expect(payload.values).toEqual(['john']);
    expect(payload.steps['1']?.message).toBe('Welcome');
  });
});
