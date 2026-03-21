import type { Step } from '../types/steps';
import { isCustomStep } from './stepResolver';

export function shouldRenderCustomStep(step: Step | undefined, index: number, renderedCount: number): boolean {
  if (!step || !isCustomStep(step)) return true;
  if (!step.replace) return true;
  return index === renderedCount - 1;
}
