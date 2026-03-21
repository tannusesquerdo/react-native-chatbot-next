import { describe, expect, it } from 'vitest';
import { resolveStepDelay } from '../delayResolver';

describe('delayResolver', () => {
  const cfg = { botDelay: 1000, userDelay: 400, customDelay: 700 };

  it('uses text step delay override', () => {
    const step = { id: '1', message: 'hello', delay: 123 };
    expect(resolveStepDelay(step, cfg)).toBe(123);
  });

  it('uses bot delay default for text step', () => {
    const step = { id: '1', message: 'hello' };
    expect(resolveStepDelay(step, cfg)).toBe(1000);
  });

  it('uses custom delay for custom step', () => {
    const step = { id: '1', component: {} as any };
    expect(resolveStepDelay(step, cfg)).toBe(700);
  });

  it('uses user delay for user step', () => {
    const step = { id: '1', user: true as const };
    expect(resolveStepDelay(step, cfg)).toBe(400);
  });
});
