import type { Step } from '../types/steps';
import type { FlowInput } from './simulateFlow';

export type FlowFixture = {
  name: string;
  steps: Step[];
  inputs: FlowInput[];
  expected: {
    renderedIds: string[];
    values: unknown[];
  };
};

export const parityFixtures: FlowFixture[] = [
  {
    name: 'text -> user -> function trigger route A',
    steps: [
      { id: '0', message: 'Welcome', trigger: '1' },
      { id: '1', user: true, trigger: ({ value }) => (value === 'yes' ? '2' : '3') },
      { id: '2', message: 'Routed-yes', end: true },
      { id: '3', message: 'Routed-no', end: true },
    ],
    inputs: [{ kind: 'user', value: 'yes' }],
    expected: {
      renderedIds: ['0', '1', '1-value', '2'],
      values: ['yes'],
    },
  },
  {
    name: 'options -> echo label -> next',
    steps: [
      {
        id: '0',
        options: [
          { label: 'Number 1', value: 1, trigger: '1' },
          { label: 'Number 2', value: 2, trigger: '1' },
        ],
      },
      { id: '1', message: 'Option done', end: true },
    ],
    inputs: [{ kind: 'option', value: 2 }],
    expected: {
      renderedIds: ['0', '0-value', '1'],
      values: [2],
    },
  },
  {
    name: 'update removes target step and continues',
    steps: [
      { id: '0', message: 'A', trigger: '1' },
      { id: '1', message: 'B', trigger: '2' },
      { id: '2', update: '1', trigger: '3' },
      { id: '3', message: 'C', end: true },
    ],
    inputs: [],
    expected: {
      renderedIds: ['0', '3'],
      values: [],
    },
  },
  {
    name: 'validator rejects and emits message',
    steps: [
      { id: '0', user: true, validator: (v) => (v.includes('@') ? true : 'Email invalid'), trigger: '1' },
      { id: '1', message: 'ok', end: true },
    ],
    inputs: [{ kind: 'user', value: 'not-email' }],
    expected: {
      renderedIds: ['0'],
      values: [],
    },
  },
  {
    name: 'custom waitAction pauses progression',
    steps: [
      { id: '0', message: 'start', trigger: '1' },
      { id: '1', component: {} as any, waitAction: true, trigger: '2' },
      { id: '2', message: 'finish', end: true },
    ],
    inputs: [],
    expected: {
      renderedIds: ['0', '1'],
      values: [],
    },
  },
  {
    name: 'custom waitAction triggerNextStep override trigger/value',
    steps: [
      { id: '0', message: 'start', trigger: '1' },
      { id: '1', component: {} as any, waitAction: true, trigger: '2' },
      { id: '2', message: 'default path', end: true },
      { id: '3', message: ({ previousValue }) => `override:${String(previousValue)}`, end: true },
    ],
    inputs: [{ kind: 'custom', value: 'x', trigger: '3' }],
    expected: {
      renderedIds: ['0', '1', '3'],
      values: ['x'],
    },
  },
];
