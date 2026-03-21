import type { RenderedStep, StepId } from '../types/steps';
import { stepKey } from './stepResolver';

export function toRenderedMap(renderedSteps: RenderedStep[]): Record<string, RenderedStep> {
  return renderedSteps.reduce<Record<string, RenderedStep>>((acc, step) => {
    acc[stepKey(step.id)] = step;
    return acc;
  }, {});
}

export function applyUpdateStep(renderedSteps: RenderedStep[], updateId: StepId): RenderedStep[] {
  const key = stepKey(updateId);
  return renderedSteps.filter((step) => stepKey(step.id) !== key);
}

export function createEndPayload(renderedSteps: RenderedStep[], values: unknown[]) {
  return {
    renderedSteps,
    steps: toRenderedMap(renderedSteps),
    values,
  };
}
