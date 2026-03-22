import { describe, expect, it } from 'vitest';
import type { Step } from '../../types/steps';
import { simulateFlow } from '../simulateFlow';

describe('simulateFlow', () => {
  it('runs text -> user -> text flow', () => {
    const steps: Step[] = [
      { id: '0', message: 'Welcome', trigger: '1' },
      { id: '1', user: true, trigger: '2' },
      { id: '2', message: ({ previousValue }) => `Hi ${String(previousValue)}`, end: true },
    ];

    const out = simulateFlow(steps, [{ kind: 'user', value: 'Tannus' }], { botDelay: 10, userDelay: 5, customDelay: 1 });

    expect(out.renderedSteps.map((s) => String(s.id))).toEqual(['0', '1', '1-value', '2']);
    expect(out.values).toEqual(['Tannus']);
    expect(out.steps['1']?.value).toBe('Tannus');
    expect(out.steps['2']?.message).toBe('Hi Tannus');
    expect(out.elapsedMs).toBe(25);
  });

  it('runs options flow and echoes option label', () => {
    const steps: Step[] = [
      { id: '0', options: [{ label: 'Yes', value: 'yes', trigger: '1' }, { label: 'No', value: 'no', trigger: '1' }] },
      { id: '1', message: 'done', end: true },
    ];

    const out = simulateFlow(steps, [{ kind: 'option', value: 'yes' }], { botDelay: 10, userDelay: 5, customDelay: 1 });
    expect(out.values).toEqual(['yes']);
    expect(out.renderedSteps.some((s) => s.message === 'Yes')).toBe(true);
    expect(out.steps['0']?.value).toBe('yes');
  });

  it('makes selected option value available in next message via steps map', () => {
    const steps: Step[] = [
      { id: 'q', options: [{ label: 'A', value: 'a', trigger: 'r' }, { label: 'B', value: 'b', trigger: 'r' }] },
      { id: 'r', message: ({ steps }) => `selected-${String(steps.q?.value)}`, end: true },
    ];

    const out = simulateFlow(steps, [{ kind: 'option', value: 'b' }], { botDelay: 1, userDelay: 1, customDelay: 1 });
    expect(out.steps['q']?.value).toBe('b');
    expect(out.steps['r']?.message).toBe('selected-b');
  });

  it('makes typed value available in next message via original user step', () => {
    const steps: Step[] = [
      { id: 'name', user: true, metadata: { key: 'name' }, trigger: 'r' },
      { id: 'r', message: ({ steps }) => `name-${String(steps.name?.value)}`, end: true },
    ];

    const out = simulateFlow(steps, [{ kind: 'user', value: 'Tannus' }], { botDelay: 1, userDelay: 1, customDelay: 1 });
    expect(out.steps['name']?.value).toBe('Tannus');
    expect(out.steps['r']?.message).toBe('name-Tannus');
  });

  it('applies update step by removing target rendered steps', () => {
    const steps: Step[] = [
      { id: '0', message: 'A', trigger: '1' },
      { id: '1', message: 'B', trigger: '2' },
      { id: '2', update: '1', trigger: '3' },
      { id: '3', message: 'C', end: true },
    ];

    const out = simulateFlow(steps, [], { botDelay: 1, userDelay: 1, customDelay: 1 });
    const ids = out.renderedSteps.map((s) => String(s.id));
    expect(ids.includes('1')).toBe(false);
    expect(ids).toEqual(['0', '3']);
  });

  it('stops at custom waitAction step (awaits external trigger)', () => {
    const steps: Step[] = [
      { id: '0', component: {} as any, waitAction: true, trigger: '1' },
      { id: '1', message: 'never auto reached', end: true },
    ];

    const out = simulateFlow(steps, [], { botDelay: 1, userDelay: 1, customDelay: 3 });
    expect(out.renderedSteps.map((s) => String(s.id))).toEqual(['0']);
  });
});
