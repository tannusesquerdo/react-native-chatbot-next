import { describe, expect, it } from 'vitest';
import { shouldRenderCustomStep } from '../customStepRules';

describe('customStepRules', () => {
  it('keeps non-custom entries renderable', () => {
    expect(shouldRenderCustomStep(undefined, 0, 1)).toBe(true);
  });

  it('renders custom step when replace=false', () => {
    const step = { id: 'c1', component: {} as any, replace: false };
    expect(shouldRenderCustomStep(step, 0, 2)).toBe(true);
  });

  it('hides replaced custom step once newer step exists', () => {
    const step = { id: 'c1', component: {} as any, replace: true };
    expect(shouldRenderCustomStep(step, 0, 2)).toBe(false);
    expect(shouldRenderCustomStep(step, 1, 2)).toBe(true);
  });
});
