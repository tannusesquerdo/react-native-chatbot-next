import type { Step } from '../types/steps';
import { isCustomStep, isTextStep, isUserStep } from './stepResolver';

export type DelayConfig = {
  botDelay: number;
  userDelay: number;
  customDelay: number;
};

export function resolveStepDelay(step: Step, cfg: DelayConfig): number {
  if (isTextStep(step)) return step.delay ?? cfg.botDelay;
  if (isCustomStep(step)) return step.delay ?? cfg.customDelay;
  if (isUserStep(step)) return cfg.userDelay;
  return cfg.userDelay;
}
