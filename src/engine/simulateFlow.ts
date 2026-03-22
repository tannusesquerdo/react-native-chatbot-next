import type { RenderedStep, Step, StepId } from '../types/steps';
import { resolveStepDelay } from './delayResolver';
import { createStepMap, isCustomStep, isOptionsStep, isTextStep, isUpdateStep, isUserStep, stepKey } from './stepResolver';
import { nextStepId } from './triggerResolver';
import { applyUpdateStep, createEndPayload, toRenderedMap } from './runtimeState';

export type FlowInput =
  | { kind: 'user'; value: string }
  | { kind: 'option'; value: unknown }
  | { kind: 'custom'; value?: unknown; trigger?: StepId };

export type SimulateConfig = {
  botDelay?: number;
  userDelay?: number;
  customDelay?: number;
};

function toRendered(step: Step, steps: Record<string, RenderedStep>, previousValue?: unknown): RenderedStep {
  if (isTextStep(step)) {
    const message = typeof step.message === 'function' ? step.message({ previousValue, steps }) : step.message;
    return { id: step.id, message, metadata: step.metadata };
  }

  if (isUserStep(step)) return { id: step.id, user: true, metadata: step.metadata };
  if (isOptionsStep(step)) return { id: step.id, options: step.options, metadata: step.metadata };
  if (isCustomStep(step)) return { id: step.id, component: step.component, metadata: step.metadata };
  return { id: step.id, metadata: step.metadata };
}

export function simulateFlow(steps: Step[], inputs: FlowInput[], cfg: SimulateConfig = {}) {
  const stepMap = createStepMap(steps);
  const botDelay = cfg.botDelay ?? 1000;
  const userDelay = cfg.userDelay ?? 1000;
  const customDelay = cfg.customDelay ?? 1000;

  let rendered: RenderedStep[] = [];
  let values: unknown[] = [];
  let elapsedMs = 0;
  let inputCursor = 0;

  const goTo = (id: StepId | undefined, value?: unknown): void => {
    if (id === undefined) return;
    const step = stepMap[stepKey(id)];
    if (!step) return;

    if (isUpdateStep(step)) {
      rendered = applyUpdateStep(rendered, step.update);
      goTo(nextStepId(step, { value, steps: toRenderedMap(rendered) }), value);
      return;
    }

    elapsedMs += resolveStepDelay(step, { botDelay, userDelay, customDelay });
    const renderedById = toRenderedMap(rendered);
    const current = toRendered(step, renderedById, value);
    rendered = [...rendered, current];

    if (isTextStep(step)) {
      goTo(nextStepId(step, { value, steps: toRenderedMap(rendered) }), value);
      return;
    }

    if (isUserStep(step)) {
      const input = inputs[inputCursor++];
      if (!input || input.kind !== 'user') return;
      const valid = step.validator?.(input.value);
      if (valid !== undefined && valid !== true) return;
      values = [...values, input.value];
      rendered = rendered.map((r) => (String(r.id) === String(step.id) ? { ...r, value: input.value } : r));
      rendered = [...rendered, { id: `${step.id}-value`, message: input.value, value: input.value }];
      goTo(nextStepId(step, { value: input.value, steps: toRenderedMap(rendered) }), input.value);
      return;
    }

    if (isOptionsStep(step)) {
      const input = inputs[inputCursor++];
      if (!input || input.kind !== 'option') return;
      const opt = step.options.find((o) => o.value === input.value);
      if (!opt) return;
      values = [...values, opt.value];
      rendered = rendered.map((r) => (String(r.id) === String(step.id) ? { ...r, value: opt.value, metadata: { ...(r.metadata ?? {}), selectedLabel: opt.label } } : r));
      rendered = [...rendered, { id: `${String(step.id)}-value`, message: opt.label, value: opt.value }];
      goTo(opt.trigger, opt.value);
      return;
    }

    if (isCustomStep(step)) {
      if (step.waitAction) {
        const input = inputs[inputCursor++];
        if (!input || input.kind !== 'custom') return;
        if (input.value !== undefined) {
          values = [...values, input.value];
          rendered = rendered.map((r) => (String(r.id) === String(step.id) ? { ...r, value: input.value } : r));
        }
        const next = input.trigger ?? nextStepId(step, { value: input.value, steps: toRenderedMap(rendered) });
        goTo(next, input.value);
        return;
      }

      goTo(nextStepId(step, { value, steps: toRenderedMap(rendered) }), value);
      return;
    }
  };

  if (steps[0]) {
    goTo(steps[0].id);
  }

  return {
    ...createEndPayload(rendered, values),
    elapsedMs,
  };
}
