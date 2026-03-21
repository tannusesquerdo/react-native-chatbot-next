import { describe, expect, it } from 'vitest';
import { nextStepId, resolveTrigger } from '../triggerResolver';

describe('triggerResolver', () => {
  it('resolves static trigger', () => {
    expect(resolveTrigger('2', { steps: {}, value: 'x' })).toBe('2');
  });

  it('resolves function trigger', () => {
    const trigger = ({ value }: { value?: unknown }) => (value === 'yes' ? 'ok' : 'no');
    expect(resolveTrigger(trigger, { value: 'yes', steps: {} })).toBe('ok');
  });

  it('returns undefined when step is end', () => {
    const step = { id: '1', message: 'done', end: true };
    expect(nextStepId(step, { steps: {}, value: undefined })).toBeUndefined();
  });
});
