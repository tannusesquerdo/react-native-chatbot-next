import { describe, expect, it } from 'vitest';
import type { Step } from '../../types/steps';
import { simulateFlow } from '../simulateFlow';

describe('simulateFlow waitAction/custom trigger semantics', () => {
  it('does not auto-advance custom step with waitAction=true', () => {
    const steps: Step[] = [
      { id: '0', message: 'start', trigger: '1' },
      { id: '1', component: {} as any, waitAction: true, trigger: '2' },
      { id: '2', message: 'end', end: true },
    ];

    const out = simulateFlow(steps, [], { botDelay: 1, userDelay: 1, customDelay: 1 });
    expect(out.renderedSteps.map((s) => String(s.id))).toEqual(['0', '1']);
  });

  it('supports function trigger based on previous value', () => {
    const steps: Step[] = [
      { id: '0', user: true, trigger: ({ value }) => (value === 'admin' ? '1' : '2') },
      { id: '1', message: 'welcome admin', end: true },
      { id: '2', message: 'welcome user', end: true },
    ];

    const out = simulateFlow(steps, [{ kind: 'user', value: 'admin' }], { botDelay: 1, userDelay: 1, customDelay: 1 });
    expect(out.steps['1']?.message).toBe('welcome admin');
    expect(out.values).toEqual(['admin']);
  });
});
