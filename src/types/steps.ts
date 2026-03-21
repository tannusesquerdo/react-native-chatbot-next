import type { ReactElement, ReactNode } from 'react';

export type StepId = string | number;

export type TriggerResolverContext = {
  value?: unknown;
  steps: Record<string, RenderedStep>;
};

export type Trigger = StepId | ((ctx: TriggerResolverContext) => StepId);

export type InputAttributes = {
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad' | string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  [key: string]: unknown;
};

export type CommonStep = {
  id: StepId;
  trigger?: Trigger;
  end?: boolean;
  metadata?: Record<string, unknown>;
  inputAttributes?: InputAttributes;
};

export type TextStep = CommonStep & {
  message: string | ((ctx: { previousValue?: unknown; steps: Record<string, RenderedStep> }) => string);
  avatar?: string;
  delay?: number;
};

export type UserStep = CommonStep & {
  user: true;
  validator?: (value: string) => true | string;
};

export type OptionItem = {
  label: string;
  value: unknown;
  trigger: StepId;
};

export type OptionsStep = CommonStep & {
  options: OptionItem[];
};

export type CustomStep = CommonStep & {
  component: ReactElement;
  replace?: boolean;
  waitAction?: boolean;
  asMessage?: boolean;
  delay?: number;
};

export type UpdateStep = CommonStep & {
  update: StepId;
};

export type Step = TextStep | UserStep | OptionsStep | CustomStep | UpdateStep;

export type RenderedStep = {
  id: StepId;
  message?: string;
  value?: unknown;
  component?: ReactNode;
  options?: OptionItem[];
  user?: boolean;
  metadata?: Record<string, unknown>;
};
