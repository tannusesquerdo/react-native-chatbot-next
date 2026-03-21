import type { Step, StepId } from '../types/steps';

export const stepKey = (id: StepId) => String(id);

export function createStepMap(steps: Step[]): Record<string, Step> {
  return steps.reduce<Record<string, Step>>((acc, step) => {
    acc[stepKey(step.id)] = step;
    return acc;
  }, {});
}

export function isUserStep(step: Step): step is Extract<Step, { user: true }> {
  return 'user' in step && step.user === true;
}

export function isOptionsStep(step: Step): step is Extract<Step, { options: unknown[] }> {
  return 'options' in step;
}

export function isTextStep(step: Step): step is Extract<Step, { message: unknown }> {
  return 'message' in step;
}

export function isCustomStep(step: Step): step is Extract<Step, { component: unknown }> {
  return 'component' in step;
}

export function isUpdateStep(step: Step): step is Extract<Step, { update: StepId }> {
  return 'update' in step;
}
