import type { Step, StepId } from '../types/steps';

export const stepKey = (id: StepId) => String(id);

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object';

export function createStepMap(steps: Step[]): Record<string, Step> {
  return steps.reduce<Record<string, Step>>((acc, step) => {
    acc[stepKey(step.id)] = step;
    return acc;
  }, {});
}

export function isUserStep(step: unknown): step is Extract<Step, { user: true }> {
  return isRecord(step) && 'user' in step && step.user === true;
}

export function isOptionsStep(step: unknown): step is Extract<Step, { options: unknown[] }> {
  return isRecord(step) && 'options' in step;
}

export function isTextStep(step: unknown): step is Extract<Step, { message: unknown }> {
  return isRecord(step) && 'message' in step;
}

export function isCustomStep(step: unknown): step is Extract<Step, { component: unknown }> {
  return isRecord(step) && 'component' in step;
}

export function isUpdateStep(step: unknown): step is Extract<Step, { update: StepId }> {
  return isRecord(step) && 'update' in step;
}
