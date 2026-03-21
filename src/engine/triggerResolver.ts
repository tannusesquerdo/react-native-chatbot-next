import type { RenderedStep, Step, StepId, Trigger } from '../types/steps';

export function resolveTrigger(trigger: Trigger | undefined, args: { value?: unknown; steps: Record<string, RenderedStep> }): StepId | undefined {
  if (!trigger) return undefined;
  if (typeof trigger === 'function') return trigger(args);
  return trigger;
}

export function nextStepId(current: Step, args: { value?: unknown; steps: Record<string, RenderedStep> }): StepId | undefined {
  if (current.end) return undefined;
  return resolveTrigger(current.trigger, args);
}
